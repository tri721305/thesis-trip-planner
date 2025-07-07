# Import All Provinces Wards - Manual Guide

Vì script tự động đang gặp vấn đề, bạn có thể import từng tỉnh thủ công bằng cách sau:

## Cách 1: Import từng tỉnh một

```bash
# Chạy từng lệnh sau trong terminal:
cd /Users/mac/Desktop/HCMUT/Thesis/source

# Import Hà Nội
npm run tsx scripts/seed-single-province.ts "Thủ_đô_Hà_Nội.json"

# Import Cần Thơ
npm run tsx scripts/seed-single-province.ts "thành_phố_Cần_Thơ.json"

# Import Đà Nẵng
npm run tsx scripts/seed-single-province.ts "thành_phố_Đà_Nẵng.json"

# Import Hải Phòng
npm run tsx scripts/seed-single-province.ts "thành_phố_Hải_Phòng.json"

# Import Huế
npm run tsx scripts/seed-single-province.ts "thành_phố_Huế.json"

# Import An Giang
npm run tsx scripts/seed-single-province.ts "tỉnh_An_Giang.json"

# ... và tiếp tục với các tỉnh khác
```

## Cách 2: Danh sách đầy đủ tất cả các tỉnh

```
Thủ_đô_Hà_Nội.json
thành_phố_Cần_Thơ.json
thành_phố_Huế.json
thành_phố_Hải_Phòng.json
thành_phố_Đà_Nẵng.json
tỉnh_An_Giang.json
tỉnh_Bắc_Ninh.json
tỉnh_Cao_Bằng.json
tỉnh_Cà_Mau.json
tỉnh_Gia_Lai.json
tỉnh_Hà_Tĩnh.json
tỉnh_Hưng_Yên.json
tỉnh_Khánh_Hòa.json
tỉnh_Lai_Châu.json
tỉnh_Lào_Cai.json
tỉnh_Lâm_Đồng.json
tỉnh_Lạng_Sơn.json
tỉnh_Nghệ_An.json
tỉnh_Ninh_Bình.json
tỉnh_Phú_Thọ.json
tỉnh_Quảng_Ngãi.json
tỉnh_Quảng_Ninh.json
tỉnh_Quảng_Trị.json
tỉnh_Sơn_La.json
tỉnh_Thanh_Hóa.json
tỉnh_Thái_Nguyên.json
tỉnh_Tuyên_Quang.json
tỉnh_Tây_Ninh.json
tỉnh_Vĩnh_Long.json
tỉnh_Điện_Biên.json
tỉnh_Đắk_Lắk.json
tỉnh_Đồng_Nai.json
tỉnh_Đồng_Tháp.json
```

## Cách 3: Kiểm tra tiến độ

Sau mỗi lần import, kiểm tra kết quả:

```bash
npm run tsx scripts/check-wards.ts
```

## Cách 4: Reset nếu cần

Nếu muốn reset và import lại:

```bash
npm run tsx scripts/drop-wards.ts
npm run seed:hcm-wards  # Import lại HCM
# Rồi import các tỉnh khác
```

## Lưu ý

- Mỗi lần import có thể mất vài phút
- Script sẽ skip các ward đã tồn tại
- Nếu gặp lỗi, hãy kiểm tra kết nối MongoDB
