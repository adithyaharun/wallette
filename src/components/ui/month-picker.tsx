"use client";

import dayjs, { type Dayjs } from "dayjs";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsMobile } from "../../hooks/use-mobile";

export interface MonthPickerProps {
  value?: Dayjs | null;
  onValueChange?: (date: Dayjs | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  format?: string;
  showToday?: boolean;
}

export function MonthPicker({
  value = dayjs(),
  onValueChange,
  placeholder = "Select month",
  disabled = false,
  className,
  buttonClassName,
  format = "MMMM YYYY",
  showToday = true,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(
    value ? value.year() : dayjs().year(),
  );
  const isMobile = useIsMobile();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleMonthSelect = (monthIndex: number) => {
    const selectedDate = dayjs().year(currentYear).month(monthIndex);
    onValueChange?.(selectedDate);
    setOpen(false);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    setCurrentYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  const handleTodayClick = () => {
    const today = dayjs();
    setCurrentYear(today.year());
  };

  const MonthPickerContent = () => (
    <div className="md:w-80 p-4 md:p-6">
      {/* Year Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleYearChange("prev")}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">{currentYear}</h3>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleYearChange("next")}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Months Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {months.map((month, index) => {
          const isSelected =
            value && value.year() === currentYear && value.month() === index;
          const isCurrentMonth =
            dayjs().year() === currentYear && dayjs().month() === index;

          return (
            <Button
              key={month}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-10 text-sm",
                isCurrentMonth && !isSelected && "border-primary",
                isSelected && "bg-primary text-primary-foreground",
              )}
              onClick={() => handleMonthSelect(index)}
            >
              {month.slice(0, 3)}
            </Button>
          );
        })}
      </div>

      {/* Today Button */}
      {showToday && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleTodayClick}
            className="text-sm w-full"
          >
            Today
          </Button>
        </div>
      )}
    </div>
  );

  if (!isMobile) {
    return (
      <div className={cn("relative", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !value && "text-muted-foreground",
                buttonClassName,
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? value.format(format) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <MonthPickerContent />
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
            disabled={disabled}
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground",
              buttonClassName,
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {value ? value.format(format) : placeholder}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <MonthPickerContent />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
