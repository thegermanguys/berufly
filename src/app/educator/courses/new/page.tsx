import Link from 'next/link';
import { createCourse } from '@/lib/actions/course';
import CourseForm from '@/components/CourseForm';

export default function NewCoursePage() {
  return (
    <div>
      <Link href="/educator/courses" className="text-sm text-inksoft">&larr; Back to courses</Link>
      <h3 className="mb-4 mt-3 text-base font-semibold">Create a course</h3>
      <CourseForm action={createCourse} submitLabel="Submit for approval" />
    </div>
  );
}
