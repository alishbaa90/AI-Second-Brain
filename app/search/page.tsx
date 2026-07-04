'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type SearchResult = {
  id: string;
  role: string;
  content: string;
  created_at: string;
  similarity: number;
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState('general');

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.projects?.length > 0) setProjects(data.projects);
      })
      .catch((err) => console.error('Projects load nahi hue:', err));
  }, []);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, projectId: currentProject }),
      });

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  function openInChat(messageId: string) {
    router.push(`/?project=${encodeURIComponent(currentProject)}&highlight=${messageId}`);
  }

  return (
    <main style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '3rem 2rem',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#0f172a',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Top Application Navigation Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', letterSpacing: '-0.02em', color: '#0f172a', margin: 0 }}>
            Search History
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
            Find past items and answers from your workspaces.
          </p>
        </div>

        <Link href="/" style={{
          fontSize: '0.85rem',
          fontWeight: '500',
          color: '#0f172a',
          textDecoration: 'none',
          padding: '0.5rem 0.85rem',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          transition: 'background-color 0.1s ease'
        }}>
          Return to Chat
        </Link>
      </div>

      {/* Workspace / Project Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: '700',
          letterSpacing: '0.05em',
          color: '#94a3b8',
          marginBottom: '0.5rem',
          textTransform: 'uppercase'
        }}>
          Active Workspace
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {projects.map((p) => (
            <button
              key={p}
              onClick={() => setCurrentProject(p)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: currentProject === p ? '#0f172a' : '#f8fafc',
                color: currentProject === p ? '#ffffff' : '#0f172a',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '500',
                transition: 'all 0.1s ease',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <p style={{ color: '#475569', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: '1.5' }}>
        Type keywords or look up phrases to locate responses and user prompts recorded inside your "{currentProject}" workspace.
      </p>

      {/* Query Command Input Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'stretch' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for answers or topics..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            outline: 'none',
            fontSize: '0.9rem',
            color: '#0f172a',
            backgroundColor: '#ffffff'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: '4px',
            background: loading || !query.trim() ? '#e2e8f0' : '#0f172a',
            color: loading || !query.trim() ? '#94a3b8' : '#ffffff',
            border: '1px solid #cbd5e1',
            fontWeight: '500',
            fontSize: '0.875rem',
            cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.1s ease'
          }}
        >
          Search
        </button>
      </div>

      {/* Query Execution Output Window */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '1.5rem',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        minHeight: '200px'
      }}>

        {loading && (
          <div style={{ margin: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            <span>Searching your memory records...</span>
          </div>
        )}

        {!loading && !searched && (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
            Enter a phrase above to scan your chat history.
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            No results found. Try adjusting your keywords.
          </div>
        )}

        {/* Mapped Query Output Results — click any result to jump to it in chat */}
        {!loading && results.map((result) => (
          <div
            key={result.id}
            onClick={() => openInChat(result.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              cursor: 'pointer',
              padding: '0.5rem',
              margin: '-0.5rem',
              borderRadius: '4px',
              transition: 'background-color 0.1s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eef2f7')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.725rem',
              fontWeight: '700',
              letterSpacing: '0.05em',
              color: result.role === 'user' ? '#2563eb' : '#475569'
            }}>
              <span>{result.role === 'user' ? 'YOU' : 'ASSISTANT'}</span>
              <span style={{ color: '#94a3b8', fontWeight: '500' }}>
                {formatDate(result.created_at)} • {Math.round(result.similarity * 100)}% match
              </span>
            </div>
            <div
              style={{
                color: '#0f172a',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                paddingLeft: '0.25rem',
                borderLeft: result.role === 'user' ? '2px solid #2563eb' : '2px solid #94a3b8'
              }}
            >
              {result.content}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
