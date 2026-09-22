'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

export async function createTrainingRequest(formData: FormData) {
  const session = await requireRole('COMPANY');
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) redirect('/company/profile');

  const vacancyId = str(formData, 'vacancyId');

  await prisma.trainingRequest.create({
    data: {
      companyId: company!.id,
      vacancyId: vacancyId || null,
      occupation: str(formData, 'occupation'),
      skillsNeeded: str(formData, 'skillsNeeded'),
      germanLevelNeeded: str(formData, 'germanLevelNeeded'),
      numberOfCandidates: str(formData, 'numberOfCandidates'),
      timeline: str(formData, 'timeline'),
      notes: str(formData, 'notes'),
      status: 'SUBMITTED'
    }
  });

  redirect(`/company/training?ok=${encodeURIComponent('Training request submitted.')}`);
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
