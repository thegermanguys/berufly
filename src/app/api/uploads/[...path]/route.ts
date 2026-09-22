import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { uploadDir } from '@/lib/storage';

// Serves files previously saved by saveUpload(). Auth is intentionally
// not enforced here (CVs are shared with a company once someone
// applies) — tighten this if you need per-file access control.
export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const filePath = path.join(uploadDir(), ...params.path);
  const base = uploadDir();
  if (!filePath.startsWith(base)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }
  try {
    const bytes = await readFile(filePath);
    return new NextResponse(bytes, {
      headers: { 'Content-Type': 'application/octet-stream' }
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
