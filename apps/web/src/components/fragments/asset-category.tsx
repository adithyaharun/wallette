import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon, TrashIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { db } from "../../lib/db";
import { useUI } from "../providers/ui-provider";
import { ImageUpload } from "../ui/image-upload";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "AssetCategory name must be at least 2 characters long.",
  }),
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

export function AssetCategoryForm() {
  const queryClient = useQueryClient();
  const {
    assetCategoryFormCallback,
    setAssetCategoryFormCallback,
    setAssetCategoryFormOpen,
    assetCategory,
  } = useUI();

  const assetCategoryMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { name, description, icon } = values;
      const categoryData = {
        name,
        description,
        ...(icon ? { icon: new Blob([icon], { type: icon.type }) } : {}),
      };

      if (assetCategory) {
        await db.assetCategories.update(assetCategory.id, categoryData);
        return assetCategory.id;
      } else {
        return await db.assetCategories.add(categoryData);
      }
    },
    onSuccess: (data) => {
      toast.success(
        `Asset category ${assetCategory ? "updated" : "created"} successfully!`,
      );

      queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
      form.reset();

      if (assetCategoryFormCallback) {
        assetCategoryFormCallback(data);
      }
      setAssetCategoryFormOpen(false);
    },
    onError: (error) => {
      toast.error(
        `Failed to ${assetCategory ? "update" : "add"} asset category: ${error.message}`,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!assetCategory) throw new Error("No asset category to delete");

      // First, update all assets under this category to have null categoryId
      await db.assets
        .where("categoryId")
        .equals(assetCategory.id)
        .modify({ categoryId: null });

      // Then delete the category
      await db.assetCategories.delete(assetCategory.id);
      return assetCategory.id;
    },
    onSuccess: () => {
      toast.success("Asset category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
      queryClient.invalidateQueries({
        queryKey: ["asset-performance-grouped"],
      });

      if (assetCategoryFormCallback) {
        setAssetCategoryFormCallback(null);
      }
      setAssetCategoryFormOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete asset category: ${error.message}`);
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
    if (assetCategory) {
      form.reset({
        name: assetCategory.name,
        description: assetCategory.description,
        ...(assetCategory.icon
          ? {
              icon: new File([assetCategory.icon], assetCategory.name),
            }
          : {}),
      });
    } else {
      form.reset();
    }
  }, [assetCategory, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    assetCategoryMutation.mutate(values);
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
          disabled={assetCategoryMutation.isPending}
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
          disabled={assetCategoryMutation.isPending}
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
          name="description"
          disabled={assetCategoryMutation.isPending}
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
            {assetCategory && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    type="button"
                    className="w-full md:w-fit"
                    disabled={
                      deleteMutation.isPending ||
                      assetCategoryMutation.isPending
                    }
                  >
                    <div className="flex items-center gap-2">
                      <TrashIcon className="size-4" />
                      <span>Delete</span>
                    </div>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the "{assetCategory.name}"
                      category and all associated assets. This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <LoaderCircleIcon className="animate-spin" />
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        "Delete Category"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-2 justify-end items-center">
            <Button
              variant="outline"
              type="button"
              className="w-full md:w-fit"
              onClick={() => {
                form.reset();
                setAssetCategoryFormOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={
                assetCategoryMutation.isPending || deleteMutation.isPending
              }
              type="submit"
              className="w-full md:w-fit"
            >
              {assetCategoryMutation.isPending ? (
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

export function AssetCategoryDialog() {
  const { isAssetCategoryFormOpen, setAssetCategoryFormOpen, assetCategory } =
    useUI();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={isAssetCategoryFormOpen}
        onOpenChange={setAssetCategoryFormOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {assetCategory ? "Edit" : "Add New"} Asset Category
            </DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pt-0">
            <AssetCategoryForm />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={isAssetCategoryFormOpen}
      onOpenChange={setAssetCategoryFormOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {assetCategory ? "Edit" : "Add New"} Asset Category
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <AssetCategoryForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
