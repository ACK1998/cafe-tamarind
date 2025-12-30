#!/usr/bin/env node

/**
 * Script to backfill Customer records from existing orders
 * This creates Customer records for all orders that don't have customerId linked
 * Usage: node scripts/backfillCustomersFromOrders.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const backfillCustomers = async () => {
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
    console.log(`📊 Database: ${mongoose.connection.name}\n`);

    // Find all orders
    console.log('📦 Fetching all orders...');
    const allOrders = await Order.find({}).lean();
    console.log(`   Found ${allOrders.length} total orders\n`);

    // Group orders by phone number
    const ordersByPhone = {};
    
    for (const order of allOrders) {
      if (!order.customerPhone) continue;
      
      // Normalize phone to 10 digits
      const normalizedPhone = order.customerPhone.replace(/\D/g, '').slice(-10);
      
      if (normalizedPhone.length !== 10) {
        console.log(`⚠️  Skipping order ${order._id}: Invalid phone number "${order.customerPhone}"`);
        continue;
      }

      if (!ordersByPhone[normalizedPhone]) {
        ordersByPhone[normalizedPhone] = {
          phone: normalizedPhone,
          orders: [],
          names: new Set(),
          hasInHouse: false,
          hasStandard: false
        };
      }

      ordersByPhone[normalizedPhone].orders.push(order);
      ordersByPhone[normalizedPhone].names.add(order.customerName);
      
      // Track pricing tier
      if (order.pricingTier === 'inhouse') {
        ordersByPhone[normalizedPhone].hasInHouse = true;
      } else {
        ordersByPhone[normalizedPhone].hasStandard = true;
      }
    }

    console.log(`📱 Found ${Object.keys(ordersByPhone).length} unique phone numbers\n`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let linkedCount = 0;

    // Process each phone number
    for (const [phone, data] of Object.entries(ordersByPhone)) {
      try {
        // Check if customer already exists
        let customer = await Customer.findOne({ phone });
        
        if (customer) {
          // Customer exists, update name if needed and link orders
          const mostCommonName = Array.from(data.names).reduce((a, b) => 
            data.orders.filter(o => o.customerName === b).length > 
            data.orders.filter(o => o.customerName === a).length ? b : a
          );
          
          if (customer.name !== mostCommonName) {
            customer.name = mostCommonName;
            await customer.save();
            updatedCount++;
            console.log(`   ✅ Updated customer: ${mostCommonName} (${phone})`);
          }
        } else {
          // Create new customer
          // Determine role: if has any in-house orders, make them employee
          // Otherwise, make them customer
          const role = data.hasInHouse ? 'employee' : 'customer';
          const mostCommonName = Array.from(data.names).reduce((a, b) => 
            data.orders.filter(o => o.customerName === b).length > 
            data.orders.filter(o => o.customerName === a).length ? b : a
          );
          
          // Generate a default password
          const defaultPassword = `temp${Date.now()}${Math.random().toString(36).slice(2)}`;
          
          customer = await Customer.create({
            name: mostCommonName,
            phone: phone,
            password: defaultPassword,
            role: role,
            isVerified: role === 'customer', // Customers auto-verified, employees need admin verification
            isActive: true
          });
          
          createdCount++;
          console.log(`   ✅ Created ${role}: ${mostCommonName} (${phone}) - ${data.orders.length} orders`);
        }

        // Link all orders for this phone to the customer
        const orderIds = data.orders
          .filter(o => !o.customerId || o.customerId.toString() !== customer._id.toString())
          .map(o => o._id);
        
        if (orderIds.length > 0) {
          await Order.updateMany(
            { _id: { $in: orderIds } },
            { $set: { customerId: customer._id } }
          );
          linkedCount += orderIds.length;
        }

      } catch (error) {
        console.error(`   ❌ Error processing phone ${phone}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${createdCount} customers`);
    console.log(`   🔄 Updated: ${updatedCount} customers`);
    console.log(`   🔗 Linked: ${linkedCount} orders to customers`);
    console.log(`   ⚠️  Skipped: ${skippedCount} phone numbers`);
    console.log(`   📦 Total orders processed: ${allOrders.length}`);

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    console.log('🎉 Backfill completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

backfillCustomers();


