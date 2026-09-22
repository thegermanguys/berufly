import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { createTrainingRequest } from '@/lib/actions/trainingRequest';
import { Field } from '@/components/ui';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default async function NewTrainingRequestPage() {
  const session = await requireRole('COMPANY');
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  const vacancies = company ? await prisma.vacancy.findMany({ where: { companyId: company.id } }) : [];

  return (
    <div>
      <Link href="/company/training" className="text-sm text-inksoft">&larr; Back to training requests</Link>
      <h3 className="mb-4 mt-3 text-base font-semibold">Request training</h3>
      <form action={createTrainingRequest} className="card max-w-xl">
        {vacancies.length > 0 && (
          <Field
            label="Related vacancy (optional)"
            name="vacancyId"
            options={vacancies.map((v) => ({ value: v.id, label: v.title }))}
          />
        )}
        <Field label="Occupation / role" name="occupation" />
        <Field label="Skills needed (comma-separated)" name="skillsNeeded" />
        <Field label="German level needed" name="germanLevelNeeded" options={LEVELS.map((l) => ({ value: l, label: l }))} />
        <Field label="How many candidates" name="numberOfCandidates" type="number" defaultValue="1" />
        <Field label="Timeline" name="timeline" />
        <Field label="Anything else Berufly should know?" name="notes" textarea />
        <button type="submit" className="btn btn-primary">Submit request</button>
      </form>
    </div>
  );
}
