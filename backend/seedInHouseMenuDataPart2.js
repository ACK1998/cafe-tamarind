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

const remainingMenuData = [
  // VEG ITEMS
  { name: "Dal Fry", price: 125, inHousePrice: 30, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Dal Fry", price: 125, inHousePrice: 55, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Dal Tadka", price: 135, inHousePrice: 30, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Dal Tadka", price: 135, inHousePrice: 55, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Kuruma", price: 190, inHousePrice: 40, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Kuruma", price: 190, inHousePrice: 75, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Paneer Butter Masala", price: 240, inHousePrice: 65, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Paneer Butter Masala", price: 240, inHousePrice: 120, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Gobi", price: 230, inHousePrice: 65, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Gobi", price: 230, inHousePrice: 120, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Gobi Manchurian", price: 230, inHousePrice: 65, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Gobi Manchurian", price: 230, inHousePrice: 120, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Paneer", price: 255, inHousePrice: 65, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Paneer", price: 255, inHousePrice: 120, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mushroom Masala", price: 255, inHousePrice: 70, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mushroom Masala", price: 255, inHousePrice: 130, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Tomato Fry", price: 145, inHousePrice: 35, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Tomato Fry", price: 145, inHousePrice: 60, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Aloo Gobi Masala", price: 220, inHousePrice: 65, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Aloo Gobi Masala", price: 220, inHousePrice: 120, category: "VEG ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // CHICKEN ITEMS
  { name: "Tamarind special chicken curry", price: 310, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Tamarind special chicken curry", price: 310, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Varatharachathu", price: 290, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Varatharachathu", price: 290, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Mapas", price: 290, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Mapas", price: 290, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Pepper Chicken", price: 280, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Pepper Chicken", price: 280, inHousePrice: 150, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "chicken Stew", price: 290, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "chicken Stew", price: 290, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Kuruma", price: 290, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Kuruma", price: 290, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken curry", price: 275, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken curry", price: 275, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Roast", price: 285, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Roast", price: 285, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Kadai Chicken", price: 310, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Kadai Chicken", price: 310, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Butter Chicken", price: 310, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Butter Chicken", price: 310, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Chicken", price: 290, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Chicken", price: 290, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Ginger Chicken", price: 290, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Ginger Chicken", price: 290, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Garlic Chicken", price: 290, inHousePrice: 85, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Garlic Chicken", price: 290, inHousePrice: 155, category: "CHICKEN ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // HOT BEVERAGES
  { name: "Tea", price: 20, inHousePrice: 12, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Black Tea", price: 15, inHousePrice: 10, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Coffee", price: 25, inHousePrice: 15, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Black Coffee", price: 20, inHousePrice: 12, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Horlicks", price: 25, inHousePrice: 15, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Boost", price: 25, inHousePrice: 15, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Milk", price: 25, inHousePrice: 15, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "LIME TEA", price: 25, inHousePrice: 15, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" }
];

const seedRemainingMenuData = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting remaining menu data seeding...');

    console.log('🍽️ Creating remaining menu items...');
    const createdMenuItems = [];
    for (const item of remainingMenuData) {
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
    console.log(`✅ ${createdMenuItems.length} remaining menu items created`);

    console.log('\n🎉 Remaining menu data seeding completed successfully!');
    console.log(`📊 Total items: ${createdMenuItems.length}`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

seedRemainingMenuData();
