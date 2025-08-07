const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Sample products data
const sampleProducts = [
  {
    name: 'Professional Soccer Jersey',
    description: 'High-quality professional soccer jersey made with moisture-wicking fabric. Perfect for teams and individual players.',
    shortDescription: 'Professional soccer jersey with moisture-wicking fabric',
    category: 'jerseys',
    subcategory: 'soccer',
    brand: 'SportsLine Pro',
    price: 45.99,
    comparePrice: 59.99,
    sku: 'SL-JERSEY-001',
    inventory: {
      trackQuantity: true,
      quantity: 100,
      lowStockThreshold: 10
    },
    variants: [
      { size: 'S', color: 'blue', quantity: 20 },
      { size: 'M', color: 'blue', quantity: 25 },
      { size: 'L', color: 'blue', quantity: 25 },
      { size: 'XL', color: 'blue', quantity: 20 },
      { size: 'S', color: 'red', quantity: 15 },
      { size: 'M', color: 'red', quantity: 20 },
      { size: 'L', color: 'red', quantity: 20 },
      { size: 'XL', color: 'red', quantity: 15 }
    ],
    images: [
      { url: '/images/jersey-1.jpg', alt: 'Professional Soccer Jersey', isPrimary: true }
    ],
    specifications: [
      { name: 'Material', value: '100% Polyester' },
      { name: 'Care', value: 'Machine wash cold' },
      { name: 'Fit', value: 'Athletic fit' }
    ],
    tags: ['soccer', 'jersey', 'professional', 'team'],
    isActive: true,
    isFeatured: true,
    isCustomizable: true,
    customizationOptions: {
      allowNamePrint: true,
      allowNumberPrint: true,
      maxNameLength: 15,
      numberRange: { min: 1, max: 99 }
    }
  },
  {
    name: 'Basketball Team Kit',
    description: 'Complete basketball team kit including jersey and shorts. Available in multiple colors and sizes.',
    shortDescription: 'Complete basketball team kit with jersey and shorts',
    category: 'sports-kits',
    subcategory: 'basketball',
    brand: 'SportsLine Pro',
    price: 89.99,
    comparePrice: 109.99,
    sku: 'SL-KIT-001',
    inventory: {
      trackQuantity: true,
      quantity: 50,
      lowStockThreshold: 5
    },
    variants: [
      { size: 'S', color: 'blue', quantity: 10 },
      { size: 'M', color: 'blue', quantity: 15 },
      { size: 'L', color: 'blue', quantity: 15 },
      { size: 'XL', color: 'blue', quantity: 10 }
    ],
    images: [
      { url: '/images/basketball-kit-1.jpg', alt: 'Basketball Team Kit', isPrimary: true }
    ],
    specifications: [
      { name: 'Material', value: 'Moisture-wicking polyester' },
      { name: 'Includes', value: 'Jersey and shorts' },
      { name: 'Fit', value: 'Loose fit' }
    ],
    tags: ['basketball', 'kit', 'team', 'complete'],
    isActive: true,
    isFeatured: true,
    isCustomizable: true
  },
  {
    name: 'Championship Trophy',
    description: 'Beautiful championship trophy perfect for tournaments and competitions. Made with high-quality materials.',
    shortDescription: 'Championship trophy for tournaments and competitions',
    category: 'trophies',
    subcategory: 'championship',
    brand: 'SportsLine Awards',
    price: 149.99,
    sku: 'SL-TROPHY-001',
    inventory: {
      trackQuantity: true,
      quantity: 25,
      lowStockThreshold: 3
    },
    images: [
      { url: '/images/trophy-1.jpg', alt: 'Championship Trophy', isPrimary: true }
    ],
    specifications: [
      { name: 'Height', value: '12 inches' },
      { name: 'Material', value: 'Metal with gold finish' },
      { name: 'Base', value: 'Marble base included' }
    ],
    tags: ['trophy', 'championship', 'award', 'tournament'],
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Soccer Ball - Professional',
    description: 'FIFA-approved professional soccer ball suitable for matches and training.',
    shortDescription: 'FIFA-approved professional soccer ball',
    category: 'equipment',
    subcategory: 'soccer',
    brand: 'SportsLine Equipment',
    price: 29.99,
    comparePrice: 39.99,
    sku: 'SL-BALL-001',
    inventory: {
      trackQuantity: true,
      quantity: 75,
      lowStockThreshold: 15
    },
    images: [
      { url: '/images/soccer-ball-1.jpg', alt: 'Professional Soccer Ball', isPrimary: true }
    ],
    specifications: [
      { name: 'Size', value: 'Size 5' },
      { name: 'Material', value: 'Synthetic leather' },
      { name: 'Certification', value: 'FIFA approved' }
    ],
    tags: ['soccer', 'ball', 'professional', 'fifa'],
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Sports Water Bottle',
    description: 'Insulated sports water bottle to keep drinks cold during training and games.',
    shortDescription: 'Insulated sports water bottle',
    category: 'accessories',
    subcategory: 'hydration',
    brand: 'SportsLine Gear',
    price: 19.99,
    sku: 'SL-BOTTLE-001',
    inventory: {
      trackQuantity: true,
      quantity: 200,
      lowStockThreshold: 25
    },
    variants: [
      { size: '500ml', color: 'blue', quantity: 50 },
      { size: '500ml', color: 'red', quantity: 50 },
      { size: '750ml', color: 'blue', quantity: 50 },
      { size: '750ml', color: 'red', quantity: 50 }
    ],
    images: [
      { url: '/images/water-bottle-1.jpg', alt: 'Sports Water Bottle', isPrimary: true }
    ],
    specifications: [
      { name: 'Material', value: 'Stainless steel' },
      { name: 'Insulation', value: 'Double-wall vacuum' },
      { name: 'Capacity', value: '500ml / 750ml' }
    ],
    tags: ['water', 'bottle', 'sports', 'hydration'],
    isActive: true,
    isFeatured: false
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL || 'admin@sportsline.com',
      password: adminPassword,
      role: 'admin',
      isActive: true
    });

    console.log('Admin user created:', adminUser.email);

    // Create sample customer
    console.log('Creating sample customer...');
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customerUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'customer@example.com',
      password: customerPassword,
      phone: '+1-555-123-4567',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      role: 'customer',
      isActive: true
    });

    console.log('Sample customer created:', customerUser.email);

    // Create sample products
    console.log('Creating sample products...');
    const productsWithCreator = sampleProducts.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));

    const products = await Product.insertMany(productsWithCreator);
    console.log(`${products.length} products created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin:');
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('\nCustomer:');
    console.log(`  Email: ${customerUser.email}`);
    console.log('  Password: customer123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
