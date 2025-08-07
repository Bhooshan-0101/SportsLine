const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    size: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    },
    customization: {
      playerName: {
        type: String,
        trim: true,
        maxlength: [20, 'Player name cannot exceed 20 characters']
      },
      playerNumber: {
        type: Number,
        min: [1, 'Player number must be at least 1'],
        max: [99, 'Player number cannot exceed 99']
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    }
  }],
  shippingAddress: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    street: { type: String, required: true, trim: true },
    apartment: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'USA' },
    phone: { type: String, trim: true }
  },
  billingAddress: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    street: { type: String, required: true, trim: true },
    apartment: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'USA' },
    phone: { type: String, trim: true }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      trim: true
    },
    paidAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    }
  },
  shipping: {
    method: {
      type: String,
      required: true,
      enum: ['standard', 'express', 'overnight', 'pickup']
    },
    carrier: {
      type: String,
      trim: true
    },
    trackingNumber: {
      type: String,
      trim: true
    },
    estimatedDelivery: {
      type: Date
    },
    shippedAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'packing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  approvalStatus: {
    approved: {
      type: Boolean,
      default: null
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: {
      type: Date
    },
    rejectionReason: {
      code: {
        type: String,
        enum: ['insufficient_stock', 'payment_failed', 'invalid_address', 'policy_violation', 'fraud_suspected', 'customer_request', 'other']
      },
      details: {
        type: String,
        trim: true,
        maxlength: [500, 'Rejection details cannot exceed 500 characters']
      }
    }
  },
  notes: {
    customer: {
      type: String,
      trim: true,
      maxlength: [500, 'Customer notes cannot exceed 500 characters']
    },
    admin: {
      type: String,
      trim: true,
      maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
    }
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  estimatedPackingTime: {
    type: Number, // in hours
    default: 24
  },
  actualPackingTime: {
    type: Number // in hours
  },
  packingStartedAt: {
    type: Date
  },
  packingCompletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'approvalStatus.approved': 1 });
orderSchema.index({ assignedTo: 1 });
orderSchema.index({ priority: 1, status: 1 });
orderSchema.index({ tags: 1 });
// Note: orderNumber index is automatically created by unique: true in schema definition

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `SL${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtuals are included in JSON output
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
