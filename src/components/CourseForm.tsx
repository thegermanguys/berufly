import { Field } from '@/components/ui';
import type { Course } from '@prisma/client';

const CATEGORIES = [
  { value: 'GERMAN_LANGUAGE', label: 'German language' },
  { value: 'OCCUPATION_GERMAN', label: 'Occupation-specific German' },
  { value: 'PROFESSIONAL_SKILLS', label: 'Professional skills' },
  { value: 'WORKPLACE_CULTURE', label: 'German workplace culture' },
  { value: 'CV_INTERVIEW_PREP', label: 'CV & interview preparation' },
  { value: 'AUSBILDUNG_PREP', label: 'Ausbildung preparation' },
  { value: 'INTEGRATION_ORIENTATION', label: 'Integration & orientation' },
  { value: 'COMPANY_SPECIFIC', label: 'Company-specific training' }
];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const FORMATS = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'HYBRID', label: 'Hybrid' }
];

export default function CourseForm({
  action,
  course,
  submitLabel
}: {
  action: (formData: FormData) => void;
  course?: Course;
  submitLabel: string;
}) {
  return (
    <form action={action} className="card max-w-3xl">
      {course && <input type="hidden" name="courseId" value={course.id} />}
      <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
        <Field label="Category" name="category" defaultValue={course?.category} options={CATEGORIES} required />
        <Field label="CEFR level (if applicable)" name="cefrLevel" defaultValue={course?.cefrLevel} options={LEVELS.map((l) => ({ value: l, label: l }))} />
        <Field label="Course title" name="title" defaultValue={course?.title} required />
        <Field label="Language taught" name="language" defaultValue={course?.language} />
        <Field label="Institution / school name" name="institutionName" defaultValue={course?.institutionName} />
        <Field label="Schedule" name="schedule" defaultValue={course?.schedule} />
        <Field label="Duration" name="duration" defaultValue={course?.duration} />
        <Field label="Capacity (seats)" name="capacity" defaultValue={course?.capacity} type="number" />
        <Field label="Price (€, leave blank if free)" name="priceAmount" defaultValue={course?.priceAmount} type="number" />
        <Field label="Format" name="format" defaultValue={course?.format} options={FORMATS} required />
        <Field label="Location / online link" name="location" defaultValue={course?.location} />
        <Field label="Prerequisites" name="prerequisites" defaultValue={course?.prerequisites} />
      </div>
      <div className="field mb-4 flex flex-col gap-2">
        <label className="flex items-center gap-2 font-normal text-ink">
          <input type="checkbox" name="free" defaultChecked={course?.free} className="h-auto w-auto" /> This course is free
        </label>
        <label className="flex items-center gap-2 font-normal text-ink">
          <input type="checkbox" name="certificate" defaultChecked={course?.certificate} className="h-auto w-auto" /> Certificate on completion
        </label>
      </div>
      <Field label="Description" name="description" defaultValue={course?.description} textarea />
      <button type="submit" className="btn btn-primary">{submitLabel}</button>
      {!course && <p className="mt-3 text-sm text-inksoft">An administrator reviews new courses before they&apos;re visible to candidates.</p>}
    </form>
  );
}
