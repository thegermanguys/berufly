import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { createGuidanceRequest } from '@/lib/actions/guidance';
import { Banner, Pill } from '@/components/ui';

const TOPICS = [
  'Ausbildung system explained',
  'Recognition of foreign qualifications',
  'Visa & residence permit basics',
  'German workplace culture',
  'Something else'
];

export default async function StudentGuidancePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await requireRole('STUDENT');
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  const requests = candidate
    ? await prisma.guidanceRequest.findMany({ where: { candidateId: candidate.id }, orderBy: { createdAt: 'desc' } })
    : [];

  return (
    <div>
      <Banner searchParams={searchParams} />

      <div className="card mb-6">
        <h3 className="mb-2 text-base font-semibold">Integration guidance</h3>
        <p className="mb-3 text-sm text-inksoft">
          Free help for candidates settling into the German system — general orientation, not legal advice. For
          anything binding, always confirm with the relevant authority (Ausländerbehörde, Chamber of Commerce, or
          your embassy).
        </p>
        <InfoBlock
          title="The Ausbildung system"
          body="Ausbildung is Germany's dual vocational training model: you work at a company and attend a vocational school (Berufsschule) at the same time, usually over 2–3.5 years, earning a training wage throughout."
        />
        <InfoBlock
          title="Recognition of foreign qualifications"
          body="Foreign school, vocational and university qualifications often need a formal recognition check (Anerkennung) before they count fully toward German requirements — the process and authority depends on the profession."
        />
        <InfoBlock
          title="Visa & residence permit basics"
          body="Non-EU candidates typically need a visa or residence permit tied to study, training or work purpose before starting — requirements vary by home country and by opportunity type, so check with the German embassy or local Ausländerbehörde early."
        />
        <InfoBlock
          title="German workplace culture"
          body="Punctuality, direct communication, and clear role boundaries are commonly valued in German workplaces — Berufly's training covers this in more depth."
        />
      </div>

      <div className="card max-w-xl">
        <h3 className="mb-3 text-base font-semibold">Ask Berufly for guidance</h3>
        <form action={createGuidanceRequest}>
          <div className="field mb-4">
            <label htmlFor="topic">Topic</label>
            <select id="topic" name="topic" defaultValue={TOPICS[0]}>
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field mb-4">
            <label htmlFor="message">Your question</label>
            <textarea id="message" name="message" placeholder="Tell us what you need help with…" required />
          </div>
          <button type="submit" className="btn btn-primary">Send request</button>
        </form>

        {requests.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            {requests.map((r) => (
              <div key={r.id} className="mb-4">
                <div className="text-sm font-semibold">
                  {r.topic} <Pill status={r.status} label={r.status.toLowerCase()} />
                </div>
                <div className="mt-1 text-sm text-inksoft">{r.message}</div>
                {r.response && (
                  <div className="mt-2 rounded-md bg-surface2 p-2.5 text-sm">{r.response}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="text-sm text-inksoft">{body}</p>
    </div>
  );
}
