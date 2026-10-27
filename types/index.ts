export type MemoryType = 'note' | 'idea' | 'decision' | 'goal' | 'observation' | 'reflection';

export interface Memory {
  id: string;
  title: string;
  content: string;
  type: MemoryType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecallResult {
  answer: string;
  citations: Memory[];
  model: string;
}

export const MEMORY_TYPES: { value: MemoryType; label: string; color: string }[] = [
  { value: 'note',        label: 'Note',        color: '#6B7280' },
  { value: 'idea',        label: 'Idea',        color: '#8B5CF6' },
  { value: 'decision',    label: 'Decision',    color: '#059669' },
  { value: 'goal',        label: 'Goal',        color: '#D97706' },
  { value: 'observation', label: 'Observation', color: '#0284C7' },
  { value: 'reflection',  label: 'Reflection',  color: '#DB2777' },
];

export const MEMORY_TYPE_MAP = Object.fromEntries(
  MEMORY_TYPES.map(t => [t.value, t])
) as Record<MemoryType, typeof MEMORY_TYPES[0]>;
