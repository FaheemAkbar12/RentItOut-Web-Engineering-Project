const mongoose = require('mongoose');

const travelSchema = new mongoose.Schema({
  driver: {
    userId: {
      type: String,
      required: true
    },
    name: String,
    email: String,
    imageUrl: String,
    rating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  route: {
    origin: {
      city: {
        type: String,
        required: [true, 'Origin city is required']
      },
      state: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number] // [longitude, latitude]
      }
    },
    destination: {
      city: {
        type: String,
        required: [true, 'Destination city is required']
      },
      state: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number]
      }
    },
    distance: Number, // in miles/km
    estimatedDuration: Number // in minutes
  },
  departureTime: {
    type: Date,
    required: [true, 'Departure time is required']
  },
  arrivalTime: Date,
  seating: {
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: 1,
      max: 8
    },
    availableSeats: {
      type: Number,
      required: true
    },
    bookedSeats: [{
      userId: String,
      passengerName: String,
      passengerEmail: String,
      bookedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  pricing: {
    pricePerSeat: {
      type: Number,
      required: [true, 'Price per seat is required'],
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  vehicle: {
    make: String,
    model: String,
    year: Number,
    color: String,
    plateNumber: String
  },
  luggage: {
    allowedBags: {
      type: Number,
      default: 1
    },
    maxBagSize: String
  },
  amenities: [{
    type: String,
    enum: ['wifi', 'ac', 'music', 'petFriendly', 'smokingAllowed', 'snacks']
  }],
  rules: [String],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
travelSchema.index({ 'route.origin.coordinates': '2dsphere' });
travelSchema.index({ 'route.destination.coordinates': '2dsphere' });
travelSchema.index({ departureTime: 1, status: 1 });
travelSchema.index({ 'driver.userId': 1 });

module.exports = mongoose.model('Travel', travelSchema);
