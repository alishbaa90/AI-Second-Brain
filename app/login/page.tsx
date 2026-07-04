'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('Signup ho gaya! Apna email check karo confirmation ke liye, ya seedha login try karo.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Kuch masla hua');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '440px',
          maxWidth: '100%',
          padding: '2.75rem 2.5rem',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#0f172a',
              margin: 0,
            }}
          >
            AI Second Brain
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.35rem' }}>
            {isSignUp ? 'Create your account to get started.' : 'Log in to your workspace.'}
          </p>
        </div>

        <div style={{ marginBottom: '1.1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: '#94a3b8',
              marginBottom: '0.4rem',
              textTransform: 'uppercase',
            }}
          >
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontSize: '0.9rem',
              color: '#0f172a',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: '#94a3b8',
              marginBottom: '0.4rem',
              textTransform: 'uppercase',
            }}
          >
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontSize: '0.9rem',
              color: '#0f172a',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#dc2626',
              marginBottom: '1.25rem',
              padding: '0.65rem 0.85rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '4px',
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '4px',
            background: loading || !email || !password ? '#e2e8f0' : '#0f172a',
            color: loading || !email || !password ? '#94a3b8' : '#ffffff',
            border: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            marginBottom: '1.25rem',
          }}
        >
          {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>

        <p style={{ fontSize: '0.85rem', textAlign: 'center', color: '#64748b', margin: 0 }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
