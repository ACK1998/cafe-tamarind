const mongoose = require('mongoose');

// Cache connection for serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, return cached connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, return the promise
  if (cached.promise) {
    return cached.promise;
  }

  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    bufferCommands: false, // Disable mongoose buffering for serverless
  };

  cached.promise = mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-tamarind',
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
