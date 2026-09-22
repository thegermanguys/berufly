import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { saveEducatorProfile } from '@/lib/actions/educator';
import { Banner, Field, Pill } from '@/components/ui';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending verification',
  APPROVED: 'Verified',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended'
};

export default async function EducatorProfilePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await requireRole('EDUCATOR');
  const educator = await prisma.educatorProfile.findUnique({ where: { userId: session.user.id } });

  return (
    <div>
      <Banner searchParams={searchParams} />
      {educator && (
        <div className="mb-4">
          <Pill status={educator.status} label={STATUS_LABEL[educator.status] || educator.status} />
          {educator.reviewNote && <span className="ml-2 text-sm text-inksoft">— {educator.reviewNote}</span>}
        </div>
      )}
      <form action={saveEducatorProfile} className="card max-w-xl">
        <Field label="Your name or institution name" name="name" defaultValue={educator?.name} required />
        <Field label="Specialties (e.g. German A1–B2, IT, nursing)" name="specialties" defaultValue={educator?.specialties} />
        <Field label="Short bio / institution description" name="bio" defaultValue={educator?.bio} textarea />
        <button type="submit" className="btn btn-primary">{educator ? 'Save changes' : 'Submit for verification'}</button>
        {!educator && <p className="mt-3 text-sm text-inksoft">An administrator reviews new educators before your courses can be published.</p>}
      </form>
    </div>
  );
}
