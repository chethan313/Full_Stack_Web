const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * Uses the MONGODB_URI from environment variables
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
