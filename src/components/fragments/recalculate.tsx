import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { assetBalanceRepository } from "../../db/repositories/asset-balance";
import { useIsMobile } from "../../hooks/use-mobile";
import { db } from "../../lib/db";
import { useUI } from "../providers/ui-provider";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

const labels = {
  title: "Recalculate Balances",
  description:
    "Use this feature to recalculate all balances across your accounts and categories. This will ensure that all your financial data is up-to-date and accurate, in case our system has missed any transactions or updates. Please note that this may take some time depending on the number of transactions you have.",
  okLabel: "Recalculate",
  cancelLabel: "Cancel",
};

export function RecalculateDialog() {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const { isRecalculatorOpen, setRecalculatorOpen } = useUI();

  const handleRecalculate = async () => {
    setIsProcessing(true);

    try {
      const assets = await db.assets.toArray();

      for (const asset of assets) {
        await assetBalanceRepository.resetAndRecalculateBalance(asset.id);
      }

      await queryClient.invalidateQueries();
    } catch (error) {
      console.error("Error recalculating balances:", error);
      toast.error("Failed to recalculate balances. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isMobile) {
    return (
      <Drawer open={isRecalculatorOpen} onOpenChange={setRecalculatorOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{labels.title}</DrawerTitle>
            <DrawerDescription>{labels.description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              className="w-full"
              onClick={handleRecalculate}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : labels.okLabel}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                {labels.cancelLabel}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isRecalculatorOpen} onOpenChange={setRecalculatorOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleRecalculate} disabled={isProcessing}>
            {isProcessing ? "Processing..." : labels.okLabel}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">{labels.cancelLabel}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
