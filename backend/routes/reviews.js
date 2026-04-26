const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Review = require('../models/Review');
const Item = require('../models/Item');
const Travel = require('../models/Travel');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Create a review
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { type, itemId, travelId, reviewedUserId, bookingId, rating, title, comment, aspects } = req.body;

    // Verify booking exists and user is involved
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (booking.renter.userId !== req.user.id && booking.owner.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only review bookings you are involved in'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      booking: bookingId,
      'reviewer.userId': req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this booking'
      });
    }

    const reviewData = {
      type,
      booking: bookingId,
      reviewer: {
        userId: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        imageUrl: req.user.imageUrl
      },
      rating,
      title,
      comment,
      aspects,
      isVerified: true // Because it's linked to a booking
    };

    if (type === 'item') {
      reviewData.item = itemId;
    } else if (type === 'travel') {
      reviewData.travel = travelId;
    } else if (type === 'user') {
      reviewData.reviewedUser = reviewedUserId;
    }

    const review = await Review.create(reviewData);

    // Update average rating
    await updateRatings(type, itemId || travelId || reviewedUserId);

    res.status(201).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
});

// Get reviews for an item/travel/user
router.get('/', async (req, res, next) => {
  try {
    const { type, itemId, travelId, userId, page = 1, limit = 10 } = req.query;

    const query = { isHidden: false };

    if (type) query.type = type;
    if (itemId) query.item = itemId;
    if (travelId) query.travel = travelId;
    if (userId) query.reviewedUser = userId;

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mark review as helpful
router.post('/:id/helpful', authenticate, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    if (review.helpful.users.includes(req.user.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already marked this review as helpful'
      });
    }

    review.helpful.users.push(req.user.id);
    review.helpful.count += 1;
    await review.save();

    res.json({
      status: 'success',
      message: 'Review marked as helpful'
    });
  } catch (error) {
    next(error);
  }
});

// Add response to review (owner only)
router.post('/:id/response', authenticate, async (req, res, next) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    // Verify user is the owner of the reviewed item/travel
    let isOwner = false;

    if (review.type === 'item') {
      const item = await Item.findById(review.item);
      isOwner = item && item.owner.userId === req.user.id;
    } else if (review.type === 'travel') {
      const travel = await Travel.findById(review.travel);
      isOwner = travel && travel.driver.userId === req.user.id;
    }

    if (!isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the owner can respond to this review'
      });
    }

    review.response = {
      comment,
      respondedAt: new Date(),
      responderId: req.user.id
    };

    await review.save();

    res.json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to update ratings
async function updateRatings(type, targetId) {
  const reviews = await Review.find({
    [type === 'item' ? 'item' : type === 'travel' ? 'travel' : 'reviewedUser']: targetId,
    isHidden: false
  });

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  if (type === 'item') {
    await Item.findByIdAndUpdate(targetId, {
      'rating.average': averageRating,
      'rating.count': reviews.length
    });
  } else if (type === 'travel') {
    await Travel.findByIdAndUpdate(targetId, {
      'driver.rating': averageRating,
      'driver.reviewCount': reviews.length
    });
  } else if (type === 'user') {
    await User.findOneAndUpdate(
      { clerkId: targetId },
      {
        'rating.asOwner.average': averageRating,
        'rating.asOwner.count': reviews.length
      }
    );
  }
}

module.exports = router;
