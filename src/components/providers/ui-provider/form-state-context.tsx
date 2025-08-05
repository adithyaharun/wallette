import { createContext, useContext, useState } from "react";

type FormStateProviderProps = {
  children: React.ReactNode;
};

type FormStateContextType = {
  isAssetCategoryFormOpen: boolean;
  setAssetCategoryFormOpen: (open: boolean) => void;
  assetCategoryFormCallback: ((data?: number) => void) | null;
  setAssetCategoryFormCallback: (
    callback: ((data?: number) => void) | null,
  ) => void;
  openAssetCategoryForm: (callback?: (data?: number) => void) => void;

  isAssetFormOpen: boolean;
  setAssetFormOpen: (open: boolean) => void;
  assetFormCallback: (() => void) | null;
  setAssetFormCallback: (callback: (() => void) | null) => void;
  openAssetForm: (callback?: () => void) => void;
};

const FormStateContext = createContext<FormStateContextType>({
  isAssetCategoryFormOpen: false,
  setAssetCategoryFormOpen: () => {},
  assetCategoryFormCallback: null,
  setAssetCategoryFormCallback: () => {},
  openAssetCategoryForm: () => {},

  isAssetFormOpen: false,
  setAssetFormOpen: () => {},
  assetFormCallback: null,
  setAssetFormCallback: () => {},
  openAssetForm: () => {},
});

export function FormStateProvider({ children }: FormStateProviderProps) {
  const [isAssetCategoryFormOpen, setAssetCategoryFormOpen] = useState(false);
  const [assetCategoryFormCallback, setAssetCategoryFormCallback] = useState<
    ((data?: number) => void) | null
  >(null);
  const [isAssetFormOpen, setAssetFormOpen] = useState(false);
  const [assetFormCallback, setAssetFormCallback] = useState<
    (() => void) | null
  >(null);

  const openAssetCategoryForm = (callback?: (data?: number) => void) => {
    setAssetCategoryFormCallback(() => callback || null);
    setAssetCategoryFormOpen(true);
  };

  const openAssetForm = (callback?: () => void) => {
    setAssetFormCallback(() => callback || null);
    setAssetFormOpen(true);
  };

  return (
    <FormStateContext.Provider
      value={{
        isAssetCategoryFormOpen,
        setAssetCategoryFormOpen,
        assetCategoryFormCallback,
        setAssetCategoryFormCallback,
        openAssetCategoryForm,
        isAssetFormOpen,
        setAssetFormOpen,
        assetFormCallback,
        setAssetFormCallback,
        openAssetForm,
      }}
    >
      {children}
    </FormStateContext.Provider>
  );
}

export function useFormState() {
  const context = useContext(FormStateContext);
  if (!context) {
    throw new Error("useFormState must be used within a FormStateProvider");
  }
  return context;
}
