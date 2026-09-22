import { requireRole } from '@/lib/authz';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole('STUDENT');
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <span className="text-xs font-semibold text-brassink">Candidate dashboard</span>
        <h1 className="mt-1 text-2xl">Your Berufly account</h1>
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        <TabLink href="/student/profile" label="Profile" />
        <TabLink href="/browse" label="Browse jobs" />
        <TabLink href="/student/applications" label="Applications" />
        <TabLink href="/student/training" label="My training" />
        <TabLink href="/student/guidance" label="Integration guidance" />
      </div>
      {children}
    </div>
  );
}

function TabLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="tab">
      {label}
    </a>
  );
}
