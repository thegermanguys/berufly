import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { saveCompanyProfile } from '@/lib/actions/company';
import { Banner, Field, Pill } from '@/components/ui';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending verification',
  APPROVED: 'Verified',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended'
};

export default async function CompanyProfilePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await requireRole('COMPANY');
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });

  return (
    <div>
      <Banner searchParams={searchParams} />
      {company && (
        <div className="mb-4">
          <Pill status={company.status} label={STATUS_LABEL[company.status] || company.status} />
          {company.reviewNote && <span className="ml-2 text-sm text-inksoft">— {company.reviewNote}</span>}
        </div>
      )}
      <form action={saveCompanyProfile} className="card max-w-xl">
        <Field label="Company name" name="name" defaultValue={company?.name} required />
        <Field label="Industry" name="industry" defaultValue={company?.industry} />
        <Field label="Locations (comma-separated)" name="locations" defaultValue={company?.locations} />
        <Field label="Website" name="website" defaultValue={company?.website} />
        <Field label="Company description" name="description" defaultValue={company?.description} textarea />
        <button type="submit" className="btn btn-primary">{company ? 'Save changes' : 'Submit for verification'}</button>
        {!company && <p className="mt-3 text-sm text-inksoft">An administrator reviews new companies before you can post vacancies.</p>}
      </form>
    </div>
  );
}
