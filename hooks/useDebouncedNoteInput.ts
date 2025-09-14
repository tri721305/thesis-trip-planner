import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounceCallback";

interface UseDebouncedNoteInputProps {
  initialValue: string;
  onDebouncedChange: (value: string) => void;
  debounceMs?: number;
}

export function useDebouncedNoteInput({
  initialValue,
  onDebouncedChange,
  debounceMs = 500,
}: UseDebouncedNoteInputProps) {
  // Local state for immediate UI updates
  const [localValue, setLocalValue] = useState(initialValue);

  // Debounced function to update the form
  const debouncedUpdate = useDebounce(onDebouncedChange, debounceMs);

  // Update local value when initial value changes (external updates)
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  // Handle input change with immediate local update and debounced form update
  const handleChange = useCallback(
    (value: string) => {
      setLocalValue(value); // Immediate UI update
      debouncedUpdate(value); // Debounced form update
    },
    [debouncedUpdate]
  );

  return {
    value: localValue,
    onChange: handleChange,
  };
}
