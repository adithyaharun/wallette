import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs, { type Dayjs } from "dayjs";
import { PlusIcon } from "lucide-react";
import { lazy, useCallback, useMemo, useState } from "react";
import { Link } from "react-router";
import type { Asset } from "../../../@types/asset";
import type {
  Transaction,
  TransactionCategory,
} from "../../../@types/transaction";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
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
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf("month"));
  const [transactionToDelete, setTransactionToDelete] =
    useState<TransactionJoined | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    categories: [],
    assets: [],
    types: [],
  });
  const queryClient = useQueryClient();

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transaction: TransactionJoined) => {
      await db.assets
        .where("id")
        .equals(transaction.assetId)
        .modify((asset) => {
          if (transaction.category.type === "expense") {
            asset.balance += transaction.amount;
          } else if (transaction.category.type === "income") {
            asset.balance -= transaction.amount;
          }
        });

      await db.transactions.delete(transaction.id);
    },
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({
        queryKey: ["transactions", month.format("YYYY-MM")],
      });
    },
  });

  const handleDeleteTransaction = useCallback(async () => {
    if (!transactionToDelete) return;

    try {
      await deleteTransactionMutation.mutateAsync(transactionToDelete);
      setTransactionToDelete(null); // Close the dialog
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  }, [deleteTransactionMutation, transactionToDelete]);

  const openDeleteConfirmation = useCallback(
    (transaction: TransactionJoined) => {
      setTransactionToDelete(transaction);
    },
    [],
  );

  const columns = useMemo<ColumnDef<TransactionJoined>[]>(() => {
    return [
      {
        header: "Details",
        accessorKey: "details",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.details ?? <>&nbsp;</>}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.category.name}
            </span>
          </div>
        ),
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ row }) => {
          const d = dayjs(row.original.date);

          if (d.isSame(dayjs(), "day")) {
            return (
              <Tooltip>
                <TooltipTrigger>{d.fromNow()}</TooltipTrigger>
                <TooltipContent>
                  {d.format("D MMM YYYY, hh:mm A")}
                </TooltipContent>
              </Tooltip>
            );
          }

          return d.format("D MMM YYYY, hh:mm A");
        },
      },
      {
        header: "Asset",
        accessorKey: "asset",
        cell: ({ row }) => (
          <div className="flex gap-2 items-center">
            <Avatar>
              <AvatarFallback>
                {row.original.asset.name.charAt(0).toUpperCase()}
              </AvatarFallback>
              {row.original.asset.icon && (
                <AvatarImage
                  src={URL.createObjectURL(row.original.asset.icon)}
                  alt={row.original.asset.name}
                />
              )}
            </Avatar>
            <span>{row.original.asset.name}</span>
          </div>
        ),
      },
      {
        header: () => <div className="text-right">Amount</div>,
        accessorKey: "amount",
        cell: ({ row }) => {
          const category = row.original.category.type;

          return (
            <div
              className={cn("text-right font-mono", {
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
  }, []);

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

          // Apply filters
          return joinedTransactions.filter((transaction) => {
            // Filter by categories
            if (
              filters.categories.length > 0 &&
              transaction.category.id !== null
            ) {
              if (!filters.categories.includes(transaction.category.id)) {
                return false;
              }
            }

            // Filter by assets
            if (filters.assets.length > 0 && transaction.asset.id !== null) {
              if (!filters.assets.includes(transaction.asset.id)) {
                return false;
              }
            }

            // Filter by transaction types
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
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
            <Button className="w-full">
              <PlusIcon />
              {isMobile ? <span>Add New</span> : <span>Add Transaction</span>}
            </Button>
          </Link>
        </div>
      </div>
      <DataTable<TransactionJoined, string>
        columns={columns}
        loading={transactionQuery.isLoading}
        data={transactionQuery.data || []}
      />
      <AlertDialog
        open={!!transactionToDelete}
        onOpenChange={(open) => !open && setTransactionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction
              {transactionToDelete?.details &&
                ` "${transactionToDelete?.details}"`}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
