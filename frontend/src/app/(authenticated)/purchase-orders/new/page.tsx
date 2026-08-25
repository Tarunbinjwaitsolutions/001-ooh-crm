import { POWizard } from '@/modules/purchase-orders/components/po-wizard';

export default function NewPurchaseOrderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Create Purchase Order</h1>
        <p className="text-sm text-slate-500">Generate a new PO for a vendor.</p>
      </div>
      <POWizard />
    </div>
  );
}
