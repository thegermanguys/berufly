import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { reviewVacancy } from '@/lib/actions/admin';
import { Banner, EmptyState, Pill } from '@/components/ui';
import ReviewControls, { ChangeStatus } from '@/components/ReviewControls';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending review', APPROVED: 'Approved', REJECTED: 'Rejected',
  NEEDS_CHANGES: 'Needs changes', SUSPENDED: 'Suspended', ARCHIVED: 'Archived', CLOSED: 'Closed'
};
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_CHANGES', 'SUSPENDED', 'ARCHIVED', 'CLOSED'];

export default async function AdminVacanciesPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireRole('ADMIN');
  const vacancies = await prisma.vacancy.findMany({ orderBy: [{ status: 'asc' }, { createdAt: 'desc' }] });

  return (
    <div>
      <Banner searchParams={searchParams} />
      {vacancies.length === 0 ? (
        <EmptyState title="No vacancies yet" />
      ) : (
        <div className="grid gap-3">
          {vacancies.map((v) => (
            <div key={v.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{v.title}</div>
                  <div className="text-xs text-inksoft">{v.occupation} · {v.location}</div>
                </div>
                <Pill status={v.status} label={STATUS_LABEL[v.status] || v.status} />
              </div>
              {v.description && <p className="mt-2 text-sm text-inksoft">{v.description}</p>}
              {v.status === 'PENDING' ? (
                <ReviewControls action={reviewVacancy} id={v.id} />
              ) : (
                <ChangeStatus action={reviewVacancy} id={v.id} statuses={STATUSES} current={v.status} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
