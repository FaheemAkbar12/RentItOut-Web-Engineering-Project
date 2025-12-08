const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const Travel = require('../models/Travel');

// Get all travel listings
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      origin,
      destination,
      date,
      seats,
      maxPrice,
      sortBy = 'departureTime',
      order = 'asc'
    } = req.query;

    const query = { isActive: true, status: 'scheduled' };

    // Filter by origin
    if (origin) {
      query['route.origin.city'] = new RegExp(origin, 'i');
    }

    // Filter by destination
    if (destination) {
      query['route.destination.city'] = new RegExp(destination, 'i');
    }

    // Filter by date
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.departureTime = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Filter by available seats
    if (seats) {
      query['seating.availableSeats'] = { $gte: Number(seats) };
    }

    // Filter by price
    if (maxPrice) {
      query['pricing.pricePerSeat'] = { $lte: Number(maxPrice) };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const travels = await Travel.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Travel.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        travels,
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

// Get single travel
router.get('/:id', async (req, res, next) => {
  try {
    const travel = await Travel.findById(req.params.id);

    if (!travel || !travel.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Travel not found'
      });
    }

    res.json({
      status: 'success',
      data: { travel }
    });
  } catch (error) {
    next(error);
  }
});

// Create new travel listing
router.post('/', authenticate, async (req, res, next) => {
  try {
    const travelData = {
      ...req.body,
      driver: {
        userId: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        imageUrl: req.user.imageUrl
      },
      seating: {
        ...req.body.seating,
        availableSeats: req.body.seating.totalSeats,
        bookedSeats: []
      }
    };

    const travel = await Travel.create(travelData);

    res.status(201).json({
      status: 'success',
      data: { travel }
    });
  } catch (error) {
    next(error);
  }
});

// Update travel
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const travel = await Travel.findById(req.params.id);

    if (!travel) {
      return res.status(404).json({
        status: 'error',
        message: 'Travel not found'
      });
    }

    // Check ownership
    if (travel.driver.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this travel'
      });
    }

    const updatedTravel = await Travel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      data: { travel: updatedTravel }
    });
  } catch (error) {
    next(error);
  }
});

// Book a seat
router.post('/:id/book', authenticate, async (req, res, next) => {
  try {
    const travel = await Travel.findById(req.params.id);

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

    // Check if user already booked
    const alreadyBooked = travel.seating.bookedSeats.some(
      seat => seat.userId === req.user.id
    );

    if (alreadyBooked) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already booked a seat'
      });
    }

    // Add booking
    travel.seating.bookedSeats.push({
      userId: req.user.id,
      passengerName: `${req.user.firstName} ${req.user.lastName}`,
      passengerEmail: req.user.email
    });

    travel.seating.availableSeats -= 1;
    await travel.save();

    res.json({
      status: 'success',
      data: { travel },
      message: 'Seat booked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Cancel travel
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const travel = await Travel.findById(req.params.id);

    if (!travel) {
      return res.status(404).json({
        status: 'error',
        message: 'Travel not found'
      });
    }

    // Check ownership
    if (travel.driver.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this travel'
      });
    }

    travel.status = 'cancelled';
    travel.isActive = false;
    await travel.save();

    res.json({
      status: 'success',
      message: 'Travel cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
