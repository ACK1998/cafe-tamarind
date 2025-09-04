const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { validationResult } = require('express-validator');

// @desc    Place new order (no authentication required for customers)
// @route   POST /api/orders
// @access  Public
const placeOrder = async (req, res) => {
  console.log('📦 Order placement request received:', req.body);
  
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { 
      customerName, 
      customerPhone, 
      items, 
      mealTime, 
      specialInstructions, 
      orderType, 
      scheduledFor,
      isPreOrder, 
      preOrderDateTime, 
      customerId, 
      createdBy,
      pricingTier 
    } = req.body;

    if (!customerName || !customerPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer name and phone are required' 
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order must contain at least one item' 
      });
    }

    // Validate meal time (optional for pre-orders)
    if (mealTime && !['breakfast', 'lunch', 'dinner', 'pre-order'].includes(mealTime)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid meal time' 
      });
    }

    // Validate order type
    if (orderType && !['NOW', 'PREORDER'].includes(orderType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid order type' 
      });
    }

    // Validate pre-order information
    if (orderType === 'PREORDER') {
      if (!scheduledFor) {
        return res.status(400).json({ 
          success: false, 
          message: 'Scheduled date and time are required for pre-orders' 
        });
      }

      const scheduledDate = new Date(scheduledFor);
      const now = new Date();
      
      // Check if scheduled date is in the future
      if (scheduledDate <= now) {
        return res.status(400).json({ 
          success: false, 
          message: 'Pre-order date and time must be in the future' 
        });
      }

      // Check if pre-order is within 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      if (scheduledDate > threeDaysFromNow) {
        return res.status(400).json({ 
          success: false, 
          message: 'Pre-orders can only be placed up to 3 days in advance' 
        });
      }
    }

    // Legacy pre-order validation (for backward compatibility)
    if (isPreOrder && !preOrderDateTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pre-order date and time are required for pre-orders' 
      });
    }

    if (isPreOrder && preOrderDateTime) {
      const preOrderDate = new Date(preOrderDateTime);
      const now = new Date();
      
      // Check if pre-order date is in the future
      if (preOrderDate <= now) {
        return res.status(400).json({ 
          success: false, 
          message: 'Pre-order date and time must be in the future' 
        });
      }

      // Check if pre-order is within 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      if (preOrderDate > threeDaysFromNow) {
        return res.status(400).json({ 
          success: false, 
          message: 'Pre-orders can only be placed up to 3 days in advance' 
        });
      }
    }

    // Validate items and check availability
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId).session(session);
      
      if (!menuItem) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          message: `Menu item ${item.menuItemId} not found` 
        });
      }

      if (!menuItem.isAvailable) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          message: `${menuItem.name} is not available` 
        });
      }

      // Skip meal time validation for pre-orders
      if (mealTime && mealTime !== 'pre-order' && !menuItem.availableFor.includes(mealTime)) {
        console.log(`❌ Meal time validation failed for ${menuItem.name}:`);
        console.log(`   Requested meal time: ${mealTime}`);
        console.log(`   Available for: ${menuItem.availableFor}`);
        console.log(`   Created by: ${createdBy}`);
        
        // Allow admin-created orders to bypass meal time restrictions
        if (createdBy === 'admin') {
          console.log(`✅ Bypassing meal time validation for admin order`);
        } else {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false, 
            message: `${menuItem.name} is not available for ${mealTime}. Available for: ${menuItem.availableFor.join(', ')}` 
          });
        }
      }

      // Validate pre-order items are available for pre-order
      if (mealTime === 'pre-order' && !menuItem.availableForPreOrder) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          message: `${menuItem.name} is not available for pre-order` 
        });
      }

      if (menuItem.stock < item.qty) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${menuItem.name}` 
        });
      }

      // Allow in-house pricing if pricingTier is 'inhouse' and either:
      // 1. Admin user (req.user.role === 'admin'), or
      // 2. Employee customer (req.customer.role === 'employee'), or  
      // 3. Order created by admin (createdBy === 'admin')
      const allowInHouse = pricingTier === 'inhouse' && (
        (req.user && req.user.role === 'admin') ||
        (req.customer && req.customer.role === 'employee') ||
        createdBy === 'admin'
      );
      const unitPrice = allowInHouse && menuItem.inHousePrice != null
        ? menuItem.inHousePrice
        : menuItem.price;
      const itemTotal = unitPrice * item.qty;
      total += itemTotal;

      validatedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        qty: item.qty,
        price: unitPrice,
        total: itemTotal
      });

      // Update stock within transaction
      await MenuItem.findByIdAndUpdate(menuItem._id, {
        $inc: { stock: -item.qty }
      }, { session });
    }

    // Create order within transaction
    const orderData = {
      customerName,
      customerPhone,
      items: validatedItems,
      total,
      mealTime,
      specialInstructions,
      orderType: orderType || 'NOW',
      createdBy: createdBy || 'customer',
      pricingTier: pricingTier === 'inhouse' ? 'inhouse' : 'standard'
    };

    // Add customer ID if provided (for authenticated customers)
    if (customerId) {
      orderData.customerId = customerId;
    }

    // Add scheduled information if it's a pre-order
    if (orderType === 'PREORDER' && scheduledFor) {
      orderData.scheduledFor = new Date(scheduledFor);
    }

    // Add legacy pre-order information if provided (for backward compatibility)
    if (isPreOrder && preOrderDateTime) {
      orderData.isPreOrder = true;
      orderData.preOrderDateTime = new Date(preOrderDateTime);
    }

    const order = await Order.create([orderData], { session });

    // Commit transaction
    await session.commitTransaction();

    // Prepare response data with customer information
    const responseData = {
      ...order[0].toObject(),
      customerData: {
        name: customerName,
        phone: customerPhone,
        _id: order[0].customerId || null
      }
    };

    res.status(201).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error('Place order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get order by ID (public access with order number)
// @route   GET /api/orders/:orderId
// @access  Public
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.menuItemId', 'name description image');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get orders by phone number (for customers to view their orders)
// @route   GET /api/orders/customer/:phone
// @access  Public
const getCustomerOrders = async (req, res) => {
  try {
    const { phone } = req.params;
    
    const orders = await Order.find({ customerPhone: phone })
      .populate('items.menuItemId', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, mealTime, page = 1, limit = 10 } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (mealTime) {
      query.mealTime = mealTime;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get customer orders (Admin only)
// @route   GET /api/orders/admin/customer
// @access  Private/Admin
const getAdminCustomerOrders = async (req, res) => {
  try {
    const { status, mealTime, page = 1, limit = 10 } = req.query;

    let query = { pricingTier: 'standard' };

    if (status) {
      query.status = status;
    }

    if (mealTime) {
      query.mealTime = mealTime;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: orders
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get in-house orders (Admin only)
// @route   GET /api/orders/admin/inhouse
// @access  Private/Admin
const getInHouseOrders = async (req, res) => {
  try {
    const { status, mealTime, page = 1, limit = 10 } = req.query;

    let query = { pricingTier: 'inhouse' };

    if (status) {
      query.status = status;
    }

    if (mealTime) {
      query.mealTime = mealTime;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: orders
    });
  } catch (error) {
    console.error('Get in-house orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/admin/:orderId
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    order.status = status;

    // Set ready time when status changes to ready
    if (status === 'ready') {
      order.actualReadyTime = new Date();
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  placeOrder,
  getOrder,
  getCustomerOrders,
  getAllOrders,
  getAdminCustomerOrders,
  getInHouseOrders,
  updateOrderStatus
};
