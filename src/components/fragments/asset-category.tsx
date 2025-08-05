import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
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
  const { assetCategoryFormCallback, setAssetCategoryFormOpen } = useUI();

  const assetCategoryMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { name, description, icon } = values;
      return await db.assetCategories.add({
        name,
        description,
        ...(icon ? { icon: new Blob([icon], { type: icon.type }) } : {}),
      });
    },
    onSuccess: (data) => {
      toast.success("Asset category added successfully!");

      queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
      form.reset();

      if (assetCategoryFormCallback) {
        assetCategoryFormCallback(data);
      }
      setAssetCategoryFormOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to add assetCategory: ${error.message}`);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

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
        <div className="flex flex-col-reverse md:flex-row gap-2 justify-end">
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
            disabled={assetCategoryMutation.isPending}
            type="submit"
            className=" w-full md:w-fit"
          >
            {assetCategoryMutation.isPending ? (
              <div className="flex items-center gap-2">
                <LoaderCircleIcon className="animate-spin" />
                <span>Adding...</span>
              </div>
            ) : (
              "Add Category"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function AssetCategoryDialog() {
  const { isAssetCategoryFormOpen, setAssetCategoryFormOpen } = useUI();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={isAssetCategoryFormOpen}
        onOpenChange={setAssetCategoryFormOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New Asset Category</DrawerTitle>
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
          <DialogTitle>Add New Asset Category</DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <AssetCategoryForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
