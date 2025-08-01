import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { ComboBox, type ComboBoxGroup } from "../../components/ui/combobox";
import { DatePicker } from "../../components/ui/date-picker";
import { Input } from "../../components/ui/input";
import { InputNumber } from "../../components/ui/input-number";
import { Textarea } from "../../components/ui/textarea";
import { db } from "../../lib/db";

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
});

export function TransactionForm({ onFinish }: { onFinish?: () => void }) {
  const queryClient = useQueryClient();

  const assetQuery = useSuspenseQuery({
    queryKey: ["assets"],
    queryFn: async () => await db.assets.toArray(),
  });

  const transactionCategoriesQuery = useSuspenseQuery({
    queryKey: ["transactionCategories"],
    queryFn: async () => await db.transactionCategories.toArray(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      date: new Date(),
    },
  });

  const transactionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const asset = await db.assets.get(data.assetId);
      if (!asset) {
        throw new Error("Asset not found");
      }

      await db.transactions.add({
        assetId: data.assetId,
        categoryId: data.categoryId,
        amount: Number.parseFloat(data.amount),
        details: data.details,
        description: data.description,
        date: dayjs().toDate(),
      });

      await db.assets.update(data.assetId, {
        balance: asset.balance + Number.parseFloat(data.amount),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({
        queryKey: ["asset-performance-7d-grouped"],
      });

      toast.success("Transaction added successfully!");
      form.reset();

      onFinish?.();
    },
    onError: (error) => {
      toast.error(`Failed to add transaction: ${error.message}`);
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    transactionMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <InputNumber placeholder="Enter amount" {...field} />
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
                <Input
                  placeholder="About this transaction"
                  {...field}
                />
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
        <div className="flex justify-end">
          <Button type="submit" className="w-full">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function TransactionModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const onFinish = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm onFinish={onFinish} />
      </DialogContent>
    </Dialog>
  );
}
