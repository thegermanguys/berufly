import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export async function getSession() {
  return getServerSession(authOptions);
}

/** Redirects to /login if signed out, or /onboarding if no role chosen yet. */
export async function requireSession() {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  return session;
}

/** Redirects to /login, /onboarding, or a "not available" page as needed. */
export async function requireRole(role: 'STUDENT' | 'COMPANY' | 'EDUCATOR' | 'ADMIN') {
  const session = await requireSession();
  if (!session.user.role) redirect('/onboarding');
  if (session.user.role !== role) redirect('/not-available');
  return session;
}
