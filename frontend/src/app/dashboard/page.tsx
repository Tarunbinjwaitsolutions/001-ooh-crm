'use client';

import { useAuth } from '@/shared/auth/auth-context';
import { RequireAuth } from '@/shared/auth/require-auth';
import { ROLE_LABELS } from '@/shared/auth/types';
import { AppShell } from '@/shared/layout/app-shell';
import { Badge, Card, EmptyState } from '@/shared/ui';

/**
 * Placeholder home screen. It exists so the auth flow lands somewhere real and
 * so you can see, at a glance, which permissions the role you signed in as
 * actually holds — useful when checking that your module's guards work.
 *
 * The real leadership home screen is the Profitability Dashboard (Track F).
 */
function DashboardContent() {
  const { user } = useAuth();
  if (!user) return null;

  const lastLogin = user.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString()
    : 'This is your first sign-in';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Signed in as {user.email} · last sign-in {lastLogin}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">Your role</h2>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {ROLE_LABELS[user.role] ?? user.role}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Role and permissions come from the server on every request — changing them in the
            browser does nothing.
          </p>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Permissions ({user.permissions.length})
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {user.permissions.map((permission) => (
              <Badge key={permission}>{permission}</Badge>
            ))}
          </div>
        </Card>
      </div>

      <EmptyState
        title="No modules mounted yet"
        description="Auth, RBAC and the shared shell are in place. Add your module's route to NAV_ITEMS in src/shared/layout/app-shell.tsx and build its pages under src/app."
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </RequireAuth>
  );
}
