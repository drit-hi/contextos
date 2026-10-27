'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Memory, MEMORY_TYPES } from '@/types';
import MemoryCard from '@/components/MemoryCard';
import EmptyState from '@/components/EmptyState';

export default function DashboardPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMemories(storage.getAll());
    setMounted(true);
  }, []);

  function handleDelete(id: string) {
    if (!confirm('Delete this memory?')) return;
    storage.delete(id);
    setMemories(storage.getAll());
  }

  const recent = memories.slice(0, 6);

  // Count by type
  const typeCounts = MEMORY_TYPES.map(t => ({
    ...t,
    count: memories.filter(m => m.type === t.value).length,
  })).filter(t => t.count > 0);

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {memories.length === 0
              ? 'Start capturing your first memory'
              : `${memories.length} memor${memories.length === 1 ? 'y' : 'ies'} captured`}
          </p>
        </div>
        <Link
          href="/memories/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          <Plus className="w-4 h-4" />
          New Memory
        </Link>
      </div>

      {/* Type summary */}
      {typeCounts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            BY TYPE
          </h2>
          <div className="flex flex-wrap gap-2">
            {typeCounts.map(t => (
              <Link
                key={t.value}
                href={`/memories?type=${t.value}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:shadow-sm bg-white"
                style={{ borderColor: 'var(--border)' }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: t.color }}
                />
                <span style={{ color: 'var(--text-primary)' }}>{t.label}</span>
                <span
                  className="font-normal"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent memories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            RECENT MEMORIES
          </h2>
          {memories.length > 6 && (
            <Link
              href="/memories"
              className="text-xs hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              View all →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon="🧠"
            title="No memories yet"
            description="Start capturing your thoughts, goals, and decisions. They will all live here."
            action={
              <Link
                href="/memories/new"
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
                style={{ background: 'var(--accent)' }}
              >
                Capture your first memory
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map(m => (
              <MemoryCard key={m.id} memory={m} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
