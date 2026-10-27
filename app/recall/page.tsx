'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, Send, ArrowRight } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Memory, RecallResult } from '@/types';
import { truncate } from '@/lib/utils';
import { MEMORY_TYPE_MAP } from '@/types';

const EXAMPLE_QUESTIONS = [
  "What goals have I set for myself?",
  "What decisions have I made recently?",
  "What ideas have I been developing?",
  "Have my priorities changed over time?",
];

interface QA {
  question: string;
  result: RecallResult | null;
  error: string | null;
  loading: boolean;
}

export default function RecallPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<QA[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMemories(storage.getAll());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  async function handleSubmit(q?: string) {
    const text = (q ?? question).trim();
    if (!text || loading) return;

    setQuestion('');
    setLoading(true);

    const entry: QA = { question: text, result: null, error: null, loading: true };
    setHistory(prev => [...prev, entry]);

    try {
      const res = await fetch('/api/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, memories }),
      });
      const data = await res.json();

      if (!res.ok) {
        setHistory(prev =>
          prev.map((h, i) =>
            i === prev.length - 1
              ? { ...h, error: data.error ?? 'Something went wrong', loading: false }
              : h
          )
        );
      } else {
        setHistory(prev =>
          prev.map((h, i) =>
            i === prev.length - 1
              ? { ...h, result: data as RecallResult, loading: false }
              : h
          )
        );
      }
    } catch {
      setHistory(prev =>
        prev.map((h, i) =>
          i === prev.length - 1
            ? { ...h, error: 'Network error — please try again', loading: false }
            : h
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 flex flex-col min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AI Recall
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Ask questions about your saved memories. The AI only uses what you have captured.
        </p>
        {memories.length > 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {memories.length} memor{memories.length === 1 ? 'y' : 'ies'} available
          </p>
        )}
      </div>

      {/* No memories warning */}
      {memories.length === 0 && (
        <div
          className="rounded-xl border p-4 mb-6 text-sm"
          style={{ borderColor: 'var(--border)', background: '#FFF8EE' }}
        >
          <p style={{ color: 'var(--text-secondary)' }}>
            You have no memories saved yet.{' '}
            <Link href="/memories/new" style={{ color: 'var(--accent)' }} className="hover:underline">
              Capture your first memory
            </Link>{' '}
            to get started.
          </p>
        </div>
      )}

      {/* Conversation history */}
      {history.length === 0 && memories.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
            TRY ASKING
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXAMPLE_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => handleSubmit(q)}
                disabled={loading}
                className="text-left px-4 py-3 rounded-xl border bg-white text-sm transition-all hover:shadow-sm hover:border-amber-200 disabled:opacity-50"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-8 mb-8">
          {history.map((item, idx) => (
            <div key={idx}>
              {/* Question */}
              <div className="flex justify-end mb-3">
                <div
                  className="max-w-lg rounded-xl px-4 py-3 text-sm text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  {item.question}
                </div>
              </div>

              {/* Answer */}
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: 'var(--border)', background: 'white' }}
              >
                {item.loading ? (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span className="animate-spin text-base">✦</span>
                    Searching your memories…
                  </div>
                ) : item.error ? (
                  <p className="text-sm text-red-500">{item.error}</p>
                ) : item.result ? (
                  <>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4" style={{ color: 'var(--text-primary)' }}>
                      {item.result.answer}
                    </p>
                    {item.result.citations.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                          SOURCES
                        </p>
                        <div className="space-y-2">
                          {item.result.citations.map(m => {
                            const typeInfo = MEMORY_TYPE_MAP[m.type];
                            return (
                              <Link
                                key={m.id}
                                href={`/memories/${m.id}`}
                                className="flex items-start gap-3 p-2.5 rounded-lg border group transition-all hover:shadow-sm"
                                style={{ borderColor: 'var(--border)' }}
                              >
                                <span
                                  className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-full mt-0.5"
                                  style={{ background: typeInfo.color + '18', color: typeInfo.color }}
                                >
                                  {typeInfo.label}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                                    {m.title}
                                  </p>
                                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                    {truncate(m.content, 80)}
                                  </p>
                                </div>
                                <ArrowRight className="w-3 h-3 shrink-0 mt-1 opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div
        className="sticky bottom-6 rounded-xl border bg-white p-3 shadow-sm"
        style={{ borderColor: 'var(--border-strong)' }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your memories… (Enter to send)"
            rows={2}
            disabled={loading}
            className="flex-1 resize-none text-sm bg-transparent border-none outline-none leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!question.trim() || loading}
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
