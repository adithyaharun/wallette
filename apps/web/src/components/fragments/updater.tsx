import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function Updater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log(`Service worker registered: ${r}`);
    },
    onRegisterError(error) {
      console.log(`SW registration error: ${error}`);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      console.log("Service Worker is ready for offline use");
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast.warning(
        <div className="flex flex-col gap-2">
          <div>
            There is new version of Wallette available. Click{" "}
            <strong>Reload</strong> to update.
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => updateServiceWorker(true)}>
              Reload
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setNeedRefresh(false);
                setOfflineReady(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>,
        {
          duration: Infinity,
        },
      );
    }
  }, [needRefresh, updateServiceWorker, setOfflineReady, setNeedRefresh]);

  return (
    <div className="hidden"></div> // Placeholder to avoid rendering issues
  );
}
