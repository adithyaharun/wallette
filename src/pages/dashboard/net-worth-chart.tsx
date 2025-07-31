import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { cn } from "../../lib/utils";

interface NetWorthData {
  date: string;
  netWorth: number;
  dailyIncome: number;
  dailyExpense: number;
  dayLabel: string;
}

export function NetWorthChart() {
  const netWorthQuery = useSuspenseQuery({
    queryKey: ["dashboard-net-worth"],
    queryFn: async (): Promise<NetWorthData[]> => {
      const currentMonth = dayjs().startOf("month");
      const endOfMonth = dayjs().endOf("month");
      const lastMonth = dayjs().subtract(1, "month");
      const startOfLastMonth = lastMonth.startOf("month");

      // Get all assets with their balances
      const assets = await db.assets.toArray();

      // Get transactions from both current and last month for comparison
      const transactions = await db.transactions
        .where("date")
        .between(startOfLastMonth.toDate(), endOfMonth.toDate())
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
          dayLabel: day.format("DD"),
        });
      }

      // Also add the same day from last month for comparison
      const todayLastMonth = dayjs().subtract(1, "month");
      const lastMonthDayEnd = todayLastMonth.endOf("day").toDate();

      let lastMonthNetWorth = 0;
      for (const asset of assets) {
        const assetTransactions = transactions.filter(
          (t) => t.assetId === asset.id && t.date <= lastMonthDayEnd,
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
        lastMonthNetWorth += assetBalance;
      }

      // Add last month's data point for comparison (won't be shown in chart)
      dailyData.unshift({
        date: todayLastMonth.format("YYYY-MM-DD"),
        netWorth: lastMonthNetWorth,
        dailyIncome: 0,
        dailyExpense: 0,
        dayLabel: todayLastMonth.format("DD"),
      });

      return dailyData;
    },
  });

  const netWorthData = netWorthQuery.data;
  const currentNetWorth = netWorthData[netWorthData.length - 1]?.netWorth || 0;

  // Get net worth from last month (first item in array is last month's data)
  const previousNetWorth = netWorthData[0]?.netWorth || currentNetWorth;
  const netWorthChange = currentNetWorth - previousNetWorth;
  const netWorthChangePercent =
    previousNetWorth !== 0 ? (netWorthChange / previousNetWorth) * 100 : 0;

  // Filter out the last month's data point for the chart (keep only current month)
  const chartData = netWorthData.slice(1);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <CardTitle>Net Worth Trend</CardTitle>
            <CardDescription>
              Daily net worth, income, and expenses for{" "}
              {dayjs().format("MMMM YYYY")}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-1.5">
            <CardTitle>{currentNetWorth.toLocaleString()}</CardTitle>
            <CardDescription
              className={cn(
                "flex items-center gap-1",
                netWorthChange >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {netWorthChange >= 0 ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
              <span>
                {Math.abs(netWorthChangePercent).toFixed(2)}% vs last month
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="netWorthGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="dayLabel"
                axisLine={false}
                hide
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                axisLine={false}
                hide
                tickLine={false}
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as NetWorthData;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-md">
                        <p className="font-medium">{label}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-green-600 dark:text-green-300">
                            Income: {data.dailyIncome.toLocaleString()}
                          </p>
                          <p className="text-red-600 dark:text-red-400">
                            Expense: {data.dailyExpense.toLocaleString()}
                          </p>
                          <p className="font-medium">
                            Net Worth: {data.netWorth.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="var(--chart-2)"
                fillOpacity={1}
                fill="url(#netWorthGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
