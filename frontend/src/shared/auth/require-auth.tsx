'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { Spinner } from '../ui';
import { useAuth } from './auth-context';

/**
 * Route guard. Wrap any page that needs a session:
 *
 *   export default function LeadsPage() {
 *     return (
 *       <RequireAuth permission="leads.view">
 *         <LeadsTable />
 *       </RequireAuth>
 *     );
 *   }
 *
 * This is a convenience for the UI only. The server enforces the same
 * permission on the route — never rely on this alone.
 */
export function RequireAuth({
  children,
  permission,
}: {
  children: ReactNode;
  permission?: string;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated, hasPermission } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Loading your session…" />
      </div>
    );
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          You do not have access to this page
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          It needs the <code className="font-mono">{permission}</code> permission. Ask an
          administrator if you think this is wrong.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
