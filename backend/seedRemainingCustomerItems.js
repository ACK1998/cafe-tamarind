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

const remainingCustomerItemsData = [
  // BEEF ITEMS
  { name: "Beef Stew", price: 330, inHousePrice: 95, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Roast", price: 330, inHousePrice: 95, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Masala", price: 330, inHousePrice: 95, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Curry", price: 330, inHousePrice: 90, category: "BEEF ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // MUTTON ITEMS
  { name: "Mutton Roast", price: 390, inHousePrice: 130, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Masala", price: 390, inHousePrice: 130, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Pepper Masala", price: 395, inHousePrice: 135, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Stew", price: 395, inHousePrice: 135, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mutton Curry", price: 385, inHousePrice: 130, category: "MUTTON ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // FISH ITEMS
  { name: "Fish Mulakittathu (Seer Fish)", price: 310, inHousePrice: 245, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Fish Mulakittathu (Mackerel)", price: 145, inHousePrice: 85, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Kerala Fish Curry (Seer Fish)", price: 330, inHousePrice: 260, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Fish Molly(Seer Fish)", price: 360, inHousePrice: 275, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Fish Mango Curry (Seer Fish)", price: 360, inHousePrice: 275, category: "FISH ITEMS", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
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

  // VEG STARTER
  { name: "Gobi 65", price: 210, inHousePrice: 70, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mushroom Pepper Salt", price: 250, inHousePrice: 80, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Paneer Dry", price: 240, inHousePrice: 80, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Crispy Fried Vegetable", price: 240, inHousePrice: 80, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Baby Corn (Dry)", price: 245, inHousePrice: 80, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // NON-VEG STARTER
  { name: "Dragon Chicken", price: 330, inHousePrice: 175, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken 65", price: 310, inHousePrice: 85, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Kondattam", price: 320, inHousePrice: 175, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Chicken Dry", price: 330, inHousePrice: 175, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Lollypop", price: 330, inHousePrice: 175, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Dry Fry", price: 390, inHousePrice: 95, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Coconut Fry", price: 390, inHousePrice: 185, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilly Beef Dry", price: 395, inHousePrice: 190, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilly Fish (Seer Fish)", price: 380, inHousePrice: 280, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // CONTINENTAL
  { name: "Veg Pasta", price: 310, inHousePrice: 190, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Pasta", price: 330, inHousePrice: 210, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Sandwich", price: 220, inHousePrice: 130, category: "CONTINENTAL", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Sandwich", price: 240, inHousePrice: 160, category: "CONTINENTAL", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Momos", price: 155, inHousePrice: 115, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Momos", price: 170, inHousePrice: 130, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "French Fries", price: 140, inHousePrice: 110, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Steak", price: 440, inHousePrice: 290, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Steak", price: 490, inHousePrice: 330, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" }
];

const seedRemainingCustomerItems = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting remaining customer items seeding...');

    console.log('🍽️ Creating remaining customer items...');
    const createdMenuItems = [];
    for (const item of remainingCustomerItemsData) {
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
    console.log(`✅ ${createdMenuItems.length} remaining customer items created`);

    console.log('\n🎉 Remaining customer items seeding completed successfully!');
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

seedRemainingCustomerItems();
