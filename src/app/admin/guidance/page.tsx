import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { respondToGuidance, closeGuidance } from '@/lib/actions/admin';
import { Banner, EmptyState, Pill } from '@/components/ui';

export default async function AdminGuidancePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireRole('ADMIN');
  const requests = await prisma.guidanceRequest.findMany({
    include: { candidate: { include: { user: true } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
  });

  return (
    <div>
      <Banner searchParams={searchParams} />
      {requests.length === 0 ? (
        <EmptyState title="No guidance requests yet" />
      ) : (
        <div className="grid gap-3">
          {requests.map((g) => (
            <div key={g.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{g.topic}</div>
                  <div className="text-xs text-inksoft">
                    {g.candidate.user.name || g.candidate.user.email} · {g.createdAt.toLocaleDateString('en-GB')}
                  </div>
                </div>
                <Pill status={g.status} label={g.status.toLowerCase()} />
              </div>
              <p className="mt-2 text-sm text-inksoft">{g.message}</p>

              <form action={respondToGuidance} className="mt-3">
                <input type="hidden" name="id" value={g.id} />
                <div className="field mb-2">
                  <label htmlFor={`response-${g.id}`}>Response</label>
                  <textarea id={`response-${g.id}`} name="response" defaultValue={g.response ?? ''} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">Send response &amp; mark answered</button>
                </div>
              </form>
              <form action={closeGuidance} className="mt-2">
                <input type="hidden" name="id" value={g.id} />
                <button type="submit" className="btn btn-ghost btn-sm">Close</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
