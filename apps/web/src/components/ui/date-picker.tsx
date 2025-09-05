import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsMobile } from "../../hooks/use-mobile";
import { useUI } from "../providers/ui-provider";

export interface DatePickerProps {
  value?: Date | null;
  onValueChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  dateFormat?: string;
  fromDate?: Date;
  toDate?: Date;
  disabledDays?: (date: Date) => boolean;
}

export function DatePicker({
  onValueChange,
  value,
  placeholder = "Pick a date",
  disabled = false,
  className,
  buttonClassName,
  dateFormat,
  fromDate,
  toDate,
  disabledDays,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { config } = useUI();

  const handleSelect = (date: Date | undefined) => {
    onValueChange?.(date || null);
    setOpen(false);
  };

  if (!isMobile) {
    return (
      <div className={cn("relative", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!value}
              disabled={disabled}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                "data-[empty=true]:text-muted-foreground",
                buttonClassName,
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                dayjs(value).format(
                  dateFormat || config?.dateFormat || "DD/MM/YYYY",
                )
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={handleSelect}
              disabled={(date) => {
                if (disabledDays?.(date)) return true;
                if (fromDate && date < fromDate) return true;
                if (toDate && date > toDate) return true;
                return false;
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            data-empty={!value}
            disabled={disabled}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              "data-[empty=true]:text-muted-foreground",
              buttonClassName,
            )}
          >
            <CalendarIcon className="mr-2" />
            {value ? (
              dayjs(value).format(
                dateFormat || config?.dateFormat || "DD/MM/YYYY",
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader style={{ display: "none" }}>
            <DrawerTitle></DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <div>
            <Calendar
              className="mx-auto"
              classNames={{
                day_button: "text-md",
              }}
              mode="single"
              selected={value || undefined}
              onSelect={handleSelect}
              autoFocus
              disabled={(date) => {
                if (disabledDays?.(date)) return true;
                if (fromDate && date < fromDate) return true;
                if (toDate && date > toDate) return true;
                return false;
              }}
            />
          </div>
          <DrawerFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
