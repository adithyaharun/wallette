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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { ComboBox, type ComboBoxGroup } from "../../components/ui/combobox";
import { DatePicker } from "../../components/ui/date-picker";
import { InputNumber } from "../../components/ui/input-number";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { db } from "../../lib/db";

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

export function BudgetForm({ onFinish }: { onFinish?: () => void }) {
  const queryClient = useQueryClient();

  const transactionCategoriesQuery = useSuspenseQuery({
    queryKey: ["transactionCategories"],
    queryFn: async () => await db.transactionCategories.toArray(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      isRepeating: false,
    },
  });

  const budgetMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Replace with your API call logic
      return await db.budgets.add({
        categoryId: data.categoryId,
        amount: Number.parseFloat(data.amount),
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        isRepeating: data.isRepeating,
        createdAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });

      toast.success("Budget added successfully!");
      form.reset();

      onFinish?.();
    },
    onError: (error) => {
      toast.error(`Failed to add budget: ${error.message}`);
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
                              <Avatar className="size-6">
                                <AvatarFallback>
                                  {category.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                                {category.icon && (
                                  <AvatarImage
                                    src={URL.createObjectURL(category.icon)}
                                    alt={category.name}
                                  />
                                )}
                              </Avatar>
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
                                  <Avatar className="size-6">
                                    <AvatarFallback>
                                      {category.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                    {category.icon && (
                                      <AvatarImage
                                        src={URL.createObjectURL(category.icon)}
                                        alt={category.name}
                                      />
                                    )}
                                  </Avatar>
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
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function BudgetModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const onFinish = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Budget</DialogTitle>
        </DialogHeader>
        <BudgetForm onFinish={onFinish} />
      </DialogContent>
    </Dialog>
  );
}
