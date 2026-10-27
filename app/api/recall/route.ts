import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Memory } from '@/types';

// Client is instantiated lazily inside the handler so an empty key
// does not crash the module at import time during prerender.
function getClient(apiKey: string) {
  return new Anthropic({ apiKey });
}

function selectRelevantMemories(question: string, memories: Memory[]): Memory[] {
  const q = question.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 3);

  const scored = memories.map(m => {
    const text = `${m.title} ${m.content} ${m.tags.join(' ')}`.toLowerCase();
    const score = words.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
    return { memory: m, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top 8 relevant memories (or all if few)
  const topScored = scored.filter(s => s.score > 0).slice(0, 8).map(s => s.memory);
  if (topScored.length === 0) {
    // No keyword match — return 5 most recent
    return memories.slice(0, 5);
  }
  return topScored;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI recall is not configured. Set ANTHROPIC_API_KEY in your environment.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { question, memories } = body as { question: string; memories: Memory[] };

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    if (!Array.isArray(memories)) {
      return NextResponse.json({ error: 'Memories array is required' }, { status: 400 });
    }

    const sanitizedQuestion = question.slice(0, 500);

    if (memories.length === 0) {
      return NextResponse.json({
        answer: "You haven't saved any memories yet. Start by capturing some notes, goals, or decisions — then I can help you search and reflect on them.",
        citations: [],
        model: 'none',
      });
    }

    const relevant = selectRelevantMemories(sanitizedQuestion, memories);

    const memoriesContext = relevant
      .map((m, i) =>
        `[Memory ${i + 1}] (${m.type}, saved ${new Date(m.createdAt).toLocaleDateString()})\nTitle: ${m.title}\nContent: ${m.content}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = `You are a personal knowledge assistant for ContextOS.
Your job is to answer questions based ONLY on the user's saved memories provided below.
Rules:
- Only use information explicitly stated in the memories.
- If the answer is not in the memories, say so clearly.
- Do not invent details or make assumptions beyond what is stated.
- Cite which memories support your answer using [Memory N] references.
- Be concise and direct. Aim for 2-4 sentences unless more detail is needed.
- If you notice tensions or contradictions between memories, point them out factually.`;

    const userMessage = `Here are my saved memories:\n\n${memoriesContext}\n\n---\n\nMy question: ${sanitizedQuestion}`;

    const response = await getClient(apiKey).messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text : '';

    // Find which memories are actually cited in the answer
    const citedIndices = relevant
      .map((_, i) => i)
      .filter(i => answer.includes(`[Memory ${i + 1}]`));
    const citations = citedIndices.map(i => relevant[i]);

    return NextResponse.json({
      answer,
      citations: citations.length > 0 ? citations : relevant.slice(0, 2),
      model: 'claude-haiku-4-5-20251001',
    });
  } catch (err) {
    console.error('Recall error:', err);
    const message = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json(
      { error: `Recall failed: ${message}` },
      { status: 500 }
    );
  }
}
