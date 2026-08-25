import { VendorForm } from '@/modules/vendors/components/vendor-form';

export default function NewVendorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Add Vendor</h1>
        <p className="text-sm text-slate-500">Create a new vendor profile.</p>
      </div>
      <VendorForm />
    </div>
  );
}
