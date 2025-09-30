# Tài Liệu Hệ Thống Đặt Phòng Khách Sạn

## Tổng Quan

Hệ thống đặt phòng khách sạn là một phần của ứng dụng Trip Planner, cho phép người dùng tìm kiếm, xem và đặt phòng khách sạn. Hệ thống tích hợp với Stripe để xử lý thanh toán và sử dụng MongoDB để lưu trữ dữ liệu đặt phòng.

## Luồng Đặt Phòng

### 1. Tìm Kiếm Khách Sạn

- Người dùng tìm kiếm khách sạn theo địa điểm, ngày và số lượng khách
- Hệ thống hiển thị danh sách các khách sạn phù hợp với tiêu chí tìm kiếm

### 2. Xem Chi Tiết Khách Sạn

- Người dùng xem thông tin chi tiết về khách sạn, bao gồm:
  - Hình ảnh, mô tả
  - Loại phòng, giá cả
  - Tiện nghi
  - Đánh giá và nhận xét

### 3. Chọn Phòng và Đặt Phòng

- Người dùng chọn loại phòng và số lượng
- Nhập thông tin cá nhân và chi tiết đặt phòng
- Xác nhận thông tin đặt phòng

### 4. Thanh Toán

- Người dùng được chuyển đến giao diện thanh toán Stripe
- Nhập thông tin thẻ và hoàn tất thanh toán
- Stripe xử lý giao dịch và gửi webhook xác nhận

### 5. Xác Nhận Đặt Phòng

- Hệ thống nhận webhook từ Stripe
- Cập nhật trạng thái đặt phòng trong cơ sở dữ liệu
- Gửi email xác nhận đến người dùng

## Cấu Trúc Mã

### Components

1. **BookingForm.tsx**

   - Component chính để nhập thông tin đặt phòng
   - Xử lý validate form
   - Gửi dữ liệu đặt phòng đến server
   - Khởi tạo quá trình thanh toán

2. **StripeCheckout.tsx**

   - Hiển thị form thanh toán Stripe
   - Xử lý tương tác với Stripe API
   - Theo dõi trạng thái thanh toán

3. **hotel-booking-test/page.tsx**
   - Trang test cho quá trình đặt phòng
   - Kết hợp BookingForm và StripeCheckout

### Server Actions

1. **booking.action.ts**

   - Xử lý tạo booking trong database
   - Validate dữ liệu đặt phòng
   - Trả về ID đặt phòng cho client

2. **payment.action.ts**
   - Tạo payment intent với Stripe
   - Kết nối booking với payment
   - Trả về client secret cho thanh toán

### API Routes

1. **api/webhooks/stripe/route.ts**
   - Xử lý các webhook từ Stripe
   - Cập nhật trạng thái đặt phòng dựa trên sự kiện thanh toán
   - Hỗ trợ cả môi trường development (không cần webhook secret) và production

### Database Models

1. **HotelBooking Model**
   - Lưu trữ thông tin đặt phòng
   - Liên kết với thông tin thanh toán
   - Các trường bắt buộc:
     - bookingId: Định danh duy nhất của booking
     - hotelId: ID của khách sạn
     - hotelName: Tên khách sạn
     - hotelLocation: Địa điểm khách sạn
     - userId: ID của người dùng
     - checkInDate: Ngày check-in
     - checkOutDate: Ngày check-out
     - guests: Số lượng khách
     - rooms: Số lượng phòng
     - totalPrice: Tổng giá trị đặt phòng
     - status: Trạng thái đặt phòng (pending, confirmed, cancelled)

## Xử Lý Thanh Toán với Stripe

### Client Side

1. Tạo PaymentIntent thông qua server action
2. Hiển thị form thanh toán với Elements
3. Theo dõi trạng thái thanh toán và hiển thị UI phù hợp

### Server Side

1. Tạo và quản lý PaymentIntent với Stripe API
2. Xử lý webhook từ Stripe để cập nhật trạng thái đặt phòng
3. Lưu trữ thông tin thanh toán liên quan đến đặt phòng

## Bảo Mật và Xử Lý Lỗi

### Bảo Mật

- Xác thực webhook signature trong môi trường production
- Validate dữ liệu đặt phòng trước khi xử lý
- Kiểm tra quyền người dùng trước khi cho phép đặt phòng

### Xử Lý Lỗi

- Hiển thị thông báo lỗi hữu ích khi validate form
- Xử lý lỗi thanh toán từ Stripe
- Ghi log lỗi phía server để debug

## Môi Trường Phát Triển

### Cấu Hình Local

- Biến môi trường cần thiết:
  - STRIPE_PUBLIC_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET (tùy chọn trong development)
- Sử dụng Stripe CLI để test webhook

### Testing

- Test end-to-end quy trình đặt phòng
- Test xử lý webhook với Stripe CLI
- Test trường hợp lỗi và cách hệ thống phản hồi

## Lưu Ý Và Cải Tiến

### Đã Sửa

- Lỗi "Export createPaymentIntent doesn't exist in target module"
- Lỗi "Maximum call stack size exceeded" do vòng lặp vô hạn trong React
- Lỗi validation schema của HotelBooking
- Xử lý webhook trong môi trường development không có webhook secret

### Cần Cải Tiến

- Thêm phương thức hủy đặt phòng
- Cải thiện UI/UX cho form đặt phòng
- Thêm tính năng đánh giá sau khi sử dụng dịch vụ
- Tích hợp với hệ thống email để gửi xác nhận đặt phòng
