import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import { useCallback, useEffect } from "react";
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
import { BlobAvatar } from "../../../components/ui/blob-avatar";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { ComboBox, type ComboBoxGroup } from "../../../components/ui/combobox";
import { DatePicker } from "../../../components/ui/date-picker";
import { Input } from "../../../components/ui/input";
import { InputNumber } from "../../../components/ui/input-number";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import { assetBalanceRepository } from "../../../db/repositories/asset-balance";
import { db } from "../../../lib/db";
import { ImageUpload } from "../../../components/ui/image-upload";
import { useIsMobile } from "../../../hooks/use-mobile";
import { cn } from "../../../lib/utils";

const formSchema = z.object({
  categoryId: z.number("Please select a category."),
  assetId: z.number("Please select an asset."),
  amount: z
    .string("Please enter amount.")
    .refine((val) => !Number.isNaN(Number(val)), {
      message: "Please enter amount.",
    })
    .refine((val) => Number(val) > 0, {
      message: "Please enter amount.",
    }),
  details: z.string().optional(),
  description: z.string().optional(),
  date: z.date().optional(),
  time: z.string().optional(),
  excludedFromReports: z.boolean(),
  photos: z.array(z.instanceof(File)).optional(),
});

export default function TransactionFormPage() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      time: dayjs().format("HH:mm"),
      assetId: searchParams.has("asset_id")
        ? Number.parseInt(searchParams.get("asset_id") ?? "")
        : undefined,
      excludedFromReports: false,
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

  const transactionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
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

        await db.transactions.update(transactionId, {
          assetId: data.assetId,
          categoryId: data.categoryId,
          amount: Number.parseFloat(data.amount),
          details: data.details,
          description: data.description,
          date: data.time
            ? dayjs(
                `${dayjs(data.date).format("YYYY-MM-DD")} ${data.time}`,
                "YYYY-MM-DD HH:mm",
              ).toDate()
            : dayjs(data.date).toDate(),
          excludedFromReports: data.excludedFromReports,
          photos: data.photos,
        });

        const amountDifference =
          Number.parseFloat(data.amount) - existingTransaction.amount;

        if (amountDifference !== 0) {
          const transactionDate = data.time
            ? dayjs(
                `${dayjs(data.date).format("YYYY-MM-DD")} ${data.time}`,
                "YYYY-MM-DD HH:mm",
              ).toDate()
            : dayjs(data.date || new Date()).toDate();

          if (category.type === "income") {
            await assetBalanceRepository.addBalance(
              data.assetId,
              amountDifference,
              transactionDate,
            );
          } else if (category.type === "expense") {
            await assetBalanceRepository.deductBalance(
              data.assetId,
              amountDifference,
              transactionDate,
            );
          }
        }
      } else {
        await db.transactions.add({
          assetId: data.assetId,
          categoryId: data.categoryId,
          amount: Number.parseFloat(data.amount),
          details: data.details,
          description: data.description,
          date: data.time
            ? dayjs(
                `${dayjs(data.date).format("YYYY-MM-DD")} ${data.time}`,
                "YYYY-MM-DD HH:mm",
              ).toDate()
            : dayjs(data.date || new Date()).toDate(),
          excludedFromReports: data.excludedFromReports,
          photos: data.photos,
        });

        if (category.type === "income") {
          assetBalanceRepository.addBalance(
            data.assetId,
            Number.parseFloat(data.amount),
            data.time
              ? dayjs(
                  `${dayjs(data.date).format("YYYY-MM-DD")} ${data.time}`,
                  "YYYY-MM-DD HH:mm",
                ).toDate()
              : dayjs(data.date || new Date()).toDate(),
          );
        } else if (category.type === "expense") {
          assetBalanceRepository.deductBalance(
            data.assetId,
            Number.parseFloat(data.amount),
            data.time
              ? dayjs(
                  `${dayjs(data.date).format("YYYY-MM-DD")} ${data.time}`,
                  "YYYY-MM-DD HH:mm",
                ).toDate()
              : dayjs(data.date || new Date()).toDate(),
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactionDetail"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({
        queryKey: ["asset-performance-grouped"],
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

  const onSubmit = useCallback(
    (data: z.infer<typeof formSchema>) => {
      transactionMutation.mutate(data);
    },
    [transactionMutation],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [form, onSubmit]);

  useEffect(() => {
    const populateForm = async () => {
      const transaction = await db.transactions
        .where("id")
        .equals(Number.parseInt(searchParams.get("id") ?? ""))
        .first();

      if (!transaction) return;

      form.setValue("categoryId", transaction.categoryId);
      form.setValue("assetId", transaction.assetId);
      form.setValue("amount", transaction.amount.toString());
      form.setValue("details", transaction.details ?? "");
      form.setValue("description", transaction.description ?? "");
      form.setValue(
        "excludedFromReports",
        transaction.excludedFromReports ?? false,
      );
      form.setValue("date", dayjs(transaction.date).toDate());
      form.setValue("time", dayjs(transaction.date).format("HH:mm"));
    };

    if (searchParams.has("id")) {
      populateForm();
    }
  }, [form.setValue, searchParams.get, searchParams.has]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 p-4 pb-32 md:pb-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="mb-8">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <InputNumber
                    autoFocus
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
                          <BlobAvatar
                            className="size-6"
                            blob={asset.icon}
                            fallback={asset.name.charAt(0).toUpperCase()}
                            alt={asset.name}
                          />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    {isMobile ? (
                      <Input 
                        className="w-full max-w-full"
                        type="date"
                        {...field} 
                        value={field.value?.toISOString().split('T')[0]} 
                        onChange={(e) => field.onChange(new Date(e.target.value))}  
                      />
                    ) : (
                      <DatePicker
                        value={field.value}
                        onValueChange={(date) => field.onChange(date)}
                        placeholder="Select date"
                        dateFormat="DD MMM YYYY"
                        buttonClassName="w-full"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="Select time"
                      className="w-auto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photos</FormLabel>
                <FormControl>
                  <ImageUpload
                    onFilesChange={(files) => field.onChange(files)}
                    files={field.value}
                    multiple
                    max={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Card className="py-4 rounded-md">
            <CardContent className="px-4">
              <FormField
                control={form.control}
                name="excludedFromReports"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 w-full">
                    <FormControl>
                      <Switch
                        id="excludedFromReports"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                    </FormControl>
                    <FormLabel htmlFor="excludedFromReports" className="grow">
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
          <div
            className={cn("flex flex-col md:flex-row gap-2", {
              "fixed p-4 pb-safe bottom-0 left-0 right-0 z-10 bg-background border-t":
                isMobile,
            })}
          >
            <Button
              type="submit"
              size={isMobile ? "lg" : "default"}
              className="md:w-24"
              disabled={transactionMutation.isPending}
            >
              {transactionMutation.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              Save
            </Button>
            <Button
              type="button"
              size={isMobile ? "lg" : "default"}
              variant="outline"
              className="md:w-24"
              onClick={() => navigate("/transactions")}
              disabled={transactionMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
