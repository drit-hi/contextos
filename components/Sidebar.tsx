'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Settings,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/memories',  label: 'My Memories', icon: BookOpen },
  { href: '/recall',    label: 'AI Recall',   icon: Sparkles },
];

function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
              active
                ? 'bg-white/10 text-white font-medium'
                : 'text-white/55 hover:text-white/90 hover:bg-white/5'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SettingsLink() {
  const pathname = usePathname();
  return (
    <Link
      href="/settings"
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
        pathname === '/settings'
          ? 'bg-white/10 text-white font-medium'
          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
      )}
    >
      <Settings className="w-4 h-4 shrink-0" />
      Settings
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside
      className="w-56 min-h-screen flex flex-col shrink-0"
      style={{ background: 'var(--bg-sidebar)' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">ContextOS</span>
        </div>
      </div>

      <Suspense
        fallback={
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => (
              <div
                key={href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/55"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
            ))}
          </nav>
        }
      >
        <NavLinks />
      </Suspense>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <Suspense fallback={
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-white/40">
            <Settings className="w-4 h-4" /> Settings
          </div>
        }>
          <SettingsLink />
        </Suspense>
        <p className="mt-4 px-3 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Saved in this browser only
        </p>
      </div>
    </aside>
  );
}
