import { useEffect } from "react";
import { useBudgetRenewal } from "../../hooks/use-budget-renewal";

export function BudgetRenewal() {
  const { checkAndRenewBudgets } = useBudgetRenewal();

  useEffect(() => {
    // Check for budget renewals when the app is fully loaded
    checkAndRenewBudgets();
  }, [checkAndRenewBudgets]);

  useEffect(() => {
    // Check for budget renewals when the window gains focus
    const handleFocus = () => {
      checkAndRenewBudgets();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [checkAndRenewBudgets]);

  // This component doesn't render anything
  return null;
}
