import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { updateCourse } from '@/lib/actions/course';
import { Pill } from '@/components/ui';
import CourseForm from '@/components/CourseForm';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Published',
  REJECTED: 'Rejected',
  NEEDS_CHANGES: 'Needs changes'
};

export default async function EducatorCourseManagePage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { edit?: string; ok?: string; err?: string };
}) {
  const session = await requireRole('EDUCATOR');
  const educator = await prisma.educatorProfile.findUnique({ where: { userId: session.user.id } });
  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course || !educator || course.instructorId !== educator.id) notFound();

  if (searchParams.edit === '1') {
    return (
      <div>
        <Link href={`/educator/courses/${course.id}`} className="text-sm text-inksoft">&larr; Back</Link>
        <h3 className="mb-4 mt-3 text-base font-semibold">Edit course</h3>
        <CourseForm action={updateCourse} course={course} submitLabel="Save changes" />
      </div>
    );
  }

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { courseId: course.id },
    include: { candidate: { include: { user: true } } }
  });

  return (
    <div>
      <Link href="/educator/courses" className="text-sm text-inksoft">&larr; Back to courses</Link>
      {searchParams.ok && <div className="banner-ok mt-3">{decodeURIComponent(searchParams.ok)}</div>}

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{course.title}</h3>
          <Pill status={course.status} label={STATUS_LABEL[course.status]} />
          {course.reviewNote && <span className="ml-2 text-sm text-inksoft">— {course.reviewNote}</span>}
        </div>
        <Link href={`/educator/courses/${course.id}?edit=1`} className="btn btn-ghost btn-sm">Edit</Link>
      </div>

      <h4 className="mb-3 mt-8 text-sm font-semibold">Enrolled students ({enrollments.length})</h4>
      {enrollments.length === 0 ? (
        <p className="text-sm text-inksoft">No enrollments yet.</p>
      ) : (
        <div className="grid gap-2">
          {enrollments.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg border border-line bg-surface p-3">
              <span>{e.candidate.user.name || e.candidate.user.email}</span>
              <Pill status={e.status} label={e.status.toLowerCase()} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
