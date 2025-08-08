import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { renewExpiredBudgets } from "../db/repositories/budget-recurring";

export function useBudgetRenewal() {
  const queryClient = useQueryClient();

  const checkAndRenewBudgets = useCallback(async () => {
    try {
      const { renewed, errors } = await renewExpiredBudgets();

      // Silently log results for debugging
      if (renewed.length > 0) {
        console.log(`Renewed ${renewed.length} expired budget(s)`);
      }
      if (errors.length > 0) {
        console.error("Budget renewal errors:", errors);
      }

      // Invalidate budget queries to show updated data
      if (renewed.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
      }
    } catch (error) {
      console.error("Budget renewal error:", error);
    }
  }, [queryClient]);

  return {
    checkAndRenewBudgets,
  };
}
