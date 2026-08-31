'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AttendanceReportsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/attendance?tab=reports');
  }, [router]);

  return null;
}
