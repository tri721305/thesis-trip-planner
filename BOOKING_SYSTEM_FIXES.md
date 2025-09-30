# Booking System & Stripe Integration Fixes

## Vấn Đề Đã Gặp

1. **Import Error**: "Export createPaymentIntent doesn't exist in target module"
2. **Validation Error**: "HotelBooking validation failed: bookingId: Path `bookingId` is required"
3. **Infinite Loop Error**: "Maximum call stack size exceeded" trong quá trình render và re-render của React

## Giải Pháp

### 1. Import Error

- Sửa lại các đường dẫn import và đảm bảo tên hàm được export đúng trong module đích.
- Kiểm tra tên hàm `createStripePaymentIntent` trong file action đúng với tên được import.

### 2. Validation Error

- Tạo `bookingId` ở phía client trước khi gửi request đến server
- Cập nhật adapter để hỗ trợ truyền `bookingId` vào model
- Format bookingId: `HB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

### 3. Infinite Loop Error (Vòng lặp vô hạn)

#### Nguyên nhân:

- Callbacks giữa các component cha-con gây ra cập nhật state liên tục
- Component re-render và tạo ra callbacks mới => gọi lại => state thay đổi => re-render lại
- Không có điều kiện dừng cho vòng lặp cập nhật state

#### Các sửa đổi chính:

1. **Sử dụng `useRef` để theo dõi trạng thái gọi hàm**

   ```typescript
   const successHandlerCalled = useRef(false);
   // Chỉ gọi callback nếu chưa được gọi trước đó
   if (!successHandlerCalled.current) {
     successHandlerCalled.current = true;
     onSuccess();
   }
   ```

2. **Sử dụng `useCallback` để memoize các hàm callback**

   ```typescript
   const handleSuccess = useCallback(() => {
     // xử lý logic
   }, [dependencies]);
   ```

3. **Sử dụng `setTimeout` để phá vỡ vòng lặp cập nhật state**

   ```typescript
   setTimeout(() => {
     // Cập nhật state sau một tick của event loop
     setPaymentInfo({...});
   }, 100);
   ```

4. **Đơn giản hóa luồng UI**

   - Loại bỏ hệ thống tab phức tạp
   - Sử dụng render có điều kiện đơn giản
   - Giảm thiểu các dependency trong callbacks

5. **Thêm logging để dễ debug**
   ```typescript
   console.log(
     "BookingForm success:",
     bookingId,
     clientSecret.substring(0, 10) + "..."
   );
   ```

## Cách Phòng Tránh Trong Tương Lai

1. **Theo dõi trạng thái gọi hàm**:

   - Luôn sử dụng `useRef` để theo dõi các hàm callback đã được gọi chưa
   - Đảm bảo mỗi callback chỉ được gọi một lần nếu cần thiết

2. **Memoize các hàm callback**:

   - Luôn sử dụng `useCallback` cho các hàm được truyền xuống component con
   - Chỉ thêm các dependency thực sự cần thiết

3. **Phá vỡ vòng lặp cập nhật**:

   - Sử dụng `setTimeout` với delay nhỏ để đảm bảo các cập nhật state được xử lý riêng biệt

4. **Thiết kế UI đơn giản hơn**:

   - Chia UI thành các component nhỏ hơn, dễ quản lý
   - Sử dụng state management có kiểm soát (như useReducer) cho các luồng phức tạp

5. **Cẩn thận với các phụ thuộc hai chiều**:
   - Tránh các component cha-con cập nhật state của nhau liên tục
   - Sử dụng state management tập trung cho các trường hợp phức tạp

## Cấu Trúc Component Đã Sửa

1. **BookingForm**:

   - Tạo bookingId phía client
   - Sử dụng useRef để theo dõi callback
   - Memoize onSubmit với useCallback

2. **StripeCheckout**:

   - Đơn giản hóa render logic
   - Sử dụng wrapper cho callbacks
   - Thêm điều kiện kiểm tra trước khi gọi callbacks

3. **hotel-booking-test/page**:
   - Loại bỏ hệ thống tab phức tạp
   - Sử dụng state đơn giản để kiểm soát luồng UI
   - Sử dụng các refs để theo dõi trạng thái xử lý
