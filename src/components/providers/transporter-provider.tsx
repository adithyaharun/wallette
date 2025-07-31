/**
 * @file TransporterProvider.tsx
 * @description This file defines the TransporterProvider component, which is responsible for providing the Transporter context to the application.
 * Transporter is used to handle export/import functionality in the application.
 */
import { type ExportProgress, exportDB } from "dexie-export-import";
import { createContext, useContext, useState } from "react";
import { db } from "../../lib/db";

type TransporterProviderProps = {
  children: React.ReactNode;
};

type TransporterContextType = {
  isTransporterOpen: boolean;
  setTransporterOpen: (open: boolean) => void;
  exportProgress: ExportProgress | null;
  export: () => Promise<void>;
  import: (file: File) => Promise<void>;
};

const TransporterContext = createContext<TransporterContextType>({
  isTransporterOpen: false,
  exportProgress: null,
  setTransporterOpen: () => {},
  export: async () => {},
  import: async () => {},
});

export function TransporterProvider({ children }: TransporterProviderProps) {
  const [isTransporterOpen, setTransporterOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(
    null,
  );

  const doExport = async () => {
    const blob = await exportDB(db, {
      numRowsPerChunk: 1,
      progressCallback: (progress) => {
        setExportProgress(progress);
        return true;
      },
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wallette-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportProgress(null); // Reset progress after export
  };

  const doImport = async (file: File) => {
    // Implement import logic here
    console.log("Importing data from file:", file.name);
  };

  return (
    <TransporterContext.Provider
      value={{
        exportProgress,
        isTransporterOpen,
        setTransporterOpen,
        export: doExport,
        import: doImport,
      }}
    >
      {children}
    </TransporterContext.Provider>
  );
}

export function useTransporter() {
  const context = useContext(TransporterContext);
  if (!context) {
    throw new Error("useTransporter must be used within a TransporterProvider");
  }
  return context;
}
