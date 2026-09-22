import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { reviewCourse } from '@/lib/actions/admin';
import { Banner, EmptyState, Pill } from '@/components/ui';
import ReviewControls, { ChangeStatus } from '@/components/ReviewControls';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending review', APPROVED: 'Published', REJECTED: 'Rejected', NEEDS_CHANGES: 'Needs changes'
};
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_CHANGES'];

export default async function AdminCoursesPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireRole('ADMIN');
  const courses = await prisma.course.findMany({
    include: { instructor: true },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
  });

  return (
    <div>
      <Banner searchParams={searchParams} />
      {courses.length === 0 ? (
        <EmptyState title="No courses yet" />
      ) : (
        <div className="grid gap-3">
          {courses.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{c.title || '(untitled)'}</div>
                  <div className="text-xs text-inksoft">{c.category.replace(/_/g, ' ').toLowerCase()} · {c.institutionName}</div>
                </div>
                <Pill status={c.status} label={STATUS_LABEL[c.status] || c.status} />
              </div>
              {c.description && <p className="mt-2 text-sm text-inksoft">{c.description}</p>}
              {c.status === 'PENDING' ? (
                <ReviewControls action={reviewCourse} id={c.id} />
              ) : (
                <ChangeStatus action={reviewCourse} id={c.id} statuses={STATUSES} current={c.status} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
