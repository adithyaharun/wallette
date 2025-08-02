import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import { FilterIcon, InboxIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import type { Budget } from "../../@types/budget";
import type { TransactionCategory } from "../../@types/transaction";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { MonthPicker } from "../../components/ui/month-picker";
import { db } from "../../lib/db";
import { cn } from "../../lib/utils";
import { BudgetModal } from "./form";
import { BudgetLoading } from "./loading";

type BudgetJoined = Budget & {
  category?: TransactionCategory;
  spent: number;
};

export function BudgetTable() {
  const [period, setPeriod] = useState<Dayjs>(dayjs().startOf("month"));
  const budgetQuery = useSuspenseQuery<BudgetJoined[]>({
    queryKey: ["budgets"],
    queryFn: async () => {
      const budgets = await db.budgets
        .where("startDate")
        .between(
          period.startOf("month").toDate(),
          period.endOf("month").toDate(),
        )
        .toArray();

      const categories = await db.transactionCategories
        .where("id")
        .anyOf(budgets.map((b) => b.categoryId))
        .toArray();

      const transactions = await db.transactions
        .where("categoryId")
        .anyOf(budgets.map((b) => b.categoryId))
        .toArray();

      return budgets.map((b) => {
        const category = categories.find((cat) => cat.id === b.categoryId);

        let spent = 0;
        for (let i = 0; i < transactions.length; i++) {
          spent += transactions[i].amount;
        }

        return {
          ...b,
          spent,
          category,
        };
      });
    },
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
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
          <BudgetModal>
            <Button className="w-full">
              <PlusIcon />
              <span>Add Budget</span>
            </Button>
          </BudgetModal>
        </div>
      </div>
      {budgetQuery.isLoading ? (
        <BudgetLoading />
      ) : budgetQuery.data.length === 0 ? (
        <div className="flex flex-col py-24 text-muted-foreground items-center space-y-4">
          <InboxIcon className="size-20" />
          <p>No budgets found for this period.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgetQuery.data.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            return (
              <Card key={budget.id}>
                <CardContent>
                  <div className="flex space-x-4">
                    <Avatar className="size-10">
                      {budget.category?.icon && (
                        <AvatarImage
                          src={URL.createObjectURL(budget.category?.icon)}
                        />
                      )}
                      <AvatarFallback>
                        {budget.category?.name.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col w-full space-y-2">
                      <div className="flex justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold">
                            {budget.category?.name ?? "Unknown"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {dayjs(budget.startDate).format("MMMM D, YYYY")} -{" "}
                            {dayjs(budget.endDate).format("MMMM D, YYYY")}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold">
                            {budget.amount.toLocaleString()}
                          </span>
                          <span
                            className={cn("text-sm text-muted-foreground", {
                              "text-red-400": budget.spent > budget.amount,
                            })}
                          >
                            {budget.spent > budget.amount
                              ? "Overspent: "
                              : "Remaining: "}
                            {budget.spent.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded bg-foreground/20 overflow-hidden">
                        <div
                          className={cn("h-2 rounded", {
                            "bg-success": percentage < 81,
                            "bg-destructive": percentage > 80,
                          })}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
