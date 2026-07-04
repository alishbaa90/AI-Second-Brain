import { GoogleGenAI } from '@google/genai';

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: { outputDimensionality: 768 },
  });

  const values = response.embeddings?.[0]?.values;

  if (!values) {
    throw new Error('No embedding values found - check response');
  }

  return values;
}
export const CHAT_MODEL = 'gemini-2.5-flash';

export async function getChatResponse(userMessage: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: userMessage,
  });

  return response.text ?? 'Sorry, no response generated.';
}

export async function getChatResponseWithContext(
  userMessage: string,
  memoryContext: { role: string; content: string }[]
): Promise<string> {
  let contextText = '';

  if (memoryContext.length > 0) {
    contextText = 'These are some previous messages in the conversation:\n\n';
    memoryContext.forEach((msg) => {
      contextText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    contextText += '\nAnswer the user\'s message based on this context.\n\n';
  }

  const fullPrompt = `${contextText}Always respond in the exact same language used by the user (Roman Urdu or English). User's new message: ${userMessage}`;

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: fullPrompt,
  });

  return response.text ?? 'Sorry, no response generated.';
}

