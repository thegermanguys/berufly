'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error || 'Could not create account.');
      setLoading(false);
      return;
    }
    const signInRes = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      setError('Account created, but automatic login failed — try logging in.');
      return;
    }
    window.location.href = '/onboarding';
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-1 text-2xl">Create your account</h1>
      <p className="mb-6 text-sm text-inksoft">Free for candidates. Companies and educators are reviewed before going live.</p>

      {error && <div className="banner-err">{error}</div>}

      <form onSubmit={onSubmit} className="card">
        <div className="field mb-4">
          <label htmlFor="name">Name</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field mb-4">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field mb-4">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="mt-1 text-xs text-inksoft">At least 8 characters.</div>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-inksoft">
        <div className="h-px flex-1 bg-line" /> or <div className="h-px flex-1 bg-line" />
      </div>

      <button onClick={() => signIn('google', { callbackUrl: '/onboarding' })} className="btn btn-ghost w-full">
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-inksoft">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </div>
  );
}
