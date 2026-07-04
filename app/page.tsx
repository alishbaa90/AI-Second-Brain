'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Message = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
};

function getInitialProject(): string {
  if (typeof window === 'undefined') return 'general';
  const params = new URLSearchParams(window.location.search);
  return params.get('project') || 'general';
}

function getInitialHighlight(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('highlight');
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);

  const [currentProject, setCurrentProject] = useState<string>(getInitialProject);

  const [newProjectName, setNewProjectName] = useState('');
  const highlightIdRef = useRef<string | null>(getInitialHighlight());

  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Projects list load karo
  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
        }
      })
      .catch((err) => console.error('Projects load nahi hue:', err));
  }, []);

  useEffect(() => {
    if (!currentProject) return;

    let ignore = false; 

    fetch(`/api/messages?projectId=${encodeURIComponent(currentProject)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.messages) {
          setMessages(data.messages);
        }
      })
      .catch((err) => console.error('History load nahi hui:', err));

    return () => {
      ignore = true;
    };
  }, [currentProject]);

  useEffect(() => {
    if (messages.length === 0) return;

    const highlightId = highlightIdRef.current;

    if (highlightId) {
      setTimeout(() => {
        const el = document.getElementById(`msg-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.transition = 'background 0.3s';
          el.style.background = '#fff3b0';
          setTimeout(() => {
            el.style.background = '';
          }, 2000);
        }
        highlightIdRef.current = null; 
        window.history.replaceState({}, '', '/'); 
      }, 400);
    } else {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, projectId: currentProject }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Kuch masla hua, dobara try karo.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') sendMessage();
  }

  function switchProject(project: string) {
    setCurrentProject(project);
  }

  async function addNewProject() {
    const trimmed = newProjectName.trim();
    if (!trimmed || projects.includes(trimmed)) {
      setNewProjectName('');
      return;
    }

    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      setProjects((prev) => [...prev, trimmed]);
      setCurrentProject(trimmed);
    } catch (err) {
      console.error('Project save nahi hua:', err);
    }

    setNewProjectName('');
  }

  async function handleLogout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = '/login';
}

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main
        style={{
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 2rem 1.5rem 2rem',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#0f172a',
          backgroundColor: '#ffffff', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Navigation Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1.25rem',
            flexShrink: 0,
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', letterSpacing: '-0.02em', color: '#0f172a', margin: 0 }}>
              AI Second Brain
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
              Personal intelligence workspace and memory assistant.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
  <Link
    href="/search"
    style={{
      fontSize: '0.85rem',
      fontWeight: '500',
      color: '#0f172a',
      textDecoration: 'none',
      padding: '0.5rem 0.85rem',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
    }}
  >
    Search Memory
  </Link>

  <button
    onClick={handleLogout}
    style={{
      fontSize: '0.85rem',
      fontWeight: '500',
      padding: '0.5rem 0.85rem',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      background: '#f8fafc',
      cursor: 'pointer',
    }}
  >
    Logout
  </button>
</div>

          
        </div>

        {/* Project Selector */}
        <div style={{ marginBottom: '1.25rem', flexShrink: 0 }}>
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              letterSpacing: '0.05em',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            Active Workspace
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {projects.map((project) => (
              <button
                key={project}
                onClick={() => switchProject(project)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: currentProject === project ? '#0f172a' : '#f8fafc',
                  color: currentProject === project ? '#ffffff' : '#0f172a',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                }}
              >
                {project}
              </button>
            ))}

            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNewProject()}
              placeholder="+ New project"
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: '1px dashed #cbd5e1',
                fontSize: '0.85rem',
                width: '130px',
                color: '#0f172a',
              }}
            />
          </div>
        </div>

        {/* Chat Messages Box */}
        <div
          ref={chatBoxRef}
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', paddingTop: '2rem' }}>
              How can I help you today?
              <br />
              <span style={{ fontSize: '0.8rem' }}>
                Ask questions or manage details specific to your <strong>{currentProject}</strong> workspace.
              </span>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={msg.id || i}
              id={msg.id ? `msg-${msg.id}` : undefined}
              style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}
            >
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  color: msg.role === 'user' ? '#2563eb' : '#475569',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}
              >
                {msg.role === 'user' ? 'YOU' : 'ASSISTANT'}
              </span>
              <div
                style={{
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                  paddingLeft: msg.role === 'user' ? 0 : '0.5rem',
                  paddingRight: msg.role === 'user' ? '0.5rem' : 0,
                  borderLeft: msg.role === 'assistant' ? '2px solid #94a3b8' : 'none',
                  borderRight: msg.role === 'user' ? '2px solid #2563eb' : 'none',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && <p style={{ color: '#888', fontSize: '0.85rem' }}>Gemini is thinking...</p>}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexShrink: 0 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${currentProject}...`}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontSize: '0.9rem',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '4px',
              background: loading ? '#e2e8f0' : '#0f172a',
              color: loading ? '#94a3b8' : '#ffffff',
              border: '1px solid #cbd5e1',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
