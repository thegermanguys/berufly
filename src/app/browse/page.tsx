import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/authz';
import { computeMatch, LEVELS } from '@/lib/match';
import { EmptyState, Pill } from '@/components/ui';

const LOCATIONS = ['Berlin', 'Potsdam', 'Brandenburg an der Havel', 'Cottbus', 'Frankfurt (Oder)'];
const TYPES = ['JOB', 'AUSBILDUNG', 'INTERNSHIP', 'TRAINEE', 'OTHER'];

export default async function BrowsePage({
  searchParams
}: {
  searchParams: { q?: string; type?: string; location?: string; level?: string };
}) {
  const session = await getSession();
  const where: any = { status: 'APPROVED' };
  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.location) where.location = searchParams.location;
  if (searchParams.level) where.germanLevel = searchParams.level;
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: 'insensitive' } },
      { occupation: { contains: searchParams.q, mode: 'insensitive' } }
    ];
  }

  const vacancies = await prisma.vacancy.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });

  let candidate = null;
  if (session?.user?.role === 'STUDENT') {
    candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <span className="text-xs font-semibold text-brassink">Opportunities</span>
        <h1 className="mt-1 text-2xl">Jobs &amp; Ausbildung</h1>
      </div>

      <form method="get" className="mb-6 flex flex-wrap gap-3">
        <input name="q" placeholder="Search title or occupation" defaultValue={searchParams.q} className="min-w-[220px] rounded-md border border-line bg-surface px-3 py-2 text-sm" />
        <select name="type" defaultValue={searchParams.type} className="rounded-md border border-line bg-surface px-3 py-2 text-sm">
          <option value="">Any type</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select name="location" defaultValue={searchParams.location} className="rounded-md border border-line bg-surface px-3 py-2 text-sm">
          <option value="">Any location</option>
          {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select name="level" defaultValue={searchParams.level} className="rounded-md border border-line bg-surface px-3 py-2 text-sm">
          <option value="">Any German level</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" type="submit">Filter</button>
      </form>

      {vacancies.length === 0 ? (
        <EmptyState title="No matching listings" body="Try widening your filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {vacancies.map((v) => {
            const match = candidate ? computeMatch(candidate, v) : null;
            return (
              <Link key={v.id} href={`/vacancy/${v.id}`} className="card block">
                <div className="mb-2 flex justify-between gap-2">
                  <span className="font-semibold">{v.title}</span>
                  <span className="pill">{v.type}</span>
                </div>
                <div className="mb-2 text-xs text-inksoft">
                  {v.location || 'Location TBC'} · {v.occupation}{v.germanLevel ? ` · German ${v.germanLevel}` : ''}
                </div>
                {match && (
                  <Pill status={match.tier} label={`${match.tier === 'strong' ? 'Strong' : match.tier === 'partial' ? 'Partial' : 'Limited'} match · ${match.pct}%`} />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
