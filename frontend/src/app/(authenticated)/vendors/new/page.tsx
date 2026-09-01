"use client";

import VendorForm from '@/modules/vendors/components/VendorForm';
import { useRouter } from 'next/navigation';

export default function NewVendorPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Add Vendor</h1>
        <p className="text-sm text-slate-500">Create a new vendor profile.</p>
      </div>
      <VendorForm vendor={null} saving={false} onClose={() => router.back()} onSubmit={async () => { router.push('/vendors'); return true; }} />
    </div>
  );
}
