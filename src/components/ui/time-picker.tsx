import { Clock } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface TimePickerProps {
  value?: string;
  onValueChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
}

export function TimePicker({
  onValueChange,
  value,
  placeholder = "Select time",
  disabled = false,
  className,
  buttonClassName,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hours, setHours] = React.useState("12");
  const [minutes, setMinutes] = React.useState("00");
  const [period, setPeriod] = React.useState<"AM" | "PM">("PM");

  React.useEffect(() => {
    if (value) {
      const [time, periodPart] = value.split(" ");
      const [h, m] = time.split(":");
      setHours(h);
      setMinutes(m);
      setPeriod(periodPart as "AM" | "PM");
    }
  }, [value]);

  const formatTime = (h: string, m: string, p: "AM" | "PM") => {
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")} ${p}`;
  };

  const handleTimeChange = (
    newHours: string,
    newMinutes: string,
    newPeriod: "AM" | "PM",
  ) => {
    const formattedTime = formatTime(newHours, newMinutes, newPeriod);
    onValueChange?.(formattedTime);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = e.target.value;
    if (h === "" || (Number(h) >= 1 && Number(h) <= 12)) {
      setHours(h);
      handleTimeChange(h, minutes, period);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = e.target.value;
    if (m === "" || (Number(m) >= 0 && Number(m) <= 59)) {
      setMinutes(m);
      handleTimeChange(hours, m, period);
    }
  };

  const handlePeriodToggle = () => {
    const newPeriod = period === "AM" ? "PM" : "AM";
    setPeriod(newPeriod);
    handleTimeChange(hours, minutes, newPeriod);
  };

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
            <Clock className="mr-2 h-4 w-4" />
            {value ? <span>{value}</span> : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="hours-input"
                className="text-xs text-muted-foreground"
              >
                Hours
              </label>
              <Input
                id="hours-input"
                type="number"
                min="1"
                max="12"
                value={hours}
                onChange={handleHoursChange}
                className="w-16 text-center"
                placeholder="12"
              />
            </div>
            <div className="flex items-center justify-center h-9">
              <span className="text-lg font-mono">:</span>
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="minutes-input"
                className="text-xs text-muted-foreground"
              >
                Minutes
              </label>
              <Input
                id="minutes-input"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={handleMinutesChange}
                className="w-16 text-center"
                placeholder="00"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="period-button"
                className="text-xs text-muted-foreground"
              >
                Period
              </label>
              <Button
                id="period-button"
                variant="outline"
                size="sm"
                onClick={handlePeriodToggle}
                className="w-16"
              >
                {period}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
