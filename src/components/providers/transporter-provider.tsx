/**
 * @file TransporterProvider.tsx
 * @description This file defines the TransporterProvider component, which is responsible for providing the Transporter context to the application.
 * Transporter is used to handle export/import functionality in the application.
 */
import { type ExportProgress, exportDB } from "dexie-export-import";
import type { ImportProgress } from "dexie-export-import/dist/import";
import { createContext, useContext, useState } from "react";
import { db } from "../../lib/db";

type TransporterProviderProps = {
  children: React.ReactNode;
};

type TransporterContextType = {
  isTransporterOpen: boolean;
  setTransporterOpen: (open: boolean) => void;
  isRecalculatorOpen: boolean;
  setRecalculatorOpen: (open: boolean) => void;
  exportProgress: ExportProgress | null;
  importProgress: ImportProgress | null;
  export: () => Promise<void>;
  import: (file: File) => Promise<void>;
};

const TransporterContext = createContext<TransporterContextType>({
  isTransporterOpen: false,
  isRecalculatorOpen: false,
  exportProgress: null,
  importProgress: null,
  setTransporterOpen: () => {},
  setRecalculatorOpen: () => {},
  export: async () => {},
  import: async () => {},
});

export function TransporterProvider({ children }: TransporterProviderProps) {
  const [isTransporterOpen, setTransporterOpen] = useState(false);
  const [isRecalculatorOpen, setRecalculatorOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(
    null,
  );
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(
    null,
  );

  const doExport = async () => {
    const blob = await exportDB(db, {
      numRowsPerChunk: 1000,
      progressCallback: (progress) => {
        setExportProgress(progress);
        return true;
      },
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wallette.wlworkspace";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportProgress(null);
  };

  const doImport = async (blob: Blob) => {
    await db.import(blob, {
      clearTablesBeforeImport: true,
      progressCallback: (progress) => {
        setImportProgress(progress);
        return true;
      },
    });

    setImportProgress(null);
  };

  return (
    <TransporterContext.Provider
      value={{
        exportProgress,
        importProgress,
        isTransporterOpen,
        setTransporterOpen,
        isRecalculatorOpen,
        setRecalculatorOpen,
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
