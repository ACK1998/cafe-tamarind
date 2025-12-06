const mongoose = require('mongoose');

// Cache connection for serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Check if MONGODB_URI is set
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    const error = new Error('MONGODB_URI environment variable is not set');
    console.error('❌', error.message);
    throw error;
  }

  // If already connected, return cached connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, return the promise
  if (cached.promise) {
    return cached.promise;
  }

  const options = {
    serverSelectionTimeoutMS: process.env.VERCEL ? 10000 : 5000, // Longer timeout for Vercel
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    bufferCommands: false, // Disable mongoose buffering for serverless
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 1, // Maintain at least 1 socket connection
    maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
  };

  console.log('🔌 Attempting to connect to MongoDB...');
  console.log('📍 URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials

  cached.promise = mongoose.connect(
    mongoUri,
    options
  ).then((conn) => {
    console.log(`🗄️ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    cached.conn = conn;
    return conn;
  }).catch((error) => {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
    cached.promise = null;
    
    // Only exit process in non-serverless environments
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  });

  return cached.promise;
};

module.exports = connectDB;
