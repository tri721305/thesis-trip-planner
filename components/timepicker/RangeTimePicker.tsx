import React, { useState, useEffect } from "react";
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
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
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

  // Sync with external value
  useEffect(() => {
    if (value) {
      setSelectedStartTime(value.startTime || "");
      setSelectedEndTime(value.endTime || "");
    }
  }, [value]);

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    if (activeInput === "start") {
      setSelectedStartTime(time);
      if (selectedEndTime && time >= selectedEndTime) {
        // Auto-adjust end time if start time is after or equal to end time
        const nextSlotIndex = timeSlots.indexOf(time) + 1;
        if (nextSlotIndex < timeSlots.length) {
          setSelectedEndTime(timeSlots[nextSlotIndex]);
        }
      }

      // Auto-focus to end time selection after selecting start time
      setTimeout(() => {
        setActiveInput("end");
      }, 150); // Small delay for smooth UX
    } else if (activeInput === "end") {
      if (selectedStartTime && time <= selectedStartTime) {
        // Don't allow end time to be before or equal to start time
        return;
      }
      setSelectedEndTime(time);
    }
  };

  // Handle save
  const handleSave = () => {
    if (selectedStartTime && selectedEndTime && onChange) {
      onChange({
        startTime: selectedStartTime,
        endTime: selectedEndTime,
      });
    }
    setActiveInput(null);
    setIsPopoverOpen(false);
  };

  // Handle clear
  const handleClear = () => {
    setSelectedStartTime("");
    setSelectedEndTime("");
    setActiveInput(null);
    if (onChange) {
      onChange({ startTime: "", endTime: "" });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset to original values
    if (value) {
      setSelectedStartTime(value.startTime || "");
      setSelectedEndTime(value.endTime || "");
    }
    setActiveInput(null);
    setIsPopoverOpen(false);
  };

  // Handle popover open change
  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open);
    if (open && !selectedStartTime && !selectedEndTime) {
      // Auto-focus to start time when opening popover for the first time
      setTimeout(() => {
        setActiveInput("start");
      }, 100);
    } else if (!open) {
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
                <ClockIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-blue-600 font-medium">
                  {selectedStartTime} — {selectedEndTime}
                </span>
              </div>
            ) : (
              <div>Add time</div>
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
                    onClick={() => setActiveInput("start")}
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
                    onClick={() => setActiveInput("end")}
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
                            onClick={() => handleTimeSelect(time)}
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
