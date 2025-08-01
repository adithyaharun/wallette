import { DownloadIcon, UploadIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransporter } from "../../providers/transporter-provider";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Progress } from "../../ui/progress";

export function TransporterDialog() {
  const {
    isTransporterOpen,
    setTransporterOpen,
    exportProgress,
    importProgress,
    export: doExport,
    import: doImport,
  } = useTransporter();

  const handleExport = async () => {
    await doExport();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await doImport(file);
      setTransporterOpen(false);
    }
  };

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
        <Tabs defaultValue="export">
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          <TabsContent value="export">
            <div className="space-y-4 text-sm">
              <p>
                Click the button below to start exporting your data. The
                database will be exported to a JSON file. Take note that the
                export process may take some time depending on the amount of
                data.
              </p>
              <div className="flex items-center justify-between gap-2">
                {exportProgress ? (
                  <Progress
                    value={
                      exportProgress.totalTables
                        ? (exportProgress.completedTables / exportProgress.totalTables) *
                          100
                        : 0
                    }
                    className="w-full"
                  />
                ) : (
                  <Button onClick={handleExport}>
                    <DownloadIcon className="size-4" />
                    Export Data
                  </Button>
                )}
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="import">
            <div className="space-y-4 text-sm">
              <p>
                Please ensure that the file is in JSON format and contains the
                necessary data. If you ever export your data, you can use the
                same file to import it back. If not, you can download the sample
                JSON file using the button below.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="file-upload"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {importProgress ? (
                    <Progress
                      value={
                        importProgress.totalTables
                          ? (importProgress.completedTables / importProgress.totalTables) *
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
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
