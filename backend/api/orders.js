// Simple orders endpoint for testing
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
    if (req.method === 'POST') {
      // Simulate order creation
      const orderData = req.body;
      
      const mockOrder = {
        _id: "order_" + Date.now(),
        orderNumber: "TM" + new Date().getFullYear().toString().slice(-2) + 
                    (new Date().getMonth() + 1).toString().padStart(2, '0') + 
                    new Date().getDate().toString().padStart(2, '0') + "001",
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        items: orderData.items || [],
        total: orderData.total || 0,
        status: 'pending',
        mealTime: orderData.mealTime || 'lunch',
        createdAt: new Date().toISOString(),
        specialInstructions: orderData.specialInstructions || ''
      };

      return res.status(201).json({
        success: true,
        data: mockOrder,
        message: 'Order placed successfully (test mode)'
      });
    }

    // GET request - return empty orders
    res.json({
      success: true,
      data: [],
      count: 0,
      message: 'No orders found (test mode)'
    });

  } catch (error) {
    console.error('Orders API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
