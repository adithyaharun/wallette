import { lazy } from "react";
import { Route, Routes } from "react-router";

const AuthLayout = lazy(() => import("./layouts/auth"));
const MainLayout = lazy(() => import("./layouts/main"));
const LoginPage = lazy(() => import("./pages/auth/login/page"));
const BudgetIndexPage = lazy(() => import("./pages/budget/page"));
const DashboardPage = lazy(() => import("./pages/dashboard/page"));
const SyncPage = lazy(() => import("./pages/sync/page"));
const TransactionFormPage = lazy(
  () => import("./pages/transactions/form/page"),
);
const TransactionPage = lazy(() => import("./pages/transactions/index/page"));

export default function Wallette() {
  return (
    <div className="flex min-h-screen w-full">
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionPage />} />
          <Route path="transactions/form" element={<TransactionFormPage />} />
          <Route path="budgets" element={<BudgetIndexPage />} />
        </Route>
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="sync" element={<SyncPage />} />
        </Route>
      </Routes>
    </div>
  );
}
