'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, X } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Memory, MEMORY_TYPES, MemoryType } from '@/types';
import MemoryCard from '@/components/MemoryCard';
import EmptyState from '@/components/EmptyState';
import { Suspense } from 'react';

function MemoriesContent() {
  const searchParams = useSearchParams();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [typeFilter, setTypeFilter] = useState<MemoryType | ''>(() => {
    const t = searchParams.get('type');
    return MEMORY_TYPES.some(m => m.value === t) ? (t as MemoryType) : '';
  });
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setMemories(storage.search(query, typeFilter));
  }, [query, typeFilter]);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  function handleDelete(id: string) {
    if (!confirm('Delete this memory?')) return;
    storage.delete(id);
    refresh();
  }

  function clearFilters() {
    setQuery('');
    setTypeFilter('');
  }

  const hasFilters = query || typeFilter;

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          My Memories
        </h1>
        <Link
          href="/memories/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--accent)' }}
        >
          <Plus className="w-4 h-4" />
          New
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search memories…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as MemoryType | '')}
          className="px-3 py-2.5 rounded-lg border text-sm bg-white appearance-none cursor-pointer"
          style={{ borderColor: 'var(--border)', color: typeFilter ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          <option value="">All types</option>
          {MEMORY_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      {hasFilters && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {memories.length} result{memories.length !== 1 ? 's' : ''}
          {query && ` for "${query}"`}
          {typeFilter && ` in ${MEMORY_TYPES.find(t => t.value === typeFilter)?.label}`}
        </p>
      )}

      {/* Grid */}
      {memories.length === 0 ? (
        <EmptyState
          icon={hasFilters ? '🔍' : '🧠'}
          title={hasFilters ? 'No memories match your search' : 'No memories yet'}
          description={
            hasFilters
              ? 'Try different keywords or clear the filters.'
              : 'Start capturing your thoughts, decisions, and ideas.'
          }
          action={
            !hasFilters ? (
              <Link
                href="/memories/new"
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
                style={{ background: 'var(--accent)' }}
              >
                Create your first memory
              </Link>
            ) : (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg text-sm border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Clear filters
              </button>
            )
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {memories.map(m => (
            <MemoryCard key={m.id} memory={m} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MemoriesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>}>
      <MemoriesContent />
    </Suspense>
  );
}
