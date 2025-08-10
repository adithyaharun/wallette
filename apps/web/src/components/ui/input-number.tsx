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

    const formatNumber = React.useCallback(
      (num: string, showDecimals = true) => {
        let cleanNum = num.replace(/[^\d.-]/g, "");

        if (!allowNegative) {
          cleanNum = cleanNum.replace(/-/g, "");
        } else {
          const hasNegative = cleanNum.startsWith("-");
          cleanNum = cleanNum.replace(/-/g, "");
          if (hasNegative) cleanNum = `-${cleanNum}`;
        }

        const parts = cleanNum.split(".");
        let integerPart = parts[0] || "0";
        let decimalPart = parts[1] || "";

        integerPart = integerPart.replace(/^-?0+/, "") || "0";
        if (integerPart.startsWith("-0")) {
          integerPart = `-${integerPart.slice(2)}`;
        }

        if (decimalPart.length > decimalPlaces) {
          decimalPart = decimalPart.slice(0, decimalPlaces);
        }
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
          result += decimalSeparator + "0".repeat(decimalPlaces);
        }

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

      if (prefix && unmasked.startsWith(prefix)) {
        unmasked = unmasked.slice(prefix.length);
      }
      if (suffix && unmasked.endsWith(suffix)) {
        unmasked = unmasked.slice(0, -suffix.length);
      }

      unmasked = unmasked.replace(
        new RegExp(`\\${thousandSeparator}`, "g"),
        "",
      );

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
      if (mask === "currency" || mask === "number") {
        const unmasked = getUnmaskedValue(displayValue);
        setDisplayValue(unmasked);
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
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
