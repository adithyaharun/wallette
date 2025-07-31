import { AssetAllocation } from "./asset-allocation";
import { DashboardHeader } from "./dashboard-header";
import { ExpenseAllocation } from "./expense-allocation";
import { MonthlySummary } from "./monthly-summary";
import { NetWorthChart } from "./net-worth-chart";
import { RecentTransactions } from "./recent-transactions";
import { WeeklyIncomeExpenseChart } from "./weekly-income-expense-chart";

export function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <DashboardHeader />

      {/* Main Net Worth Chart */}
      <NetWorthChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <AssetAllocation />

        {/* Monthly Summary */}
        <MonthlySummary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income & Expenses Chart */}
        <WeeklyIncomeExpenseChart />

        <ExpenseAllocation />
      </div>

      <RecentTransactions />
    </div>
  );
}
