import Link from 'next/link';
import { requireSession } from '@/lib/authz';
import { pickRole } from '@/lib/actions/onboarding';
import { Banner } from '@/components/ui';

const DASH: Record<string, string> = {
  STUDENT: '/student/profile',
  COMPANY: '/company/profile',
  EDUCATOR: '/educator/profile',
  ADMIN: '/admin'
};

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await requireSession();
  const role = session.user.role;

  if (role) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-lg border border-dashed border-line p-10 text-center">
          <h3 className="mb-1 text-base font-semibold">You already have a {role.toLowerCase()} account</h3>
          <p className="mb-3 text-sm text-inksoft">Head to your dashboard to continue.</p>
          <Link href={DASH[role]} className="btn btn-primary">Go to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Banner searchParams={searchParams} />
      <span className="text-xs font-semibold text-brassink">Get started</span>
      <h1 className="mb-2 mt-1 text-3xl">How will you use Berufly?</h1>
      <p className="mb-8 text-inksoft">You can only pick this once here — an administrator can help if you need to change it later.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RoleCard role="STUDENT" title="Candidate" body="I'm looking for a job, Ausbildung, internship or training in Germany." />
        <RoleCard role="COMPANY" title="Company" body="I want to post roles or Ausbildung positions, and tell Berufly what training I need candidates to have." />
        <RoleCard role="EDUCATOR" title="Educator / Institution" body="I want to teach German-language, vocational or preparation courses." />
      </div>
    </div>
  );
}

function RoleCard({ role, title, body }: { role: string; title: string; body: string }) {
  return (
    <form action={pickRole}>
      <input type="hidden" name="role" value={role} />
      <button type="submit" className="card block w-full text-left transition-colors hover:border-ink">
        <span className="mb-2 block text-xs font-semibold text-brassink">Choose</span>
        <h3 className="mb-1 text-base font-semibold">{title}</h3>
        <p className="text-sm text-inksoft">{body}</p>
      </button>
    </form>
  );
}
