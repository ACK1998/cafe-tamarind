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

const finalCustomerItemsData = [
  // HOT BEVERAGES
  { name: "Tea", price: 20, inHousePrice: 12, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Black Tea", price: 15, inHousePrice: 10, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Coffee", price: 25, inHousePrice: 15, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Black Coffee", price: 20, inHousePrice: 12, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Horlicks", price: 25, inHousePrice: 15, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Boost", price: 25, inHousePrice: 15, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "ginger tea", price: 25, inHousePrice: 15, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Milk", price: 25, inHousePrice: 15, category: "HOT BEVERAGES", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // FRESH JUICE
  { name: "Fresh Lime", price: 45, inHousePrice: 20, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mint Lime", price: 55, inHousePrice: 25, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Pineapple Lime", price: 60, inHousePrice: 30, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Grape Lime", price: 60, inHousePrice: 30, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Watermelon", price: 85, inHousePrice: 55, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Orange", price: 90, inHousePrice: 60, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Musumbi", price: 90, inHousePrice: 60, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Grape", price: 90, inHousePrice: 60, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Pineapple", price: 95, inHousePrice: 70, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Muskmelon", price: 85, inHousePrice: 55, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mango", price: 95, inHousePrice: 70, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "SODA SARBATH", price: 60, inHousePrice: 60, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "SARBATH", price: 45, inHousePrice: 45, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Lemon Soda", price: 60, inHousePrice: 25, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mojito", price: 145, inHousePrice: 80, category: "FRESH JUICE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // MILK SHAKE
  { name: "Mango", price: 110, inHousePrice: 70, category: "MILK SHAKE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Avacado", price: 120, inHousePrice: 80, category: "MILK SHAKE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Pomegranate", price: 120, inHousePrice: 80, category: "MILK SHAKE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Apple", price: 120, inHousePrice: 75, category: "MILK SHAKE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Banana", price: 110, inHousePrice: 70, category: "MILK SHAKE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Oreo", price: 120, inHousePrice: 80, category: "MILK SHAKE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Dark Fantasy", price: 120, inHousePrice: 80, category: "MILK SHAKE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // OTHER ITEMS
  { name: "Chapathi", price: 25, inHousePrice: 10, category: "OTHER ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Porotta", price: 30, inHousePrice: 15, category: "OTHER ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Cornflakes", price: 110, inHousePrice: 70, category: "OTHER ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Muesli", price: 120, inHousePrice: 85, category: "OTHER ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Bread Butter Jam", price: 80, inHousePrice: 50, category: "OTHER ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Duck Pepper Roast", price: 450, inHousePrice: 220, category: "OTHER ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // EGG ITEMS
  { name: "bullseye", price: 40, inHousePrice: 15, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "omlette Single", price: 35, inHousePrice: 20, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "omlette Double", price: 55, inHousePrice: 30, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "scrambled egg", price: 45, inHousePrice: 15, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "boiled egg", price: 20, inHousePrice: 12, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "poached egg (double)", price: 60, inHousePrice: 35, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "cheesy nugg chicken", price: 165, inHousePrice: 145, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "chicken nuggets", price: 140, inHousePrice: 130, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "veg nuggets", price: 130, inHousePrice: 100, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" }
];

const seedFinalCustomerItems = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting final customer items seeding...');

    console.log('🍽️ Creating final customer items...');
    const createdMenuItems = [];
    for (const item of finalCustomerItemsData) {
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
    console.log(`✅ ${createdMenuItems.length} final customer items created`);

    console.log('\n🎉 Final customer items seeding completed successfully!');
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

seedFinalCustomerItems();
