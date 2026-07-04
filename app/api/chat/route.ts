import { agentGraph } from '@/lib/agent';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const body = await request.json();
    const userMessage = body.message;
    const projectId = body.projectId || 'general';

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const result = await agentGraph.invoke({
      projectId,
      userMessage,
      userId: user.id,
    });

    return NextResponse.json({ reply: result.reply, usedDeepSearch: result.needsSearch });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}