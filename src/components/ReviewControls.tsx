export default function ReviewControls({
  action,
  id,
  currentNote
}: {
  action: (formData: FormData) => void;
  id: string;
  currentNote?: string | null;
}) {
  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="note"
        placeholder="Optional note (shown to them)"
        defaultValue={currentNote ?? ''}
        className="min-w-[160px] flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs"
      />
      <button name="status" value="APPROVED" className="btn btn-primary btn-sm" type="submit">Approve</button>
      <button name="status" value="REJECTED" className="btn btn-danger btn-sm" type="submit">Reject</button>
    </form>
  );
}

export function ChangeStatus({
  action,
  id,
  statuses,
  current
}: {
  action: (formData: FormData) => void;
  id: string;
  statuses: string[];
  current: string;
}) {
  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={current} className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs">
        {statuses.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, ' ').toLowerCase()}</option>
        ))}
      </select>
      <input name="note" placeholder="Note" className="min-w-[120px] flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs" />
      <button className="btn btn-ghost btn-sm" type="submit">Save</button>
    </form>
  );
}
