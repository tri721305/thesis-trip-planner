import React, { memo } from "react";
import { FaNoteSticky } from "react-icons/fa6";
import InputWithIcon from "./InputIcon";
import { useDebouncedNoteInput } from "@/hooks/useDebouncedNoteInput";

interface DebouncedNoteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

const DebouncedNoteInput = memo(
  ({
    value,
    onChange,
    placeholder = "Write or paste notes here",
    debounceMs = 500,
    className,
  }: DebouncedNoteInputProps) => {
    const { value: debouncedValue, onChange: handleChange } =
      useDebouncedNoteInput({
        initialValue: value,
        onDebouncedChange: onChange,
        debounceMs,
      });

    return (
      <InputWithIcon
        placeholder={placeholder}
        icon={<FaNoteSticky />}
        value={debouncedValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange(e.target.value)
        }
        className={className}
      />
    );
  }
);

DebouncedNoteInput.displayName = "DebouncedNoteInput";

export default DebouncedNoteInput;
