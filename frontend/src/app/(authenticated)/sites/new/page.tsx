import { SiteForm } from '@/modules/sites/components/site-form';

export default function NewSitePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Add Site</h1>
        <p className="text-sm text-slate-500">Create a new site for inventory.</p>
      </div>
      <SiteForm />
    </div>
  );
}
