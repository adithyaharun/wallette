import { useSuspenseQuery } from "@tanstack/react-query";
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
import { useUI } from "../../components/providers/ui-provider";
import {
  dashboardRepository,
  type NetWorthData,
} from "../../db/repositories/dashboard-repository";
import { cn } from "../../lib/utils";
import { useDashboardFilterContext } from "./page";

export function NetWorthChart() {
  const { date } = useDashboardFilterContext();
  const { config } = useUI();

  const netWorthQuery = useSuspenseQuery({
    queryKey: ["dashboard-net-worth-trend", date.format("YYYY-MM")],
    queryFn: () => dashboardRepository.getNetWorthTrend(date),
  });

  const netWorthData = netWorthQuery.data;
  const currentNetWorth = netWorthData[netWorthData.length - 1]?.netWorth || 0;

  const previousNetWorth = netWorthData[0]?.netWorth || currentNetWorth;
  const netWorthChange = currentNetWorth - previousNetWorth;
  const netWorthChangePercent =
    previousNetWorth !== 0 ? (netWorthChange / previousNetWorth) * 100 : 0;

  const chartData = netWorthData.slice(1);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex justify-between">
          <div className="space-y-1.5 md:space-y-3">
            <CardTitle>Net Worth Trend</CardTitle>
            <CardTitle className="text-2xl md:text-3xl font-mono">
              {config?.currencySymbol}
              {currentNetWorth.toLocaleString()}
            </CardTitle>
            {netWorthChange === 0 ? (
              <CardDescription className="text-muted-foreground">
                No change compared to last month
              </CardDescription>
            ) : (
              <CardDescription
                className={cn(
                  "flex items-center gap-1",
                  netWorthChange > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive",
                )}
              >
                {netWorthChange >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                <span>{netWorthChange.toLocaleString()}</span>
                <span>({Math.abs(netWorthChangePercent).toFixed(2)}%)</span>
                <span>vs last month</span>
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col items-end space-y-1.5"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[160px] md:h-[240px]">
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
                dataKey="dateKey"
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as NetWorthData;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-md">
                        <p className="font-medium">
                          {data.date.format(config?.shortDateFormat || "D MMM")}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className="text-green-600 dark:text-green-300">
                            Income: {config?.currencySymbol}
                            {data.dailyIncome.toLocaleString()}
                          </p>
                          <p className="text-destructive">
                            Expense: {config?.currencySymbol}
                            {data.dailyExpense.toLocaleString()}
                          </p>
                          <p className="font-medium">
                            Net Worth: {config?.currencySymbol}
                            {data.netWorth.toLocaleString()}
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
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>
            {date.startOf("month").format(config?.dateFormat || "DD MMM YYYY")}
          </span>
          <span>
            {date.endOf("month").format(config?.dateFormat || "DD MMM YYYY")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
