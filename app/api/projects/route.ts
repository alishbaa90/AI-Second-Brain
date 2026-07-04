import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await pool.query('SELECT name FROM projects ORDER BY created_at ASC');
    const projectNames = result.rows.map((row) => row.name);
    return NextResponse.json({ projects: projectNames });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: 'Project name required' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO projects (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [name]
    );

    return NextResponse.json({ success: true, name });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}