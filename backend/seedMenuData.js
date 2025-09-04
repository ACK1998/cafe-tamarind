const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const MenuItem = require('./models/MenuItem');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-tamarind', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`🗄️ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Menu items with both customer (guest) and in-house prices
const menuItems = [
  // BREAKFAST
  {
    name: "Appam",
    description: "Traditional Kerala rice pancake",
    price: 25, // Guest price
    inHousePrice: 15, // In-house price
    stock: 50,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 10
  },
  {
    name: "Puttu",
    description: "Steamed rice cake with coconut",
    price: 20,
    inHousePrice: 15,
    stock: 50,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 8
  },
  {
    name: "Puri",
    description: "Deep-fried bread served with curry",
    price: 20,
    inHousePrice: 12,
    stock: 40,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 10
  },
  {
    name: "Dosa",
    description: "Crispy rice and lentil crepe",
    price: 25,
    inHousePrice: 15,
    stock: 50,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 10
  },
  {
    name: "Idli",
    description: "Steamed rice and lentil cakes",
    price: 20,
    inHousePrice: 13,
    stock: 50,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 8
  },
  {
    name: "Upma",
    description: "Savory semolina dish with vegetables",
    price: 65,
    inHousePrice: 45,
    stock: 30,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 12
  },
  {
    name: "Bhatura",
    description: "Deep-fried leavened bread",
    price: 25,
    inHousePrice: 15,
    stock: 30,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Veg Stew(BF)",
    description: "Mixed vegetable stew for breakfast",
    price: 90,
    inHousePrice: 30,
    stock: 25,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 20
  },
  {
    name: "Veg Kuruma(BF)",
    description: "Spiced vegetable curry for breakfast",
    price: 90,
    inHousePrice: 30,
    stock: 25,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 20
  },
  {
    name: "Kadala Curry",
    description: "Black chickpea curry",
    price: 80,
    inHousePrice: 25,
    stock: 30,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Bhaji",
    description: "Spiced vegetable fritters",
    price: 70,
    inHousePrice: 25,
    stock: 25,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 12
  },
  {
    name: "Chenna Masala",
    description: "Spiced chickpea curry",
    price: 90,
    inHousePrice: 30,
    stock: 30,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Green Gram Curry Half",
    description: "Green gram curry - half portion",
    price: 80,
    inHousePrice: 30,
    stock: 25,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 18
  },
  {
    name: "Green Gram Curry Full",
    description: "Green gram curry - full portion",
    price: 120,
    inHousePrice: 55,
    stock: 20,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 18
  },
  {
    name: "Green Peas Masala",
    description: "Spiced green peas curry",
    price: 90,
    inHousePrice: 30,
    stock: 25,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Egg Curry (single piece)",
    description: "Single egg curry",
    price: 95,
    inHousePrice: 30,
    stock: 30,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 12
  },
  {
    name: "Egg Roast",
    description: "Spiced roasted eggs",
    price: 60,
    inHousePrice: 30,
    stock: 30,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 10
  },
  {
    name: "Cornflakes",
    description: "Crispy corn flakes with milk",
    price: 85,
    inHousePrice: 70,
    stock: 50,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 3
  },
  {
    name: "Muesli",
    description: "Healthy mixed grain cereal",
    price: 100,
    inHousePrice: 85,
    stock: 30,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 3
  },
  {
    name: "cheesy bread omlette",
    description: "Bread omelette with cheese",
    price: 80,
    inHousePrice: 60,
    stock: 25,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 8
  },
  {
    name: "BREAD BUTTER TOAST",
    description: "Toasted bread with butter",
    price: 45,
    inHousePrice: 25,
    stock: 40,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },
  {
    name: "toasted bread (plain) 1set",
    description: "Plain toasted bread - 1 set",
    price: 15,
    inHousePrice: 10,
    stock: 50,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 3
  },
  {
    name: "Bread peanut butter toast(2set)",
    description: "Peanut butter toast - 2 pieces",
    price: 70,
    inHousePrice: 50,
    stock: 30,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },
  {
    name: "Bread Butter Jam",
    description: "Toast with butter and jam",
    price: 80,
    inHousePrice: 50,
    stock: 30,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },

  // LUNCH
  {
    name: "Veg Meals",
    description: "Traditional vegetarian meal with rice and accompaniments",
    price: 130,
    inHousePrice: 50,
    stock: 30,
    category: "Lunch",
    availableFor: ["lunch"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 20
  },
  {
    name: "veg biriyani",
    description: "Fragrant vegetarian biryani",
    price: 190,
    inHousePrice: 70,
    stock: 25,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 25
  },
  {
    name: "Veg Meals(SP)",
    description: "Special vegetarian meals",
    price: 190,
    inHousePrice: 75,
    stock: 20,
    category: "Lunch",
    availableFor: ["lunch"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 25
  },
  {
    name: "Chicken Biriyani Half",
    description: "Half portion chicken biryani",
    price: 260,
    inHousePrice: 90,
    stock: 20,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 30
  },
  {
    name: "Chicken Biriyani Full",
    description: "Full portion chicken biryani",
    price: 260,
    inHousePrice: 130,
    stock: 15,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 30
  },
  {
    name: "Beef Biriyani Half",
    description: "Half portion beef biryani",
    price: 280,
    inHousePrice: 95,
    stock: 15,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 35
  },
  {
    name: "Beef Biriyani Full",
    description: "Full portion beef biryani",
    price: 280,
    inHousePrice: 140,
    stock: 12,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 35
  },
  {
    name: "Mutton Biriyani Half",
    description: "Half portion mutton biryani",
    price: 320,
    inHousePrice: 145,
    stock: 10,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 40
  },
  {
    name: "Mutton Biriyani Full",
    description: "Full portion mutton biryani",
    price: 320,
    inHousePrice: 230,
    stock: 8,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 40
  },
  {
    name: "Veg Pulao",
    description: "Fragrant vegetable pulao rice",
    price: 155,
    inHousePrice: 90,
    stock: 25,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 20
  },
  {
    name: "Chicken Pulao",
    description: "Chicken pulao rice",
    price: 245,
    inHousePrice: 120,
    stock: 20,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 25
  },
  {
    name: "Curd Rice",
    description: "Rice mixed with yogurt and spices",
    price: 110,
    inHousePrice: 60,
    stock: 30,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 8
  },
  {
    name: "Ghee Rice Half",
    description: "Ghee rice - half portion",
    price: 140,
    inHousePrice: 60,
    stock: 25,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Ghee Rice Full",
    description: "Ghee rice - full portion",
    price: 140,
    inHousePrice: 85,
    stock: 20,
    category: "Lunch",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },

  // VEG ITEMS
  {
    name: "Dal Fry",
    description: "Tempered lentil curry",
    price: 125,
    inHousePrice: 55,
    stock: 30,
    category: "Vegetarian",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Dal Tadka",
    description: "Spiced lentil curry with tempering",
    price: 135,
    inHousePrice: 55,
    stock: 30,
    category: "Vegetarian",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Veg Kuruma",
    description: "Mixed vegetable curry",
    price: 190,
    inHousePrice: 75,
    stock: 25,
    category: "Vegetarian",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 20
  },
  {
    name: "Paneer Butter Masala",
    description: "Cottage cheese in rich tomato gravy",
    price: 240,
    inHousePrice: 120,
    stock: 20,
    category: "Vegetarian",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 18
  },
  {
    name: "Chilli Gobi",
    description: "Spicy cauliflower dish",
    price: 230,
    inHousePrice: 120,
    stock: 25,
    category: "Vegetarian",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Gobi Manchurian",
    description: "Indo-Chinese cauliflower dish",
    price: 230,
    inHousePrice: 120,
    stock: 25,
    category: "Vegetarian",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Chilli Paneer",
    description: "Spicy cottage cheese dish",
    price: 255,
    inHousePrice: 120,
    stock: 20,
    category: "Vegetarian",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Mushroom Masala",
    description: "Spiced mushroom curry",
    price: 255,
    inHousePrice: 130,
    stock: 20,
    category: "Vegetarian",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 18
  },
  {
    name: "Tomato Fry",
    description: "Spiced tomato curry",
    price: 145,
    inHousePrice: 60,
    stock: 25,
    category: "Vegetarian",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 12
  },
  {
    name: "Aloo Gobi Masala",
    description: "Potato and cauliflower curry",
    price: 220,
    inHousePrice: 120,
    stock: 25,
    category: "Vegetarian",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 20
  },

  // HOT BEVERAGES
  {
    name: "Tea",
    description: "Traditional Indian tea",
    price: 20,
    inHousePrice: 12,
    stock: 100,
    category: "Beverages",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 3
  },
  {
    name: "Black Tea",
    description: "Plain black tea",
    price: 15,
    inHousePrice: 10,
    stock: 100,
    category: "Beverages",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 3
  },
  {
    name: "Coffee",
    description: "Filter coffee",
    price: 25,
    inHousePrice: 15,
    stock: 100,
    category: "Beverages",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },
  {
    name: "Black Coffee",
    description: "Plain black coffee",
    price: 20,
    inHousePrice: 12,
    stock: 100,
    category: "Beverages",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 3
  },
  {
    name: "Horlicks",
    description: "Malted drink",
    price: 25,
    inHousePrice: 15,
    stock: 50,
    category: "Beverages",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },
  {
    name: "Boost",
    description: "Energy drink",
    price: 25,
    inHousePrice: 15,
    stock: 50,
    category: "Beverages",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },
  {
    name: "Milk",
    description: "Fresh milk",
    price: 25,
    inHousePrice: 15,
    stock: 50,
    category: "Beverages",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 3
  },

  // FRESH JUICE
  {
    name: "Fresh Lime",
    description: "Fresh lime juice",
    price: 45,
    inHousePrice: 20,
    stock: 50,
    category: "Fresh Juice",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },
  {
    name: "Mint Lime",
    description: "Fresh lime with mint",
    price: 55,
    inHousePrice: 25,
    stock: 40,
    category: "Fresh Juice",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 8
  },
  {
    name: "Watermelon",
    description: "Fresh watermelon juice",
    price: 85,
    inHousePrice: 55,
    stock: 30,
    category: "Fresh Juice",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },
  {
    name: "Orange",
    description: "Fresh orange juice",
    price: 90,
    inHousePrice: 60,
    stock: 30,
    category: "Fresh Juice",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },
  {
    name: "Mango",
    description: "Fresh mango juice",
    price: 95,
    inHousePrice: 70,
    stock: 25,
    category: "Fresh Juice",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 8
  },

  // MILK SHAKE
  {
    name: "Mango",
    description: "Mango milkshake",
    price: 110,
    inHousePrice: 70,
    stock: 25,
    category: "Milk Shake",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 8
  },
  {
    name: "Banana",
    description: "Banana milkshake",
    price: 110,
    inHousePrice: 70,
    stock: 30,
    category: "Milk Shake",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },
  {
    name: "Oreo",
    description: "Oreo cookie milkshake",
    price: 120,
    inHousePrice: 80,
    stock: 25,
    category: "Milk Shake",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 8
  },

  // OTHER ITEMS
  {
    name: "Chapathi",
    description: "Indian flatbread",
    price: 25,
    inHousePrice: 10,
    stock: 50,
    category: "Bread",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 8
  },
  {
    name: "Porotta",
    description: "Layered flatbread",
    price: 30,
    inHousePrice: 15,
    stock: 40,
    category: "Bread",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 10
  },

  // EGG ITEMS
  {
    name: "Bullseye Single",
    description: "Single fried egg",
    price: 40,
    inHousePrice: 15,
    stock: 50,
    category: "Egg Items",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 5
  },
  {
    name: "Bullseye Double",
    description: "Double fried eggs",
    price: 55,
    inHousePrice: 25,
    stock: 40,
    category: "Egg Items",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 8
  },
  {
    name: "Omlette Single",
    description: "Single egg omelette",
    price: 35,
    inHousePrice: 20,
    stock: 50,
    category: "Egg Items",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 5
  },
  {
    name: "Omlette Double",
    description: "Double egg omelette",
    price: 55,
    inHousePrice: 30,
    stock: 40,
    category: "Egg Items",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 8
  },
  {
    name: "scrambled egg Single",
    description: "Single scrambled egg",
    price: 45,
    inHousePrice: 15,
    stock: 50,
    category: "Egg Items",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 5
  },
  {
    name: "scrambled egg Double",
    description: "Double scrambled eggs",
    price: 55,
    inHousePrice: 25,
    stock: 40,
    category: "Egg Items",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 8
  },
  {
    name: "boiled egg",
    description: "Boiled egg",
    price: 20,
    inHousePrice: 12,
    stock: 50,
    category: "Egg Items",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 10
  },
  {
    name: "poached egg (double)",
    description: "Two poached eggs",
    price: 60,
    inHousePrice: 35,
    stock: 30,
    category: "Egg Items",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 10
  },
  {
    name: "bread omlette",
    description: "Omelette with bread",
    price: 60,
    inHousePrice: 45,
    stock: 30,
    category: "Egg Items",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 8
  }
];

// Seed function
const seedMenuData = async () => {
  try {
    console.log('🌱 Starting menu data seeding...');

    // Clear existing menu items
    console.log('🧹 Clearing existing menu items...');
    await MenuItem.deleteMany({});
    console.log('✅ Existing menu items cleared');

    // Create new menu items
    console.log('🍽️ Creating menu items with pricing...');
    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`✅ ${createdMenuItems.length} menu items created`);

    console.log('\n🎉 Menu data seeding completed successfully!');
    console.log('\n📊 Menu Statistics:');
    
    const categories = [...new Set(menuItems.map(item => item.category))];
    categories.forEach(category => {
      const items = menuItems.filter(item => item.category === category);
      console.log(`- ${category}: ${items.length} items`);
    });

    console.log('\n💰 Pricing Summary:');
    console.log('- All items now have both customer (guest) and in-house prices');
    console.log('- Customer prices are shown to regular users');
    console.log('- In-house prices are available when admin places orders with in-house pricing tier');

    console.log('\n🚀 Your database is now updated with the new menu and pricing!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeding
connectDB().then(() => {
  seedMenuData();
});
