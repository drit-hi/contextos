'use client';

import { Memory, MemoryType } from '@/types';
import { generateId } from './utils';

const KEY = 'contextos_memories';
const SAMPLE_TAG = 'sample';

function load(): Memory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(memories: Memory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(memories));
}

export const storage = {
  getAll(): Memory[] {
    return load().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  getById(id: string): Memory | undefined {
    return load().find(m => m.id === id);
  },

  create(data: { title: string; content: string; type: MemoryType; tags: string[] }): Memory {
    const memories = load();
    const now = new Date().toISOString();
    const memory: Memory = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    save([memory, ...memories]);
    return memory;
  },

  update(id: string, data: Partial<Pick<Memory, 'title' | 'content' | 'type' | 'tags'>>): Memory | null {
    const memories = load();
    const idx = memories.findIndex(m => m.id === id);
    if (idx === -1) return null;
    const updated = { ...memories[idx], ...data, updatedAt: new Date().toISOString() };
    memories[idx] = updated;
    save(memories);
    return updated;
  },

  delete(id: string): boolean {
    const memories = load();
    const next = memories.filter(m => m.id !== id);
    if (next.length === memories.length) return false;
    save(next);
    return true;
  },

  search(query: string, type?: MemoryType | ''): Memory[] {
    const all = load();
    const q = query.toLowerCase();
    return all
      .filter(m => {
        const matchesQuery =
          !q ||
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.tags.some(t => t.includes(q));
        const matchesType = !type || m.type === type;
        return matchesQuery && matchesType;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY);
  },

  hasSamples(): boolean {
    return load().some(m => m.tags.includes(SAMPLE_TAG));
  },

  // Adds clearly-tagged sample memories alongside any existing ones.
  // Returns false (and adds nothing) if samples were already loaded.
  addSamples(): boolean {
    const existing = load();
    if (existing.some(m => m.tags.includes(SAMPLE_TAG))) return false;
    const now = new Date();
    const ago = (days: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      return d.toISOString();
    };
    const sample = (
      daysAgo: number,
      type: MemoryType,
      title: string,
      content: string,
      tags: string[]
    ): Memory => ({
      id: generateId(),
      title,
      content,
      type,
      tags: [...tags, SAMPLE_TAG],
      createdAt: ago(daysAgo),
      updatedAt: ago(daysAgo),
    });
    save([
      sample(
        5,
        'decision',
        'Pause the guitar goal until the exam is over',
        'Decided to put practice on hold for six weeks and spend the time on exam revision. Will pick the guitar back up afterwards.',
        ['music', 'study']
      ),
      sample(
        14,
        'idea',
        'Weekly review habit',
        'Set aside twenty minutes every Sunday to look back over the week: what moved forward, what stalled, and why.',
        ['habits']
      ),
      sample(
        21,
        'observation',
        'I plan better in the morning',
        'Plans written before noon hold up far better than ones I make late at night, which tend to be over-ambitious.',
        ['habits', 'self-knowledge']
      ),
      sample(
        30,
        'goal',
        'Practise guitar for 30 minutes every day',
        'Build a daily practice habit and learn three full songs by the end of the quarter.',
        ['music']
      ),
      ...existing,
    ]);
    return true;
  },
};
