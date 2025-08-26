// Ví dụ sử dụng CalendarDatePicker với typeShow

import React, { useState } from "react";
import { CalendarDatePicker } from "@/components/calendar-date-picker";

export default function DatePickerExample() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 ngày sau
  });

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Date Picker Examples</h2>

      {/* Hiển thị mặc định (đầy đủ) */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Default Display (Full):
        </label>
        <CalendarDatePicker
          date={dateRange}
          onDateSelect={setDateRange}
          typeShow="default"
          numberOfMonths={2}
        />
      </div>

      {/* Hiển thị rút gọn */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Reduced Display (Short):
        </label>
        <CalendarDatePicker
          date={dateRange}
          onDateSelect={setDateRange}
          typeShow="reduce"
          numberOfMonths={2}
        />
      </div>

      {/* Hiển thị rút gọn với chỉ 1 tháng */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Reduced Display (Single Month):
        </label>
        <CalendarDatePicker
          date={dateRange}
          onDateSelect={setDateRange}
          typeShow="reduce"
          numberOfMonths={1}
        />
      </div>
    </div>
  );
}

/*
Kết quả hiển thị:
- Default: "25 Aug, 2025 - 27 Aug, 2025" 
- Reduce (2 months): "25/08 - 27/08"
- Reduce (1 month): "25/08"
*/
