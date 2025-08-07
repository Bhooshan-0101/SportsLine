const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@sportsline.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      profile: {
        phone: '+91-9876543210',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'other'
      },
      address: {
        street: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;
