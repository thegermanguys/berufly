import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { EmptyState, Pill } from '@/components/ui';

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Submitted',
  REVIEWING: 'Berufly reviewing',
  COURSE_CREATED: 'Training created',
  FULFILLED: 'Fulfilled',
  CLOSED: 'Closed'
};

export default async function CompanyTrainingPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await requireRole('COMPANY');
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  const requests = company
    ? await prisma.trainingRequest.findMany({ where: { companyId: company.id }, orderBy: { createdAt: 'desc' } })
    : [];

  return (
    <div>
      {searchParams.ok && <div className="banner-ok">{decodeURIComponent(String(searchParams.ok))}</div>}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[52ch] text-sm text-inksoft">
          Tell Berufly what you need — occupation, skills, German level, how many candidates — and we prepare
          candidates for the role, or help you fill an Azubi position you&apos;ve struggled to staff.
        </p>
        <Link href="/company/training/new" className="btn btn-primary btn-sm shrink-0">Request training</Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="No training requests yet" body="Request training when you need candidates prepared for a role, or help filling an Ausbildung position." />
      ) : (
        <div className="grid gap-3">
          {requests.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{t.occupation || 'Training request'}</div>
                  <div className="text-xs text-inksoft">{t.numberOfCandidates || ''} candidate(s) · German {t.germanLevelNeeded || 'any'}</div>
                </div>
                <Pill status={t.status} label={STATUS_LABEL[t.status]} />
              </div>
              {t.notes && <p className="mt-2 text-sm text-inksoft">{t.notes}</p>}
              {t.adminNote && <div className="mt-2 rounded-md bg-surface2 p-2 text-sm">Berufly: {t.adminNote}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
