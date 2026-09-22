import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/authz';
import { computeMatch } from '@/lib/match';
import { applyToVacancy } from '@/lib/actions/candidate';
import { EmptyState, Pill } from '@/components/ui';

export default async function VacancyDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { ok?: string; err?: string };
}) {
  const session = await getSession();
  const vacancy = await prisma.vacancy.findUnique({ where: { id: params.id } });

  const isOwnerCompany =
    session?.user?.role === 'COMPANY' &&
    vacancy &&
    (await prisma.company.findUnique({ where: { userId: session.user.id } }))?.id === vacancy.companyId;

  if (!vacancy || (vacancy.status !== 'APPROVED' && !isOwnerCompany && session?.user?.role !== 'ADMIN')) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState title="This listing isn't available" body="It may be pending review, closed, or removed." action={<Link href="/browse" className="btn btn-ghost">Browse open roles</Link>} />
      </div>
    );
  }

  let candidate = null;
  let existingApp = null;
  if (session?.user?.role === 'STUDENT') {
    candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
    if (candidate) {
      existingApp = await prisma.application.findUnique({
        where: { vacancyId_candidateId: { vacancyId: vacancy.id, candidateId: candidate.id } }
      });
    }
  }
  const match = session?.user?.role === 'STUDENT' ? computeMatch(candidate, vacancy) : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/browse" className="text-sm text-inksoft">&larr; Back to listings</Link>

      {searchParams.ok && <div className="banner-ok mt-4">{decodeURIComponent(searchParams.ok)}</div>}
      {searchParams.err && <div className="banner-err mt-4">{decodeURIComponent(searchParams.err)}</div>}

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl">{vacancy.title}</h1>
          <div className="mt-2 flex gap-3 text-xs text-inksoft">
            <span>{vacancy.type}</span>
            <span>{vacancy.location || 'Location TBC'}</span>
            <span>{vacancy.workingModel}</span>
          </div>
        </div>
        {match && <Pill status={match.tier} label={`${match.tier === 'strong' ? 'Strong' : match.tier === 'partial' ? 'Partial' : 'Limited'} match · ${match.pct}%`} />}
      </div>

      {match && match.checks.length > 0 && (
        <ul className="mt-3 grid gap-1 text-[13px]">
          {match.checks.map((c, i) => (
            <li key={i} className={c.ok ? 'text-tealink' : 'text-inksoft'}>{c.ok ? '✓' : '–'} {c.label}</li>
          ))}
        </ul>
      )}

      <div className="card mt-6">
        <Detail label="Occupation" value={vacancy.occupation} />
        <Detail label="Industry" value={vacancy.industry} />
        <Detail label="Start date" value={vacancy.startDate} />
        <Detail label="Application deadline" value={vacancy.deadline} />
        <Detail label="German level required" value={vacancy.germanLevel} />
        <Detail label="Other languages" value={vacancy.otherLanguages} />
        <Detail label="Education requirement" value={vacancy.education} />
        <Detail label="Required skills" value={vacancy.skills} />
        <Detail label="Experience level" value={vacancy.experienceLevel} />
        <Detail label="Working hours" value={vacancy.hours} />
        <Detail label="Salary / compensation" value={vacancy.salary} />
        <Detail label="Positions available" value={vacancy.positions} />
        <Detail label="Company-specific training" value={vacancy.trainingAvailable ? 'Available' : undefined} />
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold">About the role</h3>
        <p className="whitespace-pre-line text-sm text-inksoft">{vacancy.description || 'No description provided.'}</p>
      </div>
      {vacancy.benefits && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold">Benefits</h3>
          <p className="text-sm text-inksoft">{vacancy.benefits}</p>
        </div>
      )}

      <div className="mt-8">
        {session?.user?.role !== 'STUDENT' ? (
          session ? (
            <p className="text-sm text-inksoft">Only candidate accounts can apply.</p>
          ) : (
            <Link href="/register" className="btn btn-primary">Create a candidate profile to apply</Link>
          )
        ) : existingApp ? (
          <Pill status={existingApp.status} label={`Application status: ${existingApp.status.replace(/_/g, ' ').toLowerCase()}`} />
        ) : (
          <ApplyForm vacancyId={vacancy.id} />
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-t border-line py-2.5 text-sm first:border-t-0 first:pt-0">
      <span className="text-inksoft">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function ApplyForm({ vacancyId }: { vacancyId: string }) {
  return (
    <details className="card">
      <summary className="cursor-pointer btn btn-primary inline-block">Apply to this role</summary>
      <form action={applyToVacancy} className="mt-4">
        <input type="hidden" name="vacancyId" value={vacancyId} />
        <div className="field mb-3">
          <label htmlFor="message">Message to the company (optional)</label>
          <textarea id="message" name="message" placeholder="A short note about why you're a good fit…" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Submit application</button>
      </form>
    </details>
  );
}
