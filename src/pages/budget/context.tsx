import { useMutation } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { Budget } from "../../@types/budget";
import type { TransactionCategory } from "../../@types/transaction";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../../components/ui/drawer";
import { useIsMobile } from "../../hooks/use-mobile";
import { db } from "../../lib/db";
import { BudgetModal } from "./form";

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
  deletingBudget: BudgetJoined | null;
  setDeletingBudget: (budget: BudgetJoined | null) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedBudget, setSelectedBudget] = useState<BudgetJoined | null>(
    null,
  );
  const [editingBudget, setEditingBudget] = useState<BudgetJoined | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<BudgetJoined | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (budgetId: number) => {
      await db.budgets.delete(budgetId);
    },
    onSuccess: () => {
      toast.success("Budget deleted successfully");
      setDeletingBudget(null);
      setIsDeleteDialogOpen(false);
      navigate("/budget");
    },
    onError: (error) => {
      console.error("Failed to delete budget:", error);
      toast.error("Failed to delete budget");
    },
  });

  const confirmDelete = () => {
    if (!deletingBudget?.id) return;
    deleteMutation.mutate(deletingBudget.id);
  };

  const cancelDelete = () => {
    setDeletingBudget(null);
    setIsDeleteDialogOpen(false);
  };

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
        deletingBudget,
        setDeletingBudget,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
      }}
    >
      {children}

      {/* Delete confirmation for desktop */}
      {!isMobile && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Budget</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the "
                {deletingBudget?.category?.name}" budget? This action cannot be
                undone and will permanently remove this budget from your
                records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={cancelDelete}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Budget"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete confirmation for mobile */}
      {isMobile && (
        <Drawer open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Delete Budget</DrawerTitle>
            </DrawerHeader>
            <div className="px-4">
              <p className="text-sm text-center text-muted-foreground mb-4">
                Are you sure you want to delete the "
                {deletingBudget?.category?.name}" budget? This action cannot be
                undone and will permanently remove this budget from your
                records.
              </p>
              <div className="flex flex-col gap-2 py-4">
                <Button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  variant="destructive"
                  size="lg"
                  className="w-full"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={cancelDelete}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Edit modal for all platforms */}
      <BudgetModal
        editingBudget={editingBudget}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
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
