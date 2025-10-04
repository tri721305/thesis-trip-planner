# Hệ thống mời và quản lý Tripmates

## Giới thiệu

Hệ thống mời và quản lý tripmates (người đồng hành) cho ứng dụng Trip Planner bao gồm các thành phần sau:

1. **InviteTripmate**: Component dialog để mời người khác tham gia kế hoạch
2. **ManageTripmates**: Component hiển thị danh sách người đồng hành và lời mời đang chờ
3. **PlannerTripmates**: Component kết hợp để hiển thị và quản lý người đồng hành
4. **TripmatesDialog**: Component dialog để tích hợp vào PlannerForm

## Cách tích hợp vào PlannerForm

Hệ thống được thiết kế để dễ dàng tích hợp vào PlannerForm hiện có. Chi tiết cách tích hợp được mô tả trong file `TRIPMATES_INTEGRATION.md`.

```tsx
// Ví dụ đơn giản về cách sử dụng TripmatesDialog
<TripmatesDialog
  plannerId={planner.id}
  isAuthor={isUserAuthor}
  currentTripmates={form.getValues("tripmates") || []}
  onTripmateChange={refreshPlannerAfterTripmateChange}
/>
```

## Luồng làm việc

1. **Gửi lời mời**:

   - Người dùng nhấp vào "Manage Tripmates"
   - Dialog mở ra hiển thị danh sách tripmates hiện tại
   - Người dùng nhấp vào "Invite Tripmate" và nhập email
   - Hệ thống gửi lời mời và cập nhật UI

2. **Quản lý tripmates**:

   - Xem danh sách tripmates hiện tại
   - Xem lời mời đang chờ phản hồi
   - Xóa tripmate khỏi kế hoạch (dành cho người tạo)

3. **Phản hồi lời mời**:
   - Người được mời sẽ nhận được email
   - Họ có thể đăng nhập và xem lời mời trong hệ thống
   - Chấp nhận hoặc từ chối lời mời

## Các file trong hệ thống

- `InviteTripmate.tsx`: Component dialog để mời người khác
- `ManageTripmates.tsx`: Component hiển thị danh sách tripmates
- `PlannerTripmates.tsx`: Component kết hợp để quản lý tripmates
- `TripmatesDialog.tsx`: Component dialog để tích hợp vào PlannerForm
- `PlannerInvitationForm.tsx`: Component form để tích hợp vào dialog
- `PlannerTripmatesIntegrationDemo.tsx`: Demo cách tích hợp
- `TRIPMATES_INTEGRATION.md`: Hướng dẫn chi tiết cách tích hợp
- `PLANNER_INTEGRATION.md`: Hướng dẫn tổng quan về hệ thống

## Lưu ý

- Chỉ người tạo kế hoạch mới có quyền mời và quản lý người đồng hành
- Kiểm tra quyền được thực hiện cả ở frontend và backend
- Email mời sẽ được gửi đến người được mời
- Người được mời cần có tài khoản trong hệ thống để xem và phản hồi lời mời
