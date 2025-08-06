import { createContext, useContext, useEffect, useState } from "react";
import type { TransactionCategory } from "../../../@types/transaction";

type TransactionCategoryFormProviderProps = {
  children: React.ReactNode;
};

type TransactionCategoryOpenProps = {
  callback?: (data?: number) => void;
  transactionCategory?: TransactionCategory;
};

type TransactionCategoryFormContextType = {
  isTransactionCategoryFormOpen: boolean;
  setTransactionCategoryFormOpen: (open: boolean) => void;
  transactionCategory: TransactionCategory | null;
  transactionCategoryFormCallback: ((data?: number) => void) | null;
  setTransactionCategoryFormCallback: (
    callback: ((data?: number) => void) | null,
  ) => void;
  openTransactionCategoryForm: (props: TransactionCategoryOpenProps) => void;
};

const TransactionCategoryFormContext =
  createContext<TransactionCategoryFormContextType>({
    isTransactionCategoryFormOpen: false,
    setTransactionCategoryFormOpen: () => {},
    transactionCategory: null,
    transactionCategoryFormCallback: null,
    setTransactionCategoryFormCallback: () => {},
    openTransactionCategoryForm: (_props: TransactionCategoryOpenProps) => {},
  });

export function TransactionCategoryFormProvider({
  children,
}: TransactionCategoryFormProviderProps) {
  const [transactionCategory, setTransactionCategory] =
    useState<TransactionCategory | null>(null);
  const [isTransactionCategoryFormOpen, setTransactionCategoryFormOpen] =
    useState(false);
  const [transactionCategoryFormCallback, setTransactionCategoryFormCallback] =
    useState<((data?: number) => void) | null>(null);

  const openTransactionCategoryForm = (props: TransactionCategoryOpenProps) => {
    setTransactionCategoryFormCallback(() => props.callback || null);
    setTransactionCategory(props.transactionCategory || null);
    setTransactionCategoryFormOpen(true);
  };

  useEffect(() => {
    if (!isTransactionCategoryFormOpen) {
      setTransactionCategory(null);
      setTransactionCategoryFormCallback(null);
    }
  }, [isTransactionCategoryFormOpen]);

  return (
    <TransactionCategoryFormContext.Provider
      value={{
        isTransactionCategoryFormOpen,
        setTransactionCategoryFormOpen,
        transactionCategory,
        transactionCategoryFormCallback,
        setTransactionCategoryFormCallback,
        openTransactionCategoryForm,
      }}
    >
      {children}
    </TransactionCategoryFormContext.Provider>
  );
}

export function useTransactionCategoryForm() {
  const context = useContext(TransactionCategoryFormContext);
  if (!context) {
    throw new Error(
      "useTransactionCategoryForm must be used within a TransactionCategoryFormProvider",
    );
  }
  return context;
}
