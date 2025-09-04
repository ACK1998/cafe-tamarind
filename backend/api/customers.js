// Simple customers endpoint for admin panel
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
    // Sample customer orders for testing
    const sampleOrders = [
      {
        _id: "order_001",
        orderNumber: "TM24010001",
        customerName: "John Doe",
        customerPhone: "+1234567890",
        items: [
          {
            name: "Masala Dosa",
            qty: 2,
            price: 120,
            total: 240
          },
          {
            name: "Filter Coffee",
            qty: 1,
            price: 50,
            total: 50
          }
        ],
        total: 290,
        status: "pending",
        mealTime: "breakfast",
        createdAt: new Date().toISOString(),
        specialInstructions: "Extra spicy"
      },
      {
        _id: "order_002",
        orderNumber: "TM24010002",
        customerName: "Jane Smith",
        customerPhone: "+1234567891",
        items: [
          {
            name: "Butter Chicken",
            qty: 1,
            price: 280,
            total: 280
          }
        ],
        total: 280,
        status: "preparing",
        mealTime: "lunch",
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
        specialInstructions: ""
      }
    ];

    // Handle different customer endpoints
    if (req.url.includes('/orders')) {
      return res.json({
        success: true,
        data: sampleOrders,
        count: sampleOrders.length
      });
    }

    if (req.url.includes('/profile')) {
      // Sample customer profile
      return res.json({
        success: true,
        data: {
          _id: "customer_001",
          name: "John Doe",
          phone: "+1234567890",
          email: "john@example.com",
          role: "customer"
        }
      });
    }

    // Handle customer registration/login
    if (req.method === 'POST') {
      const { phone, password, name, email } = req.body;

      if (req.url.includes('/register')) {
        return res.status(201).json({
          success: true,
          data: {
            _id: "customer_" + Date.now(),
            name: name,
            phone: phone,
            email: email,
            role: "customer"
          },
          message: "Customer registered successfully"
        });
      }

      if (req.url.includes('/login')) {
        // Simple customer login for testing
        return res.json({
          success: true,
          data: {
            _id: "customer_001",
            name: "Test Customer",
            phone: phone,
            email: "customer@test.com",
            role: "customer",
            token: Buffer.from(`customer:${phone}:${Date.now()}`).toString('base64')
          },
          message: "Login successful"
        });
      }
    }

    // Default response
    res.json({
      success: true,
      data: [],
      message: "Customer endpoint"
    });

  } catch (error) {
    console.error('Customers API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
