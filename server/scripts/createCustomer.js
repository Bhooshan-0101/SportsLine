const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createCustomer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if customer already exists
    const existingCustomer = await User.findOne({ email: 'customer@sportsline.com' });
    if (existingCustomer) {
      console.log('Customer user already exists:', existingCustomer.email);
      return;
    }

    // Create customer user
    const customerData = {
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'customer@sportsline.com',
      password: 'customer123', // This will be hashed by the pre-save middleware
      role: 'customer',
      isActive: true,
      isEmailVerified: true,
      profile: {
        phone: '+91-9876543211',
        dateOfBirth: new Date('1995-05-15'),
        gender: 'male'
      },
      address: {
        street: '456 Customer Lane',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      }
    };

    const customer = new User(customerData);
    await customer.save();

    console.log('✅ Customer user created successfully!');
    console.log('Email:', customer.email);
    console.log('Password: customer123');
    console.log('Role:', customer.role);
    
  } catch (error) {
    console.error('❌ Error creating customer user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
if (require.main === module) {
  createCustomer();
}

module.exports = createCustomer;
