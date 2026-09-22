import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// Stores uploaded files on local disk under UPLOAD_DIR. On Railway,
// mount a persistent Volume at this path (see README) so files
// survive redeploys. Files are served back by src/app/api/uploads/[...path]/route.ts.
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

export async function saveUpload(file: File, subdir: string): Promise<{ url: string; fileName: string }> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || '';
  const id = randomUUID();
  const dir = path.join(UPLOAD_DIR, subdir);
  await mkdir(dir, { recursive: true });
  const storedName = `${id}${ext}`;
  await writeFile(path.join(dir, storedName), bytes);
  return { url: `/api/uploads/${subdir}/${storedName}`, fileName: file.name };
}

export function uploadDir() {
  return UPLOAD_DIR;
}
