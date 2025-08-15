import { zodResolver } from "@hookform/resolvers/zod";
import { DownloadIcon, FileIcon, UploadIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useTransporter } from "../../components/providers/ui-provider/transporter-context";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";

const importSchema = z.object({
  backupFile: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Please select a backup file")
    .refine(
      (file) => file.name.endsWith(".json"),
      "Please select a valid Wallette workspace file (.json / .json)",
    ),
});

type ImportFormData = z.infer<typeof importSchema>;

export default function ImportPage() {
  const navigate = useNavigate();
  const { import: importBackup, importProgress } = useTransporter();

  const form = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
  });

  const onSubmit = async (data: ImportFormData) => {
    try {
      await importBackup(data.backupFile);
      toast.success("Backup imported successfully! Welcome back to Wallette.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Import failed:", error);

      let errorMessage = "Failed to import backup file. ";
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please check the file format and try again.";
      }

      toast.error(errorMessage);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("backupFile", file);
      form.clearErrors("backupFile");
    }
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
          <h1 className="text-2xl font-bold">Restore Your Data</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Do you have a backup file from another device? Upload it here to
            restore your data.
          </p>
        </div>
      </div>

      <div className="border border-dashed border-muted-foreground/25 rounded-lg p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <FileIcon className="w-6 h-6 text-muted-foreground" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="backupFile"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel className="cursor-pointer inline-flex items-center gap-2 px-4 h-9 bg-secondary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    <UploadIcon className="w-4 h-4" />
                    Choose Backup File
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".json"
                      className="sr-only"
                      onChange={handleFileChange}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("backupFile") && (
              <div className="text-sm text-muted-foreground">
                Selected: {form.watch("backupFile").name}
              </div>
            )}

            {/* Show import progress if importing */}
            {importProgress && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Importing... {importProgress.completedRows} /{" "}
                  {importProgress.totalRows} rows
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(importProgress.completedRows / (importProgress.totalRows || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={!form.watch("backupFile") || !!importProgress}
                className="w-full"
              >
                {importProgress ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </div>
                ) : (
                  <>
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Import Backup
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="text-center space-y-2">
        <Button variant="link" className="h-auto" asChild>
          <Link to="/setup">Skip this Section</Link>
        </Button>
      </div>
    </div>
  );
}
