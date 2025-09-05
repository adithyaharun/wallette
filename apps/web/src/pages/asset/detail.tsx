import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  Ellipsis,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Area,
  AreaChart,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { Asset, AssetCategory } from "../../@types/asset";
import type {
  Transaction,
  TransactionCategory,
} from "../../@types/transaction";
import { useUI } from "../../components/providers/ui-provider";
import { BlobAvatar } from "../../components/ui/blob-avatar";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DataTable } from "../../components/ui/data-table";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { useIsMobile } from "../../hooks/use-mobile";
import { db } from "../../lib/db";
import { cn } from "../../lib/utils";
import { useAssetContext } from "./context";

type DateSeparator = {
  type: "date-separator";
  date: dayjs.Dayjs;
};

type AssetWithCategory = Asset & {
  category?: AssetCategory;
};

type TransactionWithCategory = Transaction & {
  category?: TransactionCategory;
};

type TableRow = TransactionWithCategory | DateSeparator;

function groupTransactionsByDate(
  transactions: TransactionWithCategory[],
): TableRow[] {
  const grouped: TableRow[] = [];
  let currentDate: dayjs.Dayjs | null = null;

  for (const transaction of transactions) {
    const transactionDate = dayjs(transaction.date).startOf("day");

    if (
      currentDate?.format("YYYY-MM-DD") !== transactionDate.format("YYYY-MM-DD")
    ) {
      currentDate = transactionDate;

      grouped.push({
        type: "date-separator",
        date: transactionDate,
      });
    }

    grouped.push(transaction);
  }

  return grouped;
}

export default function AssetDetailPage() {
  const { id } = useParams();
  const { setDeletingAsset, setIsDeleteDialogOpen } = useAssetContext();
  const { openAssetForm, config } = useUI();
  const isMobile = useIsMobile();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const today = dayjs();

  const assetQuery = useSuspenseQuery<AssetWithCategory | null>({
    queryKey: ["asset", id],
    queryFn: async () => {
      if (!id) return null;

      const asset = await db.assets.get(Number(id));
      if (!asset) return null;

      return {
        ...asset,
        ...(asset.categoryId && {
          category: await db.assetCategories.get(asset.categoryId),
        }),
      };
    },
  });

  const transactionQuery = useSuspenseQuery<TransactionWithCategory[]>({
    queryKey: ["asset-transaction", id],
    queryFn: async () => {
      if (!id) return [];

      const startDate = dayjs().startOf("month").toDate();
      const endDate = dayjs().endOf("month").toDate();

      const transactions = await db.transactions
        .where("assetId")
        .equals(Number(id))
        .and(
          (transaction) =>
            transaction.date >= startDate && transaction.date <= endDate,
        )
        .reverse()
        .sortBy("date");

      const categories = await db.transactionCategories.toArray();

      const transactionsWithCategory = transactions.map((transaction) => {
        const category = categories.find(
          (cat) => cat.id === transaction.categoryId,
        );
        return {
          ...transaction,
          category: category || {
            id: 0,
            name: "Uncategorized",
            type: "expense" as const,
          },
        };
      }) as TransactionWithCategory[];

      return transactionsWithCategory || [];
    },
  });

  // Asset performance data for the current month using AssetBalance
  const performanceQuery = useSuspenseQuery<
    Array<{ date: string; balance: number; displayDate: string }>
  >({
    queryKey: ["asset-performance", id, dayjs().format("YYYY-MM")],
    queryFn: async () => {
      if (!id) return [];

      const startDate = dayjs().startOf("month");
      const endDate = dayjs().endOf("month");

      // Get asset balance records for the current month
      const assetBalances = await db.assetBalances
        .where("assetId")
        .equals(Number(id))
        .and(
          (balance) =>
            (dayjs(balance.date).isSame(startDate, "day") ||
              dayjs(balance.date).isAfter(startDate, "day")) &&
            (dayjs(balance.date).isSame(endDate, "day") ||
              dayjs(balance.date).isBefore(endDate, "day")),
        )
        .sortBy("date");

      // Create a complete date range for the month
      const performanceData: Array<{
        date: string;
        balance: number;
        displayDate: string;
      }> = [];
      const balanceMap = new Map<string, number>();

      // Map existing balances by date
      assetBalances.forEach((balance) => {
        const dateKey = dayjs(balance.date).format("YYYY-MM-DD");
        balanceMap.set(dateKey, balance.balance);
      });

      // Fill in all dates from start of month to end of month
      const actualEndDate = endDate;
      let currentDate = startDate;
      let lastKnownBalance = 0;

      // Get the asset's starting balance or first recorded balance
      if (assetBalances.length > 0) {
        lastKnownBalance = assetBalances[0].balance;
      } else {
        // Fallback to current asset balance if no historical data
        const asset = await db.assets.get(Number(id));
        lastKnownBalance = asset?.balance || 0;
      }

      while (
        currentDate.isSame(actualEndDate, "day") ||
        currentDate.isBefore(actualEndDate, "day")
      ) {
        const dateKey = currentDate.format("YYYY-MM-DD");
        const balance = balanceMap.get(dateKey) || lastKnownBalance;

        performanceData.push({
          date: dateKey,
          balance: balance,
          displayDate: currentDate.format("MMM DD"),
        });

        // Update last known balance for next iteration
        if (balanceMap.has(dateKey)) {
          lastKnownBalance = balance;
        }

        currentDate = currentDate.add(1, "day");
      }

      return performanceData;
    },
  });

  const columns = useMemo<ColumnDef<TableRow>[]>(() => {
    if (assetQuery.data === null) return [];

    if (isMobile) {
      return [
        {
          header: "Transaction",
          accessorKey: "details",
          cell: ({ row }) => {
            const data = row.original;

            // Handle date separator rows
            if ("type" in data && data.type === "date-separator") {
              return (
                <div className="py-3 px-2 bg-muted/50 rounded-md">
                  <div className="text-sm font-semibold text-muted-foreground">
                    {today.startOf("day").isSame(data.date.startOf("day"))
                      ? "Today"
                      : today
                            .startOf("day")
                            .subtract(1, "day")
                            .isSame(data.date.startOf("day"))
                        ? "Yesterday"
                        : data.date.format(config?.dateFormat)}
                  </div>
                </div>
              );
            }

            const transaction = data as TransactionWithCategory;
            return (
              <div className="flex items-start gap-3 min-w-0">
                <BlobAvatar
                  blob={transaction.category?.icon}
                  fallback={
                    transaction.category?.name?.charAt(0).toUpperCase() || "?"
                  }
                  alt={transaction.category?.name || "Category"}
                  className="shrink-0 mt-0.5"
                />
                <div className="flex flex-col space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate pr-2">
                      {transaction.details ?? "Transaction"}
                    </span>
                    <div
                      className={cn("text-sm font-mono shrink-0", {
                        "text-destructive":
                          transaction.category?.type === "expense",
                        "text-green-500":
                          transaction.category?.type === "income",
                      })}
                    >
                      {transaction.amount.toLocaleString(config?.numberFormat)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">
                        {transaction.category?.name}
                      </span>
                      <span>•</span>
                      <span className="truncate">{assetQuery.data?.name}</span>
                    </div>
                    <span className="shrink-0">
                      {dayjs(transaction.date).format(
                        config?.timeFormat || "HH:mm",
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          },
        },
      ];
    }

    return [
      {
        header: "Details",
        accessorKey: "details",
        width: "40%",
        cell: ({ row }) => {
          const data = row.original;

          // Handle date separator rows
          if ("type" in data && data.type === "date-separator") {
            return (
              <div className="p-2 bg-muted">
                <div className="text-sm font-semibold text-foreground">
                  {today.startOf("day").isSame(data.date.startOf("day"))
                    ? "Today"
                    : today
                          .startOf("day")
                          .subtract(1, "day")
                          .isSame(data.date.startOf("day"))
                      ? "Yesterday"
                      : data.date.format(config?.dateFormat)}
                </div>
              </div>
            );
          }

          const transaction = data as TransactionWithCategory;
          return (
            <div className="flex items-start gap-3 min-w-0">
              <BlobAvatar
                blob={transaction.category?.icon}
                fallback={
                  transaction.category?.name?.charAt(0).toUpperCase() || "?"
                }
                alt={transaction.category?.name || "Category"}
                className="shrink-0 mt-0.5"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate">
                  {transaction.details ?? <>&nbsp;</>}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {transaction.category?.name}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: "Time",
        accessorKey: "date",
        width: "200px",
        cell: ({ row }) => {
          const data = row.original;

          // Hide content for date separator rows
          if ("type" in data && data.type === "date-separator") {
            return null;
          }

          const transaction = data as TransactionWithCategory;
          const d = dayjs(transaction.date);

          if (d.isSame(dayjs(), "day")) {
            return (
              <Tooltip>
                <TooltipTrigger className="text-left">
                  <div className="whitespace-nowrap">{d.fromNow()}</div>
                </TooltipTrigger>
                <TooltipContent>
                  {dayjs(d).format(
                    `${config?.dateFormat || "DD/MM/YYYY"}, ${config?.timeFormat || "HH:mm"}`,
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <div className="whitespace-nowrap">
              {dayjs(d).format(
                `${config?.dateFormat || "DD/MM/YYYY"}, ${config?.timeFormat || "HH:mm"}`,
              )}
            </div>
          );
        },
      },
      {
        header: () => <div className="text-right">Amount</div>,
        accessorKey: "amount",
        width: "120px",
        cell: ({ row }) => {
          const data = row.original;

          // Hide content for date separator rows
          if ("type" in data && data.type === "date-separator") {
            return null;
          }

          const transaction = data as TransactionWithCategory;
          return (
            <div
              className={cn("text-right font-mono whitespace-nowrap", {
                "text-destructive": transaction.category?.type === "expense",
                "text-green-500": transaction.category?.type === "income",
              })}
            >
              {transaction.amount.toLocaleString(config?.numberFormat)}
            </div>
          );
        },
      },
    ];
  }, [
    isMobile,
    assetQuery.data,
    config?.timeFormat,
    config?.dateFormat,
    today,
  ]);

  const asset = assetQuery.data;
  if (!asset) return <div>Asset not found</div>;

  // Calculate performance change for the month
  const performanceData = performanceQuery.data;
  const currentBalance =
    performanceData.length > 0
      ? performanceData[performanceData.length - 1].balance
      : asset.balance || 0;
  const startBalance =
    performanceData.length > 0 ? performanceData[0].balance : currentBalance;
  const netWorthChange = currentBalance - startBalance;
  const netWorthChangePercent =
    startBalance !== 0 ? (netWorthChange / startBalance) * 100 : 0;

  const handleEdit = () => {
    if (!asset) return;

    openAssetForm({
      asset: asset,
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ["asset", id] });
        queryClient.invalidateQueries({
          queryKey: ["asset-performance-grouped"],
        });
        queryClient.invalidateQueries({
          queryKey: ["asset-transaction", id],
        });
        queryClient.invalidateQueries({
          queryKey: ["asset-performance", id, dayjs().format("YYYY-MM")],
        });
      },
    });
  };

  const handleDelete = () => {
    if (!asset) return;
    setDeletingAsset(asset);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      <div className="space-y-4 pb-24 md:pb-0">
        <div className="flex items-center md:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <BlobAvatar
              className="size-12 rounded-md"
              blob={asset.icon}
              fallback={asset.name?.charAt(0) ?? "B"}
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">
                {asset.name ?? "Unknown"}
              </h1>
              {asset.category && (
                <span className="text-sm text-muted-foreground">
                  {asset.category.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              className={cn("rounded-full md:rounded-md", {
                "fixed bottom-6 right-6 z-10": isMobile,
                "flex justify-end": !isMobile,
                "size-16 shadow-2xl shadow-accent": isMobile,
              })}
              style={{
                bottom: `calc(env(safe-area-inset-bottom) + ${
                  isMobile ? "1.5rem" : "0"
                })`,
              }}
              size={isMobile ? "icon" : "default"}
              asChild
            >
              <Link
                to={`/transactions/form?asset_id=${asset.id}`}
                viewTransition
              >
                <PlusIcon className="size-8 md:size-4" />
                {!isMobile && <span>Add Transaction</span>}
              </Link>
            </Button>
            {isMobile ? (
              <Drawer open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost">
                    <Ellipsis />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>More Options</DrawerTitle>
                    <DrawerDescription></DrawerDescription>
                  </DrawerHeader>
                  <div className="flex flex-col gap-2 px-4 pb-4">
                    <Button
                      size="lg"
                      variant="ghost"
                      onClick={() => {
                        handleEdit();
                        setIsOptionsOpen(false);
                      }}
                    >
                      <EditIcon />
                      Edit Asset
                    </Button>
                    <Button
                      size="lg"
                      variant="ghost"
                      onClick={() => {
                        handleDelete();
                        setIsOptionsOpen(false);
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2Icon />
                      Delete Asset
                    </Button>
                    <DrawerClose asChild>
                      <Button size="lg" variant="ghost">
                        Cancel
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <DropdownMenu
                open={isOptionsOpen}
                onOpenChange={setIsOptionsOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Ellipsis />
                    Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <EditIcon className="w-4 h-4" />
                    Edit Asset
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2Icon className="w-4 h-4" />
                    Delete Asset
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div className="space-y-1.5 md:space-y-3">
                <CardTitle>Asset Performance</CardTitle>
                <CardTitle className="text-2xl md:text-3xl font-mono">
                  {config?.currencySymbol}
                  {asset?.balance.toLocaleString(config?.numberFormat)}
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
                    <span>{netWorthChange.toLocaleString(config?.numberFormat)}</span>
                    <span>({Math.abs(netWorthChangePercent).toFixed(2)}%)</span>
                    <span>vs last month</span>
                  </CardDescription>
                )}
              </div>
              <div className="flex flex-col items-end space-y-1.5"></div>
            </div>
          </CardHeader>
          <CardContent>
            {performanceQuery.data.length > 0 ? (
              <div className="flex flex-col">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceQuery.data}>
                      <defs>
                        <linearGradient
                          id="balance"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={`var(${netWorthChange < 0 ? "--chart-1" : "--chart-2"})`}
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="95%"
                            stopColor={`var(${netWorthChange < 0 ? "--chart-1" : "--chart-2"})`}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="displayDate"
                        axisLine={false}
                        tickLine={false}
                        hide
                      />
                      <YAxis axisLine={false} tickLine={false} hide />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const currentBalance = payload[0].value as number;
                            const currentIndex =
                              performanceQuery.data.findIndex(
                                (item) => item.displayDate === label,
                              );
                            const previousBalance =
                              currentIndex > 0
                                ? performanceQuery.data[currentIndex - 1]
                                    .balance
                                : currentBalance;
                            const difference = currentBalance - previousBalance;

                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Date
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      {label}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Balance
                                    </span>
                                    <span className="font-bold">
                                      {currentBalance.toLocaleString(config?.numberFormat)}
                                    </span>
                                  </div>
                                  {difference !== 0 && (
                                    <div className="flex flex-col col-span-2">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        Change
                                      </span>
                                      <span
                                        className={`font-bold ${difference > 0 ? "text-green-600" : "text-destructive"}`}
                                      >
                                        {(
                                          currentBalance - previousBalance
                                        ).toLocaleString(config?.numberFormat)}{" "}
                                        ({difference > 0 ? "+" : ""}
                                        {(
                                          (difference / previousBalance) *
                                          100
                                        ).toFixed(1)}
                                        %)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke={`var(${netWorthChange < 0 ? "--chart-1" : "--chart-2"})`}
                        fillOpacity={1}
                        fill="url(#balance)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {dayjs()
                      .startOf("month")
                      .format(config?.dateFormat || "DD/MM/YYYY")}
                  </span>
                  <span>
                    {dayjs()
                      .endOf("month")
                      .format(config?.dateFormat || "DD/MM/YYYY")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No performance data available for this month
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col space-y-2">
          <h3 className="font-bold text-xl">Recent Transactions</h3>
          <DataTable<TableRow, string>
            columns={columns}
            data={groupTransactionsByDate(transactionQuery.data || [])}
            loading={transactionQuery.isLoading}
            isSpecialRow={(row) =>
              "type" in row && row.type === "date-separator"
            }
            isClickableRow={(row) => !("type" in row)}
            onRowClick={(row) =>
              navigate(
                `/transactions/detail?id=${(row as TransactionWithCategory).id}`,
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
