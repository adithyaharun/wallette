import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { HelpCircleIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import type { Config } from "../../@types/config";
import { Button } from "../../components/ui/button";
import { ComboBox } from "../../components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { useIsMobile } from "../../hooks/use-mobile";
import { db } from "../../lib/db";

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

const step2Schema = z.object({
  dateFormat: z
    .string()
    .min(1, "Date format is required")
    .refine(
      (format) => {
        // Test if the format is valid by trying to format a date
        try {
          const formatted = dayjs()
            .date(31)
            .month(11)
            .year(2023)
            .format(format);
          return formatted && formatted.length > 0;
        } catch {
          return false;
        }
      },
      {
        message:
          "Invalid date format. Use D/DD for day, M/MM/MMM for month, YY/YYYY for year.",
      },
    ),
  shortDateFormat: z
    .string()
    .min(1, "Short date format is required")
    .refine(
      (format) => {
        // Test if the format is valid by trying to format a date
        try {
          const formatted = dayjs()
            .date(31)
            .month(11)
            .year(2023)
            .format(format);
          return formatted && formatted.length > 0;
        } catch {
          return false;
        }
      },
      {
        message: "Invalid short date format. Use D/DD for day, MMM for month.",
      },
    ),
  timeFormat: z
    .string()
    .min(1, "Time format is required")
    .refine(
      (format) => {
        // Test if the format is valid by trying to format a time
        try {
          const formatted = dayjs().hour(14).minute(30).format(format);
          return formatted && formatted.length > 0;
        } catch {
          return false;
        }
      },
      {
        message:
          "Invalid time format. Use HH:mm for 24-hour format, h:mm A for 12-hour format.",
      },
    ),
  currencySymbol: z.string(),
  numberFormat: z.string(),
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;

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

function FormatHelpButton({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  const content = <div className="space-y-3">{children}</div>;

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <HelpCircleIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pt-0">{content}</div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">OK</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <HelpCircleIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">OK</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DateFormatHelp() {
  return (
    <FormatHelpButton title="Date Format Help">
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          Create your preferred date format using these tokens:
        </p>
        <div className="space-y-2 text-sm">
          <div>
            <code className="bg-muted px-1.5 py-0.5 rounded">D</code> - Day
            (1-31)
          </div>
          <div>
            <code className="bg-muted px-1.5 py-0.5 rounded">DD</code> - Day
            with zero padding (01-31)
          </div>
          <div>
            <code className="bg-muted px-1.5 py-0.5 rounded">M</code> - Month
            (1-12)
          </div>
          <div>
            <code className="bg-muted px-1.5 py-0.5 rounded">MM</code> - Month
            with zero padding (01-12)
          </div>
          <div>
            <code className="bg-muted px-1.5 py-0.5 rounded">MMM</code> - Short
            month name (Jan-Dec)
          </div>
          <div>
            <code className="bg-muted px-1.5 py-0.5 rounded">YY</code> -
            Two-digit year (23)
          </div>
          <div>
            <code className="bg-muted px-1.5 py-0.5 rounded">YYYY</code> -
            Four-digit year (2023)
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Examples:</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>DD/MM/YYYY → 31/12/2023</div>
            <div>MM-DD-YYYY → 12-31-2023</div>
            <div>YYYY.MM.DD → 2023.12.31</div>
            <div>DD MMM YYYY → 31 Dec 2023</div>
          </div>
        </div>
      </div>
    </FormatHelpButton>
  );
}

export default function SetupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null);
  const queryClient = useQueryClient();

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
    },
  });

  const defaultFormats = getUserLocaleFormats();

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      dateFormat: defaultFormats.dateFormat,
      shortDateFormat: defaultFormats.shortDateFormat,
      timeFormat: "HH:mm",
      currencySymbol: "$",
      numberFormat: navigator.language || "en-US",
    },
  });

  const onStep1Submit = (data: Step1FormData) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const onStep2Submit = async (step2Data: Step2FormData) => {
    if (!step1Data) {
      toast.error("Something went wrong. Please restart the setup.");
      setCurrentStep(1);
      return;
    }

    try {
      const config: Omit<Config, "id"> = {
        ...step1Data,
        ...step2Data,
        setupCompleted: true,
      };

      await db.config.put({ id: 1, ...config });

      const existingCategories = await db.assetCategories.count();

      if (existingCategories === 0) {
        await db.assetCategories.put({
          id: 1,
          name: "Cash in Hand",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["config"] });

      toast.success("Welcome to Wallette! Setup completed successfully.");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Setup failed. Please try again.");
    }
  };

  const goBackToStep1 = () => {
    setCurrentStep(1);
  };

  return (
    <div className="w-full max-w-lg mx-auto min-h-screen flex flex-col justify-center px-4 space-y-8 py-8">
      <div className="space-y-4">
        <img
          src="/pwa-192x192.png"
          alt="Wallette Logo"
          width={48}
          className="mx-auto"
        />
      </div>

      {currentStep === 1 && (
        <div className="space-y-6">
          <Form {...step1Form}>
            <form
              onSubmit={step1Form.handleSubmit(onStep1Submit)}
              className="space-y-6"
            >
              <FormField
                control={step1Form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your name?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </Form>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Hi {step1Data?.name}! 👋</h2>
            <p className="text-sm text-muted-foreground">
              Now let's configure your preferences.
            </p>
          </div>

          <Form {...step2Form}>
            <form
              onSubmit={step2Form.handleSubmit(onStep2Submit)}
              className="space-y-4"
            >
              <FormField
                control={step2Form.control}
                name="currencySymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Symbol</FormLabel>
                    <FormControl>
                      <ComboBox
                        options={[
                          // Major currencies
                          {
                            value: "$",
                            label: "$ - Dollar",
                            keywords: [
                              "usd",
                              "cad",
                              "aud",
                              "nzd",
                              "sgd",
                              "hkd",
                              "twd",
                              "mxn",
                              "ars",
                              "clp",
                              "cop",
                              "dollar",
                              "usa",
                              "us",
                              "united states",
                              "american",
                              "canada",
                              "canadian",
                              "australia",
                              "australian",
                              "new zealand",
                              "nz",
                              "kiwi",
                              "singapore",
                              "singaporean",
                              "hong kong",
                              "taiwan",
                              "taiwanese",
                              "mexico",
                              "mexican",
                              "peso",
                              "argentina",
                              "argentine",
                              "chile",
                              "chilean",
                              "colombia",
                              "colombian",
                            ],
                          },
                          {
                            value: "€",
                            label: "€ - Euro",
                            keywords: [
                              "eur",
                              "euro",
                              "european",
                              "europe",
                              "eurozone",
                            ],
                          },
                          {
                            value: "£",
                            label: "£ - British Pound",
                            keywords: [
                              "gbp",
                              "pound",
                              "sterling",
                              "british",
                              "uk",
                              "united kingdom",
                              "britain",
                            ],
                          },
                          {
                            value: "¥",
                            label: "¥ - Yen/Yuan",
                            keywords: [
                              "jpy",
                              "cny",
                              "yen",
                              "yuan",
                              "renminbi",
                              "rmb",
                              "japanese",
                              "japan",
                              "chinese",
                              "china",
                            ],
                          },

                          // Specialized dollars
                          {
                            value: "C$",
                            label: "C$ - Canadian Dollar",
                            keywords: ["cad", "dollar", "canadian", "canada"],
                          },
                          {
                            value: "A$",
                            label: "A$ - Australian Dollar",
                            keywords: [
                              "aud",
                              "dollar",
                              "australian",
                              "australia",
                            ],
                          },
                          {
                            value: "NZ$",
                            label: "NZ$ - New Zealand Dollar",
                            keywords: ["nzd", "dollar", "new zealand", "kiwi"],
                          },
                          {
                            value: "S$",
                            label: "S$ - Singapore Dollar",
                            keywords: [
                              "sgd",
                              "dollar",
                              "singapore",
                              "singaporean",
                            ],
                          },
                          {
                            value: "HK$",
                            label: "HK$ - Hong Kong Dollar",
                            keywords: ["hkd", "dollar", "hong kong"],
                          },
                          {
                            value: "NT$",
                            label: "NT$ - Taiwan Dollar",
                            keywords: ["twd", "dollar", "taiwanese", "taiwan"],
                          },
                          {
                            value: "R$",
                            label: "R$ - Brazilian Real",
                            keywords: ["brl", "real", "brazilian", "brazil"],
                          },

                          // European currencies
                          {
                            value: "kr",
                            label: "kr - Krona/Krone",
                            keywords: [
                              "sek",
                              "nok",
                              "dkk",
                              "krona",
                              "krone",
                              "swedish",
                              "sweden",
                              "norwegian",
                              "norway",
                              "danish",
                              "denmark",
                            ],
                          },
                          {
                            value: "Fr",
                            label: "Fr - Swiss Franc",
                            keywords: ["chf", "franc", "swiss", "switzerland"],
                          },
                          {
                            value: "zł",
                            label: "zł - Polish Złoty",
                            keywords: ["pln", "zloty", "polish", "poland"],
                          },
                          {
                            value: "Kč",
                            label: "Kč - Czech Koruna",
                            keywords: [
                              "czk",
                              "koruna",
                              "czech",
                              "czechia",
                              "republic",
                            ],
                          },
                          {
                            value: "Ft",
                            label: "Ft - Hungarian Forint",
                            keywords: ["huf", "forint", "hungarian", "hungary"],
                          },
                          {
                            value: "₽",
                            label: "₽ - Russian Ruble",
                            keywords: [
                              "rub",
                              "ruble",
                              "rouble",
                              "russian",
                              "russia",
                            ],
                          },
                          {
                            value: "₴",
                            label: "₴ - Ukrainian Hryvnia",
                            keywords: [
                              "uah",
                              "hryvnia",
                              "ukrainian",
                              "ukraine",
                            ],
                          },
                          {
                            value: "₼",
                            label: "₼ - Azerbaijani Manat",
                            keywords: [
                              "azn",
                              "manat",
                              "azerbaijani",
                              "azerbaijan",
                            ],
                          },
                          {
                            value: "₾",
                            label: "₾ - Georgian Lari",
                            keywords: ["gel", "lari", "georgian", "georgia"],
                          },
                          {
                            value: "lei",
                            label: "lei - Romanian Leu",
                            keywords: ["ron", "leu", "romanian", "romania"],
                          },
                          {
                            value: "лв",
                            label: "лв - Bulgarian Lev",
                            keywords: ["bgn", "lev", "bulgarian", "bulgaria"],
                          },
                          {
                            value: "₺",
                            label: "₺ - Turkish Lira",
                            keywords: ["try", "lira", "turkish", "turkey"],
                          },

                          // Asia Pacific
                          {
                            value: "₹",
                            label: "₹ - Indian Rupee",
                            keywords: ["inr", "rupee", "indian", "india"],
                          },
                          {
                            value: "₩",
                            label: "₩ - South Korean Won",
                            keywords: [
                              "krw",
                              "won",
                              "korean",
                              "korea",
                              "south korea",
                            ],
                          },
                          {
                            value: "₱",
                            label: "₱ - Philippine Peso",
                            keywords: [
                              "php",
                              "peso",
                              "philippine",
                              "philippines",
                            ],
                          },
                          {
                            value: "₫",
                            label: "₫ - Vietnamese Dong",
                            keywords: ["vnd", "dong", "vietnamese", "vietnam"],
                          },
                          {
                            value: "₨",
                            label: "₨ - Rupee",
                            keywords: [
                              "pkr",
                              "lkr",
                              "npr",
                              "rupee",
                              "pakistani",
                              "pakistan",
                              "sri lankan",
                              "sri lanka",
                              "nepalese",
                              "nepal",
                            ],
                          },
                          {
                            value: "Rp",
                            label: "Rp - Indonesian Rupiah",
                            keywords: [
                              "idr",
                              "rupiah",
                              "indonesian",
                              "indonesia",
                            ],
                          },
                          {
                            value: "RM",
                            label: "RM - Malaysian Ringgit",
                            keywords: [
                              "myr",
                              "ringgit",
                              "malaysian",
                              "malaysia",
                            ],
                          },
                          {
                            value: "₸",
                            label: "₸ - Kazakhstani Tenge",
                            keywords: [
                              "kzt",
                              "tenge",
                              "kazakhstani",
                              "kazakhstan",
                            ],
                          },

                          // Middle East & Africa
                          {
                            value: "ج.م",
                            label: "ج.م - Egyptian Pound",
                            keywords: ["egp", "pound", "egyptian", "egypt"],
                          },
                          {
                            value: "ر.س",
                            label: "ر.س - Saudi Riyal",
                            keywords: ["sar", "riyal", "saudi", "saudi arabia"],
                          },
                          {
                            value: "د.إ",
                            label: "د.إ - UAE Dirham",
                            keywords: [
                              "aed",
                              "dirham",
                              "uae",
                              "emirates",
                              "united arab emirates",
                            ],
                          },
                          {
                            value: "ر.ق",
                            label: "ر.ق - Qatari Riyal",
                            keywords: ["qar", "riyal", "qatari", "qatar"],
                          },
                          {
                            value: "د.ب",
                            label: "د.ب - Bahraini Dinar",
                            keywords: ["bhd", "dinar", "bahraini", "bahrain"],
                          },
                          {
                            value: "د.ك",
                            label: "د.ك - Kuwaiti Dinar",
                            keywords: ["kwd", "dinar", "kuwaiti", "kuwait"],
                          },
                          {
                            value: "ر.ع",
                            label: "ر.ع - Omani Rial",
                            keywords: ["omr", "rial", "omani", "oman"],
                          },
                          {
                            value: "ر.أ",
                            label: "ر.أ - Jordanian Dinar",
                            keywords: ["jod", "dinar", "jordanian", "jordan"],
                          },
                          {
                            value: "ل.ل",
                            label: "ل.ل - Lebanese Pound",
                            keywords: ["lbp", "pound", "lebanese", "lebanon"],
                          },
                          {
                            value: "₪",
                            label: "₪ - Israeli Shekel",
                            keywords: ["ils", "shekel", "israeli", "israel"],
                          },
                          {
                            value: "R",
                            label: "R - South African Rand",
                            keywords: [
                              "zar",
                              "rand",
                              "south african",
                              "south africa",
                            ],
                          },
                          {
                            value: "₦",
                            label: "₦ - Nigerian Naira",
                            keywords: ["ngn", "naira", "nigerian", "nigeria"],
                          },
                          {
                            value: "GH₵",
                            label: "GH₵ - Ghanaian Cedi",
                            keywords: ["ghs", "cedi", "ghanaian", "ghana"],
                          },
                          {
                            value: "KSh",
                            label: "KSh - Kenyan Shilling",
                            keywords: ["kes", "shilling", "kenyan", "kenya"],
                          },
                          {
                            value: "USh",
                            label: "USh - Ugandan Shilling",
                            keywords: ["ugx", "shilling", "ugandan", "uganda"],
                          },
                          {
                            value: "Birr",
                            label: "Birr - Ethiopian Birr",
                            keywords: ["etb", "birr", "ethiopian", "ethiopia"],
                          },
                          {
                            value: "₣",
                            label: "₣ - CFA Franc",
                            keywords: [
                              "xaf",
                              "xof",
                              "franc",
                              "cfa",
                              "central african",
                              "west african",
                            ],
                          },

                          // Additional currencies
                          {
                            value: "¢",
                            label: "¢ - Cent",
                            keywords: ["cent", "cents"],
                          },
                          {
                            value: "₡",
                            label: "₡ - Costa Rican Colón",
                            keywords: [
                              "crc",
                              "colon",
                              "costa rican",
                              "costa rica",
                            ],
                          },
                          {
                            value: "₮",
                            label: "₮ - Mongolian Tögrög",
                            keywords: [
                              "mnt",
                              "tugrik",
                              "togrog",
                              "mongolian",
                              "mongolia",
                            ],
                          },
                          {
                            value: "﷼",
                            label: "﷼ - Rial",
                            keywords: ["rial", "riyal", "generic"],
                          },
                        ]}
                        placeholder="Select currency"
                        {...field}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be used for viewing purposes, such as displaying
                      prices and amounts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2Form.control}
                name="dateFormat"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Date Format</FormLabel>
                      <DateFormatHelp />
                    </div>
                    <FormControl>
                      <Input placeholder="DD/MM/YYYY" {...field} />
                    </FormControl>
                    <FormDescription>
                      Preview:{" "}
                      {dayjs().format(field.value || defaultFormats.dateFormat)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2Form.control}
                name="shortDateFormat"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Short Date Format (for charts)</FormLabel>
                      <DateFormatHelp />
                    </div>
                    <FormControl>
                      <Input placeholder="DD MMM" {...field} />
                    </FormControl>
                    <FormDescription>
                      Preview:{" "}
                      {dayjs().format(field.value || defaultFormats.dateFormat)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2Form.control}
                name="timeFormat"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Time Format</FormLabel>
                      <FormatHelpButton title="Time Format Help">
                        <div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Create your preferred time format using these
                            tokens:
                          </p>
                          <div className="space-y-2 text-sm">
                            <div>
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                H
                              </code>{" "}
                              - Hour (0-23)
                            </div>
                            <div>
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                HH
                              </code>{" "}
                              - Hour with zero padding (00-23)
                            </div>
                            <div>
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                h
                              </code>{" "}
                              - Hour 12-hour (1-12)
                            </div>
                            <div>
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                hh
                              </code>{" "}
                              - Hour 12-hour with zero padding (01-12)
                            </div>
                            <div>
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                m
                              </code>{" "}
                              - Minutes (0-59)
                            </div>
                            <div>
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                mm
                              </code>{" "}
                              - Minutes with zero padding (00-59)
                            </div>
                            <div>
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                A
                              </code>{" "}
                              - AM/PM
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">
                              Examples:
                            </p>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div>HH:mm → 14:30 (24-hour)</div>
                              <div>h:mm A → 2:30 PM (12-hour)</div>
                              <div>HH.mm → 14.30</div>
                            </div>
                          </div>
                        </div>
                      </FormatHelpButton>
                    </div>
                    <FormControl>
                      <Input placeholder="HH:mm" {...field} />
                    </FormControl>
                    <FormDescription>
                      Preview:{" "}
                      {dayjs()
                        .hour(14)
                        .minute(30)
                        .format(field.value || "HH:mm")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2Form.control}
                name="numberFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number Format</FormLabel>
                    <FormControl>
                      <ComboBox
                        options={[
                          { value: "en-US", label: "1,234.56 (US)" },
                          { value: "en-GB", label: "1,234.56 (UK)" },
                          { value: "de-DE", label: "1.234,56 (German)" },
                          { value: "fr-FR", label: "1 234,56 (French)" },
                          { value: "ja-JP", label: "1,234.56 (Japanese)" },
                        ]}
                        placeholder="Select number format"
                        {...field}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4 pb-safe">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBackToStep1}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Finish
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
