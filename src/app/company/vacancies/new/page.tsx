import Link from 'next/link';
import { createVacancy } from '@/lib/actions/vacancy';
import VacancyForm from '@/components/VacancyForm';

export default function NewVacancyPage() {
  return (
    <div>
      <Link href="/company/vacancies" className="text-sm text-inksoft">&larr; Back to vacancies</Link>
      <h3 className="mb-4 mt-3 text-base font-semibold">Post a vacancy</h3>
      <VacancyForm action={createVacancy} submitLabel="Submit for approval" />
    </div>
  );
}
