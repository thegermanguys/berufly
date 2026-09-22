import Link from 'next/link';

export default function NotAvailablePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-lg border border-dashed border-line p-10 text-center">
        <h3 className="mb-1 text-base font-semibold">Not available</h3>
        <p className="mb-3 text-sm text-inksoft">This area isn&apos;t part of your account type.</p>
        <Link href="/" className="btn btn-ghost">Go home</Link>
      </div>
    </div>
  );
}
