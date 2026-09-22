import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { saveCandidateProfile } from '@/lib/actions/candidate';
import { Banner, Field } from '@/components/ui';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default async function StudentProfilePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await requireRole('STUDENT');
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });

  return (
    <div>
      <Banner searchParams={searchParams} />
      <form action={saveCandidateProfile} encType="multipart/form-data" className="card max-w-2xl">
        <Field label="German level (A1–C2)" name="germanLevel" defaultValue={candidate?.germanLevel} options={LEVELS.map((l) => ({ value: l, label: l }))} />
        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
          <Field label="Current city" name="city" defaultValue={candidate?.city} />
          <Field label="Target region/city" name="targetRegion" defaultValue={candidate?.targetRegion} />
          <Field label="Education level" name="educationLevel" defaultValue={candidate?.educationLevel} />
          <Field label="Field of study / qualification" name="fieldOfStudy" defaultValue={candidate?.fieldOfStudy} />
          <Field label="Desired occupation (Beruf)" name="desiredOccupation" defaultValue={candidate?.desiredOccupation} />
          <Field label="Preferred industries" name="preferredIndustries" defaultValue={candidate?.preferredIndustries} />
          <Field label="Preferred locations (comma-separated)" name="preferredLocations" defaultValue={candidate?.preferredLocations} />
          <Field label="Availability" name="availability" defaultValue={candidate?.availability} />
          <Field label="Other languages" name="otherLanguages" defaultValue={candidate?.otherLanguages} />
        </div>
        <Field label="Work experience" name="experienceSummary" defaultValue={candidate?.experienceSummary} textarea />
        <Field label="Skills (comma-separated)" name="skills" defaultValue={candidate?.skills} textarea />

        <div className="field mb-4">
          <label htmlFor="cv">CV</label>
          {candidate?.cvUrl && (
            <div className="mb-2 text-sm">
              Current file: <a href={candidate.cvUrl} target="_blank" className="underline">view</a>
            </div>
          )}
          <input type="file" id="cv" name="cv" accept=".pdf,.doc,.docx" />
          <div className="mt-1 text-xs text-inksoft">PDF preferred. Uploading a new file replaces the current one.</div>
        </div>

        <button type="submit" className="btn btn-primary">Save profile</button>
      </form>
    </div>
  );
}
