import React, { memo } from "react";
import { Textarea } from "../ui/textarea";
import { useDebouncedNoteInput } from "@/hooks/useDebouncedNoteInput";

interface DebouncedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  rows?: number;
}

const DebouncedTextarea = memo(
  ({
    value,
    onChange,
    placeholder,
    debounceMs = 500,
    className,
    rows = 3,
  }: DebouncedTextareaProps) => {
    const { value: debouncedValue, onChange: handleChange } =
      useDebouncedNoteInput({
        initialValue: value,
        onDebouncedChange: onChange,
        debounceMs,
      });

    return (
      <Textarea
        placeholder={placeholder}
        value={debouncedValue}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          handleChange(e.target.value)
        }
        rows={rows}
        className={className}
      />
    );
  }
);

DebouncedTextarea.displayName = "DebouncedTextarea";

export default DebouncedTextarea;
