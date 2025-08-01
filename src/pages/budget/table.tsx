import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs, { type Dayjs } from "dayjs";
import { FilterIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import type { Asset } from "../../@types/asset";
import type {
  Transaction,
  TransactionCategory,
} from "../../@types/transaction";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { DataTable } from "../../components/ui/data-table";
import { MonthPicker } from "../../components/ui/month-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { db } from "../../lib/db";
import { cn } from "../../lib/utils";

type TransactionJoined = Transaction & {
  category: TransactionCategory;
  asset: Asset;
};

const columns: ColumnDef<TransactionJoined>[] = [
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
            <TooltipContent>{d.format("D MMM YYYY, hh:mm A")}</TooltipContent>
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
];

export function BudgetTable() {
  const [period, setPeriod] = useState<Dayjs>(dayjs().startOf("month"));
  const transactionQuery = useSuspenseQuery<TransactionJoined[]>({
    queryKey: ["transactions", period.format("YYYY-MM")],
    queryFn: async () =>
      await db.transactions
        .where("date")
        .between(period.toDate(), dayjs(period).endOf("month").toDate())
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Button variant="outline">
            <FilterIcon className="mr-1" />
            <span>Filter</span>
          </Button>
          <MonthPicker
            value={period}
            onValueChange={(date) =>
              setPeriod(date || dayjs().startOf("month"))
            }
            placeholder="Select period"
            format="MMMM YYYY"
          />
        </div>
        <div>
          <Button className="w-full">
            <PlusIcon />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>
      <DataTable<TransactionJoined, string>
        columns={columns}
        loading={transactionQuery.isLoading}
        data={transactionQuery.data || []}
      />
    </div>
  );
}
