import { useIsMobile } from "../../hooks/use-mobile";
import { useTheme, useUI } from "../providers/ui-provider";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export function ThemeSwitcher({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { theme, setTheme } = useUI();

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Switch Theme</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            <ToggleGroup
              type="single"
              className="w-full"
              variant="primary"
              onValueChange={(selectedTheme) =>
                setTheme(selectedTheme as typeof theme)
              }
              value={theme}
            >
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system">System</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
