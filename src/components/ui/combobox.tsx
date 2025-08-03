import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsMobile } from "../../hooks/use-mobile";

export type ComboBoxOption = {
  value: string;
  label: React.JSX.Element | string;
  keywords?: string[];
};

export type ComboBoxGroup = {
  label: string;
  options: ComboBoxOption[];
};

const isGroupedOptions = (
  options: ComboBoxOption[] | ComboBoxGroup[],
): options is ComboBoxGroup[] => {
  return options.length > 0 && "options" in options[0];
};

const getAllOptions = (
  options: ComboBoxOption[] | ComboBoxGroup[],
): ComboBoxOption[] => {
  if (isGroupedOptions(options)) {
    return options.flatMap((group) => group.options);
  }
  return options;
};

export interface ComboBoxProps {
  options: ComboBoxOption[] | ComboBoxGroup[];
  value?: string;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  width?: string;
}

export function ComboBox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search options...",
  emptyText = "No results found.",
  className,
  disabled = false,
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const allOptions = getAllOptions(options);

  const [selectedOption, setSelectedOption] =
    React.useState<ComboBoxOption | null>(
      value
        ? allOptions.find((option) => option.value === value) || null
        : null,
    );

  React.useEffect(() => {
    if (value !== undefined) {
      const option =
        allOptions.find((option) => option.value === value) || null;
      setSelectedOption(option);
    }
  }, [value, allOptions]);

  const handleSelect = (newValue: string) => {
    const option = allOptions.find((opt) => opt.value === newValue) || null;
    setSelectedOption(option);
    onValueChange?.(option?.value || null);
    setOpen(false);
  };

  if (!isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(`justify-between`, className)}
            disabled={disabled}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <OptionList
            options={options}
            onSelect={handleSelect}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={cn(`justify-between`, className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronDownIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 h-80 border-y">
          <OptionList
            options={options}
            onSelect={handleSelect}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
          />
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="destructive">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function OptionList({
  options,
  onSelect,
  searchPlaceholder,
  emptyText,
}: {
  options: ComboBoxOption[] | ComboBoxGroup[];
  onSelect: (value: string) => void;
  searchPlaceholder: string;
  emptyText: string;
}) {
  const isGrouped = isGroupedOptions(options);

  return (
    <Command>
      <CommandInput placeholder={searchPlaceholder} />
      <CommandList>
        <CommandEmpty>{emptyText}</CommandEmpty>
        {isGrouped ? (
          options.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.options.map((option) => (
                <CommandItem
                  key={option.value}
                  keywords={option.keywords}
                  value={option.value}
                  onSelect={onSelect}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))
        ) : (
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                keywords={option.keywords}
                value={option.value}
                onSelect={(value) => {
                  onSelect(value);
                }}
              >
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
