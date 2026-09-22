'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

export async function updateApplicationStatus(formData: FormData) {
  const session = await requireRole('COMPANY');
  const applicationId = String(formData.get('applicationId'));
  const vacancyId = String(formData.get('vacancyId'));
  const status = String(formData.get('status'));

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  const app = await prisma.application.findUnique({ where: { id: applicationId }, include: { vacancy: true } });
  if (!app || !company || app.vacancy.companyId !== company.id) redirect('/company/vacancies');

  const history = Array.isArray(app!.statusHistory) ? (app!.statusHistory as any[]) : [];
  history.push({ status, at: new Date().toISOString(), note: '' });

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: status as any, statusHistory: history as any }
  });

  redirect(`/company/vacancies/${vacancyId}?ok=${encodeURIComponent('Status updated.')}`);
}
