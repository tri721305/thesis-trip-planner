#!/bin/bash

echo "🚀 Starting manual province import..."

cd /Users/mac/Desktop/HCMUT/Thesis/source

# Check current wards count
echo "📊 Current wards count:"
npm run tsx scripts/check-wards.ts 2>/dev/null | grep "Total wards"

echo ""
echo "🏛️  Starting imports..."

# List of smaller provinces first
provinces=(
    "tỉnh_Cao_Bằng.json"
    "tỉnh_Lai_Châu.json"
    "tỉnh_Điện_Biên.json"
)

for province in "${provinces[@]}"; do
    echo ""
    echo "📥 Importing: $province"
    npm run tsx scripts/seed-single-province.ts "$province"
    
    if [ $? -eq 0 ]; then
        echo "✅ Success: $province"
    else
        echo "❌ Failed: $province"
    fi
    
    sleep 1
done

echo ""
echo "📊 Final count:"
npm run tsx scripts/check-wards.ts 2>/dev/null | grep "Total wards"
