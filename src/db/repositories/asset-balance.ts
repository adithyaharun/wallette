import dayjs from "dayjs";
import { db } from "../../lib/db";

export const assetBalanceRepository = {
  addBalance: async (
    assetId: number,
    amount: number,
    date: Date | null = new Date(),
  ) => {
    const asset = await db.assets.get(assetId);
    if (!asset) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }

    const todayDate = dayjs().startOf("day");
    const balanceDate = dayjs(date);

    await db.assets.update(asset, {
      balance: asset.balance + amount,
    });

    const assetBalance = await db.assetBalances
      .where("[assetId+date]")
      .equals([assetId, balanceDate.toDate()])
      .first();

    if (assetBalance) {
      await db.assetBalances.update(assetBalance, {
        balance: assetBalance.balance + amount,
      });
    } else {
      const previousBalance = await db.assetBalances
        .where("assetId")
        .equals(assetId)
        .and((balance) => dayjs(balance.date).isBefore(balanceDate))
        .reverse()
        .sortBy("date");
      
      const baseBalance = previousBalance.length > 0 ? previousBalance[0].balance : 0;
      
      await db.assetBalances.add({
        assetId,
        date: balanceDate.toDate(),
        balance: baseBalance + amount,
      });
    }

    if (balanceDate.isBefore(todayDate)) {
      for (let i = 1; i <= todayDate.diff(balanceDate, "day"); i++) {
        const day = balanceDate.add(i, "day");
        const futureAssetBalance = await db.assetBalances
          .where("assetId")
          .equals(assetId)
          .and((balance) => dayjs(balance.date).isSame(day, "day"))
          .first();

        if (futureAssetBalance) {
          await db.assetBalances.update(futureAssetBalance, {
            balance: futureAssetBalance.balance + amount,
          });
        }
      }
    }
  },
  deductBalance: async (
    assetId: number,
    amount: number,
    date: Date | null = new Date(),
  ) => {
    const asset = await db.assets.get(assetId);
    if (!asset) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }

    const todayDate = dayjs().startOf("day");
    const balanceDate = dayjs(date);

    await db.assets.update(asset, {
      balance: asset.balance - amount,
    });

    const assetBalance = await db.assetBalances
      .where("[assetId+date]")
      .equals([assetId, balanceDate.toDate()])
      .first();

    if (assetBalance) {
      await db.assetBalances.update(assetBalance, {
        balance: assetBalance.balance - amount,
      });
    } else {
      const previousBalance = await db.assetBalances
        .where("assetId")
        .equals(assetId)
        .and((balance) => dayjs(balance.date).isBefore(balanceDate))
        .reverse()
        .sortBy("date");
      
      const baseBalance = previousBalance.length > 0 ? previousBalance[0].balance : 0;
      
      await db.assetBalances.add({
        assetId,
        date: balanceDate.toDate(),
        balance: baseBalance - amount,
      });
    }

    if (balanceDate.isBefore(todayDate)) {
      for (let i = 1; i <= todayDate.diff(balanceDate, "day"); i++) {
        const day = balanceDate.add(i, "day");
        const futureAssetBalance = await db.assetBalances
          .where("assetId")
          .equals(assetId)
          .and((balance) => dayjs(balance.date).isSame(day, "day"))
          .first();

        if (futureAssetBalance) {
          await db.assetBalances.update(futureAssetBalance, {
            balance: futureAssetBalance.balance - amount,
          });
        }
      }
    }
  },
  resetAndRecalculateBalance: async (
    assetId: number,
    upToDate: Date = new Date(),
  ) => {
    const asset = await db.assets.get(assetId);
    if (!asset) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }

    const upToDateDay = dayjs(upToDate).endOf("day");

    await db.assetBalances
      .where("assetId")
      .equals(assetId)
      .delete();

    const allTransactions = await db.transactions
      .where("assetId")
      .equals(assetId)
      .and((transaction) => dayjs(transaction.date).isBefore(upToDateDay) || dayjs(transaction.date).isSame(upToDateDay, 'day'))
      .toArray();

    const sortedTransactions = allTransactions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const balancesByDate = new Map<string, number>();
    let runningBalance = 0;

    for (const transaction of sortedTransactions) {
      const category = await db.transactionCategories.get(transaction.categoryId);
      if (!category) continue;

      const transactionAmount = category.type === "income" ? transaction.amount : -transaction.amount;
      runningBalance += transactionAmount;

      const dateKey = dayjs(transaction.date).format("YYYY-MM-DD");
      balancesByDate.set(dateKey, runningBalance);
    }

    for (const [dateKey, balance] of balancesByDate.entries()) {
      await db.assetBalances.add({
        assetId,
        date: dayjs(dateKey).toDate(),
        balance,
      });
    }

    await db.assets.update(asset, {
      balance: runningBalance,
    });

    return runningBalance;
  },
};
