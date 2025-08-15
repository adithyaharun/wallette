import { type ExportProgress, exportDB } from "dexie-export-import";
import type { ImportProgress } from "dexie-export-import/dist/import";
import { createContext, useContext, useState } from "react";
import { db } from "../../../lib/db";

type TransporterProviderProps = {
  children: React.ReactNode;
};

type TransporterContextType = {
  isTransporterOpen: boolean;
  setTransporterOpen: (open: boolean) => void;
  exportProgress: ExportProgress | null;
  importProgress: ImportProgress | null;
  export: () => Promise<void>;
  import: (file: File) => Promise<void>;
  isRecalculatorOpen: boolean;
  setRecalculatorOpen: (open: boolean) => void;
};

const TransporterContext = createContext<TransporterContextType>({
  isTransporterOpen: false,
  setTransporterOpen: () => {},
  exportProgress: null,
  importProgress: null,
  export: async () => {},
  import: async () => {},
  isRecalculatorOpen: false,
  setRecalculatorOpen: () => {},
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
    a.download = "wallette.json";
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
        isTransporterOpen,
        setTransporterOpen,
        exportProgress,
        importProgress,
        export: doExport,
        import: doImport,
        isRecalculatorOpen,
        setRecalculatorOpen,
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
