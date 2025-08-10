import dayjs from "dayjs";
import { db } from "../../lib/db";

export interface NetWorthData {
  date: dayjs.Dayjs;
  dateKey: string;
  netWorth: number;
  dailyIncome: number;
  dailyExpense: number;
}

export const dashboardRepository = {
  /**
   * Calculate net worth trend for a given month with comparison to previous month
   * Used by NetWorthChart component
   */
  getNetWorthTrend: async (date: dayjs.Dayjs): Promise<NetWorthData[]> => {
    const currentMonth = date.startOf("month");
    const endOfMonth = date.endOf("month");
    const assets = await db.assets.toArray();

    // Get ALL transactions (not just in date range) since we need to calculate historical balances
    const allTransactions = await db.transactions
      .filter((transaction) => transaction.excludedFromReports === false)
      .toArray();

    const categories = await db.transactionCategories.toArray();
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat.type]));

    // Helper function to calculate asset balance up to a specific date
    const calculateAssetBalanceUpToDate = (
      assetId: number,
      upToDate: dayjs.Dayjs,
    ): number => {
      const assetTransactions = allTransactions.filter(
        (t) =>
          t.assetId === assetId &&
          (dayjs(t.date).isBefore(upToDate, "day") ||
            dayjs(t.date).isSame(upToDate, "day")),
      );

      let balance = 0;
      for (const transaction of assetTransactions) {
        const categoryType = categoryMap.get(transaction.categoryId);
        if (categoryType === "income") {
          balance += transaction.amount;
        } else if (categoryType === "expense") {
          balance -= transaction.amount;
        }
      }
      return balance;
    };

    const dailyData: NetWorthData[] = [];

    for (
      let day = currentMonth;
      day.isBefore(endOfMonth) || day.isSame(endOfMonth, "day");
      day = day.add(1, "day")
    ) {
      const dayStart = day.startOf("day").toDate();
      const dayEnd = day.endOf("day").toDate();

      let totalNetWorth = 0;
      for (const asset of assets) {
        totalNetWorth += calculateAssetBalanceUpToDate(asset.id, day);
      }

      const dayTransactions = allTransactions.filter(
        (t) => t.date >= dayStart && t.date <= dayEnd,
      );

      const dailyIncome = dayTransactions
        .filter((t) => categoryMap.get(t.categoryId) === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const dailyExpense = dayTransactions
        .filter((t) => categoryMap.get(t.categoryId) === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      dailyData.push({
        date: day,
        dateKey: day.format("YYYY-MM-DD"),
        netWorth: totalNetWorth,
        dailyIncome,
        dailyExpense,
      });
    }

    const todayLastMonth = dayjs().subtract(1, "month");

    let lastMonthNetWorth = 0;
    for (const asset of assets) {
      lastMonthNetWorth += calculateAssetBalanceUpToDate(
        asset.id,
        todayLastMonth,
      );
    }

    dailyData.unshift({
      date: todayLastMonth,
      dateKey: todayLastMonth.format("YYYY-MM-DD"),
      netWorth: lastMonthNetWorth,
      dailyIncome: 0,
      dailyExpense: 0,
    });

    console.log(dailyData);

    return dailyData;
  },

  /**
   * Get monthly income/expense summary for current month only
   * Used by MonthlySummary component
   */
  getMonthlySummary: async (date: dayjs.Dayjs): Promise<NetWorthData[]> => {
    const currentMonth = date.startOf("month");
    const endOfMonth = date.endOf("month");
    const assets = await db.assets.toArray();

    // Get ALL transactions for accurate balance calculations
    const allTransactions = await db.transactions
      .filter((transaction) => transaction.excludedFromReports === false)
      .toArray();

    const categories = await db.transactionCategories.toArray();
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat.type]));

    // Helper function to calculate asset balance up to a specific date
    const calculateAssetBalanceUpToDate = (
      assetId: number,
      upToDate: dayjs.Dayjs,
    ): number => {
      const assetTransactions = allTransactions.filter(
        (t) =>
          t.assetId === assetId &&
          (dayjs(t.date).isBefore(upToDate, "day") ||
            dayjs(t.date).isSame(upToDate, "day")),
      );

      let balance = 0;
      for (const transaction of assetTransactions) {
        const categoryType = categoryMap.get(transaction.categoryId);
        if (categoryType === "income") {
          balance += transaction.amount;
        } else if (categoryType === "expense") {
          balance -= transaction.amount;
        }
      }
      return balance;
    };

    const dailyData: NetWorthData[] = [];

    for (
      let day = currentMonth;
      day.isBefore(endOfMonth) || day.isSame(endOfMonth, "day");
      day = day.add(1, "day")
    ) {
      const dayStart = day.startOf("day").toDate();
      const dayEnd = day.endOf("day").toDate();

      let totalNetWorth = 0;
      for (const asset of assets) {
        totalNetWorth += calculateAssetBalanceUpToDate(asset.id, day);
      }

      const dayTransactions = allTransactions.filter(
        (t) => t.date >= dayStart && t.date <= dayEnd,
      );

      const dailyIncome = dayTransactions
        .filter((t) => categoryMap.get(t.categoryId) === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const dailyExpense = dayTransactions
        .filter((t) => categoryMap.get(t.categoryId) === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      dailyData.push({
        date: day,
        dateKey: day.format("YYYY-MM-DD"),
        netWorth: totalNetWorth,
        dailyIncome,
        dailyExpense,
      });
    }

    return dailyData;
  },
};
