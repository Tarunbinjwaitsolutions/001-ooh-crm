'use client';

import { AppShell } from '@/shared/layout/app-shell';
import { RequireAuth } from '@/shared/auth/require-auth';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
