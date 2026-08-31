'use client';

import { useParams } from 'next/navigation';
import { useSite } from '@/modules/sites/hooks/use-sites';
import SiteForm from '@/modules/sites/components/SiteForm';
import { Spinner } from '@/shared/ui';

export default function EditSitePage() {
  const params = useParams();
  const id = params.id as string;
  const { site, isLoading, error } = useSite(id);

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>;
  if (error || !site) return <div className="p-8 text-red-500">{error || 'Site not found'}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Edit Site</h1>
        <p className="text-sm text-slate-500">Update site details.</p>
      </div>
      <SiteForm site={site} onClose={() => {}} onSuccess={() => {}} />
    </div>
  );
}
