import { useSuspenseQuery } from "@tanstack/react-query";
import { FilterIcon } from "lucide-react";
import { useCallback, useState } from "react";
import type { Asset } from "../../../@types/asset";
import type { TransactionCategory } from "../../../@types/transaction";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../components/ui/drawer";
import { Label } from "../../../components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { useIsMobile } from "../../../hooks/use-mobile";
import { db } from "../../../lib/db";

export type TransactionFilters = {
  categories: number[];
  assets: number[];
  types: ("income" | "expense")[];
};

type TransactionFilterProps = {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
};

function FilterContent({
  filters,
  onFiltersChange,
  onClose,
}: TransactionFilterProps & { onClose: () => void }) {
  const categoriesQuery = useSuspenseQuery<TransactionCategory[]>({
    queryKey: ["transaction-categories"],
    queryFn: async () => await db.transactionCategories.toArray(),
  });

  const assetsQuery = useSuspenseQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => await db.assets.toArray(),
  });

  const handleCategoryChange = useCallback(
    (categoryId: number, checked: boolean) => {
      const updatedCategories = checked
        ? [...filters.categories, categoryId]
        : filters.categories.filter((id) => id !== categoryId);

      onFiltersChange({
        ...filters,
        categories: updatedCategories,
      });
    },
    [filters, onFiltersChange],
  );

  const handleAssetChange = useCallback(
    (assetId: number, checked: boolean) => {
      const updatedAssets = checked
        ? [...filters.assets, assetId]
        : filters.assets.filter((id) => id !== assetId);

      onFiltersChange({
        ...filters,
        assets: updatedAssets,
      });
    },
    [filters, onFiltersChange],
  );

  const handleTypeChange = useCallback(
    (type: "income" | "expense", checked: boolean) => {
      const updatedTypes = checked
        ? [...filters.types, type]
        : filters.types.filter((t) => t !== type);

      onFiltersChange({
        ...filters,
        types: updatedTypes,
      });
    },
    [filters, onFiltersChange],
  );

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      categories: [],
      assets: [],
      types: [],
    });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.assets.length > 0 ||
    filters.types.length > 0;

  return (
    <>
      <div className="overflow-y-auto flex-1 p-4">
        <div className="space-y-6">
          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Transaction Type
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="income"
                    checked={filters.types.includes("income")}
                    onCheckedChange={(checked) =>
                      handleTypeChange("income", checked === true)
                    }
                  />
                  <Label htmlFor="income" className="text-sm text-green-600">
                    Income
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="expense"
                    checked={filters.types.includes("expense")}
                    onCheckedChange={(checked) =>
                      handleTypeChange("expense", checked === true)
                    }
                  />
                  <Label htmlFor="expense" className="text-sm text-red-600">
                    Expense
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Categories
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categoriesQuery.data?.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.id, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm flex-1"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Assets</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {assetsQuery.data?.map((asset) => (
                  <div key={asset.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`asset-${asset.id}`}
                      checked={filters.assets.includes(asset.id)}
                      onCheckedChange={(checked) =>
                        handleAssetChange(asset.id, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`asset-${asset.id}`}
                      className="text-sm flex-1"
                    >
                      {asset.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 p-4 mt-auto border-t">
        <Button onClick={onClose} className="flex-1">
          Apply Filters
        </Button>
      </div>
    </>
  );
}

export default function TransactionFilter({
  filters,
  onFiltersChange,
}: TransactionFilterProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.assets.length > 0 ||
    filters.types.length > 0;

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button size="icon" variant="outline" className="relative">
            <FilterIcon />
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Filter Transactions</DrawerTitle>
          </DrawerHeader>
          <FilterContent
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClose={handleClose}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <FilterIcon className="mr-1" />
          <span>Filter</span>
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96 gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>Filter Transactions</SheetTitle>
        </SheetHeader>
        <FilterContent
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClose={handleClose}
        />
      </SheetContent>
    </Sheet>
  );
}
