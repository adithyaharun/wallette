import { useEffect, useState } from "react";
import { driveService } from "../lib/google-drive";

export function useGoogleDrive() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    driveService
      .initialize()
      .then(() => {
        setIsInitialized(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return {
    isInitialized,
    isLoading,
    requestUserInfo: driveService.requestUserInfo.bind(driveService),
    requestAccessToken: driveService.requestAccessToken.bind(driveService),
    getAccessToken: driveService.getAccessToken.bind(driveService),
    getFiles: driveService.listFiles.bind(driveService),
    createFile: driveService.createFile.bind(driveService),
  };
}
