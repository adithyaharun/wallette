import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import SettingsIndexPage from "./pages/settings/index/page";

const ErrorLayout = lazy(() => import("./components/fragments/error-layout"));
const MainLayout = lazy(() => import("./layouts/main"));
const EmptyLayout = lazy(() => import("./layouts/empty"));
const AssetDetailPage = lazy(() => import("./pages/asset/detail"));
const AssetLayout = lazy(() => import("./pages/asset/layout"));

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
const ImportPage = lazy(() => import("./pages/import/page"));

export const router = createBrowserRouter([
  {
    Component: EmptyLayout,
    errorElement: <ErrorLayout />,
    children: [
      {
        path: "restore",
        Component: ImportPage,
      },
    ],
  },
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
      {
        path: "asset",
        Component: AssetLayout,
        children: [
          {
            path: ":id",
            Component: AssetDetailPage,
          },
        ],
      },
      {
        path: "settings",
        Component: SettingsIndexPage,
      },
    ],
  },
]);
