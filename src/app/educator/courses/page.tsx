import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { EmptyState, Pill } from '@/components/ui';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Published',
  REJECTED: 'Rejected',
  NEEDS_CHANGES: 'Needs changes'
};

export default async function EducatorCoursesPage() {
  const session = await requireRole('EDUCATOR');
  const educator = await prisma.educatorProfile.findUnique({ where: { userId: session.user.id } });
  const courses = educator
    ? await prisma.course.findMany({ where: { instructorId: educator.id }, orderBy: { createdAt: 'desc' } })
    : [];
  const canPost = educator?.status === 'APPROVED';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-inksoft">{courses.length} course{courses.length === 1 ? '' : 's'}</span>
        {canPost ? (
          <Link href="/educator/courses/new" className="btn btn-primary btn-sm">Create a course</Link>
        ) : (
          <span className="text-sm text-inksoft">Complete verification to create a course.</span>
        )}
      </div>

      {courses.length === 0 ? (
        <EmptyState title="No courses yet" body={canPost ? 'Create your first course.' : 'You can create courses once your profile is verified.'} />
      ) : (
        <div className="grid gap-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/educator/courses/${c.id}`} className="flex items-center justify-between rounded-lg border border-line bg-surface p-4">
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-xs text-inksoft">{c.category.replace(/_/g, ' ').toLowerCase()} · Posted {c.createdAt.toLocaleDateString('en-GB')}</div>
              </div>
              <Pill status={c.status} label={STATUS_LABEL[c.status] || c.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
