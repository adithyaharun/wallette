import dayjs from "dayjs";
import type { Transaction } from "../../@types/transaction";
import { db } from "../../lib/db";

export interface DateSuggestion {
  date: Date;
  confidence: number;
  reason: string;
}

export interface CategorySuggestion {
  categoryId: number;
  details?: string;
  description?: string;
  confidence: number;
  reason: string;
}

export const transactionAnalytics = {
  async suggestDateBasedOnRecentActivity(): Promise<DateSuggestion | null> {
    const oneMinuteAgo = dayjs().subtract(1, "minute").toDate();

    const recentTransactions = await db.transactions
      .where("createdAt")
      .above(oneMinuteAgo)
      .toArray();

    if (recentTransactions.length < 2) {
      return null;
    }

    const transactionDates = recentTransactions
      .map((t) => dayjs(t.date).format("YYYY-MM-DD"))
      .filter((date) => date !== dayjs().format("YYYY-MM-DD"));

    if (transactionDates.length === 0) {
      return null;
    }

    const mostCommonDate = transactionDates.reduce(
      (acc, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const [suggestedDateStr, count] = Object.entries(mostCommonDate).sort(
      ([, a], [, b]) => b - a,
    )[0];

    if (count >= 2) {
      return {
        date: dayjs(suggestedDateStr).toDate(),
        confidence: Math.min(count / recentTransactions.length, 0.9),
        reason: `${count} recent transactions on this date`,
      };
    }

    return null;
  },

  async suggestCategoryByAmount(
    amount: number,
  ): Promise<CategorySuggestion | null> {
    const tolerance = 0.01;

    const similarTransactions = await db.transactions
      .where("amount")
      .between(amount - tolerance, amount + tolerance)
      .toArray();

    if (similarTransactions.length < 5) {
      return null;
    }

    const categoryGroups = similarTransactions.reduce(
      (acc, transaction) => {
        const key = `${transaction.categoryId}_${transaction.details || ""}_${transaction.description || ""}`;
        if (!acc[key]) {
          acc[key] = {
            categoryId: transaction.categoryId,
            details: transaction.details,
            description: transaction.description,
            count: 0,
            transactions: [],
          };
        }
        acc[key].count++;
        acc[key].transactions.push(transaction);
        return acc;
      },
      {} as Record<
        string,
        {
          categoryId: number;
          details?: string;
          description?: string;
          count: number;
          transactions: Transaction[];
        }
      >,
    );

    const mostCommonGroup = Object.values(categoryGroups).sort(
      (a, b) => b.count - a.count,
    )[0];

    if (mostCommonGroup.count >= 5) {
      const confidence = Math.min(
        mostCommonGroup.count / similarTransactions.length,
        0.95,
      );

      return {
        categoryId: mostCommonGroup.categoryId,
        details: mostCommonGroup.details,
        description: mostCommonGroup.description,
        confidence,
        reason: `${mostCommonGroup.count} transactions with same amount and category`,
      };
    }

    return null;
  },

  async getSmartDefaults(amount?: string): Promise<{
    dateSuggestion?: DateSuggestion;
    categorySuggestion?: CategorySuggestion;
  }> {
    const results: {
      dateSuggestion?: DateSuggestion;
      categorySuggestion?: CategorySuggestion;
    } = {};

    const [dateSuggestion, categorySuggestion] = await Promise.all([
      this.suggestDateBasedOnRecentActivity(),
      amount
        ? this.suggestCategoryByAmount(parseFloat(amount))
        : Promise.resolve(null),
    ]);

    if (dateSuggestion) {
      results.dateSuggestion = dateSuggestion;
    }

    if (categorySuggestion) {
      results.categorySuggestion = categorySuggestion;
    }

    return results;
  },
};
