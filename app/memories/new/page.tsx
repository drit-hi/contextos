'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { storage } from '@/lib/storage';
import { MemoryType } from '@/types';
import MemoryForm from '@/components/MemoryForm';

export default function NewMemoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(data: { title: string; content: string; type: MemoryType; tags: string[] }) {
    setLoading(true);
    try {
      const memory = storage.create(data);
      router.push(`/memories/${memory.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <div className="mb-6">
        <Link
          href="/memories"
          className="inline-flex items-center gap-1.5 text-sm mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to memories
        </Link>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Capture a Memory
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          What do you want to remember?
        </p>
      </div>

      <div
        className="rounded-xl border bg-white p-6"
        style={{ borderColor: 'var(--border)' }}
      >
        <MemoryForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/memories')}
          loading={loading}
        />
      </div>
    </div>
  );
}
