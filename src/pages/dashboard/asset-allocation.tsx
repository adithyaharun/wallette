import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
];

interface AssetWeight {
  id: number;
  name: string;
  balance: number;
  percentage: number;
  category: string;
}

export function AssetAllocation() {
  const assetWeightsQuery = useSuspenseQuery({
    queryKey: ["dashboard-asset-weights"],
    queryFn: async (): Promise<AssetWeight[]> => {
      const assets = await db.assets.toArray();
      const categories = await db.assetCategories.toArray();
      const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

      const totalBalance = assets.reduce(
        (sum, asset) => sum + asset.balance,
        0,
      );

      return assets
        .filter((asset) => asset.balance > 0)
        .map((asset) => ({
          id: asset.id,
          name: asset.name,
          balance: asset.balance,
          percentage:
            totalBalance > 0 ? (asset.balance / totalBalance) * 100 : 0,
          category: asset.categoryId
            ? categoryMap.get(asset.categoryId) || "Unknown"
            : "Unknown",
        }))
        .sort((a, b) => b.balance - a.balance);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>Distribution of your assets by value</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assetWeightsQuery.data.map((asset, index) => (
            <div key={asset.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="text-sm font-medium">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {asset.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {asset.balance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {asset.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
