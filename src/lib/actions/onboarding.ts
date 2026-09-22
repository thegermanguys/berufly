'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/authz';

const DASH: Record<string, string> = {
  STUDENT: '/student/profile',
  COMPANY: '/company/profile',
  EDUCATOR: '/educator/profile',
  ADMIN: '/admin'
};

export async function pickRole(formData: FormData) {
  const session = await requireSession();
  const role = String(formData.get('role') || '');
  if (!['STUDENT', 'COMPANY', 'EDUCATOR', 'ADMIN'].includes(role)) {
    redirect(`/onboarding?err=${encodeURIComponent('Choose a valid option.')}`);
  }
  if (role === 'ADMIN' && session.user.role !== 'ADMIN') {
    // Extra guard: admin self-service signup is disabled. Promote the
    // first real admin directly in the database (see README), or run
    // `npm run db:seed`.
    redirect(`/onboarding?err=${encodeURIComponent('Admin accounts are created by an existing administrator.')}`);
  }
  await prisma.user.update({ where: { id: session.user.id }, data: { role: role as any } });
  redirect(DASH[role]);
}
