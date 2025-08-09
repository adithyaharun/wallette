import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import type { Config } from "../../@types/config";
import { Button } from "../../components/ui/button";
import { ComboBox } from "../../components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { db } from "../../lib/db";

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

const step2Schema = z.object({
  dateFormat: z.string(),
  timeFormat: z.string(),
  currencySymbol: z.string(),
  numberFormat: z.string(),
});

const fullSchema = step1Schema.and(step2Schema);

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;
type FullFormData = z.infer<typeof fullSchema>;

export default function SetupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null);

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
    },
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      currencySymbol: "$",
      numberFormat: "en-US",
    },
  });

  const onStep1Submit = (data: Step1FormData) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const onStep2Submit = async (data: Step2FormData) => {
    if (!step1Data) {
      toast.error("Something went wrong. Please restart the setup.");
      setCurrentStep(1);
      return;
    }

    try {
      const fullData: FullFormData = {
        ...step1Data,
        ...data,
      };

      const config: Omit<Config, "id"> = {
        ...fullData,
        setupCompleted: true,
      };

      await db.config.put({ id: 1, ...config });

      // Initialize default categories if they don't exist
      const existingTransactionCategories =
        await db.transactionCategories.toArray();
      if (existingTransactionCategories.length === 0) {
        await db.transactionCategories.bulkAdd([
          {
            id: 1,
            name: "Income",
            type: "income",
            description: "Money received",
          },
          {
            id: 2,
            name: "Expense",
            type: "expense",
            description: "Money spent",
          },
        ]);
      }

      const existingAssetCategories = await db.assetCategories.toArray();
      if (existingAssetCategories.length === 0) {
        await db.assetCategories.bulkAdd([
          {
            id: 1,
            name: "Cash",
            description: "Physical cash and checking accounts",
          },
          {
            id: 2,
            name: "Savings",
            description: "Savings accounts and deposits",
          },
          {
            id: 3,
            name: "Investments",
            description: "Stocks, bonds, and other investments",
          },
        ]);
      }

      toast.success("Welcome to Wallette! Setup completed successfully.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Setup failed:", error);
      toast.error("Setup failed. Please try again.");
    }
  };

  const goBackToStep1 = () => {
    setCurrentStep(1);
  };

  return (
    <div className="w-full max-w-lg mx-auto h-screen flex flex-col justify-center px-4 space-y-6">
      <div className="space-y-4">
        <img
          src="/pwa-192x192.png"
          alt="Wallette Logo"
          width={48}
          className="mx-auto"
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold">Let's get started!</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Just a few quick steps to personalize your experience.
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 justify-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {currentStep > 1 ? <CheckIcon className="w-4 h-4" /> : "1"}
        </div>
        <div className="w-8 h-0.5 bg-muted" />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
      </div>

      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold">What's your name?</h2>
            <p className="text-sm text-muted-foreground">
              This helps us personalize your experience.
            </p>
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
                    <FormLabel>Your Name</FormLabel>
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
                          { value: "$", label: "$ (Dollar)" },
                          { value: "€", label: "€ (Euro)" },
                          { value: "£", label: "£ (Pound)" },
                          { value: "¥", label: "¥ (Yen/Yuan)" },
                          { value: "₹", label: "₹ (Rupee)" },
                          { value: "₽", label: "₽ (Ruble)" },
                          { value: "₩", label: "₩ (Won)" },
                          { value: "R", label: "R (Rand)" },
                        ]}
                        placeholder="Select currency"
                        {...field}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2Form.control}
                name="dateFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Format</FormLabel>
                    <FormControl>
                      <ComboBox
                        options={[
                          {
                            value: "DD/MM/YYYY",
                            label: "DD/MM/YYYY (31/12/2023)",
                          },
                          {
                            value: "MM/DD/YYYY",
                            label: "MM/DD/YYYY (12/31/2023)",
                          },
                          {
                            value: "YYYY-MM-DD",
                            label: "YYYY-MM-DD (2023-12-31)",
                          },
                        ]}
                        placeholder="Select date format"
                        {...field}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2Form.control}
                name="timeFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Format</FormLabel>
                    <FormControl>
                      <ComboBox
                        options={[
                          { value: "24h", label: "24 Hour (14:30)" },
                          { value: "12h", label: "12 Hour (2:30 PM)" },
                        ]}
                        placeholder="Select time format"
                        {...field}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
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

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBackToStep1}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Complete Setup
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
