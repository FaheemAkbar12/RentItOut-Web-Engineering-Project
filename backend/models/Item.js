const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Tools', 'Sports', 'Camping', 'Photography', 'Music', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceUnit: {
    type: String,
    enum: ['hour', 'day', 'week', 'month'],
    default: 'day'
  },
  owner: {
    userId: {
      type: String,
      required: true
    },
    name: String,
    email: String,
    imageUrl: String
  },
  images: [{
    url: String,
    publicId: String
  }],
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'rented', 'maintenance'],
      default: 'available'
    },
    unavailableDates: [{
      startDate: Date,
      endDate: Date
    }]
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair'],
    default: 'good'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
itemSchema.index({ 'location.coordinates': '2dsphere' });

// Index for search
itemSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Index for filtering
itemSchema.index({ category: 1, 'availability.status': 1, isActive: 1 });

module.exports = mongoose.model('Item', itemSchema);
