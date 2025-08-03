import { RouterProvider } from "react-router";
import { router } from "./router";

export default function Wallette() {
  return (
    <div className="flex min-h-screen w-full">
      <RouterProvider router={router} />
    </div>
  );
}
