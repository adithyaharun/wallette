import { createContext, useContext, useEffect, useState } from "react";
import type { Asset } from "../../../@types/asset";

type AssetFormProviderProps = {
  children: React.ReactNode;
};

type AssetOpenProps = {
  callback?: (data?: number) => void;
  asset?: Asset;
  categoryId?: number;
};

type AssetFormContextType = {
  isAssetFormOpen: boolean;
  setAssetFormOpen: (open: boolean) => void;
  asset: Asset | null;
  assetFormCallback: ((data?: number) => void) | null;
  setAssetFormCallback: (callback: ((data?: number) => void) | null) => void;
  openAssetForm: (props: AssetOpenProps) => void;
  categoryId?: number | null;
};

const AssetFormContext = createContext<AssetFormContextType>({
  isAssetFormOpen: false,
  setAssetFormOpen: () => {},
  asset: null,
  assetFormCallback: null,
  setAssetFormCallback: () => {},
  openAssetForm: (_props: AssetOpenProps) => {},
});

export function AssetFormProvider({ children }: AssetFormProviderProps) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isAssetFormOpen, setAssetFormOpen] = useState(false);
  const [assetFormCallback, setAssetFormCallback] = useState<
    ((data?: number) => void) | null
  >(null);

  useEffect(() => {
    if (!isAssetFormOpen) {
      // Reset asset and categoryId when the form closes
      setAsset(null);
      setCategoryId(null);
    }
  }, [isAssetFormOpen]);

  const openAssetForm = (props: AssetOpenProps) => {
    if (props.callback) {
      setAssetFormCallback(() => props.callback || null);
    }

    if (props.asset) {
      setAsset(props.asset);
    }

    if (props.categoryId) {
      setCategoryId(props.categoryId);
    }

    setAssetFormOpen(true);
  };

  return (
    <AssetFormContext.Provider
      value={{
        isAssetFormOpen,
        setAssetFormOpen,
        asset,
        assetFormCallback,
        setAssetFormCallback,
        openAssetForm,
        categoryId,
      }}
    >
      {children}
    </AssetFormContext.Provider>
  );
}

export function useAssetForm() {
  const context = useContext(AssetFormContext);
  if (!context) {
    throw new Error("useAssetForm must be used within a AssetFormProvider");
  }
  return context;
}
