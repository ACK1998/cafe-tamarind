#!/usr/bin/env node

/**
 * Cafe Tamarind Application Test Suite
 * This script tests the core functionality of the application
 */

const axios = require('axios');
const colors = require('colors/safe');

// Configuration
const config = {
  baseURL: 'http://localhost:5006/api',
  timeout: 10000
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0
};

// Utility functions
const log = {
  info: (msg) => console.log(colors.blue(`ℹ ${msg}`)),
  success: (msg) => console.log(colors.green(`✅ ${msg}`)),
  error: (msg) => console.log(colors.red(`❌ ${msg}`)),
  warning: (msg) => console.log(colors.yellow(`⚠ ${msg}`)),
  header: (msg) => console.log(colors.cyan.bold(`\n${msg}`))
};

// Test runner
const runTest = async (testName, testFn) => {
  results.total++;
  try {
    await testFn();
    results.passed++;
    log.success(`${testName} - PASSED`);
  } catch (error) {
    results.failed++;
    log.error(`${testName} - FAILED: ${error.message}`);
  }
};

// Test functions
const tests = {
  // Health check
  async healthCheck() {
    const response = await axios.get(`${config.baseURL}/health`, { timeout: config.timeout });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.status || response.data.status !== 'OK') {
      throw new Error('Health check failed');
    }
  },

  // Menu API tests
  async getMenuItems() {
    const response = await axios.get(`${config.baseURL}/menu`, { timeout: config.timeout });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error('Menu items should be an array');
    }
    if (response.data.data.length === 0) {
      throw new Error('No menu items found');
    }
  },

  async getMenuCategories() {
    const response = await axios.get(`${config.baseURL}/menu/categories`, { timeout: config.timeout });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error('Categories should be an array');
    }
  },

  // Admin authentication tests
  async adminLogin() {
    const loginData = {
      email: 'admin@cafetamarind.com',
      password: 'password123'
    };
    
    const response = await axios.post(`${config.baseURL}/auth/login`, loginData, { timeout: config.timeout });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.data || !response.data.data.token) {
      throw new Error('No token received');
    }
    return response.data.data.token;
  },

  async adminAccess(token) {
    const response = await axios.get(`${config.baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: config.timeout
    });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.data || response.data.data.role !== 'admin') {
      throw new Error('Admin access denied');
    }
  },

  // OTP tests
  async generateOTP() {
    const response = await axios.post(`${config.baseURL}/auth/generate-otp`, {
      phone: '+919876543210'
    }, { timeout: config.timeout });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('OTP generation failed');
    }
  },

  // Order tests
  async placeOrder() {
    const orderData = {
      customerName: 'Test Customer',
      customerPhone: '+919876543210',
      items: [
        {
          menuItemId: '507f1f77bcf86cd799439011', // This will fail, but tests the endpoint
          qty: 1
        }
      ],
      mealTime: 'lunch'
    };

    try {
      const response = await axios.post(`${config.baseURL}/orders`, orderData, { timeout: config.timeout });
      // If we get here, the order was placed successfully
      if (response.status !== 201) {
        throw new Error(`Expected status 201, got ${response.status}`);
      }
    } catch (error) {
      // Expected to fail due to invalid menu item ID, but should return proper error
      if (error.response && error.response.status === 400) {
        // This is expected behavior
        return;
      }
      throw error;
    }
  },

  // Database connection test
  async databaseConnection() {
    // This is a basic test - in a real scenario, you'd test actual database operations
    const response = await axios.get(`${config.baseURL}/menu`, { timeout: config.timeout });
    if (response.status === 500) {
      throw new Error('Database connection failed');
    }
  }
};

// Main test runner
const runAllTests = async () => {
  log.header('🧪 Cafe Tamarind Application Test Suite');
  log.info('Starting comprehensive application tests...\n');

  // Basic connectivity tests
  log.header('🔗 Connectivity Tests');
  await runTest('Health Check', tests.healthCheck);
  await runTest('Database Connection', tests.databaseConnection);

  // API functionality tests
  log.header('🍽️ Menu API Tests');
  await runTest('Get Menu Items', tests.getMenuItems);
  await runTest('Get Menu Categories', tests.getMenuCategories);

  // Authentication tests
  log.header('🔐 Authentication Tests');
  await runTest('Generate OTP', tests.generateOTP);
  
  let adminToken;
  try {
    adminToken = await tests.adminLogin();
    await runTest('Admin Login', () => Promise.resolve());
    await runTest('Admin Access', () => tests.adminAccess(adminToken));
  } catch (error) {
    await runTest('Admin Login', () => { throw error; });
  }

  // Order tests
  log.header('📦 Order Tests');
  await runTest('Place Order Validation', tests.placeOrder);

  // Results summary
  log.header('📊 Test Results Summary');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${colors.green(results.passed)}`);
  console.log(`Failed: ${colors.red(results.failed)}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`Success Rate: ${colors.cyan(successRate)}%`);

  if (results.failed === 0) {
    log.success('🎉 All tests passed!');
    process.exit(0);
  } else {
    log.error(`❌ ${results.failed} test(s) failed`);
    process.exit(1);
  }
};

// Error handling
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runAllTests().catch((error) => {
    log.error(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { tests, runTest };
