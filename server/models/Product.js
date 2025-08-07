const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['jerseys', 'sports-kits', 'trophies', 'equipment', 'accessories'],
    lowercase: true
  },
  subcategory: {
    type: String,
    trim: true,
    lowercase: true
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  inventory: {
    trackQuantity: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Low stock threshold cannot be negative']
    }
  },
  variants: [{
    size: {
      type: String,
      trim: true,
      uppercase: true
    },
    color: {
      type: String,
      trim: true,
      lowercase: true
    },
    price: {
      type: Number,
      min: [0, 'Variant price cannot be negative']
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Variant quantity cannot be negative']
    },
    image: {
      type: String,
      trim: true
    }
  }],
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  seo: {
    title: {
      type: String,
      trim: true,
      maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isCustomizable: {
    type: Boolean,
    default: false
  },
  customizationOptions: {
    allowNamePrint: {
      type: Boolean,
      default: false
    },
    allowNumberPrint: {
      type: Boolean,
      default: false
    },
    maxNameLength: {
      type: Number,
      default: 15
    },
    numberRange: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 99 }
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  salesCount: {
    type: Number,
    default: 0,
    min: [0, 'Sales count cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (!this.inventory.trackQuantity) return 'in-stock';
  if (this.inventory.quantity === 0) return 'out-of-stock';
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) return 'low-stock';
  return 'in-stock';
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
