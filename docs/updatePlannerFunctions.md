# Travel Planner Update Functions

Các function để cập nhật thông tin travel planner với đầy đủ tính năng và validation.

## Available Functions

### 1. `updatePlanner(params: UpdatePlannerParams)`

Function chính để cập nhật toàn bộ thông tin planner. Sử dụng transaction để đảm bảo data consistency.

**Features:**

- ✅ Full validation với Zod schema
- ✅ Permission checking (author hoặc tripmate)
- ✅ MongoDB transaction
- ✅ Update tất cả fields: title, destination, dates, tripmates, lodging, details
- ✅ Replace entire arrays (tripmates, lodging, details)

**Use cases:**

- Cập nhật toàn bộ thông tin planner
- Thay đổi cấu trúc lớn của trip
- Cập nhật multiple fields cùng lúc

### 2. `partialUpdatePlanner(params: Partial<UpdatePlannerParams>)`

Function để cập nhật một phần thông tin planner mà không ảnh hưởng đến các field khác.

**Features:**

- ✅ Flexible partial updates
- ✅ Không ghi đè fields không được specify
- ✅ Permission checking
- ✅ Type-safe với TypeScript

**Use cases:**

- Cập nhật chỉ một vài fields
- Quick updates (title, note, state)
- Workflow state management

### 3. `addTripmate(params: { plannerId, tripmate })`

Function để thêm tripmate mới vào planner existing.

**Features:**

- ✅ Chỉ add thêm, không ghi đè existing tripmates
- ✅ Chỉ author mới có thể add tripmates
- ✅ Validation cho tripmate data

**Use cases:**

- Invite thêm người vào trip
- Expand nhóm travel

### 4. `addLodging(params: { plannerId, lodging })`

Function để thêm lodging option mới.

**Features:**

- ✅ Add thêm accommodation options
- ✅ Author và tripmates đều có thể add
- ✅ Auto-process dates
- ✅ Cost tracking

**Use cases:**

- Add backup hotel options
- Add multiple accommodations
- Flexible lodging planning

## Permission System

### Author Permissions

- ✅ Update tất cả fields
- ✅ Add/remove tripmates
- ✅ Add/update lodging
- ✅ Change planner state
- ✅ Delete planner

### Tripmate Permissions

- ✅ Update basic info (note, generalTips)
- ✅ Add lodging options
- ✅ Add details/itinerary items
- ❌ Cannot add/remove other tripmates
- ❌ Cannot change core settings (title, destination, dates)

## Validation

### Zod Schema Validation

```typescript
UpdateTravelPlannerSchema.parse({
  plannerId: "string",
  title?: "string",
  destination?: {
    name: "string",
    coordinates: [number, number],
    type: "province" | "ward",
    provinceId?: "string",
    wardId?: "string"
  },
  startDate?: Date | string,
  endDate?: Date | string,
  // ... other fields
})
```

### Business Logic Validation

- ✅ Date range validation (endDate > startDate)
- ✅ Destination type constraints
- ✅ Permission checking
- ✅ MongoDB document existence

## Error Handling

### Common Error Scenarios

1. **Permission Denied**: User không có quyền update planner
2. **Planner Not Found**: PlannerId không tồn tại
3. **Validation Failed**: Data không đúng format/constraints
4. **Database Error**: MongoDB transaction failed

### Error Response Format

```typescript
{
  success: false,
  error: {
    message: string,
    status?: number
  }
}
```

## Usage Examples

### Basic Update

```typescript
const result = await updatePlanner({
  plannerId: "64a7b8c9d0e1f2a3b4c5d6e7",
  title: "Updated Trip Title",
  note: "New trip description",
});
```

### Partial Update

```typescript
const result = await partialUpdatePlanner({
  plannerId: "64a7b8c9d0e1f2a3b4c5d6e7",
  state: "confirmed",
});
```

### Add Tripmate

```typescript
const result = await addTripmate({
  plannerId: "64a7b8c9d0e1f2a3b4c5d6e7",
  tripmate: {
    name: "John Doe",
    email: "john@example.com",
  },
});
```

### Add Lodging

```typescript
const result = await addLodging({
  plannerId: "64a7b8c9d0e1f2a3b4c5d6e7",
  lodging: {
    name: "Hotel XYZ",
    address: "123 Street",
    cost: { type: "VND", value: 2000000 },
  },
});
```

## Database Schema

Travel planner sử dụng MongoDB với các fields chính:

```typescript
interface TravelPlan {
  _id: ObjectId;
  title: string;
  author: ObjectId;
  destination: {
    name: string;
    coordinates: [number, number];
    type: "province" | "ward";
    provinceId?: string;
    wardId?: string;
  };
  startDate: Date;
  endDate: Date;
  type: "public" | "private" | "friend";
  state: "planning" | "confirmed" | "ongoing" | "completed" | "cancelled";
  tripmates: Array<{
    name: string;
    email?: string;
    image?: string;
    userId?: string;
  }>;
  lodging: Array<{
    name: string;
    address?: string;
    checkIn?: Date;
    checkOut?: Date;
    confirmation?: string;
    notes?: string;
    cost?: { type: string; value: number };
  }>;
  details: Array<{
    type: "route" | "list";
    name: string;
    index: number;
    data: Array<PlaceItem | NoteItem | ChecklistItem>;
  }>;
}
```

## Best Practices

### 1. Use Appropriate Function

- **Full updates**: `updatePlanner()`
- **Partial updates**: `partialUpdatePlanner()`
- **Add items**: `addTripmate()`, `addLodging()`

### 2. Error Handling

```typescript
try {
  const result = await updatePlanner(params);
  if (result.success) {
    // Handle success
  } else {
    // Handle business logic error
    console.error(result.error?.message);
  }
} catch (error) {
  // Handle unexpected error
  console.error("Unexpected error:", error);
}
```

### 3. Permission Awareness

- Check user role trước khi call functions
- Author có full permissions
- Tripmates có limited permissions

### 4. Data Validation

- Always validate dates (endDate > startDate)
- Validate destination type constraints
- Check required fields

## Testing

Sử dụng các example files để test functions:

- `examples/createPlannerExample.ts` - Create test data
- `examples/updatePlannerExample.ts` - Update test scenarios

```bash
# Run examples
npm run dev
# Test in browser console hoặc Node.js environment
```
