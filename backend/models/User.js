const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  firstName: String,
  lastName: String,
  imageUrl: String,
  profile: {
    bio: {
      type: String,
      maxlength: 500
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    dateOfBirth: Date,
    languages: [String],
    interests: [String]
  },
  verification: {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isIdVerified: {
      type: Boolean,
      default: false
    },
    documents: [{
      type: String,
      url: String,
      uploadedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }]
  },
  stats: {
    itemsListed: {
      type: Number,
      default: 0
    },
    itemsRented: {
      type: Number,
      default: 0
    },
    tripsOffered: {
      type: Number,
      default: 0
    },
    tripsTaken: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    }
  },
  rating: {
    asOwner: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },
    asRenter: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },
    asDriver: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  favorites: {
    items: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    }],
    travels: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Travel'
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'profile.address.city': 1 });

module.exports = mongoose.model('User', userSchema);
