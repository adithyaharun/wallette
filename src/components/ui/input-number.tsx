import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface InputNumberProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value?: string | number;
  onChange?: (value: string) => void;
  mask?: "currency" | "number" | "phone" | "custom";
  decimalPlaces?: number;
  allowNegative?: boolean;
  prefix?: string;
  suffix?: string;
  thousandSeparator?: string;
  decimalSeparator?: string;
  customMask?: (value: string) => string;
}

export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      className,
      value = "",
      onChange,
      mask = "currency",
      decimalPlaces = 2,
      allowNegative = false,
      prefix = "",
      suffix = "",
      thousandSeparator = ",",
      decimalSeparator = ".",
      customMask,
      onBlur,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    // Format number with separators
    const formatNumber = React.useCallback(
      (num: string, showDecimals = true) => {
        // Remove all non-numeric characters except decimal point and minus
        let cleanNum = num.replace(/[^\d.-]/g, "");

        // Handle negative numbers
        if (!allowNegative) {
          cleanNum = cleanNum.replace(/-/g, "");
        } else {
          // Ensure only one minus sign at the beginning
          const hasNegative = cleanNum.startsWith("-");
          cleanNum = cleanNum.replace(/-/g, "");
          if (hasNegative) cleanNum = "-" + cleanNum;
        }

        // Handle decimal places
        const parts = cleanNum.split(".");
        let integerPart = parts[0] || "0";
        let decimalPart = parts[1] || "";

        // Remove leading zeros except for the last one
        integerPart = integerPart.replace(/^-?0+/, "") || "0";
        if (integerPart.startsWith("-0")) {
          integerPart = "-" + integerPart.slice(2);
        }

        // Limit decimal places
        if (decimalPart.length > decimalPlaces) {
          decimalPart = decimalPart.slice(0, decimalPlaces);
        } // Add thousand separators
        const isNegative = integerPart.startsWith("-");
        const absInteger = integerPart.replace("-", "");
        const formattedInteger = absInteger.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          thousandSeparator,
        );

        let result = (isNegative ? "-" : "") + formattedInteger;

        if (showDecimals && (decimalPart || isFocused)) {
          result += decimalSeparator + decimalPart;
        } else if (
          showDecimals &&
          decimalPlaces > 0 &&
          !isFocused &&
          cleanNum
        ) {
          // Add trailing zeros when not focused for display
          result += decimalSeparator + "0".repeat(decimalPlaces);
        }

        // Only add prefix/suffix when not focused to avoid editing issues
        if (!isFocused) {
          return prefix + result + suffix;
        }

        return result;
      },
      [
        allowNegative,
        decimalPlaces,
        thousandSeparator,
        decimalSeparator,
        isFocused,
        prefix,
        suffix,
      ],
    );

    const getUnmaskedValue = (maskedValue: string) => {
      let unmasked = maskedValue;

      // Remove prefix and suffix more carefully
      if (prefix && unmasked.startsWith(prefix)) {
        unmasked = unmasked.slice(prefix.length);
      }
      if (suffix && unmasked.endsWith(suffix)) {
        unmasked = unmasked.slice(0, -suffix.length);
      }

      // Remove thousand separators
      unmasked = unmasked.replace(
        new RegExp(`\\${thousandSeparator}`, "g"),
        "",
      );

      // Convert decimal separator to standard dot
      if (decimalSeparator !== ".") {
        unmasked = unmasked.replace(decimalSeparator, ".");
      }

      return unmasked;
    };

    const applyMask = React.useCallback(
      (inputValue: string) => {
        if (customMask) {
          return customMask(inputValue);
        }

        switch (mask) {
          case "currency":
          case "number":
            return formatNumber(
              inputValue,
              !isFocused || inputValue.includes("."),
            );
          case "phone": {
            // Simple phone mask (US format)
            const phoneDigits = inputValue.replace(/\D/g, "");
            if (phoneDigits.length <= 3) return phoneDigits;
            if (phoneDigits.length <= 6)
              return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`;
            return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`;
          }
          default:
            return inputValue;
        }
      },
      [customMask, mask, formatNumber, isFocused],
    );

    // Update display value when external value changes
    React.useEffect(() => {
      if (value !== undefined) {
        const stringValue =
          typeof value === "number" ? value.toString() : value;
        setDisplayValue(applyMask(stringValue));
      }
    }, [value, applyMask]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const maskedValue = applyMask(inputValue);

      setDisplayValue(maskedValue);

      if (onChange) {
        const unmaskedValue = getUnmaskedValue(maskedValue);
        onChange(unmaskedValue);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // When focused, show raw number for easier editing
      if (mask === "currency" || mask === "number") {
        const unmasked = getUnmaskedValue(displayValue);
        setDisplayValue(unmasked);
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // When blurred, format the number nicely
      if (mask === "currency" || mask === "number") {
        const formatted = applyMask(displayValue);
        setDisplayValue(formatted);
      }
      onBlur?.(e);
    };

    return (
      <Input
        className={cn("", className)}
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  },
);

InputNumber.displayName = "InputNumber";
