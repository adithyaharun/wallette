import { Outlet } from "react-router";
import { BudgetProvider } from "./context";

export default function BudgetLayout() {
  return (
    <BudgetProvider>
      <Outlet />
    </BudgetProvider>
  );
}
