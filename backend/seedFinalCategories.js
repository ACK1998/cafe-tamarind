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

const finalCategoriesData = [
  // VEG STARTER
  { name: "Gobi 65 Half", price: 210, inHousePrice: 70, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Gobi 65 Full", price: 210, inHousePrice: 130, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mushroom Pepper Salt Half", price: 250, inHousePrice: 80, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Mushroom Pepper Salt Full", price: 250, inHousePrice: 150, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Paneer Dry Half", price: 240, inHousePrice: 80, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Paneer Dry Full", price: 240, inHousePrice: 150, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Crispy Fried Vegetable Half", price: 240, inHousePrice: 80, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Crispy Fried Vegetable Full", price: 240, inHousePrice: 150, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Baby Corn (Dry) Half", price: 245, inHousePrice: 80, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Baby Corn (Dry) Full", price: 245, inHousePrice: 150, category: "VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // NON-VEG STARTER
  { name: "Dragon Chicken", price: 330, inHousePrice: 175, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken 65 Half", price: 310, inHousePrice: 85, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken 65 Full", price: 310, inHousePrice: 155, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Kondattam", price: 320, inHousePrice: 175, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilli Chicken Dry", price: 330, inHousePrice: 175, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Lollypop", price: 330, inHousePrice: 175, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Dry Fry Half", price: 390, inHousePrice: 95, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Dry Fry Full", price: 390, inHousePrice: 185, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Coconut Fry", price: 390, inHousePrice: 185, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilly Beef Dry", price: 395, inHousePrice: 190, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chilly Fish(Seer Fish)", price: 380, inHousePrice: 280, category: "NON-VEG STARTER", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },

  // CONTINENTAL
  { name: "Veg Pasta", price: 310, inHousePrice: 190, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Pasta", price: 330, inHousePrice: 210, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Sandwich", price: 220, inHousePrice: 130, category: "CONTINENTAL", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Sandwich", price: 240, inHousePrice: 160, category: "CONTINENTAL", availableFor: ["breakfast", "lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Veg Momos", price: 155, inHousePrice: 115, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Momos", price: 170, inHousePrice: 130, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "French Fries", price: 140, inHousePrice: 110, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Chicken Steak", price: 440, inHousePrice: 290, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "Beef Steak", price: 490, inHousePrice: 330, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "veg nuggets", price: 160, inHousePrice: 100, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "CHICKEN NUGGETS", price: 160, inHousePrice: 130, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" },
  { name: "CHEESY CHICKEN NUGGETS", price: 170, inHousePrice: 145, category: "CONTINENTAL", availableFor: ["lunch", "dinner"], isAvailable: true, stock: 100, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop" }
];

const seedFinalCategories = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting final categories seeding...');

    console.log('🍽️ Creating final category items...');
    const createdMenuItems = [];
    for (const item of finalCategoriesData) {
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
    console.log(`✅ ${createdMenuItems.length} final category items created`);

    console.log('\n🎉 Final categories seeding completed successfully!');
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

seedFinalCategories();
