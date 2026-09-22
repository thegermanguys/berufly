import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { updateTrainingRequest } from '@/lib/actions/admin';
import { Banner, EmptyState, Pill } from '@/components/ui';

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Submitted', REVIEWING: 'Berufly reviewing', COURSE_CREATED: 'Training created',
  FULFILLED: 'Fulfilled', CLOSED: 'Closed'
};
const STATUSES = Object.keys(STATUS_LABEL);

export default async function AdminTrainingRequestsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireRole('ADMIN');
  const requests = await prisma.trainingRequest.findMany({
    include: { company: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <Banner searchParams={searchParams} />
      {requests.length === 0 ? (
        <EmptyState title="No training requests yet" />
      ) : (
        <div className="grid gap-3">
          {requests.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{t.occupation || 'Training request'} — {t.company.name}</div>
                  <div className="text-xs text-inksoft">
                    {t.numberOfCandidates} candidate(s) · German {t.germanLevelNeeded || 'any'} · {t.timeline}
                  </div>
                </div>
                <Pill status={t.status} label={STATUS_LABEL[t.status]} />
              </div>
              {t.skillsNeeded && <p className="mt-2 text-sm"><strong>Skills:</strong> {t.skillsNeeded}</p>}
              {t.notes && <p className="mt-1 text-sm text-inksoft">{t.notes}</p>}
              <form action={updateTrainingRequest} className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={t.id} />
                <select name="status" defaultValue={t.status} className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs">
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <input name="adminNote" defaultValue={t.adminNote ?? ''} placeholder="Note to company" className="min-w-[140px] flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs" />
                <button className="btn btn-ghost btn-sm" type="submit">Save</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
