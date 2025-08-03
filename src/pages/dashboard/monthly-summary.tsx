import { useSuspenseQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useDashboardFilterContext } from "./page";

interface NetWorthData {
  date: string;
  netWorth: number;
  dailyIncome: number;
  dailyExpense: number;
  dayLabel: string;
}

export function MonthlySummary() {
  const { date } = useDashboardFilterContext();

  const netWorthQuery = useSuspenseQuery({
    queryKey: ["dashboard-net-worth", date.format("YYYY-MM")],
    queryFn: async (): Promise<NetWorthData[]> => {
      const currentMonth = date.startOf("month");
      const endOfMonth = date.endOf("month");

      // Get all assets with their balances
      const assets = await db.assets.toArray();
      const transactions = await db.transactions
        .where("date")
        .between(currentMonth.toDate(), endOfMonth.toDate())
        .and((transaction) => transaction.excludedFromReports === 0)
        .toArray();

      const categories = await db.transactionCategories.toArray();
      const categoryMap = new Map(categories.map((cat) => [cat.id, cat.type]));

      const dailyData: NetWorthData[] = [];

      // Generate data for each day of the current month
      for (
        let day = currentMonth;
        day.isBefore(endOfMonth) || day.isSame(endOfMonth, "day");
        day = day.add(1, "day")
      ) {
        const dayStart = day.startOf("day").toDate();
        const dayEnd = day.endOf("day").toDate();

        // Calculate net worth up to this day
        let totalNetWorth = 0;
        for (const asset of assets) {
          const assetTransactions = transactions.filter(
            (t) => t.assetId === asset.id && t.date <= dayEnd,
          );

          let assetBalance = asset.balance;
          for (const transaction of assetTransactions) {
            const categoryType = categoryMap.get(transaction.categoryId);
            if (categoryType === "income") {
              assetBalance += transaction.amount;
            } else if (categoryType === "expense") {
              assetBalance -= transaction.amount;
            }
          }
          totalNetWorth += assetBalance;
        }

        // Calculate daily income and expenses
        const dayTransactions = transactions.filter(
          (t) => t.date >= dayStart && t.date <= dayEnd,
        );

        const dailyIncome = dayTransactions
          .filter((t) => categoryMap.get(t.categoryId) === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const dailyExpense = dayTransactions
          .filter((t) => categoryMap.get(t.categoryId) === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        dailyData.push({
          date: day.format("YYYY-MM-DD"),
          netWorth: totalNetWorth,
          dailyIncome,
          dailyExpense,
          dayLabel: day.format("MMM DD"),
        });
      }

      return dailyData;
    },
  });

  const netWorthData = netWorthQuery.data;
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
