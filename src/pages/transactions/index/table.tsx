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

export default function TransactionTable() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf("month"));
  const [filters, setFilters] = useState<TransactionFilters>({
    categories: [],
    assets: [],
    types: [],
  });

  const columns = useMemo<ColumnDef<TransactionJoined>[]>(() => {
    if (isMobile) {
      return [
        {
          header: "Transaction",
          accessorKey: "details",
          cell: ({ row }) => (
            <div className="flex items-start gap-3 min-w-0">
              <AvatarWithBlob
                blob={row.original.category.icon}
                fallback={
                  row.original.category.name?.charAt(0).toUpperCase() || "?"
                }
                alt={row.original.category.name || "Category"}
                className="shrink-0 mt-0.5"
              />
              <div className="flex flex-col space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate pr-2">
                    {row.original.details ?? "Transaction"}
                  </span>
                  <div
                    className={cn("text-sm font-mono shrink-0", {
                      "text-red-500": row.original.category.type === "expense",
                      "text-green-500": row.original.category.type === "income",
                    })}
                  >
                    {row.original.amount.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">
                      {row.original.category.name}
                    </span>
                    <span>•</span>
                    <span className="truncate">{row.original.asset.name}</span>
                  </div>
                  <span className="shrink-0">
                    {dayjs(row.original.date).format("MMM DD")}
                  </span>
                </div>
              </div>
            </div>
          ),
        },
      ];
    }

    return [
      {
        header: "Details",
        accessorKey: "details",
        width: "40%",
        cell: ({ row }) => (
          <div className="flex items-start gap-3 min-w-0">
            <AvatarWithBlob
              blob={row.original.category.icon}
              fallback={
                row.original.category.name?.charAt(0).toUpperCase() || "?"
              }
              alt={row.original.category.name || "Category"}
              className="shrink-0 mt-0.5"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate">
                {row.original.details ?? <>&nbsp;</>}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {row.original.category.name}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: "Date",
        accessorKey: "date",
        width: "200px",
        cell: ({ row }) => {
          const d = dayjs(row.original.date);

          if (d.isSame(dayjs(), "day")) {
            return (
              <Tooltip>
                <TooltipTrigger className="text-left">
                  <div className="whitespace-nowrap">{d.fromNow()}</div>
                </TooltipTrigger>
                <TooltipContent>
                  {d.format("D MMM YYYY, hh:mm A")}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <div className="whitespace-nowrap">
              {d.format("D MMM YYYY, hh:mm A")}
            </div>
          );
        },
      },
      {
        header: "Asset",
        accessorKey: "asset",
        width: "200px",
        cell: ({ row }) => (
          <div className="flex gap-2 items-center min-w-0">
            <AvatarWithBlob
              blob={row.original.asset.icon}
              fallback={row.original.asset.name.charAt(0).toUpperCase()}
              alt={row.original.asset.name}
              className="shrink-0"
            />
            <span className="truncate">{row.original.asset.name}</span>
          </div>
        ),
      },
      {
        header: () => <div className="text-right">Amount</div>,
        accessorKey: "amount",
        width: "100px",
        cell: ({ row }) => {
          const category = row.original.category.type;

          return (
            <div
              className={cn("text-right font-mono whitespace-nowrap", {
                "text-red-500": category === "expense",
                "text-green-500": category === "income",
              })}
            >
              {row.original.amount.toLocaleString()}
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
      <DataTable<TransactionJoined, string>
        columns={columns}
        loading={transactionQuery.isLoading}
        data={transactionQuery.data || []}
        onRowClick={(transaction) =>
          navigate(`/transactions/detail?id=${transaction.id}`)
        }
      />
    </div>
  );
}
