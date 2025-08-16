import { AboutProvider, useAbout } from "./about-context";
import {
  AssetCategoryFormProvider,
  useAssetCategoryForm,
} from "./asset-category-context";
import { AssetFormProvider, useAssetForm } from "./asset-context";
import { ConfigProvider, useConfig } from "./config-context";
import { ThemeProvider, useTheme } from "./theme-context";
import {
  TransactionCategoryFormProvider,
  useTransactionCategoryForm,
} from "./transaction-category-context";
import { TransporterProvider, useTransporter } from "./transporter-context";

type UIProviderProps = {
  children: React.ReactNode;
};

export function UIProvider({ children }: UIProviderProps) {
  return (
    <ThemeProvider defaultTheme={"system"} storageKey={"wallette-theme"}>
      <AboutProvider>
        <ConfigProvider>
          <TransporterProvider>
            <TransactionCategoryFormProvider>
              <AssetCategoryFormProvider>
                <AssetFormProvider>{children}</AssetFormProvider>
              </AssetCategoryFormProvider>
            </TransactionCategoryFormProvider>
          </TransporterProvider>
        </ConfigProvider>
      </AboutProvider>
    </ThemeProvider>
  );
}

export function useUI() {
  const theme = useTheme();
  const configContext = useConfig();
  const transporter = useTransporter();
  const assetCategoryForm = useAssetCategoryForm();
  const transactionCategoryForm = useTransactionCategoryForm();
  const assetForm = useAssetForm();
  const about = useAbout();

  return {
    ...theme,
    config: configContext.config,
    isConfigLoading: configContext.isLoading,
    ...transporter,
    ...transactionCategoryForm,
    ...assetCategoryForm,
    ...assetForm,
    ...about
  };
}

export {
  useConfig, useTheme, useTransporter,
  type useAssetCategoryForm,
  type useAssetForm
};

