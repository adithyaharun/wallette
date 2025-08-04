import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export function RecentTransactions() {
  const recentTransactionsQuery = useSuspenseQuery({
    queryKey: ["dashboard-recent-transactions"],
    queryFn: async () => {
      const transactions = await db.transactions
        .orderBy("date")
        .filter((transaction) => transaction.excludedFromReports === 0)
        .reverse()
        .limit(5)
        .toArray();

      const assets = await db.assets.toArray();
      const categories = await db.transactionCategories.toArray();

      const assetMap = new Map(assets.map((a) => [a.id, a.name]));
      const categoryMap = new Map(categories.map((c) => [c.id, c]));

      return transactions.map((transaction) => ({
        ...transaction,
        assetName: assetMap.get(transaction.assetId) || "Unknown Asset",
        category: categoryMap.get(transaction.categoryId),
      }));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTransactionsQuery.data.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {transaction.category?.type === "income" ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-600 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{transaction.details}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">
                      {transaction.category?.name}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="truncate hidden sm:inline">
                      {transaction.assetName}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="shrink-0">
                      {dayjs(transaction.date).format("MMM DD")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
                    <span className="truncate">{transaction.assetName}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p
                  className={cn(
                    "font-medium text-sm sm:text-base",
                    transaction.category?.type === "income"
                      ? "text-green-600"
                      : "text-red-600",
                  )}
                >
                  {transaction.category?.type === "income" ? "+" : "-"}
                  {transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
