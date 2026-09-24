'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

const FIELDS = [
  'title', 'language', 'institutionName', 'schedule', 'duration', 'capacity',
  'priceAmount', 'location', 'prerequisites', 'description'
] as const;

export async function createCourse(formData: FormData) {
  const session = await requireRole('EDUCATOR');
  const educator = await prisma.educatorProfile.findUnique({ where: { userId: session.user.id } });
  if (!educator || educator.status !== 'APPROVED') {
    redirect(`/educator/courses?err=${encodeURIComponent('Your profile must be verified before creating a course.')}`);
  }

  const data = collect(formData);
  if (!data.title) {
    redirect(`/educator/courses?err=${encodeURIComponent('A course title is required.')}`);
  }
  const course = await prisma.course.create({
    data: {
      instructorId: educator!.id,
      category: (formData.get('category') as any) || 'GERMAN_LANGUAGE',
      cefrLevel: str(formData, 'cefrLevel'),
      format: (formData.get('format') as any) || 'OFFLINE',
      free: formData.get('free') === 'on',
      certificate: formData.get('certificate') === 'on',
      status: 'PENDING',
      ...data,
      title: data.title
    }
  });

  redirect(`/educator/courses/${course.id}?ok=${encodeURIComponent('Submitted for approval.')}`);
}

export async function updateCourse(formData: FormData) {
  const session = await requireRole('EDUCATOR');
  const courseId = String(formData.get('courseId'));
  const educator = await prisma.educatorProfile.findUnique({ where: { userId: session.user.id } });
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !educator || course.instructorId !== educator.id) redirect('/educator/courses');

  const data = collect(formData);
  await prisma.course.update({
    where: { id: courseId },
    data: {
      category: (formData.get('category') as any) || 'GERMAN_LANGUAGE',
      cefrLevel: str(formData, 'cefrLevel'),
      format: (formData.get('format') as any) || 'OFFLINE',
      free: formData.get('free') === 'on',
      certificate: formData.get('certificate') === 'on',
      status: course!.status === 'NEEDS_CHANGES' ? 'PENDING' : course!.status,
      ...data,
      title: data.title ?? course.title
    }
  });

  redirect(`/educator/courses/${courseId}?ok=${encodeURIComponent('Saved.')}`);
}

export async function enrollInCourse(formData: FormData) {
  const session = await requireRole('STUDENT');
  const courseId = String(formData.get('courseId'));
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  if (!candidate) redirect(`/courses?err=${encodeURIComponent('Complete your profile before enrolling.')}`);

  const existing = await prisma.courseEnrollment.findUnique({
    where: { courseId_candidateId: { courseId, candidateId: candidate!.id } }
  });
  if (!existing) {
    await prisma.courseEnrollment.create({ data: { courseId, candidateId: candidate!.id } });
  }

  redirect(`/courses?ok=${encodeURIComponent('Enrolled. Find it under My training.')}`);
}

type CourseFields = { [K in (typeof FIELDS)[number]]: string | null };

function collect(formData: FormData): CourseFields {
  const out = {} as CourseFields;
  for (const key of FIELDS) out[key] = str(formData, key);
  return out;
}
function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
