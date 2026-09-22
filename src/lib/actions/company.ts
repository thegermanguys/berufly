'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

export async function saveCompanyProfile(formData: FormData) {
  const session = await requireRole('COMPANY');
  const userId = session.user.id;

  const existing = await prisma.company.findUnique({ where: { userId } });
  const data = {
    name: str(formData, 'name'),
    industry: str(formData, 'industry'),
    locations: str(formData, 'locations'),
    website: str(formData, 'website'),
    description: str(formData, 'description')
  };

  if (existing) {
    await prisma.company.update({ where: { userId }, data });
  } else {
    await prisma.company.create({ data: { userId, ...data, status: 'PENDING' } });
  }

  redirect(`/company/profile?ok=${encodeURIComponent(existing ? 'Saved.' : 'Submitted for verification.')}`);
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
