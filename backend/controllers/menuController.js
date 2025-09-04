const MenuItem = require('../models/MenuItem');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Get all menu items (with optional meal time filter)
// @route   GET /api/menu/:mealTime?
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const { mealTime } = req.params;
    const { category } = req.query;

    let query = { isAvailable: true };

    // Filter by meal time if provided
    if (mealTime && ['breakfast', 'lunch', 'dinner'].includes(mealTime)) {
      query.availableFor = mealTime;
    }

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    const menuItems = await MenuItem.find(query)
      .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/item/:id
// @access  Public
const getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create menu item (Admin only)
// @route   POST /api/admin/menu
// @access  Private/Admin
const createMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update menu item (Admin only)
// @route   PUT /api/admin/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete menu item (Admin only)
// @route   DELETE /api/admin/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }

    await menuItem.deleteOne();

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get menu categories
// @route   GET /api/menu/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');
    
    res.json({
      success: true,
      data: categories.filter(category => category) // Remove null/undefined
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get menu items available for pre-order
// @route   GET /api/menu/pre-order
// @access  Public
const getPreOrderMenuItems = async (req, res) => {
  try {
    const { category } = req.query;

    let query = { 
      isAvailable: true,
      availableForPreOrder: true 
    };

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    const menuItems = await MenuItem.find(query)
      .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('Get pre-order menu items error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  getPreOrderMenuItems
};
