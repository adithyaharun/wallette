import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { NavLink } from "react-router";
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
    queryKey: ["asset-performance-grouped"],
    queryFn: async () => {
      const assetCategories = await db.assetCategories.toArray();
      const assets = await db.assets.toArray();
      const groupedAssets: AssetPerformanceGroup[] = [];

      // Get current date for calculations
      const endDate = dayjs();
      const startOfMonth = dayjs().startOf("month");
      const daysInMonth = endDate.diff(startOfMonth, "day") + 1;

      // Get transaction categories for type information
      const transactionCategories = await db.transactionCategories.toArray();
      const categoryMap = new Map(
        transactionCategories.map((cat) => [cat.id, cat.type]),
      );

      // Find orphaned assets (assets with null categoryId)
      const orphanedAssets = assets.filter(
        (asset) => asset.categoryId === null,
      );

      // Process regular categories
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
            const sortedBalanceRecords = assetBalanceRecords.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

            for (let i = daysInMonth - 1; i >= 0; i--) {
              const currentDate = startOfMonth.add(daysInMonth - 1 - i, "days");
              const dateString = currentDate.format("YYYY-MM-DD");

              const balanceRecord = sortedBalanceRecords
                .filter(
                  (record) =>
                    dayjs(record.date).isBefore(currentDate, "day") ||
                    dayjs(record.date).isSame(currentDate, "day"),
                )
                .pop();

              const balance = balanceRecord ? balanceRecord.balance : 0;
              dailyBalances.push({ date: dateString, balance });
            }
          } else {
            const allAssetTransactions = await db.transactions
              .where("assetId")
              .equals(asset.id)
              .toArray();

            const sortedTransactions = allAssetTransactions.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

            for (let i = daysInMonth - 1; i >= 0; i--) {
              const currentDate = startOfMonth.add(daysInMonth - 1 - i, "days");
              const dateString = currentDate.format("YYYY-MM-DD");

              const transactionsUpToDate = sortedTransactions.filter(
                (t) =>
                  dayjs(t.date).isBefore(currentDate, "day") ||
                  dayjs(t.date).isSame(currentDate, "day"),
              );

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

          const oldestBalance = dailyBalances[0]?.balance || 0;
          const newestBalance =
            dailyBalances[dailyBalances.length - 1]?.balance || 0;

          let performance = 0;
          const firstNonZeroBalance = dailyBalances.find(
            (b) => b.balance !== 0,
          );

          if (
            firstNonZeroBalance &&
            firstNonZeroBalance.balance !== newestBalance
          ) {
            performance =
              ((newestBalance - firstNonZeroBalance.balance) /
                Math.abs(firstNonZeroBalance.balance)) *
              100;
          } else if (oldestBalance !== 0) {
            performance =
              ((newestBalance - oldestBalance) / Math.abs(oldestBalance)) * 100;
          }

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

      // Handle orphaned assets by creating an "Uncategorized" category
      if (orphanedAssets.length > 0) {
        const uncategorizedAssetPerformances: AssetPerformance[] = [];

        for (const asset of orphanedAssets) {
          // Try to use AssetBalance records first, fallback to transaction calculation
          const assetBalanceRecords = await db.assetBalances
            .where("assetId")
            .equals(asset.id)
            .toArray();

          const dailyBalances: { date: string; balance: number }[] = [];

          if (assetBalanceRecords.length > 0) {
            const sortedBalanceRecords = assetBalanceRecords.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

            for (let i = daysInMonth - 1; i >= 0; i--) {
              const currentDate = startOfMonth.add(daysInMonth - 1 - i, "days");
              const dateString = currentDate.format("YYYY-MM-DD");

              const balanceRecord = sortedBalanceRecords
                .filter(
                  (record) =>
                    dayjs(record.date).isBefore(currentDate, "day") ||
                    dayjs(record.date).isSame(currentDate, "day"),
                )
                .pop();

              const balance = balanceRecord ? balanceRecord.balance : 0;
              dailyBalances.push({ date: dateString, balance });
            }
          } else {
            const allAssetTransactions = await db.transactions
              .where("assetId")
              .equals(asset.id)
              .toArray();

            const sortedTransactions = allAssetTransactions.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

            for (let i = daysInMonth - 1; i >= 0; i--) {
              const currentDate = startOfMonth.add(daysInMonth - 1 - i, "days");
              const dateString = currentDate.format("YYYY-MM-DD");

              const transactionsUpToDate = sortedTransactions.filter(
                (t) =>
                  dayjs(t.date).isBefore(currentDate, "day") ||
                  dayjs(t.date).isSame(currentDate, "day"),
              );

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

          const oldestBalance = dailyBalances[0]?.balance || 0;
          const newestBalance =
            dailyBalances[dailyBalances.length - 1]?.balance || 0;

          let performance = 0;
          const firstNonZeroBalance = dailyBalances.find(
            (b) => b.balance !== 0,
          );

          if (
            firstNonZeroBalance &&
            firstNonZeroBalance.balance !== newestBalance
          ) {
            performance =
              ((newestBalance - firstNonZeroBalance.balance) /
                Math.abs(firstNonZeroBalance.balance)) *
              100;
          } else if (oldestBalance !== 0) {
            performance =
              ((newestBalance - oldestBalance) / Math.abs(oldestBalance)) * 100;
          }

          uncategorizedAssetPerformances.push({
            ...asset,
            balances: dailyBalances,
            performance: Number(performance.toFixed(2)),
          });
        }

        // Add the Uncategorized category
        groupedAssets.push({
          id: 0,
          name: "Uncategorized",
          description: "Assets from deleted categories",
          assets: uncategorizedAssetPerformances,
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
                      <NavLink
                        to={cn(`/asset/${asset.id}`)}
                        className="flex justify-between w-full"
                        viewTransition
                      >
                        {({ isActive }) => (
                          <SidebarMenuButton
                            isActive={isActive}
                            className="h-14 justify-between"
                          >
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
                                  "text-chart-2": asset.performance > 0,
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
                                      stopOpacity={0.5}
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
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  ))}
                {category.id !== 0 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="text-xs justify-center cursor-pointer"
                      onClick={() => openAssetForm({ categoryId: category.id })}
                    >
                      <PlusIcon />
                      Add New Asset
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </>
  );
}
