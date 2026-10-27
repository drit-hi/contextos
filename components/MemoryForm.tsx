'use client';

import { useState } from 'react';
import { Memory, MemoryType, MEMORY_TYPES } from '@/types';
import { parseTags } from '@/lib/utils';

interface Props {
  initial?: Partial<Memory>;
  onSubmit: (data: { title: string; content: string; type: MemoryType; tags: string[] }) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function MemoryForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [title, setTitle]   = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [type, setType]     = useState<MemoryType>(initial?.type ?? 'note');
  const [tagsRaw, setTagsRaw] = useState(initial?.tags?.join(', ') ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!content.trim()) e.content = 'Content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ title: title.trim(), content: content.trim(), type, tags: parseTags(tagsRaw) });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What is this about?"
          className="w-full px-3 py-2.5 rounded-lg border text-sm transition-colors bg-white"
          style={{
            borderColor: errors.title ? '#ef4444' : 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Type
        </label>
        <div className="flex flex-wrap gap-2">
          {MEMORY_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
              style={{
                background: type === t.value ? t.color + '20' : 'white',
                color: type === t.value ? t.color : 'var(--text-secondary)',
                borderColor: type === t.value ? t.color : 'var(--border)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Content
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your memory, idea, or observation..."
          rows={6}
          className="w-full px-3 py-2.5 rounded-lg border text-sm resize-none transition-colors bg-white"
          style={{
            borderColor: errors.content ? '#ef4444' : 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span>
        </label>
        <input
          type="text"
          value={tagsRaw}
          onChange={e => setTagsRaw(e.target.value)}
          placeholder="learning, career, ideas"
          className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
          style={{ background: loading ? 'var(--text-muted)' : 'var(--accent)' }}
        >
          {loading ? 'Saving…' : (initial?.id ? 'Save Changes' : 'Save Memory')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-sm transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
