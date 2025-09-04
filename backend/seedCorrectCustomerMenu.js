const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

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

const correctCustomerMenuData = [
  // BREAKFAST
  { name: "Appam", price: 25, inHousePrice: 15, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Puttu", price: 20, inHousePrice: 15, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Puri", price: 20, inHousePrice: 12, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Dosa", price: 25, inHousePrice: 15, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Idli", price: 20, inHousePrice: 13, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Upma", price: 65, inHousePrice: 45, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Bhatura", price: 25, inHousePrice: 15, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Stew(BF)", price: 90, inHousePrice: 30, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Kuruma(BF)", price: 90, inHousePrice: 30, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Kadala Curry", price: 80, inHousePrice: 25, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Bhaji", price: 70, inHousePrice: 25, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chenna Masala", price: 90, inHousePrice: 30, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Green Gram Curry", price: 80, inHousePrice: 30, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Green Peas Masala", price: 90, inHousePrice: 30, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Egg Curry 2 piece", price: 95, inHousePrice: 30, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "maggie egg", price: 80, inHousePrice: 60, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Maggie cheese", price: 85, inHousePrice: 60, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "maggie plain", price: 40, inHousePrice: 30, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "cornflakes", price: 85, inHousePrice: 70, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "bun butter toast", price: 60, inHousePrice: 45, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "bread butter toast", price: 45, inHousePrice: 25, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "museli", price: 100, inHousePrice: 85, category: "BREAKFAST", availableFor: ["breakfast"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // LUNCH
  { name: "Veg Meals", price: 130, inHousePrice: 50, category: "LUNCH", availableFor: ["lunch"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Meals (SP)", price: 190, inHousePrice: 75, category: "LUNCH", availableFor: ["lunch"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Biriyani", price: 260, inHousePrice: 130, category: "LUNCH", availableFor: ["lunch"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Biriyani", price: 280, inHousePrice: 140, category: "LUNCH", availableFor: ["lunch"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Biriyani", price: 320, inHousePrice: 230, category: "LUNCH", availableFor: ["lunch"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Pulao", price: 155, inHousePrice: 90, category: "LUNCH", availableFor: ["lunch"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Pulao", price: 245, inHousePrice: 120, category: "LUNCH", availableFor: ["lunch"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Curd Rice", price: 110, inHousePrice: 60, category: "LUNCH", availableFor: ["lunch"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Ghee Rice", price: 140, inHousePrice: 85, category: "LUNCH", availableFor: ["lunch"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" }
];

const seedCorrectCustomerMenu = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting correct customer menu data seeding...');

    console.log('🧹 Clearing existing menu items...');
    await MenuItem.deleteMany({});
    console.log('✅ Existing menu items cleared');

    console.log('🍽️ Creating correct customer menu items...');
    const createdMenuItems = [];
    for (const item of correctCustomerMenuData) {
      const newItem = await MenuItem.create({
        name: item.name,
        description: item.description || '',
        price: item.price,
        inHousePrice: item.inHousePrice,
        stock: item.stock || 50,
        category: item.category,
        image: item.image,
        availableFor: item.availableFor,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        availableForPreOrder: item.availableForPreOrder !== undefined ? item.availableForPreOrder : false,
        preparationTime: item.preparationTime || 15
      });
      createdMenuItems.push(newItem);
    }
    console.log(`✅ ${createdMenuItems.length} correct customer menu items created`);

    console.log('\n🎉 Correct customer menu data seeding completed successfully!');
    console.log(`📊 Total items: ${createdMenuItems.length}`);
    
    // Show category statistics
    const categoryStats = {};
    createdMenuItems.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    });
    
    console.log('\n📈 Category Statistics:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} items`);
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

seedCorrectCustomerMenu();
