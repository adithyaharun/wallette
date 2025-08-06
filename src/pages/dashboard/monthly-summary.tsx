import { useSuspenseQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dashboardRepository } from "../../db/repositories/dashboard-repository";
import { useDashboardFilterContext } from "./page";

export function MonthlySummary() {
  const { date } = useDashboardFilterContext();

  const monthlySummaryQuery = useSuspenseQuery({
    queryKey: ["dashboard-monthly-summary", date.format("YYYY-MM")],
    queryFn: () => dashboardRepository.getMonthlySummary(date),
  });

  const netWorthData = monthlySummaryQuery.data;
  const totalMonthlyIncome = netWorthData.reduce(
    (sum, day) => sum + day.dailyIncome,
    0,
  );
  const totalMonthlyExpense = netWorthData.reduce(
    (sum, day) => sum + day.dailyExpense,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Summary</CardTitle>
        <CardDescription>Income vs expenses breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-green-700 dark:text-green-300">
                  Total Income
                </p>
                <p className="text-xl font-bold text-green-800 dark:text-green-200">
                  {totalMonthlyIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-red-700 dark:text-red-300">
                  Total Expenses
                </p>
                <p className="text-xl font-bold text-red-800 dark:text-red-200">
                  {totalMonthlyExpense.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-blue-700 dark:text-blue-300">
                  Net Savings
                </p>
                <p
                  className={cn(
                    "text-xl font-bold",
                    totalMonthlyIncome - totalMonthlyExpense >= 0
                      ? "text-blue-800 dark:text-blue-200"
                      : "text-red-800 dark:text-red-200",
                  )}
                >
                  {(totalMonthlyIncome - totalMonthlyExpense).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
