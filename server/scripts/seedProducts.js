const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

// Sample product data with Indian pricing and images
const sampleProducts = [
  {
    name: "Mumbai Indians IPL Jersey 2024",
    description: "Official Mumbai Indians IPL jersey for 2024 season. Made with premium quality fabric, featuring the iconic blue and gold design. Perfect for cricket enthusiasts and MI fans.",
    shortDescription: "Official MI IPL 2024 jersey with premium fabric",
    category: "jerseys",
    subcategory: "cricket",
    brand: "Nike",
    price: 2499, // INR
    comparePrice: 3499, // INR
    cost: 1500, // INR
    sku: "MI-2024-JER",
    inventory: {
      trackQuantity: true,
      quantity: 150,
      lowStockThreshold: 20
    },
    variants: [
      { size: "S", color: "blue", price: 2499, sku: "MI-2024-JER-S-BLU", quantity: 30 },
      { size: "M", color: "blue", price: 2499, sku: "MI-2024-JER-M-BLU", quantity: 40 },
      { size: "L", color: "blue", price: 2499, sku: "MI-2024-JER-L-BLU", quantity: 35 },
      { size: "XL", color: "blue", price: 2499, sku: "MI-2024-JER-XL-BLU", quantity: 25 },
      { size: "XXL", color: "blue", price: 2699, sku: "MI-2024-JER-XXL-BLU", quantity: 20 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500", alt: "Mumbai Indians Jersey Front", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500", alt: "Mumbai Indians Jersey Back", isPrimary: false }
    ],
    specifications: [
      { name: "Material", value: "100% Polyester" },
      { name: "Fit", value: "Regular Fit" },
      { name: "Care", value: "Machine Wash" },
      { name: "Origin", value: "India" }
    ],
    tags: ["cricket", "ipl", "mumbai indians", "jersey", "sports"],
    isActive: true,
    isFeatured: true,
    isCustomizable: true,
    customizationOptions: {
      allowNamePrint: true,
      allowNumberPrint: true,
      maxNameLength: 12,
      numberRange: { min: 1, max: 99 }
    },
    ratings: { average: 4.5, count: 128 },
    salesCount: 89
  },
  {
    name: "Royal Challengers Bangalore RCB Jersey",
    description: "Official Royal Challengers Bangalore jersey featuring the bold red and gold design. High-quality moisture-wicking fabric keeps you comfortable during play.",
    shortDescription: "Official RCB jersey with moisture-wicking fabric",
    category: "jerseys",
    subcategory: "cricket",
    brand: "Puma",
    price: 2299, // INR
    comparePrice: 3199, // INR
    cost: 1400, // INR
    sku: "RCB-2024-JER",
    inventory: {
      trackQuantity: true,
      quantity: 120,
      lowStockThreshold: 15
    },
    variants: [
      { size: "S", color: "red", price: 2299, sku: "RCB-2024-JER-S-RED", quantity: 25 },
      { size: "M", color: "red", price: 2299, sku: "RCB-2024-JER-M-RED", quantity: 35 },
      { size: "L", color: "red", price: 2299, sku: "RCB-2024-JER-L-RED", quantity: 30 },
      { size: "XL", color: "red", price: 2299, sku: "RCB-2024-JER-XL-RED", quantity: 20 },
      { size: "XXL", color: "red", price: 2499, sku: "RCB-2024-JER-XXL-RED", quantity: 10 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500", alt: "RCB Jersey Front", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500", alt: "RCB Jersey Back", isPrimary: false }
    ],
    specifications: [
      { name: "Material", value: "Polyester Blend" },
      { name: "Technology", value: "Moisture-Wicking" },
      { name: "Fit", value: "Athletic Fit" },
      { name: "Care", value: "Machine Wash Cold" }
    ],
    tags: ["cricket", "ipl", "rcb", "bangalore", "jersey"],
    isActive: true,
    isFeatured: true,
    isCustomizable: true,
    customizationOptions: {
      allowNamePrint: true,
      allowNumberPrint: true,
      maxNameLength: 12,
      numberRange: { min: 1, max: 99 }
    },
    ratings: { average: 4.3, count: 95 },
    salesCount: 67
  },
  {
    name: "Premium Football Kit - Manchester United Style",
    description: "Premium quality football kit inspired by Manchester United. Includes jersey, shorts, and socks. Perfect for team sports and training sessions.",
    shortDescription: "Complete football kit with jersey, shorts, and socks",
    category: "sports-kits",
    subcategory: "football",
    brand: "Adidas",
    price: 3999, // INR
    comparePrice: 5499, // INR
    cost: 2200, // INR
    sku: "FB-KIT-MU-001",
    inventory: {
      trackQuantity: true,
      quantity: 80,
      lowStockThreshold: 10
    },
    variants: [
      { size: "S", color: "red", price: 3999, sku: "FB-KIT-MU-S-RED", quantity: 15 },
      { size: "M", color: "red", price: 3999, sku: "FB-KIT-MU-M-RED", quantity: 20 },
      { size: "L", color: "red", price: 3999, sku: "FB-KIT-MU-L-RED", quantity: 20 },
      { size: "XL", color: "red", price: 3999, sku: "FB-KIT-MU-XL-RED", quantity: 15 },
      { size: "XXL", color: "red", price: 4199, sku: "FB-KIT-MU-XXL-RED", quantity: 10 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500", alt: "Football Kit Complete Set", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500", alt: "Football Jersey Detail", isPrimary: false }
    ],
    specifications: [
      { name: "Material", value: "100% Polyester" },
      { name: "Kit Includes", value: "Jersey, Shorts, Socks" },
      { name: "Technology", value: "Climacool" },
      { name: "Fit", value: "Regular Fit" }
    ],
    tags: ["football", "kit", "manchester united", "sports", "team"],
    isActive: true,
    isFeatured: true,
    isCustomizable: true,
    customizationOptions: {
      allowNamePrint: true,
      allowNumberPrint: true,
      maxNameLength: 15,
      numberRange: { min: 1, max: 99 }
    },
    ratings: { average: 4.7, count: 156 },
    salesCount: 123
  },
  {
    name: "Golden Victory Trophy - Large",
    description: "Elegant golden victory trophy perfect for sports tournaments, competitions, and awards ceremonies. Made with high-quality materials and detailed craftsmanship.",
    shortDescription: "Premium golden trophy for sports tournaments",
    category: "trophies",
    subcategory: "victory",
    brand: "SportsLine",
    price: 1899, // INR
    comparePrice: 2499, // INR
    cost: 950, // INR
    sku: "TROPHY-GOLD-L",
    inventory: {
      trackQuantity: true,
      quantity: 50,
      lowStockThreshold: 5
    },
    images: [
      { url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=500", alt: "Golden Trophy", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500", alt: "Trophy Detail", isPrimary: false }
    ],
    specifications: [
      { name: "Material", value: "Metal with Gold Plating" },
      { name: "Height", value: "25 cm" },
      { name: "Base", value: "Marble Base" },
      { name: "Engraving", value: "Available" }
    ],
    tags: ["trophy", "award", "victory", "tournament", "golden"],
    isActive: true,
    isFeatured: false,
    isCustomizable: true,
    customizationOptions: {
      allowNamePrint: true,
      allowNumberPrint: false,
      maxNameLength: 30
    },
    ratings: { average: 4.8, count: 42 },
    salesCount: 28
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add creator to each product
    const productsWithCreator = sampleProducts.map(product => ({
      ...product,
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    }));

    // Insert sample products
    const insertedProducts = await Product.insertMany(productsWithCreator);
    console.log(`✅ Successfully inserted ${insertedProducts.length} products`);

    // Display inserted products
    insertedProducts.forEach(product => {
      console.log(`- ${product.name} (₹${product.price})`);
    });

    console.log('\n🎉 Product seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, sampleProducts };
