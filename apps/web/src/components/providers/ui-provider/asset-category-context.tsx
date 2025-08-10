import { createContext, useContext, useEffect, useState } from "react";
import type { AssetCategory } from "../../../@types/asset";

type AssetCategoryFormProviderProps = {
  children: React.ReactNode;
};

type AssetCategoryOpenProps = {
  callback?: (data?: number) => void;
  assetCategory?: AssetCategory;
};

type AssetCategoryFormContextType = {
  isAssetCategoryFormOpen: boolean;
  setAssetCategoryFormOpen: (open: boolean) => void;
  assetCategory: AssetCategory | null;
  assetCategoryFormCallback: ((data?: number) => void) | null;
  setAssetCategoryFormCallback: (
    callback: ((data?: number) => void) | null,
  ) => void;
  openAssetCategoryForm: (props: AssetCategoryOpenProps) => void;
};

const AssetCategoryFormContext = createContext<AssetCategoryFormContextType>({
  isAssetCategoryFormOpen: false,
  setAssetCategoryFormOpen: () => {},
  assetCategory: null,
  assetCategoryFormCallback: null,
  setAssetCategoryFormCallback: () => {},
  openAssetCategoryForm: (_props: AssetCategoryOpenProps) => {},
});

export function AssetCategoryFormProvider({
  children,
}: AssetCategoryFormProviderProps) {
  const [assetCategory, setAssetCategory] = useState<AssetCategory | null>(
    null,
  );
  const [isAssetCategoryFormOpen, setAssetCategoryFormOpen] = useState(false);
  const [assetCategoryFormCallback, setAssetCategoryFormCallback] = useState<
    ((data?: number) => void) | null
  >(null);

  const openAssetCategoryForm = (props: AssetCategoryOpenProps) => {
    setAssetCategoryFormCallback(() => props.callback || null);
    setAssetCategory(props.assetCategory || null);
    setAssetCategoryFormOpen(true);
  };

  useEffect(() => {
    if (!isAssetCategoryFormOpen) {
      setAssetCategory(null);
      setAssetCategoryFormCallback(null);
    }
  }, [isAssetCategoryFormOpen]);

  return (
    <AssetCategoryFormContext.Provider
      value={{
        isAssetCategoryFormOpen,
        setAssetCategoryFormOpen,
        assetCategory,
        assetCategoryFormCallback,
        setAssetCategoryFormCallback,
        openAssetCategoryForm,
      }}
    >
      {children}
    </AssetCategoryFormContext.Provider>
  );
}

export function useAssetCategoryForm() {
  const context = useContext(AssetCategoryFormContext);
  if (!context) {
    throw new Error(
      "useAssetCategoryForm must be used within a AssetCategoryFormProvider",
    );
  }
  return context;
}
