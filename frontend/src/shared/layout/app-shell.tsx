'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { useAuth } from '../auth/auth-context';
import { ROLE_LABELS } from '../auth/types';
import { Button, cx } from '../ui';

/**
 * The shell every signed-in screen sits inside: header, navigation, user menu.
 *
 * Add your module to NAV_ITEMS with the permission that guards it — items the
 * user cannot access are hidden automatically.
 */

interface NavItem {
  href: string;
  label: string;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/employees', label: 'Employees', permission: 'employees.view' },
  // Modules land here as they are built, e.g.
  // { href: '/leads', label: 'Leads', permission: 'leads.view' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, hasPermission, signOut } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50"
          >
            Media Octus CRM
          </Link>

          <nav className="flex items-center gap-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  pathname === item.href
                    ? 'bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user ? (ROLE_LABELS[user.role] ?? user.role) : ''}
              </p>
            </div>
            <Button variant="secondary" onClick={() => void signOut()} className="h-9 px-3">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
