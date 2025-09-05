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
import { currencies } from "../../data/currency";
import { useIsMobile } from "../../hooks/use-mobile";
import { db } from "../../lib/db";
import { Button } from "../ui/button";
import { ComboBox } from "../ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

const step2Schema = z.object({
  dateFormat: z
    .string()
    .min(1, "Date format is required")
    .refine(
      (format) => {
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

  const formatter = new Intl.DateTimeFormat(locale);
  const parts = formatter.formatToParts(today);

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
        break;
      case "literal":
        dateFormat += part.value;
        if (shortDateFormat && !shortDateFormat.endsWith(" ")) {
          shortDateFormat += part.value === "/" ? " " : part.value;
        }
        break;
    }
  });

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

type WelcomeSetupDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function WelcomeSetupDialog({
  isOpen,
  onClose,
}: WelcomeSetupDialogProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState<
    "welcome" | "setup-name" | "setup-preferences"
  >("welcome");
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
    setCurrentStep("setup-preferences");
  };

  const onStep2Submit = async (step2Data: Step2FormData) => {
    if (!step1Data) {
      toast.error("Something went wrong. Please restart the setup.");
      setCurrentStep("setup-name");
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
      onClose();
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Setup failed. Please try again.");
    }
  };

  const dialogContent = (
    <div className="space-y-6">
      {currentStep === "welcome" && (
        <div className="space-y-6 text-center">
          <img
            src="/wallette.webp"
            alt="Wallette Logo"
            width={64}
            className="mx-auto"
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Welcome to Wallette!</h1>
            <p className="text-sm text-muted-foreground">
              Your personal finance companion. Track your expenses, manage
              budgets, and take control of your financial future everywhere you
              go.
            </p>
            <p className="text-sm text-muted-foreground">
              No matter where you are, you can access Wallette in most
              situations even when you have no internet. Start your financial
              journey today!
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">
              Have you used Wallette before?
            </p>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => {
                  onClose();
                  navigate("/restore");
                }}
              >
                Yes, Restore My Data
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCurrentStep("setup-name")}
              >
                No, I'm New Here
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If you have a backup file from another device, choose "Restore My
              Data"
            </p>
          </div>
        </div>
      )}

      {currentStep === "setup-name" && (
        <div className="space-y-6">
          <div className="text-center">
            <img
              src="/wallette.webp"
              alt="Wallette Logo"
              width={48}
              className="mx-auto mb-4"
            />
            <h2 className="text-lg font-semibold">Let's get started!</h2>
          </div>

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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("welcome")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {currentStep === "setup-preferences" && (
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
                        options={currencies}
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
                                HH
                              </code>{" "}
                              - Hour (00-23)
                            </div>
                            <div>
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                h
                              </code>{" "}
                              - Hour 12-hour (1-12)
                            </div>
                            <div>
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                mm
                              </code>{" "}
                              - Minutes (00-59)
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
                          { value: "en-US", label: "1,234.56" },
                          { value: "de-DE", label: "1.234,56" },
                          { value: "fr-FR", label: "1 234,56" },
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

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("setup-name")}
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

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          showCloseButton={false}
          className="w-full h-[100vh] max-w-full rounded-none flex flex-col p-6 overflow-y-auto"
        >
          <DialogHeader className="text-left">
            <DialogTitle className="sr-only">Welcome to Wallette</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-lg">{dialogContent}</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Welcome to Wallette</DialogTitle>
        </DialogHeader>
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
}
