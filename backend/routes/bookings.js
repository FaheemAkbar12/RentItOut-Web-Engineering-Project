const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Item = require('../models/Item');
const Travel = require('../models/Travel');

// Create a booking
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { type, itemId, travelId, dates, notes } = req.body;

    let bookingData = {
      type,
      dates,
      notes,
      renter: {
        userId: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        imageUrl: req.user.imageUrl
      }
    };

    if (type === 'item') {
      const item = await Item.findById(itemId);

      if (!item || !item.isActive) {
        return res.status(404).json({
          status: 'error',
          message: 'Item not found'
        });
      }

      if (item.availability.status !== 'available') {
        return res.status(400).json({
          status: 'error',
          message: 'Item is not available'
        });
      }

      // Calculate total price
      const startDate = new Date(dates.startDate);
      const endDate = new Date(dates.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      const basePrice = item.price * days;
      const serviceFee = basePrice * 0.1; // 10% service fee
      const tax = basePrice * 0.08; // 8% tax
      const totalPrice = basePrice + serviceFee + tax;

      bookingData.item = itemId;
      bookingData.owner = item.owner;
      bookingData.pricing = {
        basePrice,
        serviceFee,
        tax,
        totalPrice
      };

    } else if (type === 'travel') {
      const travel = await Travel.findById(travelId);

      if (!travel || !travel.isActive) {
        return res.status(404).json({
          status: 'error',
          message: 'Travel not found'
        });
      }

      if (travel.seating.availableSeats < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'No seats available'
        });
      }

      const basePrice = travel.pricing.pricePerSeat;
      const serviceFee = basePrice * 0.15; // 15% service fee
      const totalPrice = basePrice + serviceFee;

      bookingData.travel = travelId;
      bookingData.owner = travel.driver;
      bookingData.pricing = {
        basePrice,
        serviceFee,
        tax: 0,
        totalPrice
      };
    }

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res, next) => {
  try {
    const { status, type } = req.query;

    const query = {
      $or: [
        { 'renter.userId': req.user.id },
        { 'owner.userId': req.user.id }
      ]
    };

    if (status) query.status = status;
    if (type) query.type = type;

    const bookings = await Booking.find(query)
      .populate('item')
      .populate('travel')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
});

// Get single booking
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('item')
      .populate('travel');

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user is involved in the booking
    if (booking.renter.userId !== req.user.id && booking.owner.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
});

// Update booking status
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Only owner can confirm/reject
    if (booking.owner.userId !== req.user.id && status !== 'cancelled') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    await booking.save();

    // Update item availability if confirmed
    if (status === 'confirmed' && booking.type === 'item') {
      await Item.findByIdAndUpdate(booking.item, {
        'availability.status': 'rented',
        $push: {
          'availability.unavailableDates': {
            startDate: booking.dates.startDate,
            endDate: booking.dates.endDate
          }
        }
      });
    }

    res.json({
      status: 'success',
      data: { booking },
      message: `Booking ${status} successfully`
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.post('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user is involved in the booking
    if (booking.renter.userId !== req.user.id && booking.owner.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this booking'
      });
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.user.id,
      cancelledAt: new Date(),
      reason
    };

    await booking.save();

    res.json({
      status: 'success',
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
