import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { useGoogleDrive } from "../../../hooks/use-google-drive";
import { useAuthStore } from "../../../store/auth";

export function GoogleButton() {
  const authStore = useAuthStore();
  const googleDrive = useGoogleDrive();

  const handleLogin = async () => {
    try {
      await googleDrive.requestAccessToken();
      const userInfo = await googleDrive.requestUserInfo();

      authStore.login({
        id: userInfo.sub,
        name: userInfo.name,
        picture: userInfo.picture,
      });
    } catch (error) {
      toast.error(`Login failed.`, {
        description:
          error instanceof Error
            ? `Additional message: ${error.message}`
            : "Unknown error occurred.",
      });
    }
  };

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={() => handleLogin()}
      disabled={googleDrive.isLoading}
    >
      <div className="flex items-center justify-center gap-2">
        {googleDrive.isLoading ? (
          <>
            <Loader2Icon className="animate-spin h-5 w-5" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <img
              src="/assets/google.svg"
              alt="Google Icon"
              className="h-5 w-5"
            />
            <span>Sign In with Google</span>
          </>
        )}
      </div>
    </Button>
  );
}
