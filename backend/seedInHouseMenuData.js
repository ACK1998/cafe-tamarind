const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://aromalck:aromalck1@ack.tzcc48a.mongodb.net/cafe-tamarind');
    console.log(`🗄️ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

const inHouseMenuData = [
  // Breakfast Category
  { name: 'Appam', price: 15, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Puttu', price: 15, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Puri', price: 12, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Dosa', price: 15, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Idli', price: 13, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Upma', price: 45, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Bhatura', price: 15, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Veg Stew(Bf)', price: 30, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Veg Kuruma(Bf)', price: 30, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Kadala Curry', price: 25, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Bhaji', price: 25, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Chenna Masala', price: 30, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Green Gram Curry', price: 30, category: 'Breakfast', type: 'INHOUSE', portion: 'Half', availableFor: ['breakfast'] },
  { name: 'Green Gram Curry', price: 55, category: 'Breakfast', type: 'INHOUSE', portion: 'Full', availableFor: ['breakfast'] },
  { name: 'Green Peas Masala', price: 30, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Egg Curry (Single Piece)', price: 30, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Egg Roast', price: 30, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Cornflakes', price: 70, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Muesli', price: 85, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Cheesy Bread Omlette', price: 60, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Bread Butter Toast', price: 25, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Toasted Bread (Plain)', price: 10, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Bread Peanut Butter Toast', price: 50, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },
  { name: 'Bread Butter Jam', price: 50, category: 'Breakfast', type: 'INHOUSE', availableFor: ['breakfast'] },

  // Lunch Category
  { name: 'Veg Meals', price: 50, category: 'Lunch', type: 'INHOUSE', availableFor: ['lunch'] },
  { name: 'Veg Biriyani', price: 70, category: 'Lunch', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch'] },
  { name: 'Veg Biriyani', price: 100, category: 'Lunch', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch'] },
  { name: 'Veg Meals(Sp)', price: 75, category: 'Lunch', type: 'INHOUSE', availableFor: ['lunch'] },
  { name: 'Chicken Biriyani', price: 90, category: 'Lunch', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch'] },
  { name: 'Chicken Biriyani', price: 130, category: 'Lunch', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch'] },
  { name: 'Beef Biriyani', price: 95, category: 'Lunch', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch'] },
  { name: 'Beef Biriyani', price: 140, category: 'Lunch', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch'] },
  { name: 'Mutton Biriyani', price: 145, category: 'Lunch', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch'] },
  { name: 'Mutton Biriyani', price: 230, category: 'Lunch', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch'] },
  { name: 'Veg Pulao', price: 90, category: 'Lunch', type: 'INHOUSE', availableFor: ['lunch'] },
  { name: 'Chicken Pulao', price: 120, category: 'Lunch', type: 'INHOUSE', availableFor: ['lunch'] },
  { name: 'Curd Rice', price: 60, category: 'Lunch', type: 'INHOUSE', availableFor: ['lunch'] },
  { name: 'Ghee Rice', price: 60, category: 'Lunch', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch'] },
  { name: 'Ghee Rice', price: 85, category: 'Lunch', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch'] },

  // Veg Items Category
  { name: 'Dal Fry', price: 30, category: 'Veg Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Dal Fry', price: 55, category: 'Veg Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Dal Tadka', price: 30, category: 'Veg Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Dal Tadka', price: 55, category: 'Veg Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Kuruma', price: 40, category: 'Veg Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Kuruma', price: 75, category: 'Veg Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Paneer Butter Masala', price: 65, category: 'Veg Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Paneer Butter Masala', price: 120, category: 'Veg Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Gobi', price: 65, category: 'Veg Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Gobi', price: 120, category: 'Veg Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Gobi Manchurian', price: 65, category: 'Veg Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Gobi Manchurian', price: 120, category: 'Veg Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Paneer', price: 65, category: 'Veg Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Paneer', price: 120, category: 'Veg Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Mushroom Masala', price: 70, category: 'Veg Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Mushroom Masala', price: 130, category: 'Veg Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Tomato Fry', price: 35, category: 'Veg Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Tomato Fry', price: 60, category: 'Veg Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Aloo Gobi Masala', price: 65, category: 'Veg Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Aloo Gobi Masala', price: 120, category: 'Veg Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },

  // Chicken Items Category
  { name: 'Tamarind Special Chicken Curry', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Tamarind Special Chicken Curry', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Varatharachathu', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Varatharachathu', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Mapas', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Mapas', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Pepper Chicken', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Pepper Chicken', price: 150, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Stew', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Stew', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Kuruma', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Kuruma', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Curry', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Curry', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Roast', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Roast', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Kadai Chicken', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Kadai Chicken', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Butter Chicken', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Butter Chicken', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Chicken', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Chicken', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Ginger Chicken', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Ginger Chicken', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Garlic Chicken', price: 85, category: 'Chicken Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Garlic Chicken', price: 155, category: 'Chicken Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },

  // Beef Items Category
  { name: 'Beef Stew', price: 95, category: 'Beef Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Stew', price: 185, category: 'Beef Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Roast', price: 95, category: 'Beef Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Roast', price: 185, category: 'Beef Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Masala', price: 95, category: 'Beef Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Masala', price: 185, category: 'Beef Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Curry', price: 90, category: 'Beef Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Curry', price: 175, category: 'Beef Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },

  // Mutton Items Category
  { name: 'Mutton Roast', price: 130, category: 'Mutton Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Roast', price: 245, category: 'Mutton Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Masala', price: 130, category: 'Mutton Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Masala', price: 245, category: 'Mutton Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Pepper Masala', price: 135, category: 'Mutton Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Pepper Masala', price: 250, category: 'Mutton Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Stew', price: 135, category: 'Mutton Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Stew', price: 250, category: 'Mutton Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Curry', price: 130, category: 'Mutton Items', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Mutton Curry', price: 245, category: 'Mutton Items', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },

  // Fish Items Category
  { name: 'Fish Mulakittathu (Seer Fish)', price: 245, category: 'Fish Items', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Mulakittathu (Mackerel)', price: 85, category: 'Fish Items', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Kerala Fish Curry(Seer Fish)', price: 260, category: 'Fish Items', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Molly(Seer Fish)', price: 275, category: 'Fish Items', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Mango Curry(Seer Fish)', price: 275, category: 'Fish Items', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Pollichathu (Seer Fish)', price: 250, category: 'Fish Items', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Tawa Fry(Mackerel)', price: 85, category: 'Fish Items', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Fish Tawa Fry(Seer Fish)', price: 220, category: 'Fish Items', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },

  // Fried Rice & Noodles Category
  { name: 'Veg Fried Rice', price: 100, category: 'Fried Rice & Noodles', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Egg Fried Rice', price: 115, category: 'Fried Rice & Noodles', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Fried Rice', price: 130, category: 'Fried Rice & Noodles', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Noodles', price: 100, category: 'Fried Rice & Noodles', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Egg Noodles', price: 115, category: 'Fried Rice & Noodles', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Noodles', price: 130, category: 'Fried Rice & Noodles', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },

  // Veg Starter Category
  { name: 'Gobi 65', price: 70, category: 'Veg Starter', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Gobi 65', price: 130, category: 'Veg Starter', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Mushroom Pepper Salt', price: 80, category: 'Veg Starter', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Mushroom Pepper Salt', price: 150, category: 'Veg Starter', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Paneer Dry', price: 80, category: 'Veg Starter', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Paneer Dry', price: 150, category: 'Veg Starter', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Crispy Fried Vegetable', price: 80, category: 'Veg Starter', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Crispy Fried Vegetable', price: 150, category: 'Veg Starter', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Baby Corn (Dry)', price: 80, category: 'Veg Starter', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Baby Corn (Dry)', price: 150, category: 'Veg Starter', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },

  // Non-Veg Starter Category
  { name: 'Dragon Chicken', price: 175, category: 'Non-Veg Starter', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken 65', price: 85, category: 'Non-Veg Starter', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken 65', price: 155, category: 'Non-Veg Starter', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Kondattam', price: 175, category: 'Non-Veg Starter', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilli Chicken Dry', price: 175, category: 'Non-Veg Starter', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Lollypop', price: 175, category: 'Non-Veg Starter', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Dry Fry', price: 95, category: 'Non-Veg Starter', type: 'INHOUSE', portion: 'Half', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Dry Fry', price: 185, category: 'Non-Veg Starter', type: 'INHOUSE', portion: 'Full', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Coconut Fry', price: 185, category: 'Non-Veg Starter', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilly Beef Dry', price: 190, category: 'Non-Veg Starter', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chilly Fish(Seer Fish)', price: 280, category: 'Non-Veg Starter', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },

  // Continental Category
  { name: 'Veg Pasta', price: 190, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Pasta', price: 210, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Sandwich', price: 130, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Sandwich', price: 160, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Momos', price: 115, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Momos', price: 130, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'French Fries', price: 110, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Steak', price: 290, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Beef Steak', price: 330, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Veg Nuggets', price: 100, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Chicken Nuggets', price: 130, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },
  { name: 'Cheesy Chicken Nuggets', price: 145, category: 'Continental', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },

  // Hot Beverages Category
  { name: 'Tea', price: 12, category: 'Hot Beverages', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Black Tea', price: 10, category: 'Hot Beverages', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Coffee', price: 15, category: 'Hot Beverages', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Black Coffee', price: 12, category: 'Hot Beverages', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Horlicks', price: 15, category: 'Hot Beverages', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Boost', price: 15, category: 'Hot Beverages', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Milk', price: 15, category: 'Hot Beverages', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Lime Tea', price: 15, category: 'Hot Beverages', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },

  // Fresh Juice Category
  { name: 'Fresh Lime', price: 20, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Mint Lime', price: 25, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Pineapple Lime', price: 30, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Grape Lime', price: 30, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Watermelon', price: 55, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Orange', price: 60, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Musumbi', price: 60, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Grape', price: 60, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Pineapple', price: 70, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Muskmelon', price: 55, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Mango', price: 70, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Soda Sarbath', price: 60, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Sarbath', price: 45, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Lemon Soda', price: 25, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Mojito', price: 80, category: 'Fresh Juice', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },

  // Milk Shake Category
  { name: 'Mango', price: 70, category: 'Milk Shake', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Avacado', price: 80, category: 'Milk Shake', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Pomegranate', price: 80, category: 'Milk Shake', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Apple', price: 75, category: 'Milk Shake', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Banana', price: 70, category: 'Milk Shake', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Oreo', price: 80, category: 'Milk Shake', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Dark Fantasy', price: 80, category: 'Milk Shake', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Sharjah Shake', price: 70, category: 'Milk Shake', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },

  // Other Items Category
  { name: 'Chapathi', price: 10, category: 'Other Items', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Porotta', price: 15, category: 'Other Items', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Duck Pepper Roast', price: 220, category: 'Other Items', type: 'INHOUSE', availableFor: ['lunch', 'dinner'] },

  // Egg Items Category
  { name: 'Bullseye', price: 15, category: 'Egg Items', type: 'INHOUSE', portion: 'Single', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Bullseye', price: 25, category: 'Egg Items', type: 'INHOUSE', portion: 'Double', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Omlette', price: 20, category: 'Egg Items', type: 'INHOUSE', portion: 'Single', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Omlette', price: 30, category: 'Egg Items', type: 'INHOUSE', portion: 'Double', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Scrambled Egg', price: 15, category: 'Egg Items', type: 'INHOUSE', portion: 'Single', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Scrambled Egg', price: 25, category: 'Egg Items', type: 'INHOUSE', portion: 'Double', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Boiled Egg', price: 12, category: 'Egg Items', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Poached Egg', price: 35, category: 'Egg Items', type: 'INHOUSE', portion: 'Double', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Bread Omlette', price: 45, category: 'Egg Items', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] },
  { name: 'Butter Sweet Corn', price: 80, category: 'Other Items', type: 'INHOUSE', availableFor: ['breakfast', 'lunch', 'dinner'] }
];

const seedInHouseMenu = async () => {
  try {
    await connectDB();
    
    // Clear existing in-house menu items
    await MenuItem.deleteMany({ type: 'INHOUSE' });
    console.log('🗑️ Cleared existing in-house menu items');
    
    // Insert new in-house menu items
    const result = await MenuItem.insertMany(inHouseMenuData);
    console.log(`✅ Successfully seeded ${result.length} in-house menu items`);
    
    // Display summary by category
    const categorySummary = {};
    result.forEach(item => {
      if (!categorySummary[item.category]) {
        categorySummary[item.category] = 0;
      }
      categorySummary[item.category]++;
    });
    
    console.log('\n📊 In-House Menu Summary by Category:');
    Object.entries(categorySummary).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} items`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding in-house menu data:', error);
    process.exit(1);
  }
};

seedInHouseMenu();
