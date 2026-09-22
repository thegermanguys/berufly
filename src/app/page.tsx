import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function LandingPage() {
  const [openVacancies, companies, courses, students, featuredVacancies, featuredCourses] = await Promise.all([
    prisma.vacancy.count({ where: { status: 'APPROVED' } }),
    prisma.company.count({ where: { status: 'APPROVED' } }),
    prisma.course.count({ where: { status: 'APPROVED' } }),
    prisma.candidateProfile.count(),
    prisma.vacancy.findMany({ where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.course.findMany({ where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, take: 3 })
  ]);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6">
        <section className="grid gap-10 py-14 md:grid-cols-[1.3fr_0.9fr] md:items-end md:py-16">
          <div>
            <h1 className="max-w-[14ch] text-4xl leading-[1.05] md:text-5xl">
              Helping international students build a life in Germany.
            </h1>
            <p className="mt-4 max-w-[46ch] text-inksoft">
              Berufly exists to help international students and candidates integrate into the German system —
              through free guidance, German-language and professional training, and transparent matching with
              companies and Ausbildung positions. Companies struggling to fill Azubi roles get help finding and
              preparing candidates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/onboarding" className="btn btn-brass">Start integrating</Link>
              <Link href="/browse" className="btn btn-ghost">Browse opportunities</Link>
            </div>
            <div className="mt-4">
              <span className="pill" style={{ color: 'var(--teal-ink)' }}>
                Starting in Berlin &amp; Brandenburg — expanding across Germany
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-ink p-6 text-paper">
            <StatRow n={openVacancies} label="Open roles & Ausbildung positions, approved" />
            <StatRow n={companies} label="Verified companies hiring" />
            <StatRow n={courses} label="Training & German courses running" />
            <StatRow n={students} label="Candidate profiles on Berufly" />
          </div>
        </section>
      </div>

      <div className="border-t border-line" />
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-6">
          <span className="text-xs font-semibold text-brassink">How it works</span>
          <h2 className="mt-1 text-2xl">From first profile to first day on the job</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Step n={1} title="Build a profile" body="Candidates add education, skills, German level and goals. Companies describe roles, Ausbildung positions and requirements." />
          <Step n={2} title="Berufly reviews it" body="Every company, vacancy and course is checked by an administrator before it goes live." />
          <Step n={3} title="See a transparent match" body="Requirements are compared against each profile with a plain-language explanation, not a black-box score." />
          <Step n={4} title="Apply, train, progress" body="Candidates apply and track status; Berufly can recommend training along the way." />
          <Step n={5} title="Hire, or keep learning" body="Companies move candidates through interview stages; candidates can enroll in training either way." />
        </div>
      </section>

      <div className="border-t border-line" />
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-5 md:grid-cols-3">
          <AudienceCard title="For students & candidates" body="Search jobs and Ausbildung roles, prepare with German-language and professional training, and get free guidance integrating into the German system." href="/onboarding" cta="Explore as a student" />
          <AudienceCard title="For companies" body="Post roles precisely — including Ausbildung — review verified candidates, and tell us your training requirements so we prepare candidates for you." href="/onboarding" cta="Explore as a company" />
          <AudienceCard title="For educators & institutions" body="Offer German-language, vocational and preparation courses to a pipeline of motivated candidates across Berlin and Brandenburg." href="/onboarding" cta="Explore as an educator" />
        </div>
      </section>

      <div className="border-t border-line" />
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <span className="text-xs font-semibold text-brassink">Open now</span>
            <h2 className="mt-1 text-2xl">Featured opportunities</h2>
          </div>
          <Link href="/browse" className="btn btn-ghost btn-sm">Browse all</Link>
        </div>
        {featuredVacancies.length === 0 ? (
          <p className="text-sm text-inksoft">No approved listings yet — check back soon.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredVacancies.map((v) => (
              <Link key={v.id} href={`/vacancy/${v.id}`} className="card block">
                <div className="mb-2 flex justify-between gap-2">
                  <span className="font-semibold">{v.title}</span>
                  <span className="pill">{v.type}</span>
                </div>
                <div className="text-xs text-inksoft">{v.location || 'Location TBC'} · {v.occupation}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="border-t border-line" />
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <span className="text-xs font-semibold text-brassink">Learn</span>
            <h2 className="mt-1 text-2xl">Training &amp; German courses</h2>
          </div>
          <Link href="/courses" className="btn btn-ghost btn-sm">Browse all</Link>
        </div>
        {featuredCourses.length === 0 ? (
          <p className="text-sm text-inksoft">No published courses yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredCourses.map((c) => (
              <div key={c.id} className="card">
                <div className="mb-2 flex justify-between gap-2">
                  <span className="font-semibold">{c.title}</span>
                  <span className="pill">{c.free ? 'Free' : c.priceAmount ? `€${c.priceAmount}` : 'Paid'}</span>
                </div>
                <div className="text-xs text-inksoft">{c.category.replace(/_/g, ' ').toLowerCase()}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="border-t border-line" />
      <section id="team" className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-6">
          <span className="text-xs font-semibold text-brassink">Who&apos;s behind Berufly</span>
          <h2 className="mt-1 text-2xl">Team</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TeamCard name="Johanna Janotta" role="Co-Founder" linkedin="https://www.linkedin.com/in/johanna-janotta-512a1b" />
          <TeamCard name="Awanish Srivastava" role="Co-Founder" linkedin="https://www.linkedin.com/in/imawanish5" />
        </div>
      </section>

      <div className="border-t border-line" />
      <section className="mx-auto max-w-2xl px-6 py-14">
        <div className="mb-6">
          <span className="text-xs font-semibold text-brassink">Questions</span>
          <h2 className="mt-1 text-2xl">Frequently asked</h2>
        </div>
        <Faq q="Is Berufly free for candidates?" a="Yes. Creating a profile, browsing opportunities, applying, and getting integration guidance is free for students and candidates." />
        <Faq q="How does matching work?" a="Berufly compares a vacancy's stated requirements against a candidate's profile and shows exactly what matches and what's missing. Nothing is decided automatically." />
        <Faq q="Why does everything need approval?" a="Companies, vacancies and course listings are reviewed by Berufly administrators before they're visible, so candidates only see verified opportunities." />
        <Faq q="Do you support Ausbildung specifically?" a="Yes — Ausbildung is a first-class opportunity type with its own requirements and workflow, not just a job subtype." />
      </section>
    </div>
  );
}

function StatRow({ n, label }: { n: number; label: string }) {
  return (
    <div className="border-t border-white/15 py-3 first:border-t-0 first:py-0">
      <div className="font-head text-2xl font-bold">{n}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div>
      <div className="mb-2 border-b border-line pb-2 font-head text-xs text-inksoft">0{n}</div>
      <h4 className="mb-1 text-sm font-semibold">{title}</h4>
      <p className="text-[13px] text-inksoft">{body}</p>
    </div>
  );
}

function AudienceCard({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="card">
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <p className="text-sm text-inksoft">{body}</p>
      <Link href={href} className="btn btn-ghost btn-sm mt-2">{cta}</Link>
    </div>
  );
}

function TeamCard({ name, role, linkedin }: { name: string; role: string; linkedin: string }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2);
  return (
    <div className="card flex items-start gap-4">
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-teal font-head text-lg font-bold text-white" style={{ width: 52, height: 52 }}>
        {initials}
      </div>
      <div>
        <div className="font-semibold">{name}</div>
        <div className="mb-1 text-xs font-semibold text-brassink">{role}</div>
        <a href={linkedin} target="_blank" rel="noopener" className="text-xs text-inksoft underline">LinkedIn ↗</a>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="border-t border-line py-4">
      <summary className="cursor-pointer text-sm font-semibold">{q}</summary>
      <p className="mt-2 text-sm text-inksoft">{a}</p>
    </details>
  );
}
