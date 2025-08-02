import type { UserFile } from "./file";

export type TransactionCategory = {
  id: number;
  name: string;
  type: "income" | "expense"; // Type of transaction category
  description?: string;
  icon?: Blob;
};

export type Transaction = {
  id: number;
  assetId: number;
  categoryId: number;
  amount: number;
  date: Date; // ISO date string
  details?: string; // Short description of the transaction
  description?: string;
  photos?: UserFile[]; // Array of photo URLs
  tags?: string[]; // Array of tag names
  excludedFromReports?: 0 | 1; // Whether this transaction should be excluded from reports
};
