'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamAttendanceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/attendance?tab=team');
  }, [router]);

  return null;
}
