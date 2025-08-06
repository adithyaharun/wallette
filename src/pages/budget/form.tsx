import { zodResolver } from "@hookform/resolvers/zod";
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
import { AvatarWithBlob } from "../../components/ui/avatar-with-blob";
import { Button } from "../../components/ui/button";
import { ComboBox, type ComboBoxGroup } from "../../components/ui/combobox";
import { DatePicker } from "../../components/ui/date-picker";
import { InputNumber } from "../../components/ui/input-number";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { db } from "../../lib/db";
import type { BudgetJoined } from "./context";

const formSchema = z.object({
  categoryId: z.number("Please select a category."),
  amount: z
    .string("Please enter amount.")
    .refine((val) => !Number.isNaN(Number(val)), {
      message: "Please enter amount.",
    })
    .refine((val) => Number(val) > 0, {
      message: "Please enter amount.",
    }),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isRepeating: z.boolean("Please specify if this budget is repeating or not."),
});

export function BudgetForm({
  onFinish,
  editingBudget,
}: {
  onFinish?: () => void;
  editingBudget?: BudgetJoined | null;
}) {
  const queryClient = useQueryClient();

  const transactionCategoriesQuery = useSuspenseQuery({
    queryKey: ["transactionCategories"],
    queryFn: async () => await db.transactionCategories.toArray(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editingBudget
      ? {
          categoryId: editingBudget.categoryId,
          amount: editingBudget.amount.toString(),
          description: editingBudget.description || "",
          startDate: editingBudget.startDate,
          endDate: editingBudget.endDate,
          isRepeating: editingBudget.isRepeating,
        }
      : {
          startDate: dayjs().startOf("month").toDate(),
          endDate: dayjs().endOf("month").toDate(),
          isRepeating: false,
        },
  });

  const budgetMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (editingBudget) {
        return await db.budgets.update(editingBudget.id, {
          categoryId: data.categoryId,
          amount: Number.parseFloat(data.amount),
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          isRepeating: data.isRepeating,
        });
      } else {
        return await db.budgets.add({
          categoryId: data.categoryId,
          amount: Number.parseFloat(data.amount),
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          isRepeating: data.isRepeating,
          createdAt: new Date(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });

      toast.success(
        `Budget ${editingBudget ? "updated" : "added"} successfully!`,
      );
      form.reset();

      onFinish?.();
    },
    onError: (error) => {
      toast.error(
        `Failed to ${editingBudget ? "update" : "add"} budget: ${error.message}`,
      );
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    budgetMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          label: (
                            <div className="flex items-center gap-2">
                              <AvatarWithBlob
                                className="size-6"
                                blob={category.icon}
                                fallback={category.name.charAt(0).toUpperCase()}
                                alt={category.name}
                              />
                              <span>{category.name}</span>
                            </div>
                          ),
                          keywords: category.name.split(" "),
                        });
                      } else {
                        groups.push({
                          label: groupName,
                          options: [
                            {
                              value: category.id.toString(),
                              label: (
                                <div className="flex items-center gap-2">
                                  <AvatarWithBlob
                                    className="size-6"
                                    blob={category.icon}
                                    fallback={category.name
                                      .charAt(0)
                                      .toUpperCase()}
                                    alt={category.name}
                                  />
                                  <span>{category.name}</span>
                                </div>
                              ),
                              keywords: category.name.split(" "),
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limit</FormLabel>
              <FormControl>
                <InputNumber placeholder="Enter amount" {...field} />
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
              <FormControl>
                <Textarea placeholder="About this budget" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <div className="grid grid-flow-col md:grid-flow-row md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onValueChange={(date) => field.onChange(date)}
                    placeholder="Start date"
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
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onValueChange={(date) => field.onChange(date)}
                    placeholder="End date"
                    dateFormat="DD MMM YYYY"
                    buttonClassName="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="isRepeating"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FormLabel htmlFor="isRepeating">
                  <Switch
                    id="isRepeating"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                  <span>Repeat this budget</span>
                </FormLabel>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" className="w-full">
            {editingBudget ? "Update Budget" : "Save Budget"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function BudgetModal({
  children,
  editingBudget,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  editingBudget?: BudgetJoined | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const actualOpen = isControlled ? open : internalOpen;
  const actualOnOpenChange = isControlled ? onOpenChange : setInternalOpen;

  const onFinish = () => {
    actualOnOpenChange(false);
  };

  const content = (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingBudget ? "Edit Budget" : "Add Budget"}
        </DialogTitle>
      </DialogHeader>
      <BudgetForm onFinish={onFinish} editingBudget={editingBudget} />
    </DialogContent>
  );

  if (children) {
    return (
      <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
      {content}
    </Dialog>
  );
}
