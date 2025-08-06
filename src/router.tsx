import { createBrowserRouter } from "react-router";
import AssetCategoryIndexPage from "./pages/asset-category/page";
import TransactionCategoryIndexPage from "./pages/transaction-category/page";

// import AuthLayout from "./layouts/auth";
// import LoginPage from "./pages/auth/login/page";
// import SyncPage from "./pages/sync/page";

import ErrorLayout from "./components/fragments/error-layout";
import MainLayout from "./layouts/main";
import BudgetIndexPage from "./pages/budget/page";
import DashboardPage from "./pages/dashboard/page";
import TransactionDetailPage from "./pages/transactions/detail/page";
import TransactionFormPage from "./pages/transactions/form/page";
import TransactionPage from "./pages/transactions/index/page";

export const router = createBrowserRouter([
  {
    Component: MainLayout,
    errorElement: <ErrorLayout />,
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: "dashboard",
        Component: DashboardPage,
      },
      {
        path: "asset-categories",
        Component: AssetCategoryIndexPage,
      },
      {
        path: "transaction-categories",
        Component: TransactionCategoryIndexPage,
      },
      {
        path: "transactions",
        children: [
          {
            index: true,
            Component: TransactionPage,
          },
          {
            path: "form",
            Component: TransactionFormPage,
          },
          {
            path: "detail",
            Component: TransactionDetailPage,
          },
        ],
      },
      {
        path: "budgets",
        children: [
          {
            index: true,
            Component: BudgetIndexPage,
          },
        ],
      },
    ],
  },
]);
