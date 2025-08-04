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
    {
      name: "Investments",
      description: "Investment funds",
    },
    {
      name: "Property and Land",
      description: "Real estate and land holdings",
    },
    {
      name: "Digital Assets",
      description: "Cryptocurrencies and NFTs",
    },
    {
      name: "Other",
      description: "Miscellaneous assets",
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
    {
      name: "Salary",
      type: "income",
      description: "Monthly salary or wages",
    },
    {
      name: "Freelance",
      type: "income",
      description: "Freelance or contract work income",
    },
    {
      name: "Investment Returns",
      type: "income",
      description: "Returns from investments and dividends",
    },
    {
      name: "Interest",
      type: "income",
      description: "Interest earned on savings",
    },
    {
      name: "Gifts",
      type: "income",
      description: "Monetary gifts received",
    },
    {
      name: "Refunds",
      type: "income",
      description: "Money refunded from purchases",
    },
    {
      name: "Other Incomes",
      type: "income",
      description: "Other incomes not categorized",
    },

    // Expense Categories - Fixed Expenses
    {
      name: "Rent",
      type: "expense",
      description: "Monthly rent payments",
    },
    {
      name: "Phone Bills",
      type: "expense",
      description: "Monthly phone bills",
    },
    {
      name: "Internet Bills",
      type: "expense",
      description: "Monthly internet bills",
    },
    {
      name: "Electricity Bills",
      type: "expense",
      description: "Monthly electricity bills",
    },
    {
      name: "Water Bills",
      type: "expense",
      description: "Monthly water bills",
    },
    {
      name: "Gas Bills",
      type: "expense",
      description: "Monthly gas bills",
    },
    {
      name: "Insurance",
      type: "expense",
      description: "Insurance premiums",
    },
    {
      name: "Loan Payments",
      type: "expense",
      description: "Monthly loan or mortgage payments",
    },

    // Expense Categories - Variable Expenses
    {
      name: "Groceries",
      type: "expense",
      description: "Weekly grocery shopping",
    },
    {
      name: "Food and Restaurant",
      type: "expense",
      description: "Dining out and food delivery",
    },
    {
      name: "Transportation",
      type: "expense",
      description: "Public transport, fuel, ride-sharing",
    },
    {
      name: "Shopping",
      type: "expense",
      description: "Clothing, electronics, and other purchases",
    },
    {
      name: "Entertainment",
      type: "expense",
      description: "Movies, concerts, games, subscriptions",
    },
    {
      name: "Healthcare",
      type: "expense",
      description: "Medical expenses and consultations",
    },
    {
      name: "Pharmacy",
      type: "expense",
      description: "Medicine and health supplements",
    },
    {
      name: "Sports and Fitness",
      type: "expense",
      description: "Gym memberships, sports equipment",
    },
    {
      name: "Education",
      type: "expense",
      description: "Tuition fees, courses, books",
    },
    {
      name: "Beauty and Personal Care",
      type: "expense",
      description: "Haircuts, cosmetics, personal hygiene",
    },
    {
      name: "Pet Care",
      type: "expense",
      description: "Pet food, veterinary, grooming",
    },

    // Expense Categories - Financial
    {
      name: "E-Wallet",
      type: "expense",
      description: "Digital wallet top-ups and transactions",
    },
    {
      name: "Bank Fees",
      type: "expense",
      description: "Banking fees and charges",
    },
    {
      name: "Investment",
      type: "expense",
      description: "Money invested in stocks, funds, etc.",
    },
    {
      name: "Savings",
      type: "expense",
      description: "Money transferred to savings",
    },
    {
      name: "Taxes",
      type: "expense",
      description: "Tax payments and government fees",
    },
    {
      name: "Donations",
      type: "expense",
      description: "Charitable donations and contributions",
    },

    // Expense Categories - Transfers
    {
      name: "Transfer Out",
      type: "expense",
      description: "Money transferred to other accounts",
    },
    {
      name: "Transfer In",
      type: "income",
      description: "Money received from other accounts",
    },
    {
      name: "Cash Withdrawal",
      type: "expense",
      description: "ATM withdrawals and cash outs",
    },

    // Expense Categories - Miscellaneous
    {
      name: "Travel",
      type: "expense",
      description: "Travel expenses and accommodation",
    },
    {
      name: "Gifts and Celebrations",
      type: "expense",
      description: "Gifts given and celebration expenses",
    },
    {
      name: "Home Maintenance",
      type: "expense",
      description: "Home repairs and maintenance",
    },
    {
      name: "Other Expenses",
      type: "expense",
      description: "Other expenses not categorized",
    },
  ]);
});
