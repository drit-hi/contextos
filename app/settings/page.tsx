'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

export default function SettingsPage() {
  const [count, setCount] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCount(storage.getAll().length);
    setMounted(true);
  }, []);

  function handleClear() {
    if (!confirm(`Delete all ${count} memories? This cannot be undone.`)) return;
    storage.clear();
    setCount(0);
    setCleared(true);
  }

  function handleSamples() {
    if (!storage.addSamples()) {
      alert('Sample memories are already loaded. Delete them from the memories list if you no longer want them.');
      return;
    }
    setCount(storage.getAll().length);
    setCleared(false);
  }

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
        Settings
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        Manage your ContextOS data and configuration.
      </p>

      {/* Storage info */}
      <section className="rounded-xl border bg-white p-5 mb-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          Storage
        </h2>
        <div
          className="text-xs rounded-lg px-3 py-2.5 mb-4 border"
          style={{ background: '#FFF8EE', borderColor: '#F3E8C6', color: 'var(--text-secondary)' }}
        >
          <strong>Stored in this browser only.</strong> Your memories live in localStorage. They survive page
          refreshes but are not synced, backed up, or available on other devices, and clearing your browser
          data will delete them. There is no account system or cloud storage yet.
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {cleared
            ? 'All memories cleared.'
            : `${count} memor${count === 1 ? 'y' : 'ies'} stored in this browser.`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleSamples}
            className="px-4 py-2 rounded-lg text-sm border transition-all hover:bg-gray-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Add sample memories
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-lg text-sm border transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Clear all data
          </button>
        </div>
      </section>

      {/* AI config */}
      <section className="rounded-xl border bg-white p-5" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          AI Recall
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
          AI Recall requires an Anthropic API key configured server-side. The key is never sent to the
          browser.
        </p>
        <div
          className="text-xs font-mono rounded-lg px-3 py-2.5 border"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          ANTHROPIC_API_KEY=sk-ant-... &nbsp;# in .env.local
        </div>
      </section>
    </div>
  );
}
