import { useQueryClient } from "@tanstack/react-query";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "../../../hooks/use-mobile";
import { db } from "../../../lib/db";
import { useTransporter } from "../../providers/transporter-provider";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../../ui/drawer";
import { Progress } from "../../ui/progress";

type ProgressType = {
  totalTables: number;
  completedTables: number;
} | null;

function TransporterContent({
  exportProgress,
  importProgress,
  onExport,
  onImport,
  onClose,
}: {
  exportProgress: ProgressType;
  importProgress: ProgressType;
  onExport: () => Promise<void>;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onClose: () => void;
}) {
  return (
    <Tabs defaultValue="export">
      <TabsList className="grid w-full grid-cols-2 h-10">
        <TabsTrigger value="export">Export</TabsTrigger>
        <TabsTrigger value="import">Import</TabsTrigger>
      </TabsList>
      <TabsContent value="export">
        <div className="space-y-4 text-sm">
          <p>
            Click the button below to start exporting your data. The database
            will be exported to a JSON file. Take note that the export process
            may take some time depending on the amount of data.
          </p>
          <div className="flex items-center justify-between gap-2">
            {exportProgress ? (
              <Progress
                value={
                  exportProgress.totalTables
                    ? (exportProgress.completedTables /
                        exportProgress.totalTables) *
                      100
                    : 0
                }
                className="w-full"
              />
            ) : (
              <Button onClick={onExport}>
                <DownloadIcon className="size-4" />
                Export Data
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="import">
        <div className="space-y-4 text-sm">
          <p>
            Please ensure that the file is in JSON format and contains the
            necessary data. If you ever export your data, you can use the same
            file to import it back. If not, you can download the sample JSON
            file using the button below.
          </p>
          <input
            type="file"
            accept=".json,.wlworkspace"
            onChange={onImport}
            className="hidden"
            id="file-upload"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {importProgress ? (
                <Progress
                  value={
                    importProgress.totalTables
                      ? (importProgress.completedTables /
                          importProgress.totalTables) *
                        100
                      : 0
                  }
                  className="w-full"
                />
              ) : (
                <>
                  <Button>
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <UploadIcon className="size-4" />
                      <span>Select File</span>
                    </label>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/sample-data.json" download="sample-data.json">
                      Download Sample Data
                    </a>
                  </Button>
                </>
              )}
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export function TransporterDialog() {
  const queryClient = useQueryClient();
  const {
    isTransporterOpen,
    setTransporterOpen,
    exportProgress,
    importProgress,
    export: doExport,
    import: doImport,
  } = useTransporter();
  const isMobile = useIsMobile();

  const handleExport = async () => {
    await doExport();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await db.delete();
      await db.open();
      await doImport(file);
      queryClient.invalidateQueries();
      toast.success("Import completed successfully!");
    }
  };

  const handleClose = () => {
    setTransporterOpen(false);
  };

  if (isMobile) {
    return (
      <Drawer open={isTransporterOpen} onOpenChange={setTransporterOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Export/Import</DrawerTitle>
            <DrawerDescription>
              Export or import your financial data, including transactions and
              accounts to a file.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <TransporterContent
              exportProgress={exportProgress}
              importProgress={importProgress}
              onExport={handleExport}
              onImport={handleImport}
              onClose={handleClose}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isTransporterOpen} onOpenChange={setTransporterOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Export/Import</DialogTitle>
          <DialogDescription>
            Export or import your financial data, including transactions and
            accounts to a file.
          </DialogDescription>
        </DialogHeader>
        <TransporterContent
          exportProgress={exportProgress}
          importProgress={importProgress}
          onExport={handleExport}
          onImport={handleImport}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
