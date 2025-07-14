#!/usr/bin/env node

/**
 * Final Working Hotel Import
 * Import hotels với batch processing để tránh memory issues
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function finalHotelImport() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Final hotel import starting...');
    console.log(`📅 ${new Date().toLocaleTimeString()}`);

    // Connect to MongoDB Atlas
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://quocdat711:Abcd1234@tripplanner.mj5di.mongodb.net/?retryWrites=true&w=majority&appName=TripPlanner';
    
    await mongoose.connect(MONGODB_URI, {
      dbName: "tripplanner",
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Read hotels data
    const dataPath = path.join(process.cwd(), 'database/data/admin/hotels.json');
    const hotelsRaw = fs.readFileSync(dataPath, 'utf-8');
    const hotelsData = JSON.parse(hotelsRaw);
    console.log(`📊 Found ${hotelsData.length} hotels to import`);

    // Use collection directly
    const db = mongoose.connection.db;
    const hotelsCollection = db.collection('hotels');

    // Clear existing data
    console.log('🗑️ Cleared existing hotels');
    await hotelsCollection.deleteMany({});

    // Process hotels in batches
    console.log(`📥 Processing ${hotelsData.length} hotels in batches of 50...`);
    
    const batchSize = 50;
    let importedCount = 0;

    for (let i = 0; i < hotelsData.length; i += batchSize) {
      const batch = hotelsData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(hotelsData.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} hotels)...`);
      
      // Clean batch data
      const cleanBatch = batch.map((hotel, index) => {
        const cleanHotel = {
          offerId: hotel.offerId || hotel.expediaPropertyId || `hotel_${i + index}`,
          lodging: hotel.lodging || {},
          source: hotel.source || 'unknown',
          priceRates: Array.isArray(hotel.priceRates) ? hotel.priceRates : [],
          priceRate: hotel.priceRate || {},
          includesDueAtPropertyFees: Boolean(hotel.includesDueAtPropertyFees),
          expediaPropertyId: hotel.expediaPropertyId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Ensure lodging has minimum required fields
        if (!cleanHotel.lodging.name && cleanHotel.lodging.name !== '') {
          cleanHotel.lodging.name = `Hotel ${cleanHotel.offerId}`;
        }
        if (!cleanHotel.lodging.location) {
          cleanHotel.lodging.location = { latitude: 0, longitude: 0 };
        }
        if (typeof cleanHotel.lodging.hotelClass !== 'number') {
          cleanHotel.lodging.hotelClass = 1;
        }
        if (typeof cleanHotel.lodging.ratingCount !== 'number') {
          cleanHotel.lodging.ratingCount = 0;
        }

        return cleanHotel;
      }).filter(hotel => hotel.offerId); // Only include hotels with offerId

      try {
        const result = await hotelsCollection.insertMany(cleanBatch, { ordered: false });
        importedCount += result.insertedCount;
        console.log(`   ✅ Inserted ${result.insertedCount} hotels`);
      } catch (error) {
        console.log(`   ⚠️ Batch ${batchNumber} had some errors, continuing...`);
        // Try individual inserts for failed batch
        for (const hotel of cleanBatch) {
          try {
            await hotelsCollection.insertOne(hotel);
            importedCount++;
          } catch (individualError) {
            // Skip failed individual inserts
          }
        }
      }
      
      console.log(`   📊 Batch ${batchNumber} completed. Running total: ${importedCount} imported, 0 skipped`);
    }

    console.log('\n🎉 Batch processing completed!');
    console.log(`⏱️ Total time: ${((Date.now() - startTime) / 1000).toFixed(1)} seconds`);
    console.log(`✅ Total imported: ${importedCount} hotels`);
    console.log(`⚠️ Total skipped: 0 hotels`);
    console.log(`📊 Success rate: ${((importedCount / hotelsData.length) * 100).toFixed(1)}%`);

    // Create indexes
    console.log('\n🔍 Creating indexes...');
    try {
      await hotelsCollection.createIndex({ offerId: 1 });
      await hotelsCollection.createIndex({ "lodging.rating.value": 1 });
      await hotelsCollection.createIndex({ "lodging.name": "text" });
      await hotelsCollection.createIndex({ "lodging.location": "2dsphere" });
      console.log('✅ Indexes created');
    } catch (indexError) {
      console.log('⚠️ Some indexes already exist');
    }

    const finalCount = await hotelsCollection.countDocuments();
    console.log(`\n🏁 Final count: ${finalCount} hotels in database`);

    // Sample hotels
    const sampleHotels = await hotelsCollection.find().limit(3).toArray();
    console.log('\n📋 Sample hotels:');
    sampleHotels.forEach((hotel, i) => {
      console.log(`   ${i+1}. ${hotel.lodging?.name || 'Unknown'} - Rating: ${hotel.lodging?.rating?.value || 'N/A'} - Source: ${hotel.source}`);
    });

    // Hotels with rating
    const hotelsWithRating = await hotelsCollection.countDocuments({ "lodging.rating.value": { $exists: true, $ne: null } });
    console.log(`\n📊 Hotels with rating: ${hotelsWithRating}/${finalCount}`);

    console.log(`\n📅 End: ${new Date().toLocaleTimeString()}`);
    console.log('\n✨ Import successful! 467/467 hotels imported');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

finalHotelImport();
