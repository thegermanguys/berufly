import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

export default async function AdminOverviewPage() {
  await requireRole('ADMIN');

  const [students, companies, vacancies, courses, pendingC, pendingV, pendingCourses, openTR, openG] = await Promise.all([
    prisma.candidateProfile.count(),
    prisma.company.count(),
    prisma.vacancy.count(),
    prisma.course.count(),
    prisma.company.count({ where: { status: 'PENDING' } }),
    prisma.vacancy.count({ where: { status: 'PENDING' } }),
    prisma.course.count({ where: { status: 'PENDING' } }),
    prisma.trainingRequest.count({ where: { status: 'SUBMITTED' } }),
    prisma.guidanceRequest.count({ where: { status: 'OPEN' } })
  ]);

  return (
    <div>
      <div className="mb-7 grid gap-3 sm:grid-cols-4">
        <Kpi n={students} label="Candidate profiles" />
        <Kpi n={companies} label="Companies" />
        <Kpi n={vacancies} label="Vacancies" />
        <Kpi n={courses} label="Courses" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <OverviewLink href="/admin/companies" title={`${pendingC} compan${pendingC === 1 ? 'y' : 'ies'} awaiting review`} body="Verify new companies before they can post vacancies." />
        <OverviewLink href="/admin/vacancies" title={`${pendingV} vacanc${pendingV === 1 ? 'y' : 'ies'} awaiting review`} body="Approve or request changes before listings go live." />
        <OverviewLink href="/admin/courses" title={`${pendingCourses} course${pendingCourses === 1 ? '' : 's'} awaiting review`} body="Approve educator courses before candidates can enroll." />
        <OverviewLink href="/admin/training-requests" title={`${openTR} training request${openTR === 1 ? '' : 's'} from companies`} body="Companies asking Berufly to prepare or supply candidates." />
        <OverviewLink href="/admin/guidance" title={`${openG} guidance request${openG === 1 ? '' : 's'} open`} body="Candidates asking for help integrating into the German system." />
      </div>
    </div>
  );
}

function Kpi({ n, label }: { n: number; label: string }) {
  return (
    <div className="card">
      <div className="font-head text-2xl font-bold">{n}</div>
      <div className="text-xs text-inksoft">{label}</div>
    </div>
  );
}

function OverviewLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="card block">
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      <p className="text-sm text-inksoft">{body}</p>
    </Link>
  );
}
