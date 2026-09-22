import { requireRole } from '@/lib/authz';

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  await requireRole('COMPANY');
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <span className="text-xs font-semibold text-brassink">Company dashboard</span>
        <h1 className="mt-1 text-2xl">Your Berufly account</h1>
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        <a href="/company/profile" className="tab">Company profile</a>
        <a href="/company/vacancies" className="tab">Vacancies</a>
        <a href="/company/training" className="tab">Training requests</a>
      </div>
      {children}
    </div>
  );
}
