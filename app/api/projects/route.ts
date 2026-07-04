import { pool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    const result = await pool.query(
      'SELECT name FROM projects WHERE user_id = $1 ORDER BY created_at ASC',
      [user.id]
    );
    return NextResponse.json({ projects: result.rows.map((r) => r.name) });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    const body = await request.json();
    const name = body.name?.trim();

    if (!name) return NextResponse.json({ error: 'Project name required' }, { status: 400 });

    await pool.query(
      'INSERT INTO projects (name, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [name, user.id]
    );

    return NextResponse.json({ success: true, name });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}