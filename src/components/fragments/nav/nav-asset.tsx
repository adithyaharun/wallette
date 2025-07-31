import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ChevronDownIcon } from "lucide-react";
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

type AssetPerformanceGroup = AssetCategory & {
  assets: AssetPerformance[];
};

type AssetPerformance = Asset & {
  balances: { date: string; balance: number }[];
  performance: number;
};

export function NavAsset() {
  const assetsQuery = useSuspenseQuery<AssetPerformanceGroup[]>({
    queryKey: ["asset-performance-7d-grouped"],
    queryFn: async () =>
      await db.assets.toArray(async (assets) => {
        const assetCategories = await db.assetCategories.toArray();

        // Map assets with their categories
        const assetsWithCategories = await Promise.all(
          assets.map(async (asset) => {
            // Get last 7 days of balance entries
            const sevenDaysAgo = dayjs()
              .subtract(7, "day")
              .startOf("day")
              .toDate();

            const balanceEntries = await db.assetBalances
              .where("assetId")
              .equals(asset.id)
              .and((balance) => balance.date >= sevenDaysAgo)
              .sortBy("date");

            // Create array for each of the last 7 days with actual balance data
            const balances = [];

            for (let i = 6; i >= 0; i--) {
              const currentDate = dayjs().subtract(i, "day").startOf("day");
              const dateString = currentDate.format("YYYY-MM-DD");

              // Find balance entry for this date
              const balanceEntry = balanceEntries.find(
                (entry) =>
                  dayjs(entry.date).format("YYYY-MM-DD") === dateString,
              );

              // Use balance from entry, or carry forward last known balance, or use asset.balance
              const balance: number =
                balanceEntry?.balance ??
                (balances.length > 0
                  ? balances[balances.length - 1].balance
                  : asset.balance);

              balances.push({
                date: currentDate.format("MMM DD"),
                balance,
              });
            }

            // Calculate performance percentage from first to last balance
            const firstBalance = balances[0]?.balance || 0;
            const lastBalance = balances[balances.length - 1]?.balance || 0;

            // Calculate performance percentage
            const performance =
              firstBalance !== 0
                ? ((lastBalance - firstBalance) / Math.abs(firstBalance)) * 100
                : 0; // If starting from zero, show 0%

            return {
              ...asset,
              balances,
              performance,
            };
          }),
        );

        // Group assets by category
        const groupedAssets: AssetPerformanceGroup[] = [];

        assetCategories.forEach((category) => {
          const categoryAssets = assetsWithCategories.filter(
            (asset) => asset.categoryId === category.id,
          );

          if (categoryAssets.length > 0) {
            groupedAssets.push({
              ...category,
              assets: categoryAssets,
            });
          } else {
            groupedAssets.push({
              ...category,
              assets: [],
            });
          }
        });

        console.log("Grouped assets:", groupedAssets);

        return groupedAssets;
      }),
  });

  // Render the sidebar with grouped assets
  return (
    <>
      {assetsQuery.data.map((category) => (
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
                {category.assets.length > 0 ? (
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
                                "text-red-500 dark:text-red-300":
                                  asset.performance < 0,
                              })}
                            >
                              {asset.performance > 0 ? "+" : ""}
                              {asset.performance.toFixed(2)}%
                            </span>
                            <AreaChart
                              width={80}
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
                              />
                            </AreaChart>
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-xs" disabled>
                      No assets in this category
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
