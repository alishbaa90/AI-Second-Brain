# 🧠 AI Second Brain

A full-stack, production-grade personal AI memory system for developers. It remembers conversations, stores project context, and lets you search past decisions using natural language — answering questions like "What did we decide about the database schema last week?"

Built as a hands-on exploration of Retrieval-Augmented Generation (RAG), agentic orchestration, and context engineering — the core building blocks behind modern AI memory systems.

---

## ✨ Features

## 🚀 Key Features

* **🧠 Long-Term Memory (RAG)** — Every conversation is embedded and stored in a vector database. Relevant past context is automatically retrieved and injected into new conversations using semantic (meaning-based) search rather than just rigid keyword matching.
* **⚡ Short-Term Memory (Redis)** — The last few messages of each active session are cached in Redis for fast, low-latency conversational continuity, completely isolated from the permanent long-term store.
* **🤖 Agentic Routing (LangGraph)** — A graph-based LLM agent evaluates each incoming message to dynamically decide whether a deep memory search is required (e.g., *"What did we decide?"*) or if a direct reply suffices (e.g., *"Tell me a joke"*), avoiding unnecessary context pollution.
* **📁 Multi-Project Workspaces** — Chats, details, and vector memories are strictly scoped per project ecosystem, ensuring context from one project never leaks into another.
* **🔍 Dedicated Memory Search** — A standalone search interface featuring real-time similarity scoring, allowing you to easily locate historical records and jump straight to their points of origin.
* **🔒 Multi-User Authentication** — Secure user infrastructure powered by Supabase Auth, protected by strict Row Level Security (RLS) policies enforced directly at the database layer for bulletproof isolation.
* **☁️ Deployed & Production-Ready** — Live on Vercel utilizing managed cloud backends including Supabase (Postgres + `pgvector`) and Upstash (Redis).

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14+ (App Router), React, TypeScript |
| **AI Model** | Google Gemini (chat + `gemini-embedding-001` for embeddings) |
| **Agent Orchestration** | LangGraph |
| **Long-term Memory** | PostgreSQL + pgvector (via Supabase) |
| **Short-term Memory** | Redis (via Upstash) |
| **Authentication** | Supabase Auth + Row Level Security |
| **Deployment** | Vercel |


## 📚 What This Project Demonstrates

* Generating and storing vector embeddings for semantic search
* Implementing RAG (Retrieval-Augmented Generation) from scratch, without a managed framework abstraction
* **Designing hybrid memory architectures (short-term + long-term)
* Building conditional, stateful agent graphs with LangGraph
* Context engineering — deciding what, how much, and where to inject retrieved context into a prompt
* Database-level multi-tenant security using Row Level Security (RLS)


## 🚀 Getting Started

### Prerequisites

* **Node.js 18+
* **A Supabase project (free tier works)
* **An Upstash Redis database (free tier works)
* **A Google AI Studio API key (for Gemini)


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

1. Push the repository to GitHub
2. Import the project into Vercel
3. Add the same environment variables listed above under Project Settings → Environment Variables
Deploy


## 🔮 Future Improvements

* LLM-based (rather than keyword-based) routing for the memory-search decision
* Configurable similarity threshold per project
* Export/import project memory
* Support for file/document ingestion into memory


## 📄 License

This project is open source and available for learning purposes.
