import { pool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || 'general';

    const result = await pool.query(
      `SELECT id, role, content, created_at
       FROM messages
       WHERE project_id = $1 AND user_id = $2
       ORDER BY created_at ASC`,
      [projectId, user.id]
    );

    return NextResponse.json({ messages: result.rows });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}