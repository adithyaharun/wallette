import { Dexie, type EntityTable } from "dexie";
import type { Asset, AssetBalance, AssetCategory } from "../@types/asset";
import type { Budget } from "../@types/budget";
import type { Config } from "../@types/config";
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
  config: EntityTable<Config, "id">;
};

db.version(2).stores({
  userFiles: "++id, *tags, hash",
  assetCategories: "++id, name",
  assets: "++id, name, categoryId",
  assetBalances: "++id, assetId, date, [assetId+date]",
  transactions:
    "++id, assetId, details, categoryId, date, excludedFromReports, [assetId+date], [categoryId+date]",
  transactionCategories: "++id, type, name",
  budgets:
    "++id, categoryId, month, amount, [month+amount], startDate, endDate",
  config: "++id",
});

db.version(2).stores({
  userFiles: "++id, *tags, hash",
  assetCategories: "++id, name",
  assets: "++id, name, categoryId",
  assetBalances: "++id, assetId, date, [assetId+date]",
  transactions:
    "++id, assetId, details, categoryId, date, amount, createdAt, excludedFromReports, [assetId+date], [categoryId+date]",
  transactionCategories: "++id, type, name",
  budgets:
    "++id, categoryId, month, amount, [month+amount], startDate, endDate",
  config: "++id",
});

db.on("populate", async (tx) => {
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
