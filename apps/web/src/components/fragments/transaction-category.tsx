import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BanknoteArrowDownIcon,
  BanknoteArrowUpIcon,
  LoaderCircleIcon,
  TrashIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
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
import { db } from "../../lib/db";
import { useUI } from "../providers/ui-provider";
import { ImageUpload } from "../ui/image-upload";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "TransactionCategory name must be at least 2 characters long.",
  }),
  type: z.enum(["expense", "income"]),
  description: z.string().optional(),
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

export function TransactionCategoryForm() {
  const queryClient = useQueryClient();
  const {
    transactionCategoryFormCallback,
    setTransactionCategoryFormCallback,
    setTransactionCategoryFormOpen,
    transactionCategory,
  } = useUI();

  const transactionCategoryMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { name, type, description, icon } = values;
      const categoryData = {
        name,
        description,
        type,
        ...(icon ? { icon: new Blob([icon], { type: icon.type }) } : {}),
      };

      if (transactionCategory) {
        await db.transactionCategories.update(
          transactionCategory.id,
          categoryData,
        );
        return transactionCategory.id;
      } else {
        return await db.transactionCategories.add(categoryData);
      }
    },
    onSuccess: (data) => {
      toast.success(
        `Asset category ${transactionCategory ? "updated" : "created"} successfully!`,
      );

      queryClient.invalidateQueries({ queryKey: ["transactionCategories"] });
      form.reset();

      if (transactionCategoryFormCallback) {
        transactionCategoryFormCallback(data);
      }
      setTransactionCategoryFormOpen(false);
    },
    onError: (error) => {
      toast.error(
        `Failed to ${transactionCategory ? "update" : "add"} transaction category: ${error.message}`,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!transactionCategory)
        throw new Error("No transaction category to delete");
      await db.transactionCategories.delete(transactionCategory.id);
      return transactionCategory.id;
    },
    onSuccess: () => {
      toast.success("Asset category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["transactionCategories"] });

      if (transactionCategoryFormCallback) {
        setTransactionCategoryFormCallback(null);
      }
      setTransactionCategoryFormOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete transaction category: ${error.message}`);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (transactionCategory) {
      const { icon, ...rest } = transactionCategory;
      form.reset({
        ...rest,
        ...(icon
          ? {
              icon: new File([icon], rest.name),
            }
          : {}),
      });
    } else {
      form.reset();
    }
  }, [transactionCategory, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    transactionCategoryMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="icon"
          disabled={transactionCategoryMutation.isPending}
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
          disabled={transactionCategoryMutation.isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name of the category" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          disabled={transactionCategoryMutation.isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <ToggleGroup
                  className="w-full"
                  variant="primary"
                  type="single"
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <ToggleGroupItem value="income">
                    <BanknoteArrowDownIcon />
                    Income
                  </ToggleGroupItem>
                  <ToggleGroupItem value="expense">
                    <BanknoteArrowUpIcon />
                    Expense
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          disabled={transactionCategoryMutation.isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="About this category" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col-reverse md:flex-row gap-2 justify-between">
          <div>
            {transactionCategory && (
              <Button
                variant="destructive"
                type="button"
                className="w-full md:w-fit"
                disabled={
                  deleteMutation.isPending ||
                  transactionCategoryMutation.isPending
                }
                onClick={() => deleteMutation.mutate()}
              >
                {deleteMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircleIcon className="animate-spin" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TrashIcon className="size-4" />
                    <span>Delete</span>
                  </div>
                )}
              </Button>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-2 justify-end items-center">
            <Button
              variant="outline"
              type="button"
              className="w-full md:w-fit"
              onClick={() => {
                form.reset();
                setTransactionCategoryFormOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={
                transactionCategoryMutation.isPending ||
                deleteMutation.isPending
              }
              type="submit"
              className="w-full md:w-fit"
            >
              {transactionCategoryMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <LoaderCircleIcon className="animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                `Save`
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export function TransactionCategoryDialog() {
  const {
    isTransactionCategoryFormOpen,
    setTransactionCategoryFormOpen,
    transactionCategory,
  } = useUI();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={isTransactionCategoryFormOpen}
        onOpenChange={setTransactionCategoryFormOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {transactionCategory ? "Edit" : "Add New"} Transaction Category
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pt-0">
            <TransactionCategoryForm />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={isTransactionCategoryFormOpen}
      onOpenChange={setTransactionCategoryFormOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transactionCategory ? "Edit" : "Add New"} Transaction Category
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <TransactionCategoryForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
