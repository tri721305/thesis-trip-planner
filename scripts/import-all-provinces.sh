#!/bin/bash
# filepath: /Users/mac/Desktop/HCMUT/Thesis/source/scripts/import-all-provinces.sh

echo "🚀 Starting batch import of all provinces..."

cd /Users/mac/Desktop/HCMUT/Thesis/source

# List of province files (excluding HCM which is already imported)
provinces=(
    "Thủ_đô_Hà_Nội.json"
    "thành_phố_Cần_Thơ.json"
    "thành_phố_Huế.json"
    "thành_phố_Hải_Phòng.json"
    "thành_phố_Đà_Nẵng.json"
    "tỉnh_An_Giang.json"
    "tỉnh_Bắc_Ninh.json"
    "tỉnh_Cao_Bằng.json"
    "tỉnh_Cà_Mau.json"
    "tỉnh_Gia_Lai.json"
)

# Counter
total=${#provinces[@]}
current=0

echo "📊 Will process $total provinces"

for province in "${provinces[@]}"; do
    current=$((current + 1))
    echo ""
    echo "🏛️  [$current/$total] Processing: $province"
    
    # Check if file exists
    if [[ ! -f "database/data/$province" ]]; then
        echo "❌ File not found: $province"
        continue
    fi
    
    # Run the import script
    echo "📥 Importing $province..."
    tsx scripts/seed-single-province.ts "$province"
    
    if [[ $? -eq 0 ]]; then
        echo "✅ Successfully imported: $province"
    else
        echo "❌ Failed to import: $province"
    fi
    
    # Small delay between imports
    sleep 2
done

echo ""
echo "🎉 Batch import completed!"
echo "📊 Checking final statistics..."

# Check final count
tsx scripts/check-wards.ts
