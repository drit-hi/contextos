'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Memory, MemoryType, MEMORY_TYPE_MAP } from '@/types';
import { formatDate } from '@/lib/utils';
import MemoryForm from '@/components/MemoryForm';

function MemoryDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const m = storage.getById(id);
    setMemory(m ?? null);
    setMounted(true);
  }, [id]);

  function handleUpdate(data: { title: string; content: string; type: MemoryType; tags: string[] }) {
    const updated = storage.update(id, data);
    if (updated) {
      setMemory(updated);
      setEditing(false);
    }
  }

  function handleDelete() {
    if (!confirm('Delete this memory? This cannot be undone.')) return;
    storage.delete(id);
    router.push('/memories');
  }

  if (!mounted) return null;

  if (!memory) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-10">
        <Link href="/memories" className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <p style={{ color: 'var(--text-secondary)' }}>Memory not found.</p>
      </div>
    );
  }

  const typeInfo = MEMORY_TYPE_MAP[memory.type];

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <Link
        href="/memories"
        className="inline-flex items-center gap-1.5 text-sm mb-6"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to memories
      </Link>

      {editing ? (
        <div className="rounded-xl border bg-white p-6" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-base mb-5" style={{ color: 'var(--text-primary)' }}>
            Edit Memory
          </h2>
          <MemoryForm
            initial={memory}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-6" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: typeInfo.color + '18', color: typeInfo.color }}
            >
              {typeInfo.label}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="p-2 rounded-lg transition-all hover:bg-gray-50"
                style={{ color: 'var(--text-muted)' }}
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg transition-all hover:bg-red-50"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h1 className="text-xl font-bold mb-3 leading-snug" style={{ color: 'var(--text-primary)' }}>
            {memory.title}
          </h1>

          <p className="text-sm leading-relaxed whitespace-pre-wrap mb-6" style={{ color: 'var(--text-secondary)' }}>
            {memory.content}
          </p>

          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {memory.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div>
              <span className="text-xs block mb-0.5" style={{ color: 'var(--text-muted)' }}>Created</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {new Date(memory.createdAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>
            {memory.updatedAt !== memory.createdAt && (
              <div>
                <span className="text-xs block mb-0.5" style={{ color: 'var(--text-muted)' }}>Updated</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(memory.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemoryDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>}>
      <MemoryDetailContent />
    </Suspense>
  );
}
