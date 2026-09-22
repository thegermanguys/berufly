'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

export async function saveEducatorProfile(formData: FormData) {
  const session = await requireRole('EDUCATOR');
  const userId = session.user.id;

  const existing = await prisma.educatorProfile.findUnique({ where: { userId } });
  const data = {
    name: str(formData, 'name'),
    specialties: str(formData, 'specialties'),
    bio: str(formData, 'bio')
  };

  if (existing) {
    await prisma.educatorProfile.update({ where: { userId }, data });
  } else {
    await prisma.educatorProfile.create({ data: { userId, ...data, status: 'PENDING' } });
  }

  redirect(`/educator/profile?ok=${encodeURIComponent(existing ? 'Saved.' : 'Submitted for verification.')}`);
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
