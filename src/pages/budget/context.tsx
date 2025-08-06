import { createContext, type ReactNode, useContext, useState } from "react";
import type { Budget } from "../../@types/budget";
import type { TransactionCategory } from "../../@types/transaction";

type BudgetJoined = Budget & {
  category?: TransactionCategory;
  spent: number;
};

interface BudgetContextType {
  selectedBudget: BudgetJoined | null;
  setSelectedBudget: (budget: BudgetJoined | null) => void;
  editingBudget: BudgetJoined | null;
  setEditingBudget: (budget: BudgetJoined | null) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [selectedBudget, setSelectedBudget] = useState<BudgetJoined | null>(
    null,
  );
  const [editingBudget, setEditingBudget] = useState<BudgetJoined | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  return (
    <BudgetContext.Provider
      value={{
        selectedBudget,
        setSelectedBudget,
        editingBudget,
        setEditingBudget,
        isEditModalOpen,
        setIsEditModalOpen,
        isDetailModalOpen,
        setIsDetailModalOpen,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgetContext() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudgetContext must be used within a BudgetProvider");
  }
  return context;
}

export type { BudgetJoined };
