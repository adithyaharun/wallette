import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import type { Config } from "../../../@types/config";
import { db } from "../../../lib/db";

type ConfigProviderProps = {
  children: React.ReactNode;
};

type ConfigContextType = {
  config: Config | null;
  isLoading: boolean;
};

// Get user's locale default date format
function getUserLocaleFormats() {
  const locale = navigator.language || "en-US";
  const today = new Date();

  // Get localized date format by creating a formatted string and reverse-engineering it
  const formatter = new Intl.DateTimeFormat(locale);
  const parts = formatter.formatToParts(today);

  // Build dayjs format string from Intl parts
  let dateFormat = "";
  let shortDateFormat = "";

  parts.forEach((part) => {
    switch (part.type) {
      case "day":
        dateFormat += part.value.length === 1 ? "D" : "DD";
        shortDateFormat += part.value.length === 1 ? "D" : "DD";
        break;
      case "month":
        dateFormat += part.value.length === 1 ? "M" : "MM";
        shortDateFormat += "MMM";
        break;
      case "year":
        dateFormat += part.value.length === 2 ? "YY" : "YYYY";
        // Skip year in short format
        break;
      case "literal":
        dateFormat += part.value;
        if (shortDateFormat && !shortDateFormat.endsWith(" ")) {
          shortDateFormat += part.value === "/" ? " " : part.value;
        }
        break;
    }
  });

  // Clean up short format
  shortDateFormat = shortDateFormat
    .trim()
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ");

  return {
    dateFormat: dateFormat || "DD/MM/YYYY",
    shortDateFormat: shortDateFormat || "DD MMM",
  };
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  isLoading: true,
});

export function ConfigProvider({ children }: ConfigProviderProps) {
  const configQuery = useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const cfg = await db.config.get(1);

      if (!cfg) {
        const defaultFormats = getUserLocaleFormats();
        const defaultConfig: Config = {
          id: 1,
          name: "",
          setupCompleted: false,
          dateFormat: defaultFormats.dateFormat,
          shortDateFormat: defaultFormats.shortDateFormat,
          timeFormat: "24h",
          currencySymbol: "$",
          numberFormat: navigator.language || "en-US",
        };

        return defaultConfig;
      }

      return cfg;
    },
  });

  return (
    <ConfigContext.Provider
      value={{
        config: configQuery.data || null,
        isLoading: configQuery.isLoading,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
