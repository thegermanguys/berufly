import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/authz';

const DASH: Record<string, { href: string; label: string }> = {
  STUDENT: { href: '/student/profile', label: 'My dashboard' },
  COMPANY: { href: '/company/profile', label: 'Company dashboard' },
  EDUCATOR: { href: '/educator/profile', label: 'Educator dashboard' },
  ADMIN: { href: '/admin', label: 'Admin console' }
};

export default async function Nav() {
  const session = await getSession();
  const role = session?.user?.role;
  const dash = role ? DASH[role] : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-head text-lg font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-paper text-sm">B</span>
          Berufly
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-inksoft md:flex">
          <Link href="/browse" className="hover:text-ink">Jobs &amp; Ausbildung</Link>
          <Link href="/courses" className="hover:text-ink">Training</Link>
          {dash ? (
            <Link href={dash.href} className="hover:text-ink">{dash.label}</Link>
          ) : (
            <Link href="/onboarding" className="hover:text-ink">For students</Link>
          )}
          {!role && <Link href="/onboarding" className="hover:text-ink">For companies</Link>}
        </nav>
        <div className="flex items-center gap-3">
          {session?.user?.image && (
            <Image src={session.user.image} alt="" width={26} height={26} className="rounded-full border border-line" />
          )}
          {dash ? (
            <Link href={dash.href} className="btn btn-ghost btn-sm">{dash.label}</Link>
          ) : (
            <Link href={session ? '/onboarding' : '/register'} className="btn btn-primary btn-sm">Get started</Link>
          )}
        </div>
      </div>
    </header>
  );
}
