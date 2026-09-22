import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { EmptyState, Pill } from '@/components/ui';

export default async function StudentTrainingPage() {
  const session = await requireRole('STUDENT');
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  const enrollments = candidate
    ? await prisma.courseEnrollment.findMany({
        where: { candidateId: candidate.id },
        include: { course: true },
        orderBy: { enrolledAt: 'desc' }
      })
    : [];

  return (
    <div>
      <div className="mb-4">
        <Link href="/courses" className="btn btn-ghost btn-sm">Browse all courses</Link>
      </div>
      {enrollments.length === 0 ? (
        <EmptyState title="Not enrolled in any training yet" body="Browse German-language and professional courses and enroll — free where marked." />
      ) : (
        <div className="grid gap-4">
          {enrollments.map((e) => (
            <div key={e.id} className="card flex items-center justify-between">
              <div>
                <div className="font-semibold">{e.course.title}</div>
                <div className="text-xs text-inksoft">
                  {e.course.category.replace(/_/g, ' ').toLowerCase()} · Enrolled {e.enrolledAt.toLocaleDateString('en-GB')}
                </div>
              </div>
              <Pill status={e.status} label={e.status.toLowerCase()} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
