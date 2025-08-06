import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRightIcon, InboxIcon, PlusIcon } from "lucide-react";
import type { TransactionCategory } from "../../@types/transaction";
import { useUI } from "../../components/providers/ui-provider";
import { AvatarWithBlob } from "../../components/ui/avatar-with-blob";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Feedback } from "../../components/ui/feedback";
import { useIsMobile } from "../../hooks/use-mobile";
import { db } from "../../lib/db";
import { cn } from "../../lib/utils";
import { TransactionCategoryLoading } from "./loading";

export function TransactionCategoryTable() {
  const { openTransactionCategoryForm } = useUI();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const transactionCategoryQuery = useSuspenseQuery<TransactionCategory[]>({
    queryKey: ["transactionCategories"],
    queryFn: async () => await db.transactionCategories.toArray(),
  });

  const handleEdit = (category: TransactionCategory) => {
    openTransactionCategoryForm({
      transactionCategory: category,
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ["transactionCategories"] });
      },
    });
  };

  const handleAdd = () => {
    openTransactionCategoryForm({
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ["transactionCategories"] });
        queryClient.invalidateQueries({
          queryKey: ["asset-performance-7d-grouped"],
        });
      },
    });
  };

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div
        className={cn({
          "fixed right-6 z-10": isMobile,
          "flex justify-end": !isMobile,
        })}
        style={{
          bottom: `calc(env(safe-area-inset-bottom) + ${isMobile ? "0.5rem" : "0"})`,
        }}
      >
        <Button
          className={cn("rounded-full md:rounded-md", {
            "size-12 ml-auto": isMobile,
          })}
          onClick={handleAdd}
          size={isMobile ? "icon" : "default"}
        >
          <PlusIcon className="size-6 md:size-4" />
          {!isMobile && <span>Add New Category</span>}
        </Button>
      </div>
      {transactionCategoryQuery.isLoading ? (
        <TransactionCategoryLoading />
      ) : transactionCategoryQuery.data.length === 0 ? (
        <Feedback content="No asset categories found." icon={InboxIcon} />
      ) : (
        <div className="space-y-4">
          {transactionCategoryQuery.data.map((asset) => (
            <Card
              key={asset.id}
              className="cursor-pointer transition-colors hover:bg-muted"
              onClick={() => handleEdit(asset)}
            >
              <CardContent>
                <div className="flex items-center space-x-4">
                  <AvatarWithBlob
                    className="size-10"
                    blob={asset.icon}
                    fallback={asset.name.charAt(0) ?? "U"}
                  />
                  <div className="flex flex-col w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex gap-2 items-center">
                          <span className="font-bold">
                            {asset.name ?? "Unknown"}
                          </span>
                          <Badge
                            className="text-[0.7rem] h-4 px-2"
                            variant={
                              asset.type === "income"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {asset.type.toLocaleUpperCase()}
                          </Badge>
                        </div>
                        {asset.description && (
                          <span className="text-sm text-muted-foreground">
                            {asset.description}
                          </span>
                        )}
                      </div>
                      <ChevronRightIcon className="size-6" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
