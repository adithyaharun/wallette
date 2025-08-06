import {
  AssetCategoryFormProvider,
  useAssetCategoryForm,
} from "./asset-category-context";
import { AssetFormProvider, useAssetForm } from "./asset-context";
import { ThemeProvider, useTheme } from "./theme-context";
import {
  TransactionCategoryFormProvider,
  useTransactionCategoryForm,
} from "./transaction-category-context";
import { TransporterProvider, useTransporter } from "./transporter-context";

type UIProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  storageKey?: string;
};

export function UIProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: UIProviderProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme} storageKey={storageKey}>
      <TransporterProvider>
        <TransactionCategoryFormProvider>
          <AssetCategoryFormProvider>
            <AssetFormProvider>{children}</AssetFormProvider>
          </AssetCategoryFormProvider>
        </TransactionCategoryFormProvider>
      </TransporterProvider>
    </ThemeProvider>
  );
}

export function useUI() {
  const theme = useTheme();
  const transporter = useTransporter();
  const assetCategoryForm = useAssetCategoryForm();
  const transactionCategoryForm = useTransactionCategoryForm();
  const assetForm = useAssetForm();

  return {
    ...theme,
    ...transporter,
    ...transactionCategoryForm,
    ...assetCategoryForm,
    ...assetForm,
  };
}

export {
  useTheme,
  useTransporter,
  type useAssetCategoryForm,
  type useAssetForm,
};
