const express = require('express');
const { body } = require('express-validator');
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  getPreOrderMenuItems
} = require('../controllers/menuController');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// Validation middleware
const menuItemValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('availableFor')
    .isArray({ min: 1 })
    .withMessage('At least one meal time must be specified'),
  body('availableFor.*')
    .isIn(['breakfast', 'lunch', 'dinner'])
    .withMessage('Invalid meal time'),
  body('type')
    .optional()
    .isIn(['CUSTOMER', 'INHOUSE'])
    .withMessage('Type must be either CUSTOMER or INHOUSE'),
  body('portion')
    .optional()
    .isIn(['Half', 'Full', 'Single', 'Double', 'Regular'])
    .withMessage('Invalid portion type')
];

// Public routes - specific routes first
router.get('/categories', getCategories);
router.get('/pre-order', getPreOrderMenuItems);
router.get('/item/:id', getMenuItem);

// Customer menu route (only CUSTOMER type items)
router.get('/customer/:mealTime?', async (req, res) => {
  try {
    const { mealTime } = req.params;
    const query = { type: 'CUSTOMER', isAvailable: true };
    
    if (mealTime && ['breakfast', 'lunch', 'dinner'].includes(mealTime)) {
      query.availableFor = mealTime;
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    console.error('Error fetching customer menu:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// In-house menu route (only INHOUSE type items) - accessible to customers/employees
router.get('/inhouse/:mealTime?', async (req, res) => {
  try {
    const { mealTime } = req.params;
    const query = { type: 'INHOUSE', isAvailable: true };
    
    if (mealTime && ['breakfast', 'lunch', 'dinner'].includes(mealTime)) {
      query.availableFor = mealTime;
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    console.error('Error fetching in-house menu:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// General menu route (all items - for admin management)
router.get('/:mealTime?', getMenuItems);

// Admin routes
router.post('/', protect, admin, menuItemValidation, createMenuItem);
router.put('/:id', protect, admin, menuItemValidation, updateMenuItem);
router.delete('/:id', protect, admin, deleteMenuItem);

// Admin: Get menu items by type
router.get('/admin/type/:type', protect, admin, async (req, res) => {
  try {
    const { type } = req.params;
    if (!['CUSTOMER', 'INHOUSE'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid type' });
    }

    const menuItems = await MenuItem.find({ type }).sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    console.error('Error fetching menu by type:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: bulk update inHousePrice by item name and type
router.post('/admin/bulk-inhouse-prices', protect, admin, async (req, res) => {
  try {
    const { items, type = 'INHOUSE' } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    let updated = 0;
    let notFound = [];

    for (const entry of items) {
      const { name, price } = entry || {};
      if (typeof name !== 'string' || typeof price !== 'number') {
        continue;
      }
      const doc = await MenuItem.findOneAndUpdate(
        { name: name.trim(), type },
        { inHousePrice: price },
        { new: true }
      );
      if (doc) updated += 1; else notFound.push(name);
    }

    return res.json({ success: true, updated, notFound });
  } catch (err) {
    console.error('Bulk in-house price update error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: bulk update standard price by item name and type
router.post('/admin/bulk-standard-prices', protect, admin, async (req, res) => {
  try {
    const { items, type = 'CUSTOMER' } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    let updated = 0;
    let notFound = [];

    for (const entry of items) {
      const { name, price } = entry || {};
      if (typeof name !== 'string' || typeof price !== 'number') {
        continue;
      }
      const doc = await MenuItem.findOneAndUpdate(
        { name: name.trim(), type },
        { price },
        { new: true }
      );
      if (doc) updated += 1; else notFound.push(name);
    }

    return res.json({ success: true, updated, notFound });
  } catch (err) {
    console.error('Bulk standard price update error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: bulk update both standard and in-house prices in one call
router.post('/admin/bulk-prices', protect, admin, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    let updated = 0;
    let notFound = [];
    let updatedFieldsCount = { price: 0, inHousePrice: 0 };

    for (const entry of items) {
      const { name, price, inHousePrice, type } = entry || {};
      if (typeof name !== 'string') {
        continue;
      }
      const update = {};
      const query = { name: name.trim() };
      if (type) query.type = type;
      
      if (typeof price === 'number') { update.price = price; updatedFieldsCount.price += 1; }
      if (typeof inHousePrice === 'number') { update.inHousePrice = inHousePrice; updatedFieldsCount.inHousePrice += 1; }
      if (Object.keys(update).length === 0) continue;

      const doc = await MenuItem.findOneAndUpdate(query, update, { new: true });
      if (doc) updated += 1; else notFound.push(name);
    }

    return res.json({ success: true, updated, updatedFieldsCount, notFound });
  } catch (err) {
    console.error('Bulk price update error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
