import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-4">
          <div>
            <div className="mb-2 flex items-center gap-2 font-head text-lg font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-paper text-sm">B</span>
              Berufly
            </div>
            <p className="max-w-xs text-sm text-inksoft">
              Helping international students integrate into the German system — starting in Berlin and Brandenburg.
            </p>
          </div>
          <FootCol title="Platform" links={[
            ['Jobs', '/browse'],
            ['Ausbildung', '/browse'],
            ['Training & German courses', '/courses'],
            ['For companies', '/onboarding']
          ]} />
          <FootCol title="Berufly" links={[
            ['About', '/'],
            ['Team', '/#team'],
            ['How it works', '/'],
            ['Help center', '/']
          ]} />
          <FootCol title="Legal" links={[
            ['Privacy', '/'],
            ['Terms', '/'],
            ['Imprint', '/']
          ]} />
        </div>
        <div className="mt-7 border-t border-line pt-4 text-xs text-inksoft">
          &copy; {new Date().getFullYear()} Berufly. Built by{' '}
          <a href="https://www.thegermanguy.org" target="_blank" rel="noopener" className="underline">
            TGG
          </a>
          .
        </div>
      </div>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-inksoft">{title}</h4>
      {links.map(([label, href]) => (
        <Link key={label} href={href} className="block py-1 text-sm text-inksoft hover:text-ink">
          {label}
        </Link>
      ))}
    </div>
  );
}
