import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { EditIcon } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { Asset } from "../../@types/asset";
import type {
  Transaction,
  TransactionCategory,
} from "../../@types/transaction";
import { AvatarWithBlob } from "../../components/ui/avatar-with-blob";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DataTable } from "../../components/ui/data-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { useIsMobile } from "../../hooks/use-mobile";
import { db } from "../../lib/db";
import { cn } from "../../lib/utils";
import { type BudgetJoined, useBudgetContext } from "./context";
import { BudgetModal } from "./form";

type TransactionJoined = Transaction & {
  category: TransactionCategory;
  asset: Asset;
};

type DateSeparator = {
  type: "date-separator";
  date: string;
  displayDate: string;
};

type Needle = {
  value: number;
  data: { name: string; value: number; fill: string }[];
  fill: string;
};

type TableRow = TransactionJoined | DateSeparator;

function groupTransactionsByDate(
  transactions: TransactionJoined[],
): TableRow[] {
  const grouped: TableRow[] = [];
  let currentDate: string | null = null;

  for (const transaction of transactions) {
    const transactionDate = dayjs(transaction.date).format("YYYY-MM-DD");

    if (currentDate !== transactionDate) {
      currentDate = transactionDate;
      const transactionDayjs = dayjs(transaction.date);
      const today = dayjs();
      let displayDate: string;

      if (transactionDayjs.isSame(today, "day")) {
        displayDate = "Today";
      } else if (transactionDayjs.isSame(today.subtract(1, "day"), "day")) {
        displayDate = "Yesterday";
      } else if (
        transactionDayjs.isAfter(today.subtract(6, "day").startOf("day"))
      ) {
        displayDate = transactionDayjs.fromNow();
      } else {
        displayDate = transactionDayjs.format("dddd, DD MMM YYYY");
      }

      grouped.push({
        type: "date-separator",
        date: transactionDate,
        displayDate,
      });
    }

    grouped.push(transaction);
  }

  return grouped;
}

const needle = ({ value, data, fill }: Needle) => {
  console.log(value);
  const cx = 171;
  const cy = 99;
  const iR = 63;
  const oR = 90;
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const ang = 180.0 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-(Math.PI / 180) * ang);
  const cos = Math.cos(-(Math.PI / 180) * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <path
      key="needle-path"
      d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
      stroke="var(--background)"
      fill={fill}
    />,
    <circle
      key="needle-circle"
      cx={x0}
      cy={y0}
      r={r}
      fill={fill}
      stroke="var(--background)"
    />,
  ];
};

export default function BudgetDetailPage() {
  const { id } = useParams();
  const { setEditingBudget, isEditModalOpen, setIsEditModalOpen } =
    useBudgetContext();
  const isMobile = useIsMobile();

  const budgetQuery = useSuspenseQuery<BudgetJoined | null>({
    queryKey: ["budget", id],
    queryFn: async () => {
      if (!id) return null;

      const budget = await db.budgets.get(Number(id));
      if (!budget) return null;

      const category = await db.transactionCategories.get(budget.categoryId);
      const transactions = await db.transactions
        .where("categoryId")
        .equals(budget.categoryId)
        .and(
          (transaction) =>
            (budget.startDate ? transaction.date >= budget.startDate : true) &&
            (budget.endDate ? transaction.date <= budget.endDate : true),
        )
        .toArray();

      const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

      return {
        ...budget,
        category,
        spent,
      };
    },
  });

  const transactionsQuery = useSuspenseQuery<TransactionJoined[]>({
    queryKey: ["budget-transactions", id],
    queryFn: async () => {
      if (!id || !budgetQuery.data) return [];

      const budget = budgetQuery.data;
      const transactions = await db.transactions
        .where("categoryId")
        .equals(budget.categoryId)
        .and(
          (transaction) =>
            (budget.startDate ? transaction.date >= budget.startDate : true) &&
            (budget.endDate ? transaction.date <= budget.endDate : true),
        )
        .reverse()
        .sortBy("date");

      const assets = await db.assets
        .where("id")
        .anyOf(transactions.map((t) => t.assetId))
        .toArray();

      return transactions.map((transaction) => ({
        ...transaction,
        category: budget.category || {
          id: null,
          name: "Unknown",
          type: "expense",
        },
        asset: assets.find((a) => a.id === transaction.assetId) || {
          id: null,
          name: "Unknown",
        },
      })) as TransactionJoined[];
    },
  });

  const columns = useMemo<ColumnDef<TableRow>[]>(() => {
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
                    {data.displayDate}
                  </div>
                </div>
              );
            }

            const transaction = data as TransactionJoined;
            return (
              <div className="flex items-start gap-3 min-w-0">
                <AvatarWithBlob
                  blob={transaction.asset.icon}
                  fallback={
                    transaction.asset.name?.charAt(0).toUpperCase() || "?"
                  }
                  alt={transaction.asset.name || "Asset"}
                  className="shrink-0 mt-0.5"
                />
                <div className="flex flex-col space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate pr-2">
                      {transaction.details ?? "Transaction"}
                    </span>
                    <div className="text-sm font-mono shrink-0 text-red-500">
                      {transaction.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{transaction.asset.name}</span>
                    <span className="shrink-0">
                      {dayjs(transaction.date).format("HH:mm")}
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
              <div className="p-2 bg-accent">
                <div className="text-sm font-semibold text-accent-foreground">
                  {data.displayDate}
                </div>
              </div>
            );
          }

          const transaction = data as TransactionJoined;
          return (
            <div className="flex items-start gap-3 min-w-0">
              <AvatarWithBlob
                blob={transaction.category.icon}
                fallback={
                  transaction.category.name?.charAt(0).toUpperCase() || "?"
                }
                alt={transaction.category.name || "Category"}
                className="shrink-0 mt-0.5"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate">
                  {transaction.details ?? <>&nbsp;</>}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {transaction.category.name}
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

          const transaction = data as TransactionJoined;
          const d = dayjs(transaction.date);

          if (d.isSame(dayjs(), "day")) {
            return (
              <Tooltip>
                <TooltipTrigger className="text-left">
                  <div className="whitespace-nowrap">{d.fromNow()}</div>
                </TooltipTrigger>
                <TooltipContent>{d.format("HH:mm")}</TooltipContent>
              </Tooltip>
            );
          }

          return <div className="whitespace-nowrap">{d.format("HH:mm")}</div>;
        },
      },
      {
        header: "Asset",
        accessorKey: "asset",
        width: "200px",
        cell: ({ row }) => {
          const data = row.original;

          // Hide content for date separator rows
          if ("type" in data && data.type === "date-separator") {
            return null;
          }

          const transaction = data as TransactionJoined;
          return (
            <div className="flex gap-2 items-center min-w-0">
              <AvatarWithBlob
                blob={transaction.asset.icon}
                fallback={
                  transaction.asset.name?.charAt(0).toUpperCase() || "?"
                }
                alt={transaction.asset.name || "Asset"}
                className="shrink-0"
              />
              <span className="truncate">{transaction.asset.name}</span>
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

          const transaction = data as TransactionJoined;
          return (
            <div className="text-right font-mono whitespace-nowrap text-red-500">
              {transaction.amount.toLocaleString()}
            </div>
          );
        },
      },
    ];
  }, [isMobile]);

  const budget = budgetQuery.data;
  if (!budget) return <div>Budget not found</div>;

  const percentage =
    budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
  const remaining = Math.max(budget.amount - budget.spent, 0);
  const isOverspent = budget.spent > budget.amount;

  const chartData = [
    { name: "Safe", value: (budget.amount * 60) / 100, fill: "var(--chart-2)" },
    {
      name: "Warning",
      value: (budget.amount * 30) / 100,
      fill: "var(--chart-5)",
    },
    {
      name: "Danger",
      value: (budget.amount * 10) / 100,
      fill: "var(--chart-1)",
    },
  ];

  if (isOverspent) {
    chartData.push({
      name: "Overspent",
      value: budget.spent - budget.amount,
      fill: "#dc2626",
    });
  }

  const handleEdit = () => {
    setEditingBudget(budget);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <AvatarWithBlob
              className="size-10"
              blob={budget.category?.icon}
              fallback={budget.category?.name?.charAt(0) ?? "B"}
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">
                {budget.category?.name ?? "Unknown"} Budget
              </h1>
              <span className="text-xs text-muted-foreground">
                {dayjs(budget.startDate).format("MMM DD")} -{" "}
                {dayjs(budget.endDate).format("MMM DD, YYYY")}
              </span>
            </div>
          </div>
        </div>
        <Button onClick={handleEdit}>
          <EditIcon className="size-4" />
          Edit Budget
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={63}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="none"
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  {needle({
                    value: budget.spent,
                    data: chartData,
                    fill: "var(--foreground)",
                  })}
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <div className="text-2xl font-bold">{percentage.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">
                {isOverspent ? "Over Budget" : "of Budget Used"}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Budget Limit
              </span>
              <span className="font-mono font-semibold">
                {budget.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className="font-mono font-semibold text-red-500">
                {budget.spent.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {isOverspent ? "Overspent" : "Remaining"}
              </span>
              <span
                className={cn("font-mono font-semibold", {
                  "text-red-500": isOverspent,
                  "text-green-500": !isOverspent,
                })}
              >
                {isOverspent
                  ? (budget.spent - budget.amount).toLocaleString()
                  : remaining.toLocaleString()}
              </span>
            </div>
            {budget.description && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {budget.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions */}
        <DataTable<TableRow, string>
          columns={columns}
          data={groupTransactionsByDate(transactionsQuery.data || [])}
          loading={transactionsQuery.isLoading}
          isSpecialRow={(row) => "type" in row && row.type === "date-separator"}
          isClickableRow={(row) => !("type" in row)}
        />
      </div>

      {/* Edit Modal */}
      <BudgetModal
        editingBudget={budgetQuery.data}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
}
