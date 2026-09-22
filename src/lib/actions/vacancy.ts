'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

const FIELDS = [
  'title', 'occupation', 'industry', 'location', 'workingModel', 'startDate', 'deadline',
  'otherLanguages', 'education', 'skills', 'experienceLevel', 'salary', 'hours',
  'positions', 'requiredDocuments', 'benefits', 'description'
] as const;

export async function createVacancy(formData: FormData) {
  const session = await requireRole('COMPANY');
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company || company.status !== 'APPROVED') {
    redirect(`/company/vacancies?err=${encodeURIComponent('Your company must be verified before posting a vacancy.')}`);
  }

  const data = collect(formData);
  const vac = await prisma.vacancy.create({
    data: {
      companyId: company!.id,
      type: (formData.get('type') as any) || 'JOB',
      germanLevel: str(formData, 'germanLevel'),
      trainingAvailable: formData.get('trainingAvailable') === 'on',
      status: 'PENDING',
      ...data
    }
  });

  redirect(`/company/vacancies/${vac.id}?ok=${encodeURIComponent('Submitted for approval.')}`);
}

export async function updateVacancy(formData: FormData) {
  const session = await requireRole('COMPANY');
  const vacancyId = String(formData.get('vacancyId'));
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  const vac = await prisma.vacancy.findUnique({ where: { id: vacancyId } });
  if (!vac || !company || vac.companyId !== company.id) redirect('/company/vacancies');

  const data = collect(formData);
  await prisma.vacancy.update({
    where: { id: vacancyId },
    data: {
      type: (formData.get('type') as any) || 'JOB',
      germanLevel: str(formData, 'germanLevel'),
      trainingAvailable: formData.get('trainingAvailable') === 'on',
      status: vac!.status === 'NEEDS_CHANGES' ? 'PENDING' : vac!.status,
      ...data
    }
  });

  redirect(`/company/vacancies/${vacancyId}?ok=${encodeURIComponent('Saved.')}`);
}

export async function closeVacancy(formData: FormData) {
  const session = await requireRole('COMPANY');
  const vacancyId = String(formData.get('vacancyId'));
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  const vac = await prisma.vacancy.findUnique({ where: { id: vacancyId } });
  if (!vac || !company || vac.companyId !== company.id) redirect('/company/vacancies');

  await prisma.vacancy.update({ where: { id: vacancyId }, data: { status: 'CLOSED' } });
  redirect(`/company/vacancies/${vacancyId}?ok=${encodeURIComponent('Vacancy closed.')}`);
}

function collect(formData: FormData) {
  const out: Record<string, string | null> = {};
  for (const key of FIELDS) out[key] = str(formData, key);
  return out;
}
function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
