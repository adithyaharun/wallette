import { Dexie, type EntityTable } from "dexie";
import type { Asset, AssetBalance, AssetCategory } from "../@types/asset";
import type { Budget } from "../@types/budget";
import type { UserFile } from "../@types/file";
import type { Transaction, TransactionCategory } from "../@types/transaction";

export const db = new Dexie("wallette") as Dexie & {
  assetCategories: EntityTable<AssetCategory, "id">;
  assets: EntityTable<Asset, "id">;
  assetBalances: EntityTable<AssetBalance, "id">;
  userFiles: EntityTable<UserFile, "id">;
  transactions: EntityTable<Transaction, "id">;
  transactionCategories: EntityTable<TransactionCategory, "id">;
  budgets: EntityTable<Budget, "id">;
};

db.version(1).stores({
  userFiles: "++id, *tags, hash",
  assetCategories: "++id, name",
  assets: "++id, name, categoryId",
  assetBalances: "++id, assetId, date, [assetId+date]",
  transactions:
    "++id, assetId, details, categoryId, date, excludedFromReports, [assetId+date], [categoryId+date]",
  transactionCategories: "++id, type, name",
  budgets:
    "++id, categoryId, month, amount, [month+amount], startDate, endDate",
});

db.on("populate", async (tx) => {
  // Initial data for asset categories
  await tx.table("assetCategories").bulkAdd([
    {
      id: 1,
      name: "Cash",
      description: "Cash in hand or at bank",
    },
  ]);

  await tx.table("assets").bulkAdd([
    {
      name: "Cash in Hand",
      description: "Physical cash kept at home or wallet",
      categoryId: 1,
      balance: 0,
    },
  ]);

  await tx.table("transactionCategories").bulkAdd([
    {
      name: "Other Income",
      type: "income",
      description: "Other income not categorized",
    },
    {
      name: "Other Expenses",
      type: "expense",
      description: "Other expenses not categorized",
    },
  ]);
});
