import dayjs, { type Dayjs } from "dayjs";

import type { Budget } from "../../@types/budget";
import { db } from "../../lib/db";

export interface BudgetPeriodInfo {
  isMonthly: boolean;
  periodDays: number;
  nextStartDate: Date;
  nextEndDate: Date;
}

/**
 * Analyzes a budget period to determine if it's monthly or custom day-based
 */
export function analyzeBudgetPeriod(
  startDate: Date,
  endDate: Date,
): BudgetPeriodInfo {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const periodDays = end.diff(start, "day") + 1;

  const isStartOfMonth = start.date() === 1;
  const isEndOfMonth = end.date() === end.daysInMonth();
  const isMonthly =
    isStartOfMonth && isEndOfMonth && start.month() === end.month();

  let nextStartDate: Dayjs;
  let nextEndDate: Dayjs;

  if (isMonthly) {
    nextStartDate = end.add(1, "day").startOf("month");
    nextEndDate = nextStartDate.endOf("month");
  } else {
    nextStartDate = end.add(1, "day");
    nextEndDate = nextStartDate.add(periodDays - 1, "day");
  }

  return {
    isMonthly,
    periodDays,
    nextStartDate: nextStartDate.toDate(),
    nextEndDate: nextEndDate.toDate(),
  };
}

/**
 * Checks if a budget period has expired and needs renewal
 */
export function isBudgetExpired(budget: Budget): boolean {
  if (!budget.endDate) return false;
  return dayjs().isAfter(dayjs(budget.endDate), "day");
}

/**
 * Creates a new budget period for a repeating budget
 */
export async function createNextBudgetPeriod(budget: Budget): Promise<number> {
  if (!budget.startDate || !budget.endDate) {
    throw new Error("Budget must have start and end dates for renewal");
  }

  const periodInfo = analyzeBudgetPeriod(budget.startDate, budget.endDate);

  const newBudgetId = await db.budgets.add({
    categoryId: budget.categoryId,
    amount: budget.amount,
    description: budget.description,
    startDate: periodInfo.nextStartDate,
    endDate: periodInfo.nextEndDate,
    isRepeating: budget.isRepeating,
    createdAt: new Date(),
  });

  return newBudgetId;
}

/**
 * Finds all expired repeating budgets that need renewal
 */
export async function findExpiredRepeatingBudgets(): Promise<Budget[]> {
  const budgets = await db.budgets.toArray();
  const expiredRepeatingBudgets = budgets.filter(
    (budget) => budget.isRepeating && isBudgetExpired(budget),
  );

  const budgetsNeedingRenewal: Budget[] = [];

  for (const budget of expiredRepeatingBudgets) {
    if (!budget.startDate || !budget.endDate) continue;

    const periodInfo = analyzeBudgetPeriod(budget.startDate, budget.endDate);

    const existingRenewal = budgets.find(
      (b) =>
        b.categoryId === budget.categoryId &&
        b.startDate &&
        dayjs(b.startDate).isSame(dayjs(periodInfo.nextStartDate), "day") &&
        b.endDate &&
        dayjs(b.endDate).isSame(dayjs(periodInfo.nextEndDate), "day") &&
        b.amount === budget.amount,
    );

    if (!existingRenewal) {
      budgetsNeedingRenewal.push(budget);
    }
  }

  return budgetsNeedingRenewal;
}

/**
 * Renews all expired repeating budgets
 */
export async function renewExpiredBudgets(): Promise<{
  renewed: Array<{ originalBudget: Budget; newBudgetId: number }>;
  errors: Array<{ budget: Budget; error: string }>;
}> {
  const expiredBudgets = await findExpiredRepeatingBudgets();
  const renewed: Array<{ originalBudget: Budget; newBudgetId: number }> = [];
  const errors: Array<{ budget: Budget; error: string }> = [];

  for (const budget of expiredBudgets) {
    try {
      const newBudgetId = await createNextBudgetPeriod(budget);
      renewed.push({ originalBudget: budget, newBudgetId });
    } catch (error) {
      errors.push({
        budget,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { renewed, errors };
}
