import { BudgetTable } from "./table";

export default function BudgetIndexPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full max-w-5xl mx-auto">
      <BudgetTable />
    </div>
  );
}
