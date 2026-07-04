import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || 'general';

    const result = await pool.query(
      `SELECT id, role, content, created_at
       FROM messages
       WHERE project_id = $1
       ORDER BY created_at ASC`,
      [projectId]
    );

    return NextResponse.json({ messages: result.rows });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}