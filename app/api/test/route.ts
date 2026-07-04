import { getChatResponse } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const reply = await getChatResponse(userMessage);

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}