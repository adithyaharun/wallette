import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useIsMobile } from "../../hooks/use-mobile";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isMobile = useIsMobile();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      offset={{
        bottom: "calc(24px + env(safe-area-inset-bottom))",
        top: "calc(4rem + 24px + env(safe-area-inset-top))",
        left: "calc(24px + env(safe-area-inset-left))",
        right: "calc(24px + env(safe-area-inset-right))",
      }}
      mobileOffset={{
        bottom: "calc(1rem + env(safe-area-inset-bottom))",
        top: "calc(1rem + 4rem + env(safe-area-inset-top))",
        left: "calc(1rem + env(safe-area-inset-left))",
        right: "calc(1rem + env(safe-area-inset-right))",
      }}
      position={isMobile ? "bottom-center" : "bottom-right"}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
