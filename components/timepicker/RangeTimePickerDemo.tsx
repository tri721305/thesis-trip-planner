import React, { useState } from "react";
import RangeTimePicker from "./RangeTimePicker";

interface TimeRange {
  startTime: string;
  endTime: string;
}

const RangeTimePickerDemo: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startTime: "",
    endTime: "",
  });

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
    console.log("Time range changed:", newTimeRange);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          RangeTimePicker Demo with Popover
        </h1>
        <p className="text-gray-600">
          This demo shows the RangeTimePicker component with Popover
          functionality. Once you select a time range, you can click on the
          displayed time range to edit it.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-700">
            Time Range Picker
          </h2>
          <p className="text-sm text-gray-500">
            Select start and end times. After selecting, click on the time range
            to edit.
          </p>
        </div>

        <RangeTimePicker
          value={timeRange}
          onChange={handleTimeRangeChange}
          className="max-w-md"
        />

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Current Selection:
          </h3>
          <pre className="text-sm text-gray-600">
            {JSON.stringify(timeRange, null, 2)}
          </pre>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Features:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>30-minute interval time slots</li>
          <li>Automatic validation (end time must be after start time)</li>
          <li>Popover interface for editing selected time ranges</li>
          <li>Clean, intuitive design with save/cancel/clear actions</li>
          <li>Responsive layout</li>
        </ul>
      </div>
    </div>
  );
};

export default RangeTimePickerDemo;
