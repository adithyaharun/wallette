export type Budget = {
  id: number;
  categoryId: number; // Reference to the transaction category
  amount: number; // Budgeted amount for the category
  description?: string; // Optional description of the budget
  startDate?: Date; // Start date of the budget period
  endDate?: Date; // End date of the budget period
  isRepeating: boolean;
  repeatInterval?: "monthly" | "yearly"; // Optional repeat interval if isRepeating is true
  createdAt: Date; // Creation timestamp
};
