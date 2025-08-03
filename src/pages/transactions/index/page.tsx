import { lazy } from 'react';

const TransactionTable = lazy(() => import('./table'));

export default function TransactionPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <TransactionTable />
    </div>
  );
}
