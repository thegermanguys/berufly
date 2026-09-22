import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { EmptyState, Pill } from '@/components/ui';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  NEEDS_CHANGES: 'Needs changes',
  SUSPENDED: 'Suspended',
  ARCHIVED: 'Archived',
  CLOSED: 'Closed'
};

export default async function CompanyVacanciesPage() {
  const session = await requireRole('COMPANY');
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  const vacancies = company
    ? await prisma.vacancy.findMany({ where: { companyId: company.id }, orderBy: { createdAt: 'desc' } })
    : [];
  const canPost = company?.status === 'APPROVED';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-inksoft">{vacancies.length} vacanc{vacancies.length === 1 ? 'y' : 'ies'}</span>
        {canPost ? (
          <Link href="/company/vacancies/new" className="btn btn-primary btn-sm">Post a vacancy</Link>
        ) : (
          <span className="text-sm text-inksoft">Complete company verification to post a vacancy.</span>
        )}
      </div>

      {vacancies.length === 0 ? (
        <EmptyState title="No vacancies yet" body={canPost ? 'Post your first role or Ausbildung position.' : 'You can post once your company profile is verified.'} />
      ) : (
        <div className="grid gap-3">
          {vacancies.map((v) => (
            <Link key={v.id} href={`/company/vacancies/${v.id}`} className="flex items-center justify-between rounded-lg border border-line bg-surface p-4">
              <div>
                <div className="font-semibold">{v.title}</div>
                <div className="text-xs text-inksoft">{v.location || ''} · Posted {v.createdAt.toLocaleDateString('en-GB')}</div>
              </div>
              <Pill status={v.status} label={STATUS_LABEL[v.status] || v.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
