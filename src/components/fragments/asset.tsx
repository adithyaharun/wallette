import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar } from "@radix-ui/react-avatar";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
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
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import { ComboBox } from "../ui/combobox";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Asset name must be at least 2 characters long.",
  }),
  description: z.string().optional(),
  categoryId: z.number(),
  balance: z.number(),
  type: z.enum(["expense", "income"]),
});

const AssetOption = ({ category }: { category: AssetCategory }) => (
  <span className="flex items-center gap-2">
    <Avatar className="h-6 w-6 gap-1">
      <AvatarFallback className="bg-foreground text-background text-sm">
        {category.name.charAt(0).toUpperCase()}
      </AvatarFallback>
      <AvatarImage src={category.icon} alt={category.name} />
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
      await db.assets.add({
        name: values.name,
        description: values.description,
        balance: values.balance,
        categoryId: values.categoryId,
      });
    },
    onSuccess: () => {
      toast.success("Asset added successfully!");

      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-performance-7d-grouped"] });
      
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
      balance: 0,
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4 md:p-0"
      >
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
              <FormControl>
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
          <AssetForm onFinish={() => setOpen(false)} />
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
        <AssetForm onFinish={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
