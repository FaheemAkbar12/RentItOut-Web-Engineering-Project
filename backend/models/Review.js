const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['item', 'travel', 'user'],
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
  reviewedUser: String, // userId for user reviews
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  reviewer: {
    userId: {
      type: String,
      required: true
    },
    name: String,
    imageUrl: String
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: 1000
  },
  aspects: {
    cleanliness: Number,
    communication: Number,
    accuracy: Number,
    value: Number
  },
  photos: [{
    url: String,
    publicId: String
  }],
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [String] // userIds who found it helpful
  },
  response: {
    comment: String,
    respondedAt: Date,
    responderId: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ type: 1, item: 1, travel: 1, reviewedUser: 1 });
reviewSchema.index({ 'reviewer.userId': 1 });
reviewSchema.index({ rating: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
