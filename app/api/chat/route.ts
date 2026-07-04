import { agentGraph } from '@/lib/agent';
import { NextResponse } from 'next/server';

const DEFAULT_PROJECT_ID = 'general';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessage = body.message;
    const projectId = body.projectId || DEFAULT_PROJECT_ID;

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const result = await agentGraph.invoke({
      projectId,
      userMessage,
    });

    return NextResponse.json({
      reply: result.reply,
      usedDeepSearch: result.needsSearch,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}