# 🧠 AI Second Brain

A full-stack, production-grade personal AI memory system for developers. It remembers conversations, stores project context, and lets you search past decisions using natural language — answering questions like "What did we decide about the database schema last week?"

Built as a hands-on exploration of Retrieval-Augmented Generation (RAG), agentic orchestration, and context engineering — the core building blocks behind modern AI memory systems.

---

## ✨ Features


*🧠 Long-term memory (RAG) — every conversation is embedded and stored in a vector database; relevant past context is automatically retrieved and injected into new conversations using semantic (meaning-based) search, not just keyword matching.
*⚡ Short-term memory (Redis) — the last few messages of each session are cached in Redis for fast, low-latency conversational context, separate from the permanent long-term store.
*🤖 Agentic routing (LangGraph) — a graph-based agent decides, per message, whether deep memory search is actually needed (e.g. "what did we decide?") or whether a direct reply is enough (e.g. "tell me a joke") — avoiding irrelevant context pollution.
*📁 Multi-project workspaces — conversations and memory are scoped per project, so context from one project never leaks into another.
*🔍 Dedicated memory search — a standalone search interface with similarity scoring, letting you jump directly from a search result to its exact point in the original conversation.
*🔒 Multi-user authentication — full auth flow via Supabase Auth, with Row Level Security (RLS) enforced at the database level so each user's data is isolated even if application code has a bug.
*☁️ Deployed & production-ready — live on Vercel with Supabase (Postgres + pgvector) and Upstash (Redis) as managed cloud services.

## 🛠️ Tech Stack

LayerTechnologyFrontendNext.js 14+ (App Router), React, TypeScriptAI ModelGoogle Gemini (chat + gemini-embedding-001 for embeddings)Agent OrchestrationLangGraphLong-term MemoryPostgreSQL + pgvector (via Supabase)Short-term MemoryRedis (via Upstash)AuthenticationSupabase Auth + Row Level SecurityDeploymentVercel


## 📚 What This Project Demonstrates

Generating and storing vector embeddings for semantic search
Implementing RAG (Retrieval-Augmented Generation) from scratch, without a managed framework abstraction
Designing hybrid memory architectures (short-term + long-term)
Building conditional, stateful agent graphs with LangGraph
Context engineering — deciding what, how much, and where to inject retrieved context into a prompt
Database-level multi-tenant security using Row Level Security (RLS)


## 🚀 Getting Started

Prerequisites


Node.js 18+
A Supabase project (free tier works)
An Upstash Redis database (free tier works)
A Google AI Studio API key (for Gemini)


1. Clone the repository

bashgit clone https://github.com/your-username/ai-second-brain.git
cd ai-second-brain

2. Install dependencies

bashnpm install

3. Set up the database

In your Supabase project's SQL Editor, run:

sqlcreate extension if not exists vector;

create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  project_id text not null,
  user_id uuid references auth.users(id),
  role text not null,
  content text not null,
  embedding vector(768),
  created_at timestamptz default now()
);

create index on messages using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table projects enable row level security;
alter table messages enable row level security;

create policy "Users can view own projects" on projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can view own messages" on messages for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on messages for insert with check (auth.uid() = user_id);

4. Configure environment variables

Create a .env.local file in the project root:

envGEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_supabase_pooler_connection_string
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key


Note: Use Supabase's connection pooler string (port 6543) for DATABASE_URL, not the direct connection — the direct connection is IPv6-only and will fail on platforms like Vercel.



5. Run locally

bashnpm run dev

Visit http://localhost:3000, sign up for an account, and start chatting.


## 🌐 Deployment

This project is deployed on Vercel:

Push the repository to GitHub
Import the project into Vercel
Add the same environment variables listed above under Project Settings → Environment Variables
Deploy


## 🔮 Future Improvements

LLM-based (rather than keyword-based) routing for the memory-search decision
Configurable similarity threshold per project
Export/import project memory
Support for file/document ingestion into memory


## 📄 License

This project is open source and available for learning purposes.
