import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { updateVacancy, closeVacancy } from '@/lib/actions/vacancy';
import { updateApplicationStatus } from '@/lib/actions/application';
import { Banner, Pill } from '@/components/ui';
import VacancyForm from '@/components/VacancyForm';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  NEEDS_CHANGES: 'Needs changes',
  SUSPENDED: 'Suspended',
  ARCHIVED: 'Archived',
  CLOSED: 'Closed'
};
const APP_STATUSES = [
  'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_INVITED',
  'INTERVIEW_COMPLETED', 'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'CLOSED'
];

export default async function CompanyVacancyManagePage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined; edit?: string };
}) {
  const session = await requireRole('COMPANY');
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  const vacancy = await prisma.vacancy.findUnique({ where: { id: params.id } });
  if (!vacancy || !company || vacancy.companyId !== company.id) notFound();

  if (searchParams.edit === '1') {
    return (
      <div>
        <Link href={`/company/vacancies/${vacancy.id}`} className="text-sm text-inksoft">&larr; Back</Link>
        <h3 className="mb-4 mt-3 text-base font-semibold">Edit vacancy</h3>
        <VacancyForm action={updateVacancy} vacancy={vacancy} submitLabel="Save changes" />
      </div>
    );
  }

  const applications = await prisma.application.findMany({
    where: { vacancyId: vacancy.id },
    include: { candidate: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <Link href="/company/vacancies" className="text-sm text-inksoft">&larr; Back to vacancies</Link>
      <Banner searchParams={searchParams} />

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{vacancy.title}</h3>
          <Pill status={vacancy.status} label={STATUS_LABEL[vacancy.status]} />
          {vacancy.reviewNote && <span className="ml-2 text-sm text-inksoft">— {vacancy.reviewNote}</span>}
        </div>
        <div className="flex gap-2">
          {['PENDING', 'NEEDS_CHANGES', 'APPROVED'].includes(vacancy.status) && (
            <Link href={`/company/vacancies/${vacancy.id}?edit=1`} className="btn btn-ghost btn-sm">Edit</Link>
          )}
          {vacancy.status === 'APPROVED' && (
            <form action={closeVacancy}>
              <input type="hidden" name="vacancyId" value={vacancy.id} />
              <button className="btn btn-danger btn-sm" type="submit">Close vacancy</button>
            </form>
          )}
        </div>
      </div>

      <h4 className="mb-3 mt-8 text-sm font-semibold">Applicants ({applications.length})</h4>
      {applications.length === 0 ? (
        <p className="text-sm text-inksoft">No applications yet.</p>
      ) : (
        <div className="grid gap-3">
          {applications.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">Candidate</div>
                  <div className="text-xs text-inksoft">
                    {a.candidate.desiredOccupation || ''} · German {a.candidate.germanLevel || '—'} · {a.candidate.city || ''}
                  </div>
                  {a.candidate.cvUrl ? (
                    <a href={a.candidate.cvUrl} target="_blank" className="text-xs underline">View CV</a>
                  ) : (
                    <span className="text-xs text-inksoft">No CV uploaded</span>
                  )}
                </div>
                <Pill status={a.status} label={a.status.replace(/_/g, ' ').toLowerCase()} />
              </div>
              {a.message && <p className="mt-2 text-sm italic text-inksoft">&ldquo;{a.message}&rdquo;</p>}
              <form action={updateApplicationStatus} className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="applicationId" value={a.id} />
                <input type="hidden" name="vacancyId" value={vacancy.id} />
                <select name="status" defaultValue={a.status} className="rounded-md border border-line bg-surface px-2 py-1.5 text-xs">
                  {APP_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').toLowerCase()}</option>
                  ))}
                </select>
                <button type="submit" className="btn btn-ghost btn-sm">Update status</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
