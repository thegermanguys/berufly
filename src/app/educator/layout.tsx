import { requireRole } from '@/lib/authz';

export default async function EducatorLayout({ children }: { children: React.ReactNode }) {
  await requireRole('EDUCATOR');
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <span className="text-xs font-semibold text-brassink">Educator dashboard</span>
        <h1 className="mt-1 text-2xl">Your Berufly account</h1>
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        <a href="/educator/profile" className="tab">Profile</a>
        <a href="/educator/courses" className="tab">Courses</a>
      </div>
      {children}
    </div>
  );
}
