const mongoose = require('mongoose');

const bulkJerseyOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: false
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamName: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    }
  },
  jerseyDetails: {
    baseProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false
    },

    material: {
      type: String,
      required: true,
      enum: ['polyester', 'cotton', 'cotton-polyester', 'dri-fit', 'mesh'],
      default: 'polyester'
    },
    style: {
      type: String,
      required: true,
      enum: ['home', 'away', 'third', 'training', 'goalkeeper'],
      default: 'home'
    },
    sizes: [{
      size: {
        type: String,
        required: false,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
      },
      quantity: {
        type: Number,
        required: false,
        min: [1, 'Size quantity must be at least 1']
      }
    }]
  },
  customDesign: {
    hasCustomDesign: {
      type: Boolean,
      default: false
    },
    designFiles: [{
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      path: { type: String, required: true },
      size: { type: Number, required: true },
      mimetype: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }],
    designNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Design notes cannot exceed 1000 characters']
    }
  },
  playerDetails: [{
    playerName: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
      maxlength: [30, 'Player name cannot exceed 30 characters']
    },
    jerseyNumber: {
      type: Number,
      required: [true, 'Jersey number is required'],
      min: [1, 'Jersey number must be at least 1'],
      max: [99, 'Jersey number cannot exceed 99']
    },
    size: {
      type: String,
      required: [true, 'Jersey size is required'],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    },
    position: {
      type: String,
      trim: true,
      maxlength: [20, 'Position cannot exceed 20 characters']
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [200, 'Special requests cannot exceed 200 characters']
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Base price cannot be negative']
    },
    customizationFee: {
      type: Number,
      default: 0,
      min: [0, 'Customization fee cannot be negative']
    },
    designFee: {
      type: Number,
      default: 0,
      min: [0, 'Design fee cannot be negative']
    },
    bulkDiscount: {
      percentage: { type: Number, default: 0, min: 0, max: 50 },
      amount: { type: Number, default: 0, min: 0 }
    },
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
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  timeline: {
    designApproval: {
      required: { type: Boolean, default: true },
      deadline: { type: Date },
      approvedAt: { type: Date },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    production: {
      startDate: { type: Date },
      estimatedCompletion: { type: Date },
      actualCompletion: { type: Date }
    },
    delivery: {
      estimatedDate: { type: Date },
      actualDate: { type: Date },
      method: {
        type: String,
        enum: ['pickup', 'delivery', 'shipping'],
        default: 'shipping'
      }
    }
  },
  status: {
    type: String,
    required: true,
    enum: [
      'pending_review',
      'design_approval_needed',
      'approved',
      'in_production',
      'quality_check',
      'ready_for_delivery',
      'completed',
      'cancelled',
      'on_hold'
    ],
    default: 'pending_review'
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'check', 'cash', 'partial_payment']
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    deposits: [{
      amount: { type: Number, required: true },
      paidAt: { type: Date, default: Date.now },
      method: { type: String, required: true },
      transactionId: { type: String }
    }],
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, 'Total paid cannot be negative']
    },
    balanceDue: {
      type: Number,
      default: 0
    }
  },
  shippingAddress: {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: 'USA' },
    phone: { type: String, trim: true }
  },
  notes: {
    customer: {
      type: String,
      trim: true,
      maxlength: [1000, 'Customer notes cannot exceed 1000 characters']
    },
    admin: {
      type: String,
      trim: true,
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters']
    },
    production: {
      type: String,
      trim: true,
      maxlength: [1000, 'Production notes cannot exceed 1000 characters']
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bulkJerseyOrderSchema.index({ customer: 1, createdAt: -1 });
bulkJerseyOrderSchema.index({ status: 1 });
bulkJerseyOrderSchema.index({ assignedTo: 1 });
bulkJerseyOrderSchema.index({ priority: 1, status: 1 });
bulkJerseyOrderSchema.index({ 'timeline.designApproval.deadline': 1 });
bulkJerseyOrderSchema.index({ estimatedDelivery: 1 });

// Pre-save middleware to generate order number
bulkJerseyOrderSchema.pre('save', async function(next) {
  // Always generate order number if not present
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `BJO${timestamp.slice(-6)}${random}`;
    console.log('Generated order number:', this.orderNumber);
  }

  // Calculate balance due
  if (this.payment && this.pricing) {
    this.payment.balanceDue = this.pricing.total - (this.payment.totalPaid || 0);
  }

  next();
});

// Virtual for total jersey quantity
bulkJerseyOrderSchema.virtual('totalQuantity').get(function() {
  if (this.jerseyDetails.sizes && this.jerseyDetails.sizes.length > 0) {
    return this.jerseyDetails.sizes.reduce((total, size) => total + size.quantity, 0);
  }
  // Fallback to player count if sizes are not specified
  return this.playerDetails ? this.playerDetails.length : 0;
});

// Virtual for order age in days
bulkJerseyOrderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON output
bulkJerseyOrderSchema.set('toJSON', { virtuals: true });
bulkJerseyOrderSchema.set('toObject', { virtuals: true });

// Clear any existing model to avoid caching issues
if (mongoose.models.BulkJerseyOrder) {
  delete mongoose.models.BulkJerseyOrder;
}

module.exports = mongoose.model('BulkJerseyOrder', bulkJerseyOrderSchema);
