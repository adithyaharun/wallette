import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { createContext, useContext, useState } from "react";
import { AssetAllocation } from "./asset-allocation";
import { DashboardHeader } from "./dashboard-header";
import { ExpenseAllocation } from "./expense-allocation";
import { MonthlySummary } from "./monthly-summary";
import { NetWorthChart } from "./net-worth-chart";
import { RecentTransactions } from "./recent-transactions";
import { WeeklyIncomeExpenseChart } from "./weekly-income-expense-chart";

const initialContextValue = {
  date: dayjs(),
  setDate: () => {
    throw new Error("setDate was called outside of DashboardFilterProvider");
  },
};

const DashboardFilterContext = createContext<{
  date: Dayjs;
  setDate: (date: Dayjs) => void;
}>(initialContextValue);

const DashboardFilterProvider = DashboardFilterContext.Provider;

export const useDashboardFilterContext = () => {
  const context = useContext(DashboardFilterContext);
  if (!context) {
    throw new Error(
      "useDashboardFilterContext must be used within a DashboardFilterProvider",
    );
  }
  return context;
};

export default function DashboardPage() {
  const [date, setDate] = useState<Dayjs>(dayjs());

  return (
    <DashboardFilterProvider value={{ date, setDate }}>
      <div className="p-4 space-y-4">
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
    </DashboardFilterProvider>
  );
}
