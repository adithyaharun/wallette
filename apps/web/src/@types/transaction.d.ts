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
  date: Date; // When the transaction actually occurred
  createdAt?: Date; // When the transaction was created in the app
  details?: string; // Short description of the transaction
  description?: string;
  photos?: Blob[]; // Array of photo URLs
  tags?: string[]; // Array of tag names
  excludedFromReports: boolean; // Whether this transaction should be excluded from reports
};
