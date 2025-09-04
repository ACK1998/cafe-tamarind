const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
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

// Sample menu items
const menuItems = [
  {
    name: "Masala Dosa",
    description: "Crispy rice and lentil crepe filled with spiced potato mixture, served with sambar and coconut chutney",
    price: 120,
    stock: 50,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 10
  },
  {
    name: "Idli Sambar",
    description: "Steamed rice and lentil cakes served with hot sambar and coconut chutney",
    price: 80,
    stock: 40,
    category: "Breakfast",
    availableFor: ["breakfast"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 8
  },
  {
    name: "Paneer Butter Masala",
    description: "Cottage cheese cubes in rich tomato and cream gravy with aromatic spices",
    price: 280,
    stock: 30,
    category: "Main Course",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  },
  {
    name: "Chicken Biryani",
    description: "Fragrant basmati rice cooked with tender chicken and aromatic spices",
    price: 320,
    stock: 25,
    category: "Main Course",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 20
  },
  {
    name: "Dal Makhani",
    description: "Slow-cooked black lentils with cream and butter, served with rice or bread",
    price: 180,
    stock: 35,
    category: "Main Course",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 12
  },
  {
    name: "Cold Coffee",
    description: "Blended coffee with milk, sugar, and ice cream",
    price: 120,
    stock: 100,
    category: "Beverages",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 5
  },
  {
    name: "Masala Chai",
    description: "Traditional Indian tea with milk and aromatic spices",
    price: 40,
    stock: 100,
    category: "Beverages",
    availableFor: ["breakfast", "lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: false,
    preparationTime: 3
  },
  {
    name: "Gulab Jamun",
    description: "Sweet milk solids dumplings soaked in sugar syrup",
    price: 60,
    stock: 50,
    category: "Desserts",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 5
  },
  {
    name: "Rasmalai",
    description: "Soft cottage cheese patties soaked in sweetened, thickened milk",
    price: 80,
    stock: 30,
    category: "Desserts",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 5
  },
  {
    name: "Veg Thali",
    description: "Complete meal with rice, dal, vegetables, roti, and accompaniments",
    price: 220,
    stock: 20,
    category: "Thali",
    availableFor: ["lunch", "dinner"],
    isAvailable: true,
    availableForPreOrder: true,
    preparationTime: 15
  }
];

// Admin user data
const adminUser = {
  name: "Admin",
  email: "admin@cafetamarind.com",
  phone: "+1234567890",
  password: "password123",
  role: "admin",
  isActive: true
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    const admin = await User.create({
      ...adminUser,
      password: hashedPassword
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // Create menu items
    console.log('🍽️ Creating menu items...');
    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`✅ ${createdMenuItems.length} menu items created`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Admin Login Credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    console.log('\n🍽️ Menu items have been added with the following categories:');
    
    const categories = [...new Set(menuItems.map(item => item.category))];
    categories.forEach(category => {
      const items = menuItems.filter(item => item.category === category);
      console.log(`- ${category}: ${items.length} items`);
    });

    console.log('\n🚀 You can now start the application and login as admin!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeding
connectDB().then(() => {
  seedDatabase();
});
