'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/onboarding';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false, callbackUrl });
    setLoading(false);
    if (res?.error) {
      setError('Incorrect email or password.');
      return;
    }
    window.location.href = callbackUrl;
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-1 text-2xl">Log in</h1>
      <p className="mb-6 text-sm text-inksoft">Welcome back to Berufly.</p>

      {error && <div className="banner-err">{error}</div>}

      <form onSubmit={onSubmit} className="card">
        <div className="field mb-4">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field mb-4">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-inksoft">
        <div className="h-px flex-1 bg-line" /> or <div className="h-px flex-1 bg-line" />
      </div>

      <button
        onClick={() => signIn('google', { callbackUrl })}
        className="btn btn-ghost w-full"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-inksoft">
        New to Berufly? <Link href="/register" className="underline">Create an account</Link>
      </p>
    </div>
  );
}
