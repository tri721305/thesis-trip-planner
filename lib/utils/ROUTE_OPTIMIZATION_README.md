# Tối Ưu Hóa Tuyến Đường (Route Optimization)

Module này cung cấp chức năng tối ưu hóa tuyến đường cho Trip Planner sử dụng thuật toán Simulated Annealing (SA).

## Các tính năng chính

- **Tối ưu hóa tuyến đường** giữa nhiều điểm đến sử dụng giải thuật Simulated Annealing
- Tính toán **khoảng cách và thời gian di chuyển** giữa các điểm
- Xử lý **ràng buộc về giờ mở cửa và đóng cửa** của các địa điểm
- **Tính điểm ưu tiên** cho các điểm đến dựa trên độ quan trọng
- Cung cấp **kết quả chi tiết** bao gồm tuyến đường, timeline và các cảnh báo về thời gian

## Cấu trúc thư mục

```
/lib
  /utils
    routeOptimizer.ts        # Core optimization engine
    routeOptimizationHelper.ts # Helper functions for PlannerForm
    distance.ts              # Distance calculation utilities
/components
  /planners
    OptimizeRouteButton.tsx  # Button component to trigger optimization
    RouteOptimizationResult.tsx # Component to display optimization results
```

## Cách sử dụng trong PlannerForm

### 1. Thêm nút tối ưu hóa vào form

Thêm `OptimizeRouteButton` vào component PlannerForm để cho phép người dùng tối ưu hóa tuyến đường:

```tsx
import OptimizeRouteButton from "@/components/planners/OptimizeRouteButton";

// Inside your PlannerForm component
const PlannerForm = () => {
  // ...existing code

  // Handler to update day data after optimization
  const handleRouteOptimized = (updatedDayData: any, dayIndex: number) => {
    const updatedDetails = [...planner.details];
    updatedDetails[dayIndex] = updatedDayData;

    setPlanner({
      ...planner,
      details: updatedDetails,
    });
  };

  // When rendering each day in the form
  return (
    <div>
      {/* Other form elements */}

      {planner.details.map((dayData, index) => (
        <div key={index} className="day-container">
          <div className="day-header">
            <h3>{dayData.name}</h3>

            {/* Add optimization button */}
            <OptimizeRouteButton
              dayData={dayData}
              hotelInfo={findHotelInfo(dayData.date)}
              onRouteUpdated={(updated) => handleRouteOptimized(updated, index)}
            />
          </div>

          {/* Day content */}
        </div>
      ))}
    </div>
  );
};
```

### 2. Sử dụng trực tiếp route optimizer

Bạn cũng có thể sử dụng trực tiếp giải thuật tối ưu hóa:

```tsx
import { optimizeRoute, RoutePoint } from "@/lib/utils/routeOptimizer";

// Tạo mảng các điểm đến
const points: RoutePoint[] = [
  {
    id: "hotel",
    name: "Khách sạn",
    coordinates: { lat: 10.7765, lon: 106.7004 },
    visitDuration: 0,
    priority: 5,
    isHotel: true,
  },
  {
    id: "point1",
    name: "Nhà thờ Đức Bà",
    coordinates: { lat: 10.7797, lon: 106.6991 },
    visitDuration: 60, // minutes
    priority: 4,
  },
  {
    id: "point2",
    name: "Bảo tàng Chứng tích Chiến tranh",
    coordinates: { lat: 10.7793, lon: 106.6926 },
    visitDuration: 90, // minutes
    priority: 3,
  },
];

// Tối ưu hóa tuyến đường
const result = optimizeRoute(points, new Date(), {
  startTimeHour: 8,
  returnToStart: true,
});

// Kết quả tối ưu
console.log("Optimized route:", result.route);
console.log("Total distance:", result.totalDistance);
console.log("Total duration:", result.totalDuration);
```

## Tùy chỉnh thuật toán

Bạn có thể tùy chỉnh các thông số của thuật toán SA thông qua options:

```tsx
const options = {
  startTimeHour: 9, // Bắt đầu lúc 9:00 sáng
  startTimeMinute: 30, // Bắt đầu lúc 9:30 sáng
  returnToStart: true, // Quay về điểm đầu tiên
  maxIterations: 10000, // Số lần lặp tối đa
  initialTemperature: 10000, // Nhiệt độ ban đầu
  coolingRate: 0.995, // Tỷ lệ làm mát
  stoppingTemperature: 0.1, // Nhiệt độ dừng
  bonusFor24h: 300, // Điểm thưởng cho địa điểm mở cửa 24/7
};

const result = optimizeRoute(points, new Date(), options);
```

## Ghi chú

- Tối ưu hóa tuyến đường hoạt động tốt nhất khi có ít nhất 2 điểm đến có tọa độ
- Nếu cung cấp thông tin khách sạn, nó sẽ được sử dụng làm điểm đầu và cuối của tuyến đường
- Thuật toán xem xét các ràng buộc thời gian khi tính toán điểm, nhưng vẫn có thể đề xuất lịch trình có cảnh báo thời gian nếu không thể tìm thấy giải pháp hoàn hảo
- Nếu một địa điểm không có thông tin giờ mở/đóng cửa, nó được coi là mở cửa 24/7
