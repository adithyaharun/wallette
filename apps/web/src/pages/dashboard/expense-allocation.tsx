import { useSuspenseQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { useUI } from "../../components/providers/ui-provider";
import { useDashboardFilterContext } from "./page";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface CategoryWeight {
  id: number;
  name: string;
  amount: number;
  percentage: number;
  category: string;
}

export function ExpenseAllocation() {
  const { date } = useDashboardFilterContext();
  const { config } = useUI();
  const categoryWeightsQuery = useSuspenseQuery({
    queryKey: ["dashboard-expense-weights", date.format("YYYY-MM")],
    queryFn: async (): Promise<CategoryWeight[]> => {
      const startDate = date.startOf("month").toDate();
      const endDate = date.endOf("month").toDate();
      const categories = await db.transactionCategories
        .where("type")
        .equals("expense")
        .toArray();
      const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));
      const transactions = await db.transactions
        .where("date")
        .between(startDate, endDate)
        .and((transaction) => categoryMap.has(transaction.categoryId))
        .and((transaction) => transaction.excludedFromReports === false)
        .toArray();

      const totalExpenses = transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      );

      const categoryWeights = categories
        .map((category) => {
          const categoryTransactions = transactions.filter(
            (transaction) => transaction.categoryId === category.id,
          );
          const categoryAmount = categoryTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0,
          );

          return {
            id: category.id,
            name: category.name,
            amount: categoryAmount,
            percentage:
              totalExpenses > 0 ? (categoryAmount / totalExpenses) * 100 : 0,
            category: category.name,
          };
        })
        .filter((weight) => weight.amount > 0)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      return categoryWeights;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Expenses</CardTitle>
        <CardDescription>
          Distribution of your expenses by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={730} height={250}>
              <Pie
                data={categoryWeightsQuery.data ?? []}
                dataKey="amount"
                nameKey="category"
                paddingAngle={5}
                innerRadius={96}
                outerRadius={120}
                cy={120}
                fill="#82ca9d"
              >
                {categoryWeightsQuery.data?.map((entry, index) => (
                  <Cell
                    key={entry.id}
                    fill={COLORS[index]}
                    onMouseEnter={() => console.log(entry.category)}
                  />
                ))}
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const { name, value } = payload[0];
                      return (
                        <div className="bg-background p-2 rounded shadow">
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-gray-500">
                            {config?.currencySymbol}
                            {value.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 flex-wrap items-center">
          {categoryWeightsQuery.data?.map((entry, index) => (
            <div key={entry.id} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="ml-2 text-sm">{entry.category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
