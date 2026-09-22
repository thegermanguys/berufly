import { Field } from '@/components/ui';
import type { Vacancy } from '@prisma/client';

const TYPES = [
  { value: 'JOB', label: 'Job' },
  { value: 'AUSBILDUNG', label: 'Ausbildung' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TRAINEE', label: 'Trainee' },
  { value: 'OTHER', label: 'Other' }
];
const LOCATIONS = ['Berlin', 'Potsdam', 'Brandenburg an der Havel', 'Cottbus', 'Frankfurt (Oder)'];
const WORKING_MODELS = ['On-site', 'Hybrid', 'Remote'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function VacancyForm({
  action,
  vacancy,
  submitLabel
}: {
  action: (formData: FormData) => void;
  vacancy?: Vacancy;
  submitLabel: string;
}) {
  return (
    <form action={action} className="card max-w-3xl">
      {vacancy && <input type="hidden" name="vacancyId" value={vacancy.id} />}
      <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
        <Field label="Opportunity type" name="type" defaultValue={vacancy?.type} options={TYPES} required />
        <Field label="Job title" name="title" defaultValue={vacancy?.title} required />
        <Field label="Occupation / Beruf" name="occupation" defaultValue={vacancy?.occupation} />
        <Field label="Industry" name="industry" defaultValue={vacancy?.industry} />
        <Field label="Work location" name="location" defaultValue={vacancy?.location} options={LOCATIONS.map((l) => ({ value: l, label: l }))} />
        <Field label="Working model" name="workingModel" defaultValue={vacancy?.workingModel} options={WORKING_MODELS.map((l) => ({ value: l, label: l }))} />
        <Field label="Start date" name="startDate" defaultValue={vacancy?.startDate} />
        <Field label="Application deadline" name="deadline" defaultValue={vacancy?.deadline} />
        <Field label="Required German level" name="germanLevel" defaultValue={vacancy?.germanLevel} options={LEVELS.map((l) => ({ value: l, label: l }))} />
        <Field label="Other required languages" name="otherLanguages" defaultValue={vacancy?.otherLanguages} />
        <Field label="Education requirement" name="education" defaultValue={vacancy?.education} />
        <Field label="Required skills (comma-separated)" name="skills" defaultValue={vacancy?.skills} />
        <Field label="Experience level" name="experienceLevel" defaultValue={vacancy?.experienceLevel} />
        <Field label="Salary / training compensation" name="salary" defaultValue={vacancy?.salary} />
        <Field label="Working hours" name="hours" defaultValue={vacancy?.hours} />
        <Field label="Number of positions" name="positions" defaultValue={vacancy?.positions} />
        <Field label="Required documents" name="requiredDocuments" defaultValue={vacancy?.requiredDocuments} />
      </div>
      <div className="field mb-4">
        <label className="flex items-center gap-2 font-normal text-ink">
          <input type="checkbox" name="trainingAvailable" defaultChecked={vacancy?.trainingAvailable} className="h-auto w-auto" />
          Company-specific training available
        </label>
      </div>
      <Field label="Description" name="description" defaultValue={vacancy?.description} textarea />
      <Field label="Benefits" name="benefits" defaultValue={vacancy?.benefits} textarea />
      <button type="submit" className="btn btn-primary">{submitLabel}</button>
      {!vacancy && <p className="mt-3 text-sm text-inksoft">An administrator reviews new vacancies before they become searchable.</p>}
    </form>
  );
}
