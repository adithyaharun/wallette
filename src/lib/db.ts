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
    "++id, assetId, details, categoryId, date, [assetId+date], [categoryId+date]",
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
      ...(process.env.NODE_ENV === "development"
        ? {
            balance: 500000, // Starting with 500k IDR
          }
        : {
            balance: 0, // Default balance for production
          }),
    },
    ...(process.env.NODE_ENV === "development"
      ? [
          {
            name: "Bank Account 1",
            description: "Primary bank account for daily transactions",
            categoryId: 1,
            balance: 8500000, // Starting with 8.5 million IDR
          },
          {
            name: "Bank Account 2",
            description: "Secondary bank account for savings and investments",
            categoryId: 1,
            balance: 12000000, // Starting with 12 million IDR
          },
          {
            name: "Emergency Fund",
            description: "Emergency savings fund",
            categoryId: 1,
            balance: 15000000, // Starting with 15 million IDR
          },
          {
            name: "Investment Portfolio",
            description: "Stock and mutual fund investments",
            categoryId: 2, // Investments category
            balance: 25000000, // Starting with 25 million IDR
          },
        ]
      : []),
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

  if (process.env.NODE_ENV === "development") {
    // Add comprehensive sample transactions for July 2025
    const sampleTransactions = [
      // July 1, 2025 (Tuesday) - Month start with salary
      {
        assetId: 2, // Bank Account 1
        categoryId: 1, // Salary
        amount: 15000000, // 15 million IDR
        date: new Date("2025-07-01T09:00:00"),
        details: "Monthly salary deposit",
      },
      {
        assetId: 2, // Bank Account 1
        categoryId: 15, // Groceries
        amount: 350000, // 350k IDR
        date: new Date("2025-07-01T18:30:00"),
        details: "Weekly grocery shopping",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 85000, // 85k IDR
        date: new Date("2025-07-01T20:15:00"),
        details: "Dinner at local restaurant",
      },

      // July 2, 2025 (Wednesday)
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 65000, // 65k IDR
        date: new Date("2025-07-02T12:30:00"),
        details: "Office lunch",
      },
      {
        assetId: 2, // Bank Account 1
        categoryId: 9, // Phone Bills
        amount: 150000, // 150k IDR
        date: new Date("2025-07-02T16:00:00"),
        details: "Monthly phone bill payment",
      },

      // July 3, 2025 (Thursday)
      {
        assetId: 2, // Bank Account 1
        categoryId: 18, // Shopping
        amount: 425000, // 425k IDR
        date: new Date("2025-07-03T14:20:00"),
        details: "New work clothes",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 17, // Transportation
        amount: 45000, // 45k IDR
        date: new Date("2025-07-03T18:00:00"),
        details: "Commute home",
      },

      // July 4, 2025 (Friday) - Major expenses
      {
        assetId: 2, // Bank Account 1
        categoryId: 8, // Rent
        amount: 4500000, // 4.5 million IDR
        date: new Date("2025-07-04T10:00:00"),
        details: "Monthly apartment rent",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 19, // Entertainment
        amount: 175000, // 175k IDR
        date: new Date("2025-07-04T20:00:00"),
        details: "Friday night out",
      },

      // July 5, 2025 (Saturday) - Weekend expenses
      {
        assetId: 1, // Cash in Hand
        categoryId: 15, // Groceries
        amount: 280000, // 280k IDR
        date: new Date("2025-07-05T09:30:00"),
        details: "Weekend grocery shopping",
      },
      {
        assetId: 2, // Bank Account 1
        categoryId: 22, // Sports and Fitness
        amount: 450000, // 450k IDR
        date: new Date("2025-07-05T11:00:00"),
        details: "Monthly gym membership",
      },
      {
        assetId: 3, // Bank Account 2
        categoryId: 16, // Food and Restaurant
        amount: 195000, // 195k IDR
        date: new Date("2025-07-05T13:30:00"),
        details: "Weekend brunch with friends",
      },

      // July 6, 2025 (Sunday) - Rest day with some income
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 125000, // 125k IDR
        date: new Date("2025-07-06T12:00:00"),
        details: "Sunday family lunch",
      },
      {
        assetId: 3, // Bank Account 2
        categoryId: 5, // Gifts
        amount: 800000, // 800k IDR
        date: new Date("2025-07-06T15:30:00"),
        details: "Gift money from relatives",
      },

      // July 7, 2025 (Monday) - Utilities week
      {
        assetId: 2, // Bank Account 1
        categoryId: 10, // Internet Bills
        amount: 350000, // 350k IDR
        date: new Date("2025-07-07T08:00:00"),
        details: "Monthly internet bill",
      },
      {
        assetId: 2, // Bank Account 1
        categoryId: 11, // Electricity Bills
        amount: 425000, // 425k IDR
        date: new Date("2025-07-07T10:30:00"),
        details: "Monthly electricity bill",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 75000, // 75k IDR
        date: new Date("2025-07-07T12:30:00"),
        details: "Monday lunch",
      },

      // July 8, 2025 (Tuesday)
      {
        assetId: 1, // Cash in Hand
        categoryId: 17, // Transportation
        amount: 95000, // 95k IDR
        date: new Date("2025-07-08T07:30:00"),
        details: "Weekly transport pass",
      },
      {
        assetId: 2, // Bank Account 1
        categoryId: 20, // Healthcare
        amount: 400000, // 400k IDR
        date: new Date("2025-07-08T14:20:00"),
        details: "Regular health checkup",
      },

      // July 9, 2025 (Wednesday)
      {
        assetId: 3, // Bank Account 2
        categoryId: 23, // Education
        amount: 750000, // 750k IDR
        date: new Date("2025-07-09T10:00:00"),
        details: "Online course subscription",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 21, // Pharmacy
        amount: 85000, // 85k IDR
        date: new Date("2025-07-09T19:45:00"),
        details: "Monthly vitamins",
      },

      // July 10, 2025 (Thursday) - Mid-month freelance income
      {
        assetId: 3, // Bank Account 2
        categoryId: 2, // Freelance
        amount: 2500000, // 2.5 million IDR
        date: new Date("2025-07-10T14:00:00"),
        details: "Freelance project payment",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 145000, // 145k IDR
        date: new Date("2025-07-10T19:30:00"),
        details: "Celebration dinner",
      },

      // July 11, 2025 (Friday)
      {
        assetId: 2, // Bank Account 1
        categoryId: 27, // E-Wallet
        amount: 300000, // 300k IDR
        date: new Date("2025-07-11T09:30:00"),
        details: "GoPay top-up for the week",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 19, // Entertainment
        amount: 225000, // 225k IDR
        date: new Date("2025-07-11T21:00:00"),
        details: "Movie night with friends",
      },

      // July 12, 2025 (Saturday) - Weekend shopping
      {
        assetId: 2, // Bank Account 1
        categoryId: 15, // Groceries
        amount: 465000, // 465k IDR
        date: new Date("2025-07-12T10:00:00"),
        details: "Weekly family groceries",
      },
      {
        assetId: 3, // Bank Account 2
        categoryId: 18, // Shopping
        amount: 320000, // 320k IDR
        date: new Date("2025-07-12T15:30:00"),
        details: "Household items",
      },

      // July 13, 2025 (Sunday) - Rest day
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 165000, // 165k IDR
        date: new Date("2025-07-13T14:30:00"),
        details: "Sunday brunch",
      },

      // July 14, 2025 (Monday) - Investment week
      {
        assetId: 2, // Bank Account 1
        categoryId: 29, // Investment
        amount: 1500000, // 1.5 million IDR
        date: new Date("2025-07-14T09:00:00"),
        details: "Monthly investment contribution",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 17, // Transportation
        amount: 115000, // 115k IDR
        date: new Date("2025-07-14T18:00:00"),
        details: "Weekly transport budget",
      },

      // July 15, 2025 (Tuesday) - Mid-month salary bonus
      {
        assetId: 2, // Bank Account 1
        categoryId: 1, // Salary
        amount: 3000000, // 3 million IDR
        date: new Date("2025-07-15T10:00:00"),
        details: "Performance bonus",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 24, // Beauty and Personal Care
        amount: 185000, // 185k IDR
        date: new Date("2025-07-15T16:00:00"),
        details: "Haircut and personal care",
      },

      // July 16, 2025 (Wednesday)
      {
        assetId: 2, // Bank Account 1
        categoryId: 12, // Water Bills
        amount: 125000, // 125k IDR
        date: new Date("2025-07-16T09:00:00"),
        details: "Monthly water bill",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 95000, // 95k IDR
        date: new Date("2025-07-16T12:30:00"),
        details: "Midweek lunch treat",
      },

      // July 17, 2025 (Thursday)
      {
        assetId: 3, // Bank Account 2
        categoryId: 19, // Entertainment
        amount: 275000, // 275k IDR
        date: new Date("2025-07-17T20:00:00"),
        details: "Concert tickets",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 17, // Transportation
        amount: 65000, // 65k IDR
        date: new Date("2025-07-17T22:30:00"),
        details: "Late night ride home",
      },

      // July 18, 2025 (Friday)
      {
        assetId: 2, // Bank Account 1
        categoryId: 30, // Savings
        amount: 2000000, // 2 million IDR
        date: new Date("2025-07-18T11:00:00"),
        details: "Monthly savings transfer",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 155000, // 155k IDR
        date: new Date("2025-07-18T19:30:00"),
        details: "Friday dinner",
      },

      // July 19, 2025 (Saturday) - Weekend activities
      {
        assetId: 1, // Cash in Hand
        categoryId: 15, // Groceries
        amount: 385000, // 385k IDR
        date: new Date("2025-07-19T09:30:00"),
        details: "Weekend grocery run",
      },
      {
        assetId: 3, // Bank Account 2
        categoryId: 38, // Travel
        amount: 850000, // 850k IDR
        date: new Date("2025-07-19T14:00:00"),
        details: "Weekend getaway booking",
      },

      // July 20, 2025 (Sunday) - Investment returns
      {
        assetId: 3, // Bank Account 2
        categoryId: 3, // Investment Returns
        amount: 1200000, // 1.2 million IDR
        date: new Date("2025-07-20T10:30:00"),
        details: "Quarterly dividend payout",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 195000, // 195k IDR
        date: new Date("2025-07-20T13:00:00"),
        details: "Sunday family meal celebration",
      },

      // July 21, 2025 (Monday)
      {
        assetId: 2, // Bank Account 1
        categoryId: 15, // Insurance
        amount: 650000, // 650k IDR
        date: new Date("2025-07-21T09:00:00"),
        details: "Monthly insurance premium",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 17, // Transportation
        amount: 85000, // 85k IDR
        date: new Date("2025-07-21T18:00:00"),
        details: "Monday commute",
      },

      // July 22, 2025 (Tuesday)
      {
        assetId: 1, // Cash in Hand
        categoryId: 20, // Healthcare
        amount: 325000, // 325k IDR
        date: new Date("2025-07-22T15:30:00"),
        details: "Dental appointment",
      },
      {
        assetId: 2, // Bank Account 1
        categoryId: 39, // Gifts and Celebrations
        amount: 400000, // 400k IDR
        date: new Date("2025-07-22T18:00:00"),
        details: "Birthday gift for colleague",
      },

      // July 23, 2025 (Wednesday)
      {
        assetId: 3, // Bank Account 2
        categoryId: 32, // Donations
        amount: 250000, // 250k IDR
        date: new Date("2025-07-23T11:00:00"),
        details: "Monthly charity donation",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 115000, // 115k IDR
        date: new Date("2025-07-23T19:00:00"),
        details: "Midweek dinner",
      },

      // July 24, 2025 (Thursday) - Today
      {
        assetId: 2, // Bank Account 1
        categoryId: 31, // Taxes
        amount: 850000, // 850k IDR
        date: new Date("2025-07-24T10:00:00"),
        details: "Monthly tax payment",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 95000, // 95k IDR
        date: new Date("2025-07-24T12:30:00"),
        details: "Today's lunch",
      },

      // July 25, 2025 (Friday)
      {
        assetId: 2, // Bank Account 1
        categoryId: 40, // Home Maintenance
        amount: 750000, // 750k IDR
        date: new Date("2025-07-25T14:00:00"),
        details: "Monthly home maintenance",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 19, // Entertainment
        amount: 225000, // 225k IDR
        date: new Date("2025-07-25T20:00:00"),
        details: "Friday night entertainment",
      },

      // July 26, 2025 (Saturday)
      {
        assetId: 1, // Cash in Hand
        categoryId: 15, // Groceries
        amount: 435000, // 435k IDR
        date: new Date("2025-07-26T10:00:00"),
        details: "Weekend grocery shopping",
      },
      {
        assetId: 3, // Bank Account 2
        categoryId: 18, // Shopping
        amount: 565000, // 565k IDR
        date: new Date("2025-07-26T15:30:00"),
        details: "Monthly shopping spree",
      },

      // July 27, 2025 (Sunday)
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 185000, // 185k IDR
        date: new Date("2025-07-27T13:00:00"),
        details: "Sunday brunch with family",
      },

      // July 28, 2025 (Monday) - Week-end month
      {
        assetId: 2, // Bank Account 1
        categoryId: 28, // Bank Fees
        amount: 45000, // 45k IDR
        date: new Date("2025-07-28T09:00:00"),
        details: "Monthly banking fees",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 17, // Transportation
        amount: 125000, // 125k IDR
        date: new Date("2025-07-28T18:00:00"),
        details: "End-of-month transport budget",
      },

      // July 29, 2025 (Tuesday)
      {
        assetId: 3, // Bank Account 2
        categoryId: 6, // Refunds
        amount: 150000, // 150k IDR
        date: new Date("2025-07-29T14:00:00"),
        details: "Product return refund",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 21, // Pharmacy
        amount: 75000, // 75k IDR
        date: new Date("2025-07-29T16:30:00"),
        details: "Monthly medication",
      },

      // July 30, 2025 (Wednesday)
      {
        assetId: 2, // Bank Account 1
        categoryId: 23, // Education
        amount: 850000, // 850k IDR
        date: new Date("2025-07-30T11:00:00"),
        details: "Professional development course",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 135000, // 135k IDR
        date: new Date("2025-07-30T19:00:00"),
        details: "Pre-month-end dinner",
      },

      // July 31, 2025 (Thursday) - Month end
      {
        assetId: 3, // Bank Account 2
        categoryId: 4, // Interest
        amount: 125000, // 125k IDR
        date: new Date("2025-07-31T10:00:00"),
        details: "Monthly savings interest",
      },
      {
        assetId: 1, // Cash in Hand
        categoryId: 16, // Food and Restaurant
        amount: 165000, // 165k IDR
        date: new Date("2025-07-31T20:00:00"),
        details: "End of month celebration dinner",
      },
    ];

    await tx.table("transactions").bulkAdd(sampleTransactions);

    // Generate daily balances for July 2025 (development data)
    await generateHistoricalBalances();
  }
});

// Generate historical balances for existing transactions
export async function generateHistoricalBalances() {
  console.log("Generating historical asset balances...");

  // Get all unique dates from transactions
  const transactions = await db.transactions.orderBy("date").toArray();
  const uniqueDates = [
    ...new Set(
      transactions.map((t) => {
        const date = new Date(t.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }),
    ),
  ].map((timestamp) => new Date(timestamp));

  // Get all assets
  const assets = await db.assets.toArray();

  // Generate balance entries for each asset on each transaction date
  for (const date of uniqueDates) {
    for (const asset of assets) {
      await updateAssetBalance(asset.id, date);
    }
  }

  console.log(
    `Generated balances for ${uniqueDates.length} days and ${assets.length} assets`,
  );
}

// Asset Balance Management Functions
export async function updateAssetBalance(
  assetId: number,
  transactionDate: Date,
) {
  const dateStart = new Date(transactionDate);
  dateStart.setHours(0, 0, 0, 0);

  const dateEnd = new Date(transactionDate);
  dateEnd.setHours(23, 59, 59, 999);

  // Get the asset's starting balance
  const asset = await db.assets.get(assetId);
  const startingBalance = asset?.balance || 0;

  // Calculate balance up to end of transaction date by considering category types
  const transactions = await db.transactions
    .where("assetId")
    .equals(assetId)
    .and((transaction) => transaction.date <= dateEnd)
    .toArray();

  // Get all transaction categories to determine income vs expense
  const categories = await db.transactionCategories.toArray();
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat.type]));

  const balance = transactions.reduce((sum, transaction) => {
    const categoryType = categoryMap.get(transaction.categoryId);

    if (categoryType === "income") {
      return sum + transaction.amount; // Add income
    } else if (categoryType === "expense") {
      return sum - transaction.amount; // Subtract expenses
    }

    return sum; // Fallback for unknown categories
  }, startingBalance);

  // Check if balance entry already exists for this date
  const existingBalance = await db.assetBalances
    .where("[assetId+date]")
    .equals([assetId, dateStart])
    .first();

  if (existingBalance) {
    // Update existing balance
    await db.assetBalances.update(existingBalance.id, { balance });
  } else {
    // Create new balance entry
    await db.assetBalances.add({
      assetId,
      date: dateStart,
      balance,
    });
  }

  // Also update the asset's current balance
  await db.assets.update(assetId, { balance });
}

export async function updateAllAssetBalances(transactionDate: Date) {
  const assets = await db.assets.toArray();

  await Promise.all(
    assets.map((asset) => updateAssetBalance(asset.id, transactionDate)),
  );
}

// Enhanced transaction creation with balance updates
export async function createTransaction(transaction: Omit<Transaction, "id">) {
  const result = await db.transaction(
    "rw",
    db.transactions,
    db.assets,
    db.assetBalances,
    async () => {
      // Add the transaction
      const transactionId = await db.transactions.add(transaction);

      // Update asset balance for the transaction date and all affected assets
      await updateAssetBalance(transaction.assetId, transaction.date);

      // Update balances for any dates after this transaction that might be affected
      const laterBalances = await db.assetBalances
        .where("assetId")
        .equals(transaction.assetId)
        .and((balance) => balance.date > transaction.date)
        .toArray();

      // Recalculate all later balances
      for (const laterBalance of laterBalances) {
        await updateAssetBalance(transaction.assetId, laterBalance.date);
      }

      return transactionId;
    },
  );

  return result;
}
