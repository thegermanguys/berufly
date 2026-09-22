import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { reviewCompany } from '@/lib/actions/admin';
import { Banner, EmptyState, Pill } from '@/components/ui';
import ReviewControls, { ChangeStatus } from '@/components/ReviewControls';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending verification', APPROVED: 'Verified', REJECTED: 'Rejected', SUSPENDED: 'Suspended'
};
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

export default async function AdminCompaniesPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireRole('ADMIN');
  const companies = await prisma.company.findMany({ orderBy: [{ status: 'asc' }, { createdAt: 'desc' }] });

  return (
    <div>
      <Banner searchParams={searchParams} />
      {companies.length === 0 ? (
        <EmptyState title="No companies yet" />
      ) : (
        <div className="grid gap-3">
          {companies.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{c.name || '(unnamed company)'}</div>
                  <div className="text-xs text-inksoft">{c.industry} · {c.locations}</div>
                </div>
                <Pill status={c.status} label={STATUS_LABEL[c.status] || c.status} />
              </div>
              {c.description && <p className="mt-2 text-sm text-inksoft">{c.description}</p>}
              {c.status === 'PENDING' ? (
                <ReviewControls action={reviewCompany} id={c.id} />
              ) : (
                <ChangeStatus action={reviewCompany} id={c.id} statuses={STATUSES} current={c.status} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
