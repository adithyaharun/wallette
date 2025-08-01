import { Skeleton } from "../../components/ui/skeleton";

export function BudgetLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-1/3">
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="w-1/3">
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="w-1/3">
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      ))}
    </>
  );
}
