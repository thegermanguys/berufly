'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { saveUpload } from '@/lib/storage';

export async function saveCandidateProfile(formData: FormData) {
  const session = await requireRole('STUDENT');
  const userId = session.user.id;

  const data: Record<string, string | null> = {
    germanLevel: str(formData, 'germanLevel'),
    city: str(formData, 'city'),
    targetRegion: str(formData, 'targetRegion'),
    educationLevel: str(formData, 'educationLevel'),
    fieldOfStudy: str(formData, 'fieldOfStudy'),
    desiredOccupation: str(formData, 'desiredOccupation'),
    preferredIndustries: str(formData, 'preferredIndustries'),
    preferredLocations: str(formData, 'preferredLocations'),
    availability: str(formData, 'availability'),
    otherLanguages: str(formData, 'otherLanguages'),
    experienceSummary: str(formData, 'experienceSummary'),
    skills: str(formData, 'skills')
  };

  const cvFile = formData.get('cv') as File | null;
  let cvFields: Record<string, string> = {};
  if (cvFile && cvFile.size > 0) {
    const { url, fileName } = await saveUpload(cvFile, 'cv');
    cvFields = { cvUrl: url, cvFileName: fileName };
  }

  await prisma.candidateProfile.upsert({
    where: { userId },
    create: { userId, ...data, ...cvFields },
    update: { ...data, ...cvFields }
  });

  redirect(`/student/profile?ok=${encodeURIComponent('Profile saved.')}`);
}

export async function applyToVacancy(formData: FormData) {
  const session = await requireRole('STUDENT');
  const vacancyId = String(formData.get('vacancyId'));
  const message = str(formData, 'message');

  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  if (!candidate) {
    redirect(`/vacancy/${vacancyId}?err=${encodeURIComponent('Complete your profile before applying.')}`);
  }

  const existing = await prisma.application.findUnique({
    where: { vacancyId_candidateId: { vacancyId, candidateId: candidate!.id } }
  });
  if (existing) {
    redirect(`/vacancy/${vacancyId}?err=${encodeURIComponent('You already applied to this role.')}`);
  }

  await prisma.application.create({
    data: {
      vacancyId,
      candidateId: candidate!.id,
      message,
      status: 'SUBMITTED',
      statusHistory: [{ status: 'SUBMITTED', at: new Date().toISOString(), note: '' }] as any
    }
  });

  redirect(`/vacancy/${vacancyId}?ok=${encodeURIComponent('Application submitted.')}`);
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
