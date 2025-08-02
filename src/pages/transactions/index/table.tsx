import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs, { type Dayjs } from "dayjs";
import {
  Edit3Icon,
  EllipsisIcon,
  FilterIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { MonthPicker } from "../../../components/ui/month-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { db } from "../../../lib/db";
import { cn } from "../../../lib/utils";

type TransactionJoined = Transaction & {
  category: TransactionCategory;
  asset: Asset;
};

export function TransactionTable() {
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf("month"));
  const [transactionToDelete, setTransactionToDelete] =
    useState<TransactionJoined | null>(null);
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
            <span>{row.original.details}</span>
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
              <AvatarImage
                src={row.original.asset.icon}
                alt={row.original.asset.name}
              />
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
      {
        header: "",
        accessorKey: "actions",
        cell: ({ row }) => {
          const transaction = row.original;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="size-6">
                    <span className="sr-only">Actions</span>
                    <EllipsisIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link to={`/transactions/form?id=${transaction.id}`}>
                    <DropdownMenuItem>
                      <Edit3Icon />
                      Edit
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => openDeleteConfirmation(transaction)}
                  >
                    <Trash2Icon />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ];
  }, [openDeleteConfirmation]);

  const transactionQuery = useSuspenseQuery<TransactionJoined[]>({
    queryKey: ["transactions", month.format("YYYY-MM")],
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

          return transactions.map((transaction) => {
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
        }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Button variant="outline">
            <FilterIcon className="mr-1" />
            <span>Filter</span>
          </Button>
          <MonthPicker
            value={month}
            onValueChange={(date) => setMonth(date || dayjs().startOf("month"))}
            placeholder="Select month"
            format="MMMM YYYY"
          />
        </div>
        <div>
          <Link to="/transactions/form">
            <Button className="w-full">
              <PlusIcon />
              <span>Add Transaction</span>
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
