const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Dish = require('../models/Dish');
const Menu = require('../models/Menu');
const Table = require('../models/Table');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Dish.deleteMany();
    await Menu.deleteMany();
    await Table.deleteMany();

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: 'admin123',
      phone: '+94771234567',
      role: 'admin',
    });

    // Create test user
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      phone: '+94779876543',
      address: '123 Main St, Colombo',
    });

    // Create test rider
    const rider = await User.create({
      name: 'Kamal Perera',
      email: 'rider@restaurant.com',
      password: 'rider123',
      phone: '+94771234567',
      address: '45 Rider Lane, Colombo',
      role: 'rider',
    });

    console.log('Users seeded');

    // Create dishes
    const dishes = await Dish.insertMany([
      { name: 'Grilled Chicken Burger', description: 'Juicy grilled chicken patty with fresh lettuce, tomato, and our special sauce on a toasted bun', price: 1250, category: 'main-course', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', ingredients: ['Chicken', 'Lettuce', 'Tomato', 'Cheese', 'Bun'], rating: 4.5, numReviews: 12, prepTime: 15 },
      { name: 'Margherita Pizza', description: 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil on a thin crispy crust', price: 1800, category: 'main-course', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', ingredients: ['Dough', 'Mozzarella', 'Tomato Sauce', 'Basil'], rating: 4.7, numReviews: 28, prepTime: 20 },
      { name: 'Caesar Salad', description: 'Crisp romaine lettuce with parmesan cheese, croutons, and creamy Caesar dressing', price: 850, category: 'appetizer', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', ingredients: ['Romaine', 'Parmesan', 'Croutons', 'Caesar Dressing'], rating: 4.2, numReviews: 8, prepTime: 10 },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a molten center, served with vanilla ice cream', price: 750, category: 'dessert', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Flour'], rating: 4.8, numReviews: 35, prepTime: 25 },
      { name: 'Mango Smoothie', description: 'Fresh tropical mango blended with yogurt and honey', price: 550, category: 'beverage', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', ingredients: ['Mango', 'Yogurt', 'Honey', 'Ice'], rating: 4.3, numReviews: 15, prepTime: 5 },
      { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs, served with marinara dip', price: 450, category: 'side', image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400', ingredients: ['Bread', 'Garlic Butter', 'Herbs'], rating: 4.1, numReviews: 10, prepTime: 8 },
      { name: 'Grilled Salmon', description: 'Atlantic salmon fillet grilled to perfection with lemon herb sauce', price: 2500, category: 'main-course', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', ingredients: ['Salmon', 'Lemon', 'Herbs', 'Olive Oil'], rating: 4.9, numReviews: 20, prepTime: 25 },
      { name: "Chef's Special Pasta", description: 'Handmade fettuccine with creamy alfredo sauce and grilled shrimp', price: 1950, category: 'special', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', ingredients: ['Fettuccine', 'Cream', 'Shrimp', 'Parmesan'], rating: 4.6, numReviews: 18, prepTime: 20 },
    ]);

    console.log('Dishes seeded');

    // Create menus
    await Menu.insertMany([
      { name: 'Appetizers & Sides', description: 'Start your meal right', dishes: dishes.filter(d => ['appetizer', 'side'].includes(d.category)).map(d => d._id) },
      { name: 'Main Course', description: 'Hearty mains for every appetite', dishes: dishes.filter(d => d.category === 'main-course').map(d => d._id) },
      { name: 'Desserts & Beverages', description: 'Sweet treats and refreshing drinks', dishes: dishes.filter(d => ['dessert', 'beverage'].includes(d.category)).map(d => d._id) },
      { name: "Chef's Specials", description: 'Exclusive dishes crafted by our head chef', dishes: dishes.filter(d => d.category === 'special').map(d => d._id) },
    ]);

    console.log('Menus seeded');

    // Create tables
    await Table.insertMany([
      { tableNumber: 1, capacity: 2, location: 'indoor' },
      { tableNumber: 2, capacity: 2, location: 'indoor' },
      { tableNumber: 3, capacity: 4, location: 'indoor' },
      { tableNumber: 4, capacity: 4, location: 'indoor' },
      { tableNumber: 5, capacity: 6, location: 'indoor' },
      { tableNumber: 6, capacity: 4, location: 'outdoor' },
      { tableNumber: 7, capacity: 6, location: 'outdoor' },
      { tableNumber: 8, capacity: 8, location: 'vip' },
      { tableNumber: 9, capacity: 4, location: 'vip' },
      { tableNumber: 10, capacity: 10, location: 'vip' },
    ]);

    console.log('Tables seeded');
    console.log('\n--- Seed Complete ---');
    console.log('Admin: admin@restaurant.com / admin123');
    console.log('User:  john@example.com / user123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
