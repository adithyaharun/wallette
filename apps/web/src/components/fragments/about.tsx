import packageJson from "../../../package.json";
import { useUI } from "../providers/ui-provider";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

export default function AboutDialog() {
  const { setAboutOpen, isAboutOpen } = useUI();

  return (
    <Dialog open={isAboutOpen} onOpenChange={setAboutOpen}>
      <DialogContent>
        <DialogTitle></DialogTitle>
        <div className="flex flex-col items-center space-y-8 mt-4">
          <img src="/pwa-192x192.png" className="size-20" alt="Wallette logo" />
          <div className="space-y-2 text-center">
            <h4 className="font-bold text-lg">Wallette.</h4>
            <div className="text-sm">
              A personal finance management app that helps you track your
              expenses, incomes, and budgets effortlessly.
            </div>
            <div className="text-sm text-muted-foreground">
              Version: {packageJson.version}
            </div>
            <div className="text-sm flex justify-center space-x-4">
              <Button variant="link" size="sm" asChild>
                <a
                  href="https://pages.wallette.id/policies/terms-of-service"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Terms of Service
                </a>
              </Button>
              <Button variant="link" size="sm" asChild>
                <a
                  href="https://pages.wallette.id/policies/privacy-policy"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Privacy Policy
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
