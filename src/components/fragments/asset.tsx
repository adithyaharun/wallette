import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { LoaderCircleIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AssetCategory } from "../../@types/asset";
import { db } from "../../lib/db";
import { useUI } from "../providers/ui-provider";
import { AvatarWithBlob } from "../ui/avatar-with-blob";
import { ComboBox } from "../ui/combobox";
import { ImageUpload } from "../ui/image-upload";
import { Input } from "../ui/input";
import { InputNumber } from "../ui/input-number";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Asset name must be at least 2 characters long.",
  }),
  description: z.string().optional(),
  categoryId: z.number(),
  balance: z
    .string()
    .refine((val) => !Number.isNaN(Number(val)), {
      message: "Please enter amount.",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Please enter amount.",
    }),
  type: z.enum(["expense", "income"]),
  icon: z
    .file()
    .mime([
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "image/webp",
    ])
    .optional(),
});

const AssetOption = ({ category }: { category: AssetCategory }) => (
  <span className="flex items-center gap-2">
    <AvatarWithBlob
      className="h-6 w-6"
      blob={category.icon}
      fallback={
        <div className="bg-foreground text-background text-xs">
          {category.name.charAt(0).toUpperCase()}
        </div>
      }
      alt={category.name}
    />
    {category.name}
  </span>
);

export function AssetForm() {
  const queryClient = useQueryClient();
  const {
    openAssetCategoryForm,
    assetFormCallback,
    setAssetFormOpen,
    categoryId,
    asset,
  } = useUI();

  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);

  useEffect(() => {
    const fetchAssetCategories = async () => {
      const categories = await db.assetCategories.toArray();
      setAssetCategories(categories);
    };

    fetchAssetCategories();
  }, []);

  const assetMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const balance = Number.parseFloat(values.balance);

      if (asset) {
        const currentBalance = asset.balance;

        if (balance !== currentBalance) {
          const diff = balance - currentBalance;
          const existingBalance = await db.assetBalances
            .where("[assetId+date]")
            .equals([asset.id, dayjs().startOf("day").toDate()])
            .first();

          if (diff > 0 || diff < 0) {
            if (existingBalance) {
              await db.assetBalances.update(existingBalance.id, {
                balance: existingBalance.balance + diff,
              });
            } else {
              await db.assetBalances.add({
                assetId: asset.id,
                date: dayjs().startOf("day").toDate(),
                balance: currentBalance + diff,
              });
            }

            if (diff > 0) {
              await db.transactions.add({
                assetId: asset.id,
                categoryId: 1,
                amount: diff,
                date: new Date(),
                details: `Balance adjustment`,
                excludedFromReports: false,
              });
            } else if (diff < 0) {
              await db.transactions.add({
                assetId: asset.id,
                categoryId: 2,
                amount: -diff,
                date: new Date(),
                details: `Balance adjustment`,
                excludedFromReports: false,
              });
            }
          }
        }

        await db.assets.update(asset.id, {
          name: values.name,
          description: values.description,
          balance,
          categoryId: values.categoryId,
          icon: values.icon
            ? new Blob([values.icon], { type: values.icon.type })
            : undefined,
        });
      } else {
        const assetId = await db.assets.add({
          name: values.name,
          description: values.description,
          balance,
          categoryId: values.categoryId,
          icon: values.icon
            ? new Blob([values.icon], { type: values.icon.type })
            : undefined,
        });

        if (balance > 0) {
          await db.assetBalances.add({
            assetId,
            date: dayjs().startOf("month").toDate(),
            balance,
          });
        }

        await db.transactions.add({
          assetId,
          categoryId: 1,
          amount: balance,
          date: new Date(),
          details: "Initial balance",
          excludedFromReports: false,
        });
      }
    },
    onSuccess: () => {
      toast.success("Asset added successfully!");

      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({
        queryKey: ["asset-performance-grouped"],
      });

      form.reset();

      if (assetFormCallback) {
        assetFormCallback();
      }
      setAssetFormOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to add asset: ${error.message}`);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: asset?.name,
      description: asset?.description || "",
      balance: asset?.balance ? asset.balance.toString() : "0",
      categoryId: asset?.categoryId || categoryId || undefined,
      type: "income",
      icon: asset?.icon ? new File([asset.icon], "icon") : undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    assetMutation.mutate(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="icon"
          disabled={assetMutation.isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <ImageUpload
                  files={field.value ? [field.value] : []}
                  onFilesChange={(files) =>
                    field.onChange(files.length > 0 ? files[0] : [])
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          disabled={assetMutation.isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="Name of the asset" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          disabled={assetMutation.isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl className="flex-1">
                  <ComboBox
                    options={assetCategories.map((category) => ({
                      value: category.id.toString(),
                      label: <AssetOption category={category} />,
                    }))}
                    placeholder="Select a category"
                    {...field}
                    value={field.value?.toString()}
                    onValueChange={(value) => {
                      console.log("Selected category:", value);
                      field.onChange(value ? Number(value) : undefined);
                    }}
                  />
                </FormControl>
                <Button
                  type="button"
                  size={"icon"}
                  variant="outline"
                  onClick={() =>
                    openAssetCategoryForm({
                      callback: (data?: number) => {
                        if (data) {
                          field.onChange(data);
                          queryClient.invalidateQueries({
                            queryKey: ["assetCategories"],
                          });
                          queryClient.invalidateQueries({
                            queryKey: ["asset-performance-grouped"],
                          });
                        }
                      },
                    })
                  }
                >
                  <PlusIcon />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          disabled={assetMutation.isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What's about this asset?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <FormField
          control={form.control}
          name="balance"
          disabled={assetMutation.isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance</FormLabel>
              <FormControl>
                <InputNumber
                  placeholder="Enter initial balance for this asset"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col-reverse md:flex-row gap-2 justify-end">
          <Button
            variant="outline"
            type="button"
            className="w-full md:w-fit"
            onClick={() => {
              form.reset();
              setAssetFormOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={assetMutation.isPending}
            type="submit"
            className=" w-full md:w-fit"
          >
            {assetMutation.isPending ? (
              <div className="flex items-center gap-2">
                <LoaderCircleIcon className="animate-spin" />
                <span>Adding...</span>
              </div>
            ) : (
              "Add Asset"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function AssetDialog() {
  const { isAssetFormOpen, setAssetFormOpen, asset } = useUI();
  const isMobile = useIsMobile();

  const title = asset ? "Edit Asset" : "Add New Asset";

  if (isMobile) {
    return (
      <Drawer open={isAssetFormOpen} onOpenChange={setAssetFormOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pt-0">
            <AssetForm />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isAssetFormOpen} onOpenChange={setAssetFormOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <AssetForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
