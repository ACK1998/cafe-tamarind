// Simple menu endpoint for testing
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
    // Sample menu data for testing
    const sampleMenuItems = [
      {
        _id: "1",
        name: "Masala Dosa",
        description: "Crispy rice crepe with spiced potato filling",
        price: 120,
        category: "South Indian",
        stock: 20,
        isAvailable: true,
        availableFor: ["breakfast", "lunch"],
        type: "CUSTOMER"
      },
      {
        _id: "2", 
        name: "Butter Chicken",
        description: "Creamy tomato-based chicken curry",
        price: 280,
        category: "Main Course",
        stock: 15,
        isAvailable: true,
        availableFor: ["lunch", "dinner"],
        type: "CUSTOMER"
      },
      {
        _id: "3",
        name: "Biryani",
        description: "Aromatic rice dish with spices and meat",
        price: 320,
        category: "Rice",
        stock: 10,
        isAvailable: true,
        availableFor: ["lunch", "dinner"],
        type: "CUSTOMER"
      }
    ];

    const sampleCategories = ["South Indian", "Main Course", "Rice", "Beverages"];

    // Handle different menu endpoints
    if (req.url.includes('/categories')) {
      return res.json({
        success: true,
        data: sampleCategories
      });
    }
    
    if (req.url.includes('/customer')) {
      return res.json({
        success: true,
        data: sampleMenuItems,
        count: sampleMenuItems.length
      });
    }

    // Default menu response
    res.json({
      success: true,
      data: sampleMenuItems,
      count: sampleMenuItems.length
    });

  } catch (error) {
    console.error('Menu API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
