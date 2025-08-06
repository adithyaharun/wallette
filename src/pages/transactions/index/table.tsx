import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs, { type Dayjs } from "dayjs";
import { PlusIcon } from "lucide-react";
import { lazy, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { Asset } from "../../../@types/asset";
import type {
  Transaction,
  TransactionCategory,
} from "../../../@types/transaction";
import { AvatarWithBlob } from "../../../components/ui/avatar-with-blob";
import { Button } from "../../../components/ui/button";
import { DataTable } from "../../../components/ui/data-table";
import { MonthPicker } from "../../../components/ui/month-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { useIsMobile } from "../../../hooks/use-mobile";
import { db } from "../../../lib/db";
import { cn } from "../../../lib/utils";
import type { TransactionFilters } from "./filter";

const TransactionFilter = lazy(() => import("./filter"));

type TransactionJoined = Transaction & {
  category: TransactionCategory;
  asset: Asset;
};

type DateSeparator = {
  type: "date-separator";
  date: string;
  displayDate: string;
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
      const daysDiff = dayjs().diff(transactionDayjs, "day");
      let displayDate: string;

      if (daysDiff === 0) {
        displayDate = "Today";
      } else if (daysDiff <= 6) {
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

export default function TransactionTable() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf("month"));
  const [filters, setFilters] = useState<TransactionFilters>({
    categories: [],
    assets: [],
    types: [],
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
                  blob={transaction.category.icon}
                  fallback={
                    transaction.category.name?.charAt(0).toUpperCase() || "?"
                  }
                  alt={transaction.category.name || "Category"}
                  className="shrink-0 mt-0.5"
                />
                <div className="flex flex-col space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate pr-2">
                      {transaction.details ?? "Transaction"}
                    </span>
                    <div
                      className={cn("text-sm font-mono shrink-0", {
                        "text-red-500": transaction.category.type === "expense",
                        "text-green-500":
                          transaction.category.type === "income",
                      })}
                    >
                      {transaction.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">
                        {transaction.category.name}
                      </span>
                      <span>•</span>
                      <span className="truncate">{transaction.asset.name}</span>
                    </div>
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
              <div className="py-2 px-2 bg-accent">
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
                fallback={transaction.asset.name.charAt(0).toUpperCase()}
                alt={transaction.asset.name}
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
        width: "100px",
        cell: ({ row }) => {
          const data = row.original;

          // Hide content for date separator rows
          if ("type" in data && data.type === "date-separator") {
            return null;
          }

          const transaction = data as TransactionJoined;
          const category = transaction.category.type;

          return (
            <div
              className={cn("text-right font-mono whitespace-nowrap", {
                "text-red-500": category === "expense",
                "text-green-500": category === "income",
              })}
            >
              {transaction.amount.toLocaleString()}
            </div>
          );
        },
      },
    ];
  }, [isMobile]);

  const transactionQuery = useSuspenseQuery<TransactionJoined[]>({
    queryKey: ["transactions", month.format("YYYY-MM"), filters],
    queryFn: async () =>
      await db.transactions
        .where("date")
        .between(month.toDate(), dayjs(month).endOf("month").toDate())
        .sortBy("date")
        .then((transactions) => transactions.reverse())
        .then(async (transactions) => {
          const categories = await db.transactionCategories
            .offset(0)
            .limit(100)
            .toArray();
          const assets = await db.assets.toArray();

          const joinedTransactions = transactions.map((transaction) => {
            const category = categories.find(
              (cat) => cat.id === transaction.categoryId,
            );

            const asset = assets.find((wal) => wal.id === transaction.assetId);
            return {
              ...transaction,
              category: category || { id: null, name: "Uncategorized" },
              asset: asset || { id: null, name: "Unknown" },
            };
          }) as TransactionJoined[];

          return joinedTransactions.filter((transaction) => {
            if (
              filters.categories.length > 0 &&
              transaction.category.id !== null
            ) {
              if (!filters.categories.includes(transaction.category.id)) {
                return false;
              }
            }

            if (filters.assets.length > 0 && transaction.asset.id !== null) {
              if (!filters.assets.includes(transaction.asset.id)) {
                return false;
              }
            }

            if (filters.types.length > 0 && transaction.category.type) {
              if (!filters.types.includes(transaction.category.type)) {
                return false;
              }
            }

            return true;
          });
        }),
  });

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div className="flex justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 items-start sm:items-center w-full sm:w-auto">
          <TransactionFilter filters={filters} onFiltersChange={setFilters} />
          <MonthPicker
            value={month}
            onValueChange={(date) => setMonth(date || dayjs().startOf("month"))}
            placeholder="Select month"
            format="MMMM YYYY"
          />
        </div>
        <div>
          <Link to="/transactions/form" viewTransition>
            <Button
              className={cn("rounded-full md:rounded-md", {
                "fixed bottom-6 right-6 z-10": isMobile,
                "flex justify-end": !isMobile,
                "size-12 shadow-2xl shadow-accent": isMobile,
              })}
              style={{
                bottom: `calc(env(safe-area-inset-bottom) + ${isMobile ? "1.5rem" : "0"})`,
              }}
              size={isMobile ? "icon" : "default"}
            >
              <PlusIcon className="size-6 md:size-4" />
              {!isMobile && <span>Add Transaction</span>}
            </Button>
          </Link>
        </div>
      </div>
      <DataTable<TableRow, string>
        columns={columns}
        loading={transactionQuery.isLoading}
        data={groupTransactionsByDate(transactionQuery.data || [])}
        isSpecialRow={(row) => "type" in row && row.type === "date-separator"}
        isClickableRow={(row) => !("type" in row)}
        onRowClick={(row) => {
          const transaction = row as TransactionJoined;
          navigate(`/transactions/detail?id=${transaction.id}`);
        }}
      />
    </div>
  );
}
