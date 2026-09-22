'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

export async function reviewCompany(formData: FormData) {
  const session = await requireRole('ADMIN');
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  const note = String(formData.get('note') || '').trim();
  await prisma.company.update({
    where: { id },
    data: { status: status as any, reviewNote: note, reviewedBy: session.user.id, reviewedAt: new Date() }
  });
  redirect(`/admin/companies?ok=${encodeURIComponent('Status updated.')}`);
}

export async function reviewVacancy(formData: FormData) {
  const session = await requireRole('ADMIN');
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  const note = String(formData.get('note') || '').trim();
  await prisma.vacancy.update({
    where: { id },
    data: { status: status as any, reviewNote: note, reviewedBy: session.user.id, reviewedAt: new Date() }
  });
  redirect(`/admin/vacancies?ok=${encodeURIComponent('Status updated.')}`);
}

export async function reviewCourse(formData: FormData) {
  const session = await requireRole('ADMIN');
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  const note = String(formData.get('note') || '').trim();
  await prisma.course.update({
    where: { id },
    data: { status: status as any, reviewNote: note, reviewedBy: session.user.id, reviewedAt: new Date() }
  });
  redirect(`/admin/courses?ok=${encodeURIComponent('Status updated.')}`);
}

export async function updateTrainingRequest(formData: FormData) {
  await requireRole('ADMIN');
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  const adminNote = String(formData.get('adminNote') || '').trim();
  await prisma.trainingRequest.update({ where: { id }, data: { status: status as any, adminNote } });
  redirect(`/admin/training-requests?ok=${encodeURIComponent('Updated.')}`);
}

export async function respondToGuidance(formData: FormData) {
  const session = await requireRole('ADMIN');
  const id = String(formData.get('id'));
  const response = String(formData.get('response') || '').trim();
  await prisma.guidanceRequest.update({
    where: { id },
    data: { response, status: 'ANSWERED', respondedBy: session.user.id, respondedAt: new Date() }
  });
  redirect(`/admin/guidance?ok=${encodeURIComponent('Response sent.')}`);
}

export async function closeGuidance(formData: FormData) {
  await requireRole('ADMIN');
  const id = String(formData.get('id'));
  await prisma.guidanceRequest.update({ where: { id }, data: { status: 'CLOSED' } });
  redirect(`/admin/guidance?ok=${encodeURIComponent('Closed.')}`);
}
