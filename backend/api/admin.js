// Simple admin endpoints for admin panel functionality
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Sample admin data for testing
    const sampleUsers = [
      {
        _id: "user_001",
        name: "Admin User",
        email: "admin@cafetamarind.com",
        phone: "+1234567890",
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: "user_002", 
        name: "Manager User",
        email: "manager@cafetamarind.com",
        phone: "+1234567891",
        role: "admin",
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    const sampleStats = {
      totalOrders: 25,
      pendingOrders: 5,
      completedOrders: 18,
      totalRevenue: 12500,
      todayOrders: 8,
      todayRevenue: 2400
    };

    // Handle different admin endpoints
    if (req.url.includes('/users')) {
      if (req.method === 'GET') {
        return res.json({
          success: true,
          data: sampleUsers,
          count: sampleUsers.length
        });
      }
      
      if (req.method === 'POST') {
        const userData = req.body;
        const newUser = {
          _id: "user_" + Date.now(),
          ...userData,
          createdAt: new Date().toISOString()
        };
        
        return res.status(201).json({
          success: true,
          data: newUser,
          message: "User created successfully"
        });
      }
      
      if (req.method === 'PUT') {
        const userData = req.body;
        return res.json({
          success: true,
          data: { ...sampleUsers[0], ...userData },
          message: "User updated successfully"
        });
      }
      
      if (req.method === 'DELETE') {
        return res.json({
          success: true,
          message: "User deleted successfully"
        });
      }
    }

    if (req.url.includes('/stats')) {
      return res.json({
        success: true,
        data: sampleStats
      });
    }

    if (req.url.includes('/orders')) {
      // Return sample orders for admin panel
      const sampleOrders = [
        {
          _id: "order_001",
          orderNumber: "TM24010001",
          customerName: "John Doe",
          customerPhone: "+1234567890",
          items: [
            { name: "Masala Dosa", qty: 2, price: 120, total: 240 },
            { name: "Filter Coffee", qty: 1, price: 50, total: 50 }
          ],
          total: 290,
          status: "pending",
          mealTime: "breakfast",
          createdAt: new Date().toISOString(),
          pricingTier: "standard"
        },
        {
          _id: "order_002", 
          orderNumber: "TM24010002",
          customerName: "Jane Smith",
          customerPhone: "+1234567891",
          items: [
            { name: "Butter Chicken", qty: 1, price: 280, total: 280 }
          ],
          total: 280,
          status: "preparing", 
          mealTime: "lunch",
          createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
          pricingTier: "standard"
        }
      ];

      return res.json({
        success: true,
        data: sampleOrders,
        count: sampleOrders.length,
        total: sampleOrders.length,
        pages: 1,
        currentPage: 1
      });
    }

    // Default admin response
    res.json({
      success: true,
      message: "Admin endpoint working",
      data: { adminAccess: true }
    });

  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
