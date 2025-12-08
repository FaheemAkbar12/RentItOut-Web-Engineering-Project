const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['item', 'travel'],
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  travel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Travel'
  },
  renter: {
    userId: {
      type: String,
      required: true
    },
    name: String,
    email: String,
    phone: String,
    imageUrl: String
  },
  owner: {
    userId: {
      type: String,
      required: true
    },
    name: String,
    email: String
  },
  dates: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    serviceFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    method: String,
    transactionId: String,
    paidAt: Date
  },
  notes: String,
  cancellation: {
    cancelledBy: String, // userId
    cancelledAt: Date,
    reason: String
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ 'renter.userId': 1, status: 1 });
bookingSchema.index({ 'owner.userId': 1, status: 1 });
bookingSchema.index({ type: 1, item: 1, travel: 1 });
bookingSchema.index({ 'dates.startDate': 1, 'dates.endDate': 1 });

module.exports = mongoose.model('Booking', bookingSchema);
