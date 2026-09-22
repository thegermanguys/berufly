'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

export async function createGuidanceRequest(formData: FormData) {
  const session = await requireRole('STUDENT');
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  if (!candidate) redirect(`/student/guidance?err=${encodeURIComponent('Complete your profile first.')}`);

  const message = String(formData.get('message') || '').trim();
  if (!message) redirect(`/student/guidance?err=${encodeURIComponent('Add a question first.')}`);

  await prisma.guidanceRequest.create({
    data: {
      candidateId: candidate!.id,
      topic: String(formData.get('topic') || 'Something else'),
      message,
      status: 'OPEN'
    }
  });

  redirect(`/student/guidance?ok=${encodeURIComponent('Sent — Berufly will get back to you.')}`);
}
