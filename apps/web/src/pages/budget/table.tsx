import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import { FilterIcon, InboxIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { Budget } from "../../@types/budget";
import type { TransactionCategory } from "../../@types/transaction";
import { useUI } from "../../components/providers/ui-provider";
import { AvatarWithBlob } from "../../components/ui/avatar-with-blob";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Feedback } from "../../components/ui/feedback";
import { MonthPicker } from "../../components/ui/month-picker";
import { Progress } from "../../components/ui/progress";
import { useIsMobile } from "../../hooks/use-mobile";
import { db } from "../../lib/db";
import { cn } from "../../lib/utils";
import { useBudgetContext } from "./context";
import { BudgetLoading } from "./loading";

type BudgetJoined = Budget & {
  category?: TransactionCategory;
  spent: number;
};

export function BudgetTable() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState<Dayjs>(dayjs().startOf("month"));
  const { config } = useUI();

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
          const transaction = transactions[i];
          if (
            transaction.categoryId === b.categoryId &&
            b.startDate &&
            transaction.date >= b.startDate &&
            b.endDate &&
            transaction.date <= b.endDate
          ) {
            spent += transaction.amount;
          }
        }

        return {
          ...b,
          spent,
          category,
        };
      });
    },
  });

  const { setIsEditModalOpen, setEditingBudget } = useBudgetContext();

  const handleAddBudget = () => {
    setEditingBudget(null);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <div className="flex justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 items-start sm:items-center w-full sm:w-auto">
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
            format="MMM YYYY"
          />
        </div>
        <div>
          <Button
            onClick={handleAddBudget}
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
          >
            <PlusIcon className="size-8 md:size-4" />
            {!isMobile && <span>Add Budget</span>}
          </Button>
        </div>
      </div>
      {budgetQuery.isLoading ? (
        <BudgetLoading />
      ) : budgetQuery.data.length === 0 ? (
        <Feedback
          content="No budgets found for this period."
          icon={InboxIcon}
        />
      ) : (
        <div className="space-y-4">
          {budgetQuery.data.map((budget) => {
            const percentage =
              budget.amount > 0
                ? Math.min((budget.spent / budget.amount) * 100, 100)
                : 0;

            const handleView = () => {
              navigate(`/budget/${budget.id}`);
            };

            return (
              <Card
                key={budget.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={handleView}
              >
                <CardContent>
                  <div className="flex space-x-4">
                    <AvatarWithBlob
                      className="size-10"
                      blob={budget.category?.icon}
                      fallback={budget.category?.name?.charAt(0) ?? "U"}
                    />
                    <div className="flex flex-col w-full space-y-2">
                      <div className="flex justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold">
                            {budget.category?.name ?? "Unknown"}
                          </span>
                          {isMobile ? (
                            <span className="text-xs text-muted-foreground">
                              {dayjs(budget.endDate).from(
                                budget.startDate,
                                true,
                              )}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {dayjs(budget.startDate).format(
                                config?.dateFormat || "DD MMM YYYY",
                              )}{" "}
                              -{" "}
                              {dayjs(budget.endDate).format(
                                config?.dateFormat || "DD MMM YYYY",
                              )}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold">
                            {budget.amount.toLocaleString()}
                          </span>
                          <span
                            className={cn(
                              "text-xs md:text-sm text-muted-foreground",
                              {
                                "text-destructive":
                                  budget.spent > budget.amount,
                              },
                            )}
                          >
                            {budget.spent > budget.amount
                              ? `Overspent: ${(budget.spent - budget.amount).toLocaleString()}`
                              : `Remaining: ${(budget.amount - budget.spent).toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={percentage}
                        className={cn("h-2", {
                          "[&>[data-slot=progress-indicator]]:bg-chart-2 bg-chart-2/20":
                            percentage <= 60,
                          "[&>[data-slot=progress-indicator]]:bg-chart-5 bg-chart-5/20":
                            percentage > 61 && percentage <= 90,
                          "[&>[data-slot=progress-indicator]]:bg-chart-1 bg-chart-1/20":
                            percentage > 90,
                        })}
                      />
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
