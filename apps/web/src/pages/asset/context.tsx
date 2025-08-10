import { useMutation } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { Asset } from "../../@types/asset";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../../components/ui/drawer";
import { useIsMobile } from "../../hooks/use-mobile";
import { db } from "../../lib/db";

interface AssetContextType {
  deletingAsset: Asset | null;
  setDeletingAsset: (asset: Asset | null) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (assetId: number) => {
      await db.assets.delete(assetId);
    },
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      setDeletingAsset(null);
      setIsDeleteDialogOpen(false);
      navigate("/asset");
    },
    onError: (error) => {
      console.error("Failed to delete asset:", error);
      toast.error("Failed to delete asset");
    },
  });

  const confirmDelete = () => {
    if (!deletingAsset?.id) return;
    deleteMutation.mutate(deletingAsset.id);
  };

  const cancelDelete = () => {
    setDeletingAsset(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <AssetContext.Provider
      value={{
        deletingAsset,
        setDeletingAsset,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
      }}
    >
      {children}
      {isMobile ? (
        <Drawer open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Delete Asset</DrawerTitle>
            </DrawerHeader>
            <div className="px-4">
              <p className="text-sm text-center text-muted-foreground mb-4">
                Are you sure you want to delete the "{deletingAsset?.name}"
                asset? This action cannot be undone and will permanently remove
                this asset from your records.
              </p>
              <div className="flex flex-col gap-2 py-4">
                <Button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  variant="destructive"
                  size="lg"
                  className="w-full"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={cancelDelete}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Asset</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the "{deletingAsset?.name}"
                asset? This action cannot be undone and will permanently remove
                this asset from your records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={cancelDelete}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Asset"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AssetContext.Provider>
  );
}

export function useAssetContext() {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error("useAssetContext must be used within a AssetProvider");
  }
  return context;
}

export type { Asset };
