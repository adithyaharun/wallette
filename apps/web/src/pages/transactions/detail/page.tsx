import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Edit3Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import type { Asset } from "../../../@types/asset";
import type {
  Transaction,
  TransactionCategory,
} from "../../../@types/transaction";
import { ConfirmButton } from "../../../components/fragments/confirm-button";
import { useUI } from "../../../components/providers/ui-provider";
import { AvatarWithBlob } from "../../../components/ui/avatar-with-blob";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { ImagePreviewDialog } from "../../../components/fragments/image-preview-dialog";
import { Separator } from "../../../components/ui/separator";
import { db } from "../../../lib/db";

type TransactionDetail = Transaction & {
  asset?: Asset | null;
  category?: TransactionCategory | null;
};

export default function TransactionDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("id");
  const { config } = useUI();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const transactionDetailQuery = useSuspenseQuery<TransactionDetail | null>({
    queryKey: ["transaction-detail", transactionId],
    queryFn: async () => {
      if (!transactionId) return null;

      const t = await db.transactions
        .where({ id: Number.parseInt(transactionId) })
        .first();

      if (t) {
        const asset = await db.assets.where({ id: t.assetId }).first();
        const category = await db.transactionCategories
          .where({ id: t.categoryId })
          .first();
        return { ...t, asset, category };
      }

      return null;
    },
  });

  const onDelete = useCallback(async () => {
    if (!transactionDetailQuery.data) return;

    await db.assets.update(transactionDetailQuery.data.assetId, {
      balance:
        (transactionDetailQuery.data.asset?.balance || 0) +
        (transactionDetailQuery.data.category?.type === "income"
          ? -transactionDetailQuery.data.amount
          : transactionDetailQuery.data.amount),
    });

    await db.transactions.delete(transactionDetailQuery.data.id);

    queryClient.invalidateQueries({ queryKey: ["transactionDetail"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["assets"] });
    queryClient.invalidateQueries({
      queryKey: ["asset-performance-grouped"],
    });

    toast.success("Transaction successfully deleted.");
    navigate("/transactions");
  }, [transactionDetailQuery.data, queryClient.invalidateQueries, navigate]);

  if (!transactionDetailQuery.data) {
    return <div className="p-4">Transaction not found.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              navigate(
                `/transactions/form?id=${transactionDetailQuery.data?.id}`,
              )
            }
          >
            <Edit3Icon />
            Edit
          </Button>
          <ConfirmButton
            onOk={onDelete}
            title="Delete Transaction"
            description="Are you sure you want to delete this transaction? This action cannot be undone."
            okProps={{ variant: "destructive" }}
            okLabel="Delete"
          >
            <Button variant="destructive">Delete</Button>
          </ConfirmButton>
        </div>
      </div>
      <Card className="w-full !rounded-md">
        <CardContent className="space-y-4 p-0 text-sm">
          <div className="flex flex-col items-center space-y-1">
            <div>Amount</div>
            <h1 className="text-3xl font-bold font-mono">
              {config?.currencySymbol}
              {transactionDetailQuery.data.amount.toLocaleString()}
            </h1>
          </div>
          <Separator />
          <div className="flex px-4 flex-col items-center space-y-2">
            <div className="flex items-center gap-2 justify-between w-full">
              <div className="text-muted-foreground">Date</div>
              <div className="font-medium">
                {dayjs(transactionDetailQuery.data.date).format(
                  "DD MMM YYYY, HH:mm",
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 justify-between w-full">
              <div className="text-muted-foreground">Details</div>
              <div className="font-medium">
                {transactionDetailQuery.data.details || "No details provided"}
              </div>
            </div>
            <div className="flex items-center gap-2 justify-between w-full">
              <div className="text-muted-foreground">Asset</div>
              <div className="font-medium flex items-center gap-2">
                {transactionDetailQuery.data.asset && (
                  <>
                    <AvatarWithBlob
                      className="size-5"
                      blob={transactionDetailQuery.data.asset.icon}
                      alt={transactionDetailQuery.data.asset.name}
                      fallback={transactionDetailQuery.data.asset.name
                        .charAt(0)
                        .toUpperCase()}
                    />
                    <span>{transactionDetailQuery.data.asset.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 justify-between w-full">
              <div className="text-muted-foreground">Category</div>
              <div className="font-medium flex items-center gap-2">
                {transactionDetailQuery.data.category && (
                  <>
                    <AvatarWithBlob
                      className="size-5"
                      blob={transactionDetailQuery.data.category.icon}
                      alt={transactionDetailQuery.data.category.name}
                      fallback={transactionDetailQuery.data.category.name
                        .charAt(0)
                        .toUpperCase()}
                    />
                    <span>{transactionDetailQuery.data.category.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 justify-between w-full">
              <div className="text-muted-foreground">Excluded from reports</div>
              <div className="font-medium">
                {transactionDetailQuery.data.excludedFromReports ? "Yes" : "No"}
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-1 md:gap-2 justify-between w-full px-4">
            <div className="text-muted-foreground">Description</div>
            <div className="font-medium">
              {transactionDetailQuery.data.description ||
                "No description provided"}
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-1 md:gap-2 justify-between w-full px-4">
            <div className="text-muted-foreground">Photos</div>
            {transactionDetailQuery.data.photos &&
            transactionDetailQuery.data.photos.length > 0 ? (
              <div className="flex md:flex-wrap gap-2 overflow-x-auto">
                {transactionDetailQuery.data.photos?.map((photo, index) => (
                  <button
                    type="button"
                    key={`photo-${transactionDetailQuery.data?.id}-${index}`}
                    onClick={() => {
                      setPreviewIndex(index);
                      setPreviewOpen(true);
                    }}
                  >
                    <AvatarWithBlob
                      className="size-24"
                      blob={photo}
                      alt={`Photo ${index + 1}`}
                      fallback={`Photo ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div>No photos provided</div>
            )}
          </div>
        </CardContent>
      </Card>

      {transactionDetailQuery.data.photos &&
        transactionDetailQuery.data.photos.length > 0 && (
          <ImagePreviewDialog
            images={transactionDetailQuery.data.photos}
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
            initialIndex={previewIndex}
          />
        )}
    </div>
  );
}
