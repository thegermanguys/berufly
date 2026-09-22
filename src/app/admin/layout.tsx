import { requireRole } from '@/lib/authz';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('ADMIN');
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <span className="text-xs font-semibold text-brassink">Admin console</span>
        <h1 className="mt-1 text-2xl">Review &amp; approvals</h1>
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        <a href="/admin" className="tab">Overview</a>
        <a href="/admin/companies" className="tab">Companies</a>
        <a href="/admin/vacancies" className="tab">Vacancies</a>
        <a href="/admin/courses" className="tab">Courses</a>
        <a href="/admin/training-requests" className="tab">Training requests</a>
        <a href="/admin/guidance" className="tab">Guidance</a>
      </div>
      {children}
    </div>
  );
}
