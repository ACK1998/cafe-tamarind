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

const remainingCategoriesData = [
  // BEEF ITEMS
  { name: "Beef Stew", price: 330, inHousePrice: 95, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Stew", price: 330, inHousePrice: 185, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Roast", price: 330, inHousePrice: 95, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Roast", price: 330, inHousePrice: 185, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Masala", price: 330, inHousePrice: 95, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Masala", price: 330, inHousePrice: 185, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Curry", price: 330, inHousePrice: 90, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Curry", price: 330, inHousePrice: 175, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // MUTTON ITEMS
  { name: "Mutton Roast", price: 390, inHousePrice: 130, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Roast", price: 390, inHousePrice: 245, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Masala", price: 390, inHousePrice: 130, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Masala", price: 390, inHousePrice: 245, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Pepper Masala", price: 395, inHousePrice: 135, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Pepper Masala", price: 395, inHousePrice: 250, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Stew", price: 395, inHousePrice: 135, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Stew", price: 395, inHousePrice: 250, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Curry", price: 385, inHousePrice: 130, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Curry", price: 385, inHousePrice: 245, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // FISH ITEMS
  { name: "Fish Mulakittathu (Seer Fish)", price: 310, inHousePrice: 245, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Fish Mulakittathu (Mackerel)", price: 145, inHousePrice: 85, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Kerala Fish Curry(Seer Fish)", price: 330, inHousePrice: 260, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Fish Molly(Seer Fish)", price: 360, inHousePrice: 275, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Fish Mango Curry(Seer Fish)", price: 360, inHousePrice: 275, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Fish Pollichathu (Seer Fish)", price: 345, inHousePrice: 250, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Fish Tawa Fry(Mackerel)", price: 145, inHousePrice: 85, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Fish Tawa Fry(Seer Fish)", price: 320, inHousePrice: 220, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // FRIED RICE & NOODLES
  { name: "Veg Fried Rice", price: 190, inHousePrice: 100, category: "FRIED RICE & NOODLES", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Egg Fried Rice", price: 210, inHousePrice: 115, category: "FRIED RICE & NOODLES", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Fried Rice", price: 230, inHousePrice: 130, category: "FRIED RICE & NOODLES", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Noodles", price: 190, inHousePrice: 100, category: "FRIED RICE & NOODLES", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Egg Noodles", price: 210, inHousePrice: 115, category: "FRIED RICE & NOODLES", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Noodles", price: 230, inHousePrice: 130, category: "FRIED RICE & NOODLES", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

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
  { name: "SHARJAH SHAKE", price: 70, inHousePrice: 70, category: "MILK SHAKE", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // OTHER ITEMS
  { name: "Chapathi", price: 25, inHousePrice: 10, category: "OTHER ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Porotta", price: 30, inHousePrice: 15, category: "OTHER ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Duck Pepper Roast", price: 450, inHousePrice: 220, category: "OTHER ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // EGG ITEMS
  { name: "Bullseye Single", price: 40, inHousePrice: 15, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Bullseye Double", price: 40, inHousePrice: 25, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Omlette Single", price: 35, inHousePrice: 20, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Omlette Double", price: 55, inHousePrice: 30, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "scrambled egg Single", price: 45, inHousePrice: 15, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "scrambled egg Double", price: 45, inHousePrice: 25, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "boiled egg", price: 20, inHousePrice: 12, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "poached egg (double)", price: 60, inHousePrice: 35, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "bread omlette", price: 45, inHousePrice: 45, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "butter sweet corn", price: 80, inHousePrice: 80, category: "EGG ITEMS", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" }
];

const seedRemainingCategories = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting remaining categories seeding...');

    console.log('🍽️ Creating remaining category items...');
    const createdMenuItems = [];
    for (const item of remainingCategoriesData) {
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
    console.log(`✅ ${createdMenuItems.length} remaining category items created`);

    console.log('\n🎉 Remaining categories seeding completed successfully!');
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

seedRemainingCategories();
