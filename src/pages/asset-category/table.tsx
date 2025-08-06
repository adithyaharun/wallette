import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRightIcon, InboxIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import type { AssetCategory } from "../../@types/asset";
import { useUI } from "../../components/providers/ui-provider";
import { AvatarWithBlob } from "../../components/ui/avatar-with-blob";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Feedback } from "../../components/ui/feedback";
import { useIsMobile } from "../../hooks/use-mobile";
import { db } from "../../lib/db";
import { cn } from "../../lib/utils";
import { AssetCategoryLoading } from "./loading";

export function AssetCategoryTable() {
  const { openAssetCategoryForm } = useUI();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const assetCategoryQuery = useSuspenseQuery<AssetCategory[]>({
    queryKey: ["assetCategories"],
    queryFn: async () => await db.assetCategories.toArray(),
  });

  const handleEdit = (category: AssetCategory) => {
    openAssetCategoryForm({
      assetCategory: category,
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
        queryClient.invalidateQueries({
          queryKey: ["asset-performance-7d-grouped"],
        });
      },
    });
  };

  const handleAdd = () => {
    openAssetCategoryForm({
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
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
      {assetCategoryQuery.isLoading ? (
        <AssetCategoryLoading />
      ) : assetCategoryQuery.data.length === 0 ? (
        <Feedback content="No asset categories found." icon={InboxIcon} />
      ) : (
        <div className="space-y-4">
          {assetCategoryQuery.data.map((asset) => (
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
                        <span className="font-bold">
                          {asset.name ?? "Unknown"}
                        </span>
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
