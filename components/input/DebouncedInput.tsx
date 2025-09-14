import React, { memo } from "react";
import { Input } from "../ui/input";
import { useDebouncedNoteInput } from "@/hooks/useDebouncedNoteInput";

interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  type?: string;
}

const DebouncedInput = memo(
  ({
    value,
    onChange,
    placeholder,
    debounceMs = 500,
    className,
    type = "text",
  }: DebouncedInputProps) => {
    const { value: debouncedValue, onChange: handleChange } =
      useDebouncedNoteInput({
        initialValue: value,
        onDebouncedChange: onChange,
        debounceMs,
      });

    return (
      <Input
        type={type}
        placeholder={placeholder}
        value={debouncedValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange(e.target.value)
        }
        className={className}
      />
    );
  }
);

DebouncedInput.displayName = "DebouncedInput";

export default DebouncedInput;
