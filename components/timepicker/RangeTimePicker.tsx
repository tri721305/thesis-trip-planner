import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ClockIcon, EditIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface RangeTimePickerProps {
  value?: TimeRange;
  onChange?: (value: TimeRange) => void;
  className?: string;
  disabled?: boolean;
}

const RangeTimePicker: React.FC<RangeTimePickerProps> = ({
  value,
  onChange,
  className,
  disabled = false,
}) => {
  // Initialize state with value from props if available
  const [selectedStartTime, setSelectedStartTime] = useState<string>(
    value?.startTime || ""
  );
  const [selectedEndTime, setSelectedEndTime] = useState<string>(
    value?.endTime || ""
  );
  const [activeInput, setActiveInput] = useState<"start" | "end" | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  // Generate time slots (every 30 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Sync with external value - use refs to prevent infinite loops
  const prevValueRef = useRef(value);

  useEffect(() => {
    console.log("🔄 RangeTimePicker useEffect triggered with value:", value);
    console.log("🔄 Current internal state:", {
      selectedStartTime,
      selectedEndTime,
    });
    console.log("🔄 Previous value ref:", prevValueRef.current);

    // Always update if value prop exists and is different from previous ref
    if (
      value &&
      (!prevValueRef.current ||
        prevValueRef.current.startTime !== value.startTime ||
        prevValueRef.current.endTime !== value.endTime)
    ) {
      const valueStartTime = value.startTime || "";
      const valueEndTime = value.endTime || "";

      console.log("🔄 Value prop changed, updating internal state:", {
        from: prevValueRef.current,
        to: value,
      });

      setSelectedStartTime(valueStartTime);
      setSelectedEndTime(valueEndTime);
      prevValueRef.current = value;
    }
  }, [value]); // Remove selectedStartTime, selectedEndTime from dependencies

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    console.log("⏰ handleTimeSelect called:", {
      time,
      activeInput,
      selectedStartTime,
      selectedEndTime,
    });

    if (activeInput === "start") {
      console.log("⏰ Setting start time:", time);
      setSelectedStartTime(time);
      if (selectedEndTime && time >= selectedEndTime) {
        // Auto-adjust end time if start time is after or equal to end time
        const nextSlotIndex = timeSlots.indexOf(time) + 1;
        if (nextSlotIndex < timeSlots.length) {
          console.log(
            "⏰ Auto-adjusting end time to:",
            timeSlots[nextSlotIndex]
          );
          setSelectedEndTime(timeSlots[nextSlotIndex]);
        }
      }

      // Auto-focus to end time selection after selecting start time
      setTimeout(() => {
        console.log("⏰ Auto-switching to end time input");
        setActiveInput("end");
      }, 150); // Small delay for smooth UX
    } else if (activeInput === "end") {
      if (selectedStartTime && time <= selectedStartTime) {
        // Don't allow end time to be before or equal to start time
        console.warn("⏰ End time cannot be before or equal to start time");
        return;
      }
      console.log("⏰ Setting end time:", time);
      setSelectedEndTime(time);
    } else {
      console.warn("⏰ No active input set");
    }
  };

  // Handle save
  const handleSave = () => {
    console.log("💾 RangeTimePicker handleSave called:", {
      selectedStartTime,
      selectedEndTime,
    });
    if (selectedStartTime && selectedEndTime && onChange) {
      const timeRange = {
        startTime: selectedStartTime,
        endTime: selectedEndTime,
      };
      console.log("💾 Calling onChange with:", timeRange);

      // Use setTimeout to ensure proper state update order
      setTimeout(() => {
        onChange(timeRange);
      }, 0);
    } else {
      console.warn("⚠️ Save failed - missing data:", {
        hasStartTime: !!selectedStartTime,
        hasEndTime: !!selectedEndTime,
        hasOnChange: !!onChange,
      });
    }
    setActiveInput(null);
    setIsPopoverOpen(false);
  };

  // Handle clear
  const handleClear = () => {
    console.log("🗑️ RangeTimePicker handleClear called");
    setSelectedStartTime("");
    setSelectedEndTime("");
    setActiveInput(null);
    if (onChange) {
      onChange({ startTime: "", endTime: "" });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    console.log("❌ RangeTimePicker handleCancel called");
    // Reset to original values
    if (value) {
      console.log("❌ Resetting to original values:", value);
      setSelectedStartTime(value.startTime || "");
      setSelectedEndTime(value.endTime || "");
    } else {
      console.log("❌ No original values to reset to");
    }
    setActiveInput(null);
    setIsPopoverOpen(false);
  };

  // Handle popover open change
  const handlePopoverOpenChange = (open: boolean) => {
    console.log("📂 Popover open change:", {
      open,
      selectedStartTime,
      selectedEndTime,
    });
    setIsPopoverOpen(open);
    if (open && !selectedStartTime && !selectedEndTime) {
      // Auto-focus to start time when opening popover for the first time
      console.log("📂 Auto-focusing to start time");
      setTimeout(() => {
        setActiveInput("start");
      }, 100);
    } else if (!open) {
      console.log("📂 Clearing active input");
      setActiveInput(null);
    }
  };

  // Check if time slot should be disabled
  const isTimeSlotDisabled = (time: string) => {
    if (activeInput === "end" && selectedStartTime) {
      return time <= selectedStartTime;
    }
    return false;
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      {/* Always show as Popover - either "Add time" or selected time range */}
      <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-fit p-2 h-[40px] justify-between text-left text-[10px] border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors",
              !disabled && "hover:bg-gray-50"
            )}
            disabled={disabled}
          >
            {selectedEndTime && selectedStartTime ? (
              <div className="flex items-center">
                {/* <ClockIcon className="mr-2 h-4 w-4 text-blue-600" /> */}
                <span className="text-blue-600 font-medium text-sm">
                  🕐 {selectedStartTime} — {selectedEndTime}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <ClockIcon className="mr-2 h-4 w-4" />
                <span className="text-sm">Add time</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardContent className="p-6">
              <div className="mb-4">
                <Label className="text-base font-semibold text-gray-800">
                  {selectedStartTime && selectedEndTime
                    ? "Edit Time Range"
                    : "Select Time Range"}
                </Label>
              </div>

              {/* Time Range Display */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-600 mb-1 block">
                    Start time
                  </Label>
                  <Button
                    variant={activeInput === "start" ? "default" : "outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedStartTime && "text-muted-foreground"
                    )}
                    onClick={() => {
                      console.log("🎯 Start time button clicked");
                      setActiveInput("start");
                    }}
                  >
                    <ClockIcon className="mr-2 h-4 w-4" />
                    {selectedStartTime || "Select time"}
                  </Button>
                </div>

                <div className="mx-4 text-gray-400">—</div>

                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-600 mb-1 block">
                    End time
                  </Label>
                  <Button
                    variant={activeInput === "end" ? "default" : "outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedEndTime && "text-muted-foreground",
                      activeInput === "end" &&
                        "bg-blue-500 text-white hover:bg-blue-600"
                    )}
                    onClick={() => {
                      console.log("🎯 End time button clicked");
                      setActiveInput("end");
                    }}
                  >
                    <ClockIcon className="mr-2 h-4 w-4" />
                    {selectedEndTime || "Select time"}
                  </Button>
                </div>
              </div>

              {/* Time Slots */}
              {activeInput && (
                <div className="mb-6">
                  <ScrollArea className="h-64 w-full rounded-md border">
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={
                              (activeInput === "start" &&
                                time === selectedStartTime) ||
                              (activeInput === "end" &&
                                time === selectedEndTime)
                                ? "default"
                                : "ghost"
                            }
                            className={cn(
                              "justify-start text-left h-12",
                              (activeInput === "start" &&
                                time === selectedStartTime) ||
                                (activeInput === "end" &&
                                  time === selectedEndTime)
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "hover:bg-gray-100",
                              isTimeSlotDisabled(time) &&
                                "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => {
                              console.log("🎯 Time slot clicked:", {
                                time,
                                activeInput,
                                disabled: isTimeSlotDisabled(time),
                              });
                              handleTimeSelect(time);
                            }}
                            disabled={isTimeSlotDisabled(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600"
                  onClick={handleClear}
                >
                  Clear
                </Button>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleSave}
                  disabled={!selectedStartTime || !selectedEndTime}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RangeTimePicker;
