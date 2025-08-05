import { FormStateProvider, useFormState } from "./form-state-context";
import { ThemeProvider, useTheme } from "./theme-context";
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
        <FormStateProvider>{children}</FormStateProvider>
      </TransporterProvider>
    </ThemeProvider>
  );
}

export function useUI() {
  const theme = useTheme();
  const transporter = useTransporter();
  const formState = useFormState();

  return {
    ...theme,
    ...transporter,
    ...formState,
  };
}

export { useTheme, useTransporter, useFormState };
