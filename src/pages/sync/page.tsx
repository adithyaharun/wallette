import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Card, CardContent } from "../../components/ui/card";
import { useGoogleDrive } from "../../hooks/use-google-drive";
import { db } from "../../lib/db";
import type { DriveFile } from "../../lib/google-drive";

export function SyncPage() {
  const googleDrive = useGoogleDrive();

  const [isFinished, setFinished] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const syncData = useCallback(async () => {
    try {
      if (isFinished) return;

      const getFilesResponse = await googleDrive.getFiles();
      let file: DriveFile;

      if (getFilesResponse.files.length === 0) {
        file = await googleDrive.createFile(
          "wallette.wlworkspace",
          "{}",
          "application/json",
        );
      } else {
        file = getFilesResponse.files[0];
      }

      const blob = await googleDrive.getFileContents(file.id);
      await db.import(blob);
    } catch (error) {
      setError(error as Error);
    } finally {
      setFinished(true);
    }
  }, [googleDrive, isFinished]);

  useEffect(() => {
    syncData();
  }, [syncData]);

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {error ? (
            <AlertCircleIcon className="h-16 w-16 text-red-500" />
          ) : !isFinished ? (
            <Loader2Icon className="h-16 w-16 animate-spin" />
          ) : (
            <CheckCircle2Icon className="h-16 w-16 text-green-500" />
          )}
          <div className="text-center space-y-2">
            <h1 className="text-lg md:text-2xl font-medium">
              {error
                ? "An error occurred."
                : !isFinished
                  ? "Preparing your data..."
                  : "Restore completed."}
            </h1>
            <div className="text-sm text-muted-foreground">
              {error ? (
                <div className="space-y-4">
                  <p>
                    We encountered an error while restoring your data. You can
                    try again or skip this step.
                  </p>
                  <Alert variant="default" className="text-left">
                    <AlertTitle>Code: {error.name}</AlertTitle>
                    <AlertDescription>
                      {error.message || "No error message available."}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : !isFinished ? (
                <p>
                  We are currently syncing your data from your Google Drive.
                  Please wait a moment...
                </p>
              ) : (
                <p>
                  We have successfully restored your data. Start using Wallette
                  now!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
