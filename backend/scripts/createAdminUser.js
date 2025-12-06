#!/usr/bin/env node

/**
 * Script to create admin user in production database
 * Usage: node scripts/createAdminUser.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_USER = {
  name: 'Admin',
  email: 'cafetamarindsf3@gmail.com',
  phone: '1234567890',
  password: 'password123',
  role: 'admin',
  isActive: true
};

const createAdminUser = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-tamarind',
      options
    );

    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: ADMIN_USER.email });
    
    if (existingUser) {
      console.log('👤 User already exists. Updating...');
      existingUser.password = ADMIN_USER.password;
      existingUser.role = 'admin';
      existingUser.isActive = true;
      existingUser.name = ADMIN_USER.name;
      await existingUser.save();
      console.log('✅ Admin user updated successfully');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
    } else {
      console.log('👤 Creating admin user...');
      const newUser = await User.create(ADMIN_USER);
      console.log('✅ Admin user created successfully');
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Name: ${newUser.name}`);
    }

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdminUser();

