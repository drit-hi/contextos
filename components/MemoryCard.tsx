'use client';

import Link from 'next/link';
import { Memory, MEMORY_TYPE_MAP } from '@/types';
import { formatDate, truncate } from '@/lib/utils';

interface Props {
  memory: Memory;
  onDelete?: (id: string) => void;
}

export default function MemoryCard({ memory, onDelete }: Props) {
  const typeInfo = MEMORY_TYPE_MAP[memory.type];

  return (
    <div
      className="group rounded-xl border p-4 bg-white transition-all hover:shadow-sm"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: typeInfo.color + '18',
              color: typeInfo.color,
            }}
          >
            {typeInfo.label}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatDate(memory.updatedAt)}
          </span>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(memory.id)}
            className="opacity-0 group-hover:opacity-100 text-xs px-2 py-0.5 rounded transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Delete
          </button>
        )}
      </div>

      {/* Title */}
      <Link href={`/memories/${memory.id}`}>
        <h3
          className="font-semibold text-sm leading-snug mb-1.5 hover:underline cursor-pointer"
          style={{ color: 'var(--text-primary)' }}
        >
          {memory.title}
        </h3>
      </Link>

      {/* Content preview */}
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
        {truncate(memory.content, 160)}
      </p>

      {/* Tags */}
      {memory.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {memory.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}
            >
              #{tag}
            </span>
          ))}
          {memory.tags.length > 4 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              +{memory.tags.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
