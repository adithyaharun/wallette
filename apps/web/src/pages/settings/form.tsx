import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import z from "zod";
import {
  DateFormatHelp,
  FormatHelpButton,
} from "../../components/fragments/welcome-setup-dialog";
import { useConfig } from "../../components/providers/ui-provider";
import { Button } from "../../components/ui/button";
import { ComboBox } from "../../components/ui/combobox";
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
import { currencies } from "../../data/currency";
import { db } from "../../lib/db";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string(),
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

export default function SettingsForm() {
  const { config } = useConfig();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: config?.name || "",
      dateFormat: config?.dateFormat || "",
      shortDateFormat: config?.shortDateFormat || "",
      timeFormat: config?.timeFormat || "",
      currencySymbol: config?.currencySymbol || "",
      numberFormat: config?.numberFormat || "",
    },
  });

  const configMutation = useMutation({
    mutationKey: ["config-update"],
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await db.config.update(1, {...data});
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const toastId = toast.loading("Updating settings...");

    try {
      await configMutation.mutateAsync(data);
      toast.success("Settings updated successfully!", { id: toastId });
      navigate("/");
    } catch (error) {
      console.error("Failed to update config:", error);
      toast.error("Failed to update settings.", { id: toastId });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          disabled={configMutation.isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
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
          control={form.control}
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
                Preview: {dayjs().format(field.value)}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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
                Preview: {dayjs().format(field.value)}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeFormat"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Time Format</FormLabel>
                <FormatHelpButton title="Time Format Help">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create your preferred time format using these tokens:
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
                      <p className="text-sm font-medium mb-2">Examples:</p>
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
          control={form.control}
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

        <div className="flex flex-col gap-2">
          <Button type="submit" className="flex-1">
            Save
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
