import { Outlet } from "react-router";

export default function EmptyLayout() {
  return (
    <div className="flex-1">
      <Outlet />
    </div>
  );
}
