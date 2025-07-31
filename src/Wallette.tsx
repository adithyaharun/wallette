import { Route, Routes } from "react-router";
import { AuthLayout } from "./layouts/auth";
import { MainLayout } from "./layouts/main";
import { LoginPage } from "./pages/auth/login/page";
import { DashboardPage } from "./pages/dashboard/page";
import { SyncPage } from "./pages/sync/page";
import { TransactionPage } from "./pages/transactions/page";

export default function Wallette() {
  return (
    <div className="flex min-h-screen w-full">
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionPage />} />
        </Route>
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="sync" element={<SyncPage />} />
        </Route>
      </Routes>
    </div>
  );
}
