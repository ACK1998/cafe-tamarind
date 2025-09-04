const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || '');
    console.log(`🗄️ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

const customerMenuData = [
  // Breakfast Category
  { name: 'Appam', price: 25, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Puttu', price: 20, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Puri', price: 20, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Dosa', price: 25, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Idli', price: 20, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Upma', price: 65, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Bhatura', price: 25, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Veg Stew(Bf)', price: 90, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Veg Kuruma(Bf)', price: 90, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Kadala Curry', price: 80, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Bhaji', price: 70, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Chenna Masala', price: 90, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Green Gram Curry', price: 80, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Green Peas Masala', price: 90, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Egg Curry 2 Piece', price: 95, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Maggie Egg', price: 80, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Maggie Cheese', price: 85, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Maggie Plain', price: 40, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Cornflakes', price: 85, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Bun Butter Toast', price: 60, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Bread Butter Toast', price: 45, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },
  { name: 'Museli', price: 100, category: 'Breakfast', type: 'CUSTOMER', availableFor: ['breakfast'] },

  // Lunch Category
  { name: 'Veg Meals', price: 130, category: 'Lunch', type: 'CUSTOMER', availableFor: ['lunch'] },
  { name: 'Veg Meals (Sp)', price: 190, category: 'Lunch', type: 'CUSTOMER', availableFor: ['lunch'] },
  { name: 'Chicken Biriyani', price: 260, category: 'Lunch', type: 'CUSTOMER', availableFor: ['lunch'] },
  { name: 'Beef Biriyani', price: 280, category: 'Lunch', type: 'CUSTOMER', availableFor: ['lunch'] },
  { name: 'Mutton Biriyani', price: 320, category: 'Lunch', type: 'CUSTOMER', availableFor: ['lunch'] },
  { name: 'Veg Pulao', price: 155, category: 'Lunch', type: 'CUSTOMER', availableFor: ['lunch'] },
  { name: 'Chicken Pulao', price: 245, category: 'Lunch', type: 'CUSTOMER', availableFor: ['lunch'] },
  { name: 'Curd Rice', price: 110, category: 'Lunch', type: 'CUSTOMER', availableFor: ['lunch'] },
  { name: 'Ghee Rice', price: 140, category: 'Lunch', type: 'CUSTOMER', availableFor: ['lunch'] },

  // Veg Items Category
  { name: 'Dal Fry', price: 125, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Dal Tadka', price: 135, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Kuruma', price: 190, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Paneer Butter Masala', price: 240, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Gobi', price: 230, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Gobi Manchurian', price: 230, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Paneer', price: 255, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Mushroom Masala', price: 255, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Tomato Fry', price: 145, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Aloo Gobi Masala', price: 220, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Nuggets', price: 160, category: 'Veg Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },

  // Chicken Items Category
  { name: 'Tamarind Special Chicken Curry', price: 310, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Varatharachathu', price: 290, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Mapas', price: 290, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Pepper Chicken', price: 280, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Stew', price: 290, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Kuruma', price: 290, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Curry', price: 275, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Roast', price: 285, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Kadai Chicken', price: 310, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Butter Chicken', price: 310, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Chicken', price: 290, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Ginger Chicken', price: 290, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Garlic Chicken', price: 290, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Cheesy Chicken Nuggets', price: 170, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Nuggets', price: 160, category: 'Chicken Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },

  // Beef Items Category
  { name: 'Beef Stew', price: 330, category: 'Beef Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Roast', price: 330, category: 'Beef Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Masala', price: 330, category: 'Beef Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Curry', price: 330, category: 'Beef Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },

  // Mutton Items Category
  { name: 'Mutton Roast', price: 390, category: 'Mutton Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Masala', price: 390, category: 'Mutton Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Pepper Masala', price: 395, category: 'Mutton Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Stew', price: 395, category: 'Mutton Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Curry', price: 385, category: 'Mutton Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },

  // Fish Items Category
  { name: 'Fish Mulakittathu (Seer Fish)', price: 310, category: 'Fish Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Mulakittathu (Mackerel)', price: 145, category: 'Fish Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Kerala Fish Curry (Seer Fish)', price: 330, category: 'Fish Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Molly(Seer Fish)', price: 360, category: 'Fish Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Mango Curry (Seer Fish)', price: 360, category: 'Fish Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Pollichathu (Seer Fish)', price: 345, category: 'Fish Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Tawa Fry(Mackerel)', price: 145, category: 'Fish Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Tawa Fry(Seer Fish)', price: 320, category: 'Fish Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },

  // Fried Rice & Noodles Category
  { name: 'Veg Fried Rice', price: 190, category: 'Fried Rice & Noodles', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Egg Fried Rice', price: 210, category: 'Fried Rice & Noodles', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Fried Rice', price: 230, category: 'Fried Rice & Noodles', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Noodles', price: 190, category: 'Fried Rice & Noodles', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Egg Noodles', price: 210, category: 'Fried Rice & Noodles', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Noodles', price: 230, category: 'Fried Rice & Noodles', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },

  // Veg Starter Category
  { name: 'Gobi 65', price: 210, category: 'Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Mushroom Pepper Salt', price: 250, category: 'Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Paneer Dry', price: 240, category: 'Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Crispy Fried Vegetable', price: 240, category: 'Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Baby Corn (Dry)', price: 245, category: 'Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },

  // Non-Veg Starter Category
  { name: 'Dragon Chicken', price: 330, category: 'Non-Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken 65', price: 310, category: 'Non-Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Kondattam', price: 320, category: 'Non-Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Chicken Dry', price: 330, category: 'Non-Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Lollypop', price: 330, category: 'Non-Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Dry Fry', price: 390, category: 'Non-Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Coconut Fry', price: 390, category: 'Non-Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilly Beef Dry', price: 395, category: 'Non-Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilly Fish (Seer Fish)', price: 380, category: 'Non-Veg Starter', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },

  // Continental Category
  { name: 'Veg Pasta', price: 310, category: 'Continental', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Pasta', price: 330, category: 'Continental', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Sandwich', price: 220, category: 'Continental', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Sandwich', price: 240, category: 'Continental', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Momos', price: 155, category: 'Continental', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Momos', price: 170, category: 'Continental', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'French Fries', price: 140, category: 'Continental', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Steak', price: 440, category: 'Continental', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Steak', price: 490, category: 'Continental', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },

  // Hot Beverages Category
  { name: 'Tea', price: 20, category: 'Hot Beverages', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Black Tea', price: 15, category: 'Hot Beverages', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Coffee', price: 25, category: 'Hot Beverages', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Black Coffee', price: 20, category: 'Hot Beverages', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Horlicks', price: 25, category: 'Hot Beverages', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Boost', price: 25, category: 'Hot Beverages', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Ginger Tea', price: 25, category: 'Hot Beverages', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Milk', price: 25, category: 'Hot Beverages', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },

  // Fresh Juice Category
  { name: 'Fresh Lime', price: 45, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Mint Lime', price: 55, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Pineapple Lime', price: 60, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Grape Lime', price: 60, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Watermelon', price: 85, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Orange', price: 90, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Musumbi', price: 90, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Grape', price: 90, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Pineapple', price: 95, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Muskmelon', price: 85, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Mango', price: 95, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Soda Sarbath', price: 60, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Sarbath', price: 45, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Lemon Soda', price: 60, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Mojito', price: 145, category: 'Fresh Juice', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },

  // Milk Shake Category
  { name: 'Mango', price: 110, category: 'Milk Shake', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Avacado', price: 120, category: 'Milk Shake', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Pomegranate', price: 120, category: 'Milk Shake', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Apple', price: 120, category: 'Milk Shake', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Banana', price: 110, category: 'Milk Shake', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Oreo', price: 120, category: 'Milk Shake', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Dark Fantasy', price: 120, category: 'Milk Shake', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },

  // Other Items Category
  { name: 'Chapathi', price: 25, category: 'Other Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Porotta', price: 30, category: 'Other Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Cornflakes', price: 110, category: 'Other Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Muesli', price: 120, category: 'Other Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Bread Butter Jam', price: 80, category: 'Other Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Duck Pepper Roast', price: 450, category: 'Other Items', type: 'CUSTOMER', availableFor: ['lunch', 'dinner'] },

  // Egg Items Category
  { name: 'Bullseye', price: 40, category: 'Egg Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Omlette Single', price: 35, category: 'Egg Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Omlette Double', price: 55, category: 'Egg Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Scrambled Egg', price: 45, category: 'Egg Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Boiled Egg', price: 20, category: 'Egg Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Poached Egg (Double)', price: 60, category: 'Egg Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Cheesy Nugg Chicken', price: 165, category: 'Egg Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Chicken Nuggets', price: 140, category: 'Egg Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Veg Nuggets', price: 130, category: 'Egg Items', type: 'CUSTOMER', availableFor: ['breakfast', 'lunch', 'dinner'] }
];

const seedCustomerMenu = async () => {
  try {
    await connectDB();
    
    // Clear existing customer menu items
    await MenuItem.deleteMany({ type: 'CUSTOMER' });
    console.log('🗑️ Cleared existing customer menu items');
    
    // Insert new customer menu items
    const result = await MenuItem.insertMany(customerMenuData);
    console.log(`✅ Successfully seeded ${result.length} customer menu items`);
    
    // Display summary by category
    const categorySummary = {};
    result.forEach(item => {
      if (!categorySummary[item.category]) {
        categorySummary[item.category] = 0;
      }
      categorySummary[item.category]++;
    });
    
    console.log('\n📊 Customer Menu Summary by Category:');
    Object.entries(categorySummary).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} items`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding customer menu data:', error);
    process.exit(1);
  }
};

seedCustomerMenu();
