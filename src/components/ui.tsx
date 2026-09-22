export function Pill({ status, label }: { status: string; label: string }) {
  return <span className={`pill pill-${status.toLowerCase()}`}>{label}</span>;
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line p-10 text-center text-inksoft">
      <h3 className="mb-1 text-base font-semibold text-ink">{title}</h3>
      {body && <p className="mx-auto max-w-sm text-sm">{body}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Banner({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const ok = searchParams.ok;
  const err = searchParams.err;
  if (ok) return <div className="banner-ok">{decodeURIComponent(String(ok))}</div>;
  if (err) return <div className="banner-err">{decodeURIComponent(String(err))}</div>;
  return null;
}

export function Tabs({ tabs, active }: { tabs: { href: string; label: string }[]; active: string }) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <a key={t.href} href={t.href} className={`tab ${active === t.href ? 'active' : ''}`}>
          {t.label}
        </a>
      ))}
    </div>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  textarea,
  options,
  required
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  textarea?: boolean;
  options?: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="field mb-4">
      <label htmlFor={name}>{label}</label>
      {textarea ? (
        <textarea id={name} name={name} defaultValue={defaultValue ?? ''} required={required} />
      ) : options ? (
        <select id={name} name={name} defaultValue={defaultValue ?? ''} required={required}>
          <option value="">{required ? 'Select…' : 'Not set'}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input id={name} name={name} type={type} defaultValue={defaultValue ?? ''} required={required} />
      )}
    </div>
  );
}
