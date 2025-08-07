import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { Area, AreaChart, XAxis } from "recharts";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Asset, AssetCategory } from "../../../@types/asset";
import { db } from "../../../lib/db";
import { cn } from "../../../lib/utils";
import { useUI } from "../../providers/ui-provider";

type AssetPerformanceGroup = AssetCategory & {
  assets: AssetPerformance[];
};

type AssetPerformance = Asset & {
  balances: { date: string; balance: number }[];
  performance: number;
};

export function NavAsset() {
  const { openAssetForm } = useUI();

  const assetsQuery = useSuspenseQuery<AssetPerformanceGroup[]>({
    queryKey: ["asset-performance-7d-grouped"],
    queryFn: async () => {
      const assetCategories = await db.assetCategories.toArray();
      const assets = await db.assets.toArray();
      const groupedAssets: AssetPerformanceGroup[] = [];

      // Get current date for calculations
      const endDate = dayjs();

      // Get transaction categories for type information
      const transactionCategories = await db.transactionCategories.toArray();
      const categoryMap = new Map(
        transactionCategories.map((cat) => [cat.id, cat.type]),
      );

      for (const category of assetCategories) {
        const categoryAssets = assets.filter(
          (asset) => asset.categoryId === category.id,
        );

        const assetPerformances: AssetPerformance[] = [];

        for (const asset of categoryAssets) {
          // Try to use AssetBalance records first, fallback to transaction calculation
          const assetBalanceRecords = await db.assetBalances
            .where("assetId")
            .equals(asset.id)
            .toArray();

          const dailyBalances: { date: string; balance: number }[] = [];

          if (assetBalanceRecords.length > 0) {
            // Use existing balance records
            const sortedBalanceRecords = assetBalanceRecords.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

            for (let i = 6; i >= 0; i--) {
              const currentDate = endDate.subtract(i, "days");
              const dateString = currentDate.format("YYYY-MM-DD");

              // Find the balance record for this date or the closest previous date
              const balanceRecord = sortedBalanceRecords
                .filter(
                  (record) =>
                    dayjs(record.date).isBefore(currentDate, "day") ||
                    dayjs(record.date).isSame(currentDate, "day"),
                )
                .pop(); // Get the most recent balance on or before this date

              const balance = balanceRecord ? balanceRecord.balance : 0;
              dailyBalances.push({ date: dateString, balance });
            }
          } else {
            // Fallback: calculate from transactions but use ALL transactions (including transfers)
            // This gives us the true asset balance evolution
            const allAssetTransactions = await db.transactions
              .where("assetId")
              .equals(asset.id)
              .toArray();

            const sortedTransactions = allAssetTransactions.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

            for (let i = 6; i >= 0; i--) {
              const currentDate = endDate.subtract(i, "days");
              const dateString = currentDate.format("YYYY-MM-DD");

              // Get all transactions up to and including this date
              const transactionsUpToDate = sortedTransactions.filter(
                (t) =>
                  dayjs(t.date).isBefore(currentDate, "day") ||
                  dayjs(t.date).isSame(currentDate, "day"),
              );

              // Calculate balance by summing all transactions up to this date
              let balance = 0;
              for (const transaction of transactionsUpToDate) {
                const category = categoryMap.get(transaction.categoryId);
                if (category) {
                  const transactionAmount =
                    category === "income"
                      ? transaction.amount
                      : -transaction.amount;
                  balance += transactionAmount;
                }
              }

              dailyBalances.push({ date: dateString, balance });
            }
          }

          // Calculate performance as percentage change from 7 days ago to now
          const oldestBalance = dailyBalances[0]?.balance || 0;
          const newestBalance =
            dailyBalances[dailyBalances.length - 1]?.balance || 0;

          // Calculate performance - handle case when starting from 0 by finding first non-zero balance
          let performance = 0;
          const firstNonZeroBalance = dailyBalances.find(
            (b) => b.balance !== 0,
          );

          if (
            firstNonZeroBalance &&
            firstNonZeroBalance.balance !== newestBalance
          ) {
            // Calculate from first non-zero balance to current balance
            performance =
              ((newestBalance - firstNonZeroBalance.balance) /
                Math.abs(firstNonZeroBalance.balance)) *
              100;
          } else if (oldestBalance !== 0) {
            // Normal calculation when oldest balance is not zero
            performance =
              ((newestBalance - oldestBalance) / Math.abs(oldestBalance)) * 100;
          }
          // If no meaningful change can be calculated, performance stays 0

          assetPerformances.push({
            ...asset,
            balances: dailyBalances,
            performance: Number(performance.toFixed(2)),
          });
        }

        groupedAssets.push({
          ...category,
          assets: assetPerformances,
        });
      }

      return groupedAssets;
    },
  });

  return (
    <>
      {assetsQuery.data?.map((category) => (
        <Collapsible
          defaultOpen
          key={category.id}
          className="group/collapsible"
        >
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                {category.name}
                <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            <CollapsibleContent>
              <SidebarMenu>
                {category.assets.length > 0 &&
                  category.assets.map((asset) => (
                    <SidebarMenuItem key={asset.id}>
                      <SidebarMenuButton asChild>
                        <div className="flex justify-between h-14">
                          <div className="flex flex-col">
                            <span className="font-medium">{asset.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {asset.balance > 0
                                ? asset.balance.toLocaleString()
                                : "No balance"}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={cn("text-[0.675rem]", {
                                "text-green-500 dark:text-green-300":
                                  asset.performance > 0,
                                "text-destructive": asset.performance < 0,
                              })}
                            >
                              {asset.performance > 0 ? "+" : ""}
                              {asset.performance.toFixed(2)}%
                            </span>
                            <AreaChart
                              width={64}
                              height={24}
                              data={asset.balances}
                            >
                              <defs>
                                <linearGradient
                                  id={`colorBalance-${asset.id}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor={
                                      asset.performance >= 0
                                        ? "var(--chart-2)"
                                        : "var(--chart-1)"
                                    }
                                    stopOpacity={0.3}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor={
                                      asset.performance >= 0
                                        ? "var(--chart-2)"
                                        : "var(--chart-1)"
                                    }
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" hide />
                              <Area
                                type="monotone"
                                dataKey="balance"
                                stroke={
                                  asset.performance >= 0
                                    ? "var(--chart-2)"
                                    : "var(--chart-1)"
                                }
                                strokeWidth={1.5}
                                fillOpacity={1}
                                fill={`url(#colorBalance-${asset.id})`}
                                dot={false}
                                activeDot={false}
                              />
                            </AreaChart>
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-xs justify-center cursor-pointer"
                    onClick={() => openAssetForm({ categoryId: category.id })}
                  >
                    <PlusIcon />
                    Add New Asset
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </>
  );
}
