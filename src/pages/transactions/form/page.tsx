import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Transaction } from "../../../@types/transaction";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { ComboBox, type ComboBoxGroup } from "../../../components/ui/combobox";
import { DatePicker } from "../../../components/ui/date-picker";
import { Input } from "../../../components/ui/input";
import { InputNumber } from "../../../components/ui/input-number";
import { Textarea } from "../../../components/ui/textarea";
import { db } from "../../../lib/db";

const formSchema = z.object({
  categoryId: z.number(),
  assetId: z.number(),
  amount: z
    .string()
    .refine((val) => !Number.isNaN(Number(val)), {
      message: "Please enter amount.",
    })
    .refine((val) => Number(val) > 0, {
      message: "Please enter amount.",
    }),
  details: z.string().optional(),
  description: z.string().optional(),
  date: z.date().optional(),
  excludeFromReports: z.number().refine(
    (val) => val === 0 || val === 1,
  ),
});

export default function TransactionFormPage() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      excludeFromReports: 0,
    },
  });

  const assetQuery = useSuspenseQuery({
    queryKey: ["assets"],
    queryFn: async () => await db.assets.toArray(),
  });

  const transactionCategoriesQuery = useSuspenseQuery({
    queryKey: ["transactionCategories"],
    queryFn: async () => await db.transactionCategories.toArray(),
  });

  const transactionDetailQuery = useSuspenseQuery<Transaction | null>({
    queryKey: ["transactionDetail"],
    queryFn: async () => {
      if (!searchParams.has("id")) return null;

      const transaction = await db.transactions
        .where("id")
        .equals(Number.parseInt(searchParams.get("id") ?? ""))
        .first();

      if (!transaction) return null;

      return transaction;
    },
  });

  const transactionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      console.log(data);
      const asset = await db.assets.get(data.assetId);
      if (!asset) {
        throw new Error("Asset not found");
      }

      const category = await db.transactionCategories.get(data.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }

      if (searchParams.has("id")) {
        const transactionId = Number.parseInt(searchParams.get("id") ?? "");
        const existingTransaction = await db.transactions.get(transactionId);
        if (!existingTransaction) {
          throw new Error("Transaction not found");
        }

        // Update existing transaction
        await db.transactions.update(transactionId, {
          assetId: data.assetId,
          categoryId: data.categoryId,
          amount: Number.parseFloat(data.amount),
          details: data.details,
          description: data.description,
          date: dayjs(data.date).toDate(),
        });

        // Update asset balance
        await db.assets.update(data.assetId, {
          balance:
            asset.balance -
            existingTransaction.amount +
            Number.parseFloat(data.amount) *
              (category.type === "income" ? 1 : -1),
        });
      } else {
        await db.transactions.add({
          assetId: data.assetId,
          categoryId: data.categoryId,
          amount: Number.parseFloat(data.amount),
          details: data.details,
          description: data.description,
          date: dayjs().toDate(),
        });

        await db.assets.update(data.assetId, {
          balance:
            asset.balance +
            Number.parseFloat(data.amount) *
              (category.type === "income" ? 1 : -1),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactionDetail"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({
        queryKey: ["asset-performance-7d-grouped"],
      });

      toast.success(
        `Transaction ${searchParams.has("id") ? "updated" : "added"} successfully!`,
      );
      form.reset();

      navigate("/transactions");
    },
    onError: (error) => {
      toast.error(`Failed to save transaction: ${error.message}`);
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(formSchema.check());
    transactionMutation.mutate(data);
  };

  useEffect(() => {
    if (transactionDetailQuery.data) {
      console.log(transactionDetailQuery.data);

      form.setValue("categoryId", transactionDetailQuery.data.categoryId);
      form.setValue("assetId", transactionDetailQuery.data.assetId);
      form.setValue("amount", transactionDetailQuery.data.amount.toString());
      form.setValue("details", transactionDetailQuery.data.details ?? "");
      form.setValue(
        "description",
        transactionDetailQuery.data.description ?? "",
      );
      form.setValue("date", dayjs(transactionDetailQuery.data.date).toDate());
    }
  }, [transactionDetailQuery.data, form]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 p-4 md:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="mb-8">
                <FormControl>
                  <InputNumber
                    placeholder="Enter amount"
                    {...field}
                    className="h-12 md:h-14 !text-lg md:!text-2xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset</FormLabel>
                <FormControl>
                  <ComboBox
                    placeholder="Select asset"
                    options={assetQuery.data.map((asset) => ({
                      value: asset.id.toString(),
                      label: (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback>
                              {asset.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                            <AvatarImage src={asset.icon} alt={asset.name} />
                          </Avatar>
                          <span>{asset.name}</span>
                        </div>
                      ),
                      keywords: asset.name.split(" "),
                    }))}
                    {...field}
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <ComboBox
                    placeholder="Select category"
                    options={transactionCategoriesQuery.data.reduce(
                      (groups, category) => {
                        const groupName =
                          category.type === "income" ? "Income" : "Expense";
                        const group = groups.find((g) => g.label === groupName);
                        if (group) {
                          group.options.push({
                            value: category.id.toString(),
                            label: category.name,
                            keywords: [category.name],
                          });
                        } else {
                          groups.push({
                            label: groupName,
                            options: [
                              {
                                value: category.id.toString(),
                                label: category.name,
                                keywords: [category.name],
                              },
                            ],
                          });
                        }

                        return groups;
                      },
                      [] as ComboBoxGroup[],
                    )}
                    {...field}
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onValueChange={(date) => field.onChange(date)}
                    placeholder="Select date"
                    dateFormat="DD MMM YYYY"
                    buttonClassName="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details</FormLabel>
                <FormControl>
                  <Input placeholder="About this transaction" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes/Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="More details about this transaction"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Card className="!py-4 rounded-md">
            <CardContent className="!px-4">
              <FormField
                control={form.control}
                name="excludeFromReports"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 w-full">
                    <FormControl>
                      <Checkbox
                        id="excludeFromReports"
                        checked={field.value === 1}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 1 : 0)
                        }
                      />
                    </FormControl>
                    <FormLabel htmlFor="excludeFromReports" className="grow">
                      Exclude from reports
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Check this if you want to exclude this transaction from reports
                and analytics.
              </p>
            </CardContent>
          </Card>
          <div className="flex flex-col-reverse md:flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/transactions")}
              disabled={transactionMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={transactionMutation.isPending}>
              {transactionMutation.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
