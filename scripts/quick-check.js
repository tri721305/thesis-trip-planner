#!/usr/bin/env node

const mongoose = require('mongoose');

async function quickCheck() {
  try {
    await mongoose.connect('mongodb+srv://quocdat711:Abcd1234@tripplanner.mj5di.mongodb.net/?retryWrites=true&w=majority&appName=TripPlanner', {
      dbName: "tripplanner",
      serverSelectionTimeoutMS: 5000
    });
    
    const db = mongoose.connection.db;
    const count = await db.collection('hotels').countDocuments();
    console.log(`📊 Hotels in database: ${count}`);
    
    if (count > 0) {
      const sample = await db.collection('hotels').findOne();
      console.log(`📝 Sample hotel: ${sample?.lodging?.name || sample?.offerId || 'Unknown'}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  } finally {
    await mongoose.disconnect();
  }
}

quickCheck();
