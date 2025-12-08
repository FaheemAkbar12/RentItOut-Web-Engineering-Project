const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Item = require('../models/Item');
const Booking = require('../models/Booking');

// Get or create user profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    let user = await User.findOne({ clerkId: req.user.id });

    if (!user) {
      // Create new user profile
      user = await User.create({
        clerkId: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        imageUrl: req.user.imageUrl,
        verification: {
          isEmailVerified: true
        }
      });
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const allowedUpdates = ['profile', 'preferences'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findOneAndUpdate(
      { clerkId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.id });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get active items count
    const activeItems = await Item.countDocuments({
      'owner.userId': req.user.id,
      isActive: true
    });

    // Get bookings count
    const [rentalsAsOwner, rentalsAsRenter] = await Promise.all([
      Booking.countDocuments({ 'owner.userId': req.user.id }),
      Booking.countDocuments({ 'renter.userId': req.user.id })
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          ...user.stats,
          activeItems,
          totalRentalsAsOwner: rentalsAsOwner,
          totalRentalsAsRenter: rentalsAsRenter
        },
        rating: user.rating
      }
    });
  } catch (error) {
    next(error);
  }
});

// Add item to favorites
router.post('/favorites/items/:itemId', authenticate, async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.id });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const itemId = req.params.itemId;

    // Check if already in favorites
    if (user.favorites.items.includes(itemId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Item already in favorites'
      });
    }

    user.favorites.items.push(itemId);
    await user.save();

    res.json({
      status: 'success',
      message: 'Item added to favorites'
    });
  } catch (error) {
    next(error);
  }
});

// Remove item from favorites
router.delete('/favorites/items/:itemId', authenticate, async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.id });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    user.favorites.items = user.favorites.items.filter(
      id => id.toString() !== req.params.itemId
    );

    await user.save();

    res.json({
      status: 'success',
      message: 'Item removed from favorites'
    });
  } catch (error) {
    next(error);
  }
});

// Get user's favorites
router.get('/favorites', authenticate, async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.id })
      .populate('favorites.items')
      .populate('favorites.travels');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        items: user.favorites.items,
        travels: user.favorites.travels
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get public user profile
router.get('/:userId', async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.params.userId })
      .select('firstName lastName imageUrl profile rating stats createdAt');

    if (!user || !user.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
