import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/authz';
import { EmptyState } from '@/components/ui';
import { enrollInCourse } from '@/lib/actions/course';
import Link from 'next/link';

const CATEGORIES = [
  ['GERMAN_LANGUAGE', 'German language'],
  ['OCCUPATION_GERMAN', 'Occupation-specific German'],
  ['PROFESSIONAL_SKILLS', 'Professional skills'],
  ['WORKPLACE_CULTURE', 'German workplace culture'],
  ['CV_INTERVIEW_PREP', 'CV & interview preparation'],
  ['AUSBILDUNG_PREP', 'Ausbildung preparation'],
  ['INTEGRATION_ORIENTATION', 'Integration & orientation'],
  ['COMPANY_SPECIFIC', 'Company-specific training']
] as const;
const FORMATS = ['ONLINE', 'OFFLINE', 'HYBRID'];

export default async function CoursesPage({
  searchParams
}: {
  searchParams: { q?: string; category?: string; format?: string; ok?: string; err?: string };
}) {
  const session = await getSession();
  const where: any = { status: 'APPROVED' };
  if (searchParams.category) where.category = searchParams.category;
  if (searchParams.format) where.format = searchParams.format;
  if (searchParams.q) where.title = { contains: searchParams.q, mode: 'insensitive' };

  const courses = await prisma.course.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <span className="text-xs font-semibold text-brassink">Training</span>
        <h1 className="mt-1 text-2xl">German courses &amp; professional training</h1>
      </div>

      {searchParams.ok && <div className="banner-ok">{decodeURIComponent(searchParams.ok)}</div>}
      {searchParams.err && <div className="banner-err">{decodeURIComponent(searchParams.err)}</div>}

      <form method="get" className="mb-6 flex flex-wrap gap-3">
        <input name="q" placeholder="Search courses" defaultValue={searchParams.q} className="min-w-[220px] rounded-md border border-line bg-surface px-3 py-2 text-sm" />
        <select name="category" defaultValue={searchParams.category} className="rounded-md border border-line bg-surface px-3 py-2 text-sm">
          <option value="">Any category</option>
          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="format" defaultValue={searchParams.format} className="rounded-md border border-line bg-surface px-3 py-2 text-sm">
          <option value="">Any format</option>
          {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" type="submit">Filter</button>
      </form>

      {courses.length === 0 ? (
        <EmptyState title="No matching courses" body="Try widening your filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="card">
              <div className="mb-2 flex justify-between gap-2">
                <span className="font-semibold">{c.title}</span>
                <span className="pill">{c.free ? 'Free' : c.priceAmount ? `€${c.priceAmount}` : 'Paid'}</span>
              </div>
              <div className="mb-2 text-xs text-inksoft">
                {CATEGORIES.find(([v]) => v === c.category)?.[1]}{c.cefrLevel ? ` · ${c.cefrLevel}` : ''} · {c.format}
              </div>
              <p className="mb-3 text-sm text-inksoft">{(c.description || '').slice(0, 110)}{(c.description || '').length > 110 ? '…' : ''}</p>
              {session?.user?.role === 'STUDENT' ? (
                <form action={enrollInCourse}>
                  <input type="hidden" name="courseId" value={c.id} />
                  <button className="btn btn-ghost btn-sm" type="submit">Enroll</button>
                </form>
              ) : !session ? (
                <Link href="/register" className="btn btn-ghost btn-sm">Sign in as a candidate to enroll</Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
