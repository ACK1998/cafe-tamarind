#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Cafe Tamarind...\n');

// Check if Node.js is installed
try {
  execSync('node --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Install root dependencies
console.log('📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Create .env file for backend if it doesn't exist
const backendEnvPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(backendEnvPath)) {
  console.log('\n📝 Creating backend .env file...');
  const envContent = `# Server Configuration
PORT=5006
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cafe-tamarind

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3006
`;
  
  fs.writeFileSync(backendEnvPath, envContent);
  console.log('✅ Backend .env file created');
}

console.log('\n✅ Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Start MongoDB server');
console.log('2. Update backend/.env with your MongoDB connection string');
console.log('3. Run "cd backend && npm run seed" to populate database with admin user and menu items');
console.log('4. Run "npm run dev" to start both frontend and backend');
console.log('5. Visit http://localhost:3006 for the customer interface');
console.log('6. Visit http://localhost:3006/admin/login for admin access');
console.log('\n🔑 Admin Login Credentials (after seeding):');
console.log('Email: admin@cafetamarind.com');
console.log('Password: password123');
console.log('\n�� Happy coding!');
