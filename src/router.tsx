import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import ErrorLayout from "./components/fragments/error-layout";
import MainLayout from "./layouts/main";

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import("./pages/dashboard/page"));
const AssetCategoryIndexPage = lazy(
  () => import("./pages/asset-category/page"),
);
const TransactionCategoryIndexPage = lazy(
  () => import("./pages/transaction-category/page"),
);
const TransactionPage = lazy(() => import("./pages/transactions/index/page"));
const TransactionFormPage = lazy(
  () => import("./pages/transactions/form/page"),
);
const TransactionDetailPage = lazy(
  () => import("./pages/transactions/detail/page"),
);
const BudgetLayout = lazy(() => import("./pages/budget/layout"));
const BudgetIndexPage = lazy(() => import("./pages/budget/page"));
const BudgetDetailPage = lazy(() => import("./pages/budget/detail"));

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
        path: "budget",
        Component: BudgetLayout,
        children: [
          {
            index: true,
            Component: BudgetIndexPage,
          },
          {
            path: ":id",
            Component: BudgetDetailPage,
          },
        ],
      },
    ],
  },
]);
