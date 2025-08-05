import { AlertTriangleIcon } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { Alert, AlertDescription } from "../ui/alert";

export const DefaultError = () => (
  <div className="flex flex-col items-center space-y-4">
    <AlertTriangleIcon className="size-20" />
    <div className="flex flex-col items-center space-y-2">
      <h1 className="text-2xl font-bold">An unexpected error occurred</h1>
      <p className="text-muted-foreground">
        Please try again later or contact support if the issue persists.
      </p>
    </div>
  </div>
);

export function RootErrorPage() {
  const error = useRouteError();

  console.log("Error:", error);

  return isRouteErrorResponse(error) ? (
    error.status === 404 ? (
      <div className="flex flex-col items-center space-y-4">
        <AlertTriangleIcon className="size-20" />
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you are looking for is not found.
          </p>
        </div>
        <Alert>
          <AlertDescription>{error.data}</AlertDescription>
        </Alert>
      </div>
    ) : error.status === 500 ? (
      <div className="flex flex-col items-center space-y-4">
        <AlertTriangleIcon className="size-20" />
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-2xl font-bold">Oops.</h1>
          <p className="text-muted-foreground">{error.data}</p>
        </div>
      </div>
    ) : (
      <DefaultError />
    )
  ) : (
    <DefaultError />
  );
}
