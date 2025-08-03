import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { LoaderCircleIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ComboBox } from "../ui/combobox";
import { ImageUpload } from "../ui/image-upload";
import { Input } from "../ui/input";
import { InputNumber } from "../ui/input-number";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { AssetCategoryDialog } from "./asset-category";

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
    .refine((val) => Number(val) > 0, {
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
    <Avatar className="h-6 w-6">
      <AvatarFallback className="bg-foreground text-background text-xs">
        {category.name.charAt(0).toUpperCase()}
      </AvatarFallback>
      {category.icon && (
        <AvatarImage
          src={URL.createObjectURL(category.icon)}
          alt={category.name}
        />
      )}
    </Avatar>
    {category.name}
  </span>
);

export function AssetForm({ onFinish }: { onFinish?: () => void }) {
  const queryClient = useQueryClient();

  const assetQuery = useSuspenseQuery<AssetCategory[]>({
    queryKey: ["assetCategories"],
    queryFn: async () => await db.assetCategories.toArray(),
  });

  const assetMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const balance = Number.parseFloat(values.balance);
      const asset = await db.assets.add({
        name: values.name,
        description: values.description,
        balance,
        categoryId: values.categoryId,
        icon: values.icon ? new Blob([values.icon], { type: values.icon.type }) : undefined,
      });

      if (balance > 0) {
        await db.assetBalances.add({
          assetId: asset,
          date: dayjs().startOf("month").toDate(),
          balance,
        });

        await db.transactions.add({
          assetId: asset,
          categoryId: 1,
          amount: balance,
          date: new Date(),
          details: "Initial balance",
        });
      }
    },
    onSuccess: () => {
      toast.success("Asset added successfully!");

      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({
        queryKey: ["asset-performance-7d-grouped"],
      });

      form.reset();

      onFinish?.();
    },
    onError: (error) => {
      toast.error(`Failed to add asset: ${error.message}`);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance: "0",
      type: "income",
    },
  });

  // 2. Define a submit handler.
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
                  className="justify-center md:justify-start"
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
                    options={assetQuery.data.map((category) => ({
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
                <AssetCategoryDialog
                  onFinish={(assetCategoryId) =>
                    assetCategoryId &&
                    form.setValue("categoryId", assetCategoryId)
                  }
                >
                  <Button type="button" size={"icon"} variant="outline">
                    <PlusIcon />
                  </Button>
                </AssetCategoryDialog>
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
              onFinish?.();
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
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full cursor-pointer">
            <PlusIcon />
            <span>New Asset</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New Asset</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pt-0">
            <AssetForm onFinish={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full cursor-pointer">
          <PlusIcon />
          <span>New Asset</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <AssetForm onFinish={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
