import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  Legend,
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
import { useUI } from "../../components/providers/ui-provider";
import { useIsMobile } from "../../hooks/use-mobile";
import { useDashboardFilterContext } from "./page";

interface IncomeExpenseData {
  name: string;
  income: number;
  expense: number;
}

export function WeeklyIncomeExpenseChart() {
  const { date } = useDashboardFilterContext();
  const isMobile = useIsMobile();
  const { config } = useUI();

  const incomeExpenseQuery = useSuspenseQuery({
    queryKey: ["dashboard-income-expense", date.format("YYYY-MM")],
    queryFn: async (): Promise<IncomeExpenseData[]> => {
      const currentMonth = date.startOf("month");
      const endMonth = date.endOf("month");
      const transactions = await db.transactions
        .where("date")
        .between(currentMonth.toDate(), endMonth.toDate())
        .and((transaction) => transaction.excludedFromReports === false)
        .toArray();

      const categories = await db.transactionCategories.toArray();
      const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

      const weeklyData: IncomeExpenseData[] = [];
      for (let week = 0; week < 4; week++) {
        const weekStart = currentMonth.add(week * 7, "day");
        const weekEnd = weekStart.add(6, "day");

        const weekTransactions = transactions.filter((t) => {
          const tDate = dayjs(t.date);
          return (
            tDate.isAfter(weekStart.subtract(1, "day")) &&
            tDate.isBefore(weekEnd.add(1, "day"))
          );
        });

        const income = weekTransactions
          .filter((t) => categoryMap.get(t.categoryId)?.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = weekTransactions
          .filter((t) => categoryMap.get(t.categoryId)?.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        weeklyData.push({
          name: `Week ${week + 1}`,
          income,
          expense,
        });
      }

      return weeklyData;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Income vs Expenses</CardTitle>
        <CardDescription>Weekly breakdown for this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomeExpenseQuery.data}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id="expenseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                hide={isMobile}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-md">
                        <p className="font-medium mb-2">{label}</p>
                        <div className="space-y-1">
                          {payload.map((entry) => (
                            <div
                              key={entry.dataKey}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm">
                                {entry.name}: {config?.currencySymbol}
                                {(entry.value as number).toLocaleString(config?.numberFormat)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--chart-2)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#incomeGradient)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expenseGradient)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
