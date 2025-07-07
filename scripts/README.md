# Province Seeding Scripts

Các script để thêm dữ liệu Province từ file JSON vào MongoDB.

## Files

- `seed-province.ts` - Script chính để seed dữ liệu Province đầu tiên
- `add-first-province.ts` - Script đơn giản để thêm Province với dữ liệu hardcode
- `run-seed.ts` - Script runner để chạy seed với connection handling

## Cách sử dụng

### 1. Chuẩn bị Environment

```bash
# Copy file .env.example thành .env
cp .env.example .env

# Chỉnh sửa MONGODB_URI trong file .env
MONGODB_URI=mongodb://localhost:27017/travel_planner
```

### 2. Chạy Seed Script

```bash
# Chạy script seed Province
npm run seed:province

# Hoặc chạy trực tiếp
npx ts-node scripts/run-seed.ts
```

### 3. Kiểm tra kết quả

Script sẽ:
- Đọc dữ liệu từ `database/data/thành_phố_Hồ_Chí_Minh.json`
- Lấy item đầu tiên (Thành phố Hồ Chí Minh)
- Kiểm tra xem đã tồn tại trong database chưa
- Nếu chưa có thì thêm mới
- Hiển thị thông tin Province đã được thêm

## Dữ liệu được thêm

Province đầu tiên từ file JSON với các thông tin:

```json
{
  "matinh": "29",
  "tentinh": "thành phố Hồ Chí Minh", 
  "ma": "2687",
  "loai": "thành phố",
  "tenhc": "Hồ Chí Minh",
  "cay": 2687,
  "con": "168 ĐVHC cấp xã (01 đặc khu, 113 phường, 54 xã)",
  "dientichkm2": 6,
  "dansonguoi": 14002598,
  "trungtamhc": "Tp. HCM (cũ)",
  "kinhdo": 106.673,
  "vido": 10.853,
  "truocsapnhap": "TPHCM, tỉnh Bà Rịa - Vũng Tàu và tỉnh Bình Dương",
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [...]
  },
  "geometry_type": "MultiPolygon",
  "geometry_coordinate_count": 814
}
```

## Troubleshooting

### MongoDB Connection Error
- Đảm bảo MongoDB đang chạy
- Kiểm tra MONGODB_URI trong file .env
- Đảm bảo database có quyền truy cập

### Import Error
- Đảm bảo đã cài đặt dependencies: `npm install`
- Kiểm tra file JSON tồn tại: `database/data/thành_phố_Hồ_Chí_Minh.json`

### Geometry Validation Error  
- Kiểm tra geometry coordinates format trong JSON
- Đảm bảo geometry type khớp với coordinates structure
