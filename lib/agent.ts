import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { getChatResponseWithContext } from './gemini';
import { saveMessage, searchMemory } from './memory';
import { addToSession, getSession } from './redis';

// Step A: Define the State Schema — This is the shared memory accessible by every node in the graph
const AgentState = Annotation.Root({
  projectId: Annotation<string>,
  userMessage: Annotation<string>,
  needsSearch: Annotation<boolean>,
  recentSession: Annotation<{ role: string; content: string }[]>,
  deepMemories: Annotation<{ role: string; content: string }[]>,
  reply: Annotation<string>,
});

type State = typeof AgentState.State;

// Step B: Router Node — Analyzes the input to evaluate whether a deep-memory database lookup is required
function routerNode(state: State): Partial<State> {
  const message = state.userMessage.toLowerCase();

  // Keyword heuristic to catch explicit contextual or historical dependencies
  const memoryTriggers = [
    'remember', 'recall', 'decide', 'what was', 'last week',
    'previous', 'history', 'before', 'past', 'earlier',
    'yaad', 'pehle', 'kya bola', 'purana' 
  ];

  const needsSearch = memoryTriggers.some((trigger) => message.includes(trigger));

  return { needsSearch };
}

// Step C: Retriever Node — Executes deep vector search on Postgres only if triggered by the router
async function retrieverNode(state: State): Promise<Partial<State>> {
  const deepMemories = await searchMemory(state.projectId, state.userMessage, 5);
  return { deepMemories };
}

// Step D: Session Node — Retrieves low-latency short-term session data from Redis (always executes)
async function sessionNode(state: State): Promise<Partial<State>> {
  const recentSession = await getSession(state.projectId);
  return { recentSession };
}

// Step E: Responder Node — Passes compiled context layers to the Gemini API to formulate the response
async function responderNode(state: State): Promise<Partial<State>> {
  const context = [
    ...(state.recentSession || []),
    ...(state.deepMemories || []),
  ];

  const reply = await getChatResponseWithContext(state.userMessage, context);
  return { reply };
}

// Step F: Memory Writer Node — Persists transaction transcripts across both volatile cache and persistent database tiers
async function memoryWriterNode(state: State): Promise<Partial<State>> {
  // Save current incoming user message
  await addToSession(state.projectId, { role: 'user', content: state.userMessage });
  await saveMessage(state.projectId, 'user', state.userMessage);

  // Save generated agent response
  await addToSession(state.projectId, { role: 'assistant', content: state.reply });
  await saveMessage(state.projectId, 'assistant', state.reply);

  return {};
}

// Step G: Conditional Edge Evaluator — Evaluates routing decision based on state values
function routeDecision(state: State): 'retriever' | 'skipRetrieval' {
  return state.needsSearch ? 'retriever' : 'skipRetrieval';
}

// Step H: Construct and Assemble the StateGraph Workflow safely
const workflow = new StateGraph(AgentState)
  .addNode('router', routerNode)
  .addNode('session', sessionNode)
  .addNode('retriever', retrieverNode)
  .addNode('responder', responderNode)
  .addNode('memoryWriter', memoryWriterNode)
  
  // 1. Enter graph through the session cache harvester
  .addEdge(START, 'session')
  
  // 2. Pass control over to intent keyword matching evaluation
  .addEdge('session', 'router')
  
  // 3. Make runtime edge assignment branching directly out of the router node's findings
  .addConditionalEdges('router', routeDecision, {
    retriever: 'retriever',
    skipRetrieval: 'responder',
  })
  
  // 4. Connect long-term vector output cleanly straight back to generation
  .addEdge('retriever', 'responder')
  
  // 5. Commit states downstream to safe memory storage layers
  .addEdge('responder', 'memoryWriter')
  .addEdge('memoryWriter', END);

export const agentGraph = workflow.compile();