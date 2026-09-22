import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { EmptyState, Pill } from '@/components/ui';

const FORWARD = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_INVITED', 'INTERVIEW_COMPLETED', 'OFFER', 'ACCEPTED'];

export default async function StudentApplicationsPage() {
  const session = await requireRole('STUDENT');
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  const apps = candidate
    ? await prisma.application.findMany({
        where: { candidateId: candidate.id },
        include: { vacancy: true },
        orderBy: { createdAt: 'desc' }
      })
    : [];

  if (!apps.length) {
    return (
      <EmptyState
        title="No applications yet"
        body="Browse open roles and apply — your status will appear here."
        action={<Link href="/browse" className="btn btn-ghost">Browse roles</Link>}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {apps.map((a) => (
        <div key={a.id} className="card">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/vacancy/${a.vacancyId}`} className="font-semibold">{a.vacancy.title}</Link>
              <div className="text-xs text-inksoft">Applied {a.createdAt.toLocaleDateString('en-GB')}</div>
            </div>
            <Pill status={a.status} label={a.status.replace(/_/g, ' ').toLowerCase()} />
          </div>
          <StatusTrack current={a.status} />
        </div>
      ))}
    </div>
  );
}

function StatusTrack({ current }: { current: string }) {
  if (['REJECTED', 'WITHDRAWN', 'CLOSED'].includes(current)) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-inksoft">{current.toLowerCase()}</span>
      </div>
    );
  }
  const idx = FORWARD.indexOf(current);
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {FORWARD.map((s, i) => (
        <span
          key={s}
          className={`rounded-full border px-2.5 py-1 text-[11px] ${
            i < idx ? 'border-teal bg-teal text-white' : i === idx ? 'border-brass bg-brass text-white' : 'border-line text-inksoft'
          }`}
        >
          {s.replace(/_/g, ' ').toLowerCase()}
        </span>
      ))}
    </div>
  );
}
