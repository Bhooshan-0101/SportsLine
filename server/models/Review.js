const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [100, 'Pro cannot exceed 100 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [100, 'Con cannot exceed 100 characters']
  }],
  images: [{
    url: { type: String, required: true },
    alt: { type: String, trim: true }
  }],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  reported: {
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reasons: [{
      reason: { type: String, required: true },
      reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reportedAt: { type: Date, default: Date.now }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationNote: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per customer per product per order
reviewSchema.index({ product: 1, customer: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ verified: 1 });

// Virtual for review age
reviewSchema.virtual('reviewAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON output
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);
