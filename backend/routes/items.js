const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const { authenticate, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Item = require('../models/Item');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Get all items (with filters, search, pagination)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      availability,
      sortBy = 'createdAt',
      order = 'desc',
      city,
      radius // in miles
    } = req.query;

    const query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Availability
    if (availability) {
      query['availability.status'] = availability;
    }

    // Location-based search
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const items = await Item.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Item.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        items,
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

// Get single item
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item || !item.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found'
      });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.json({
      status: 'success',
      data: { item }
    });
  } catch (error) {
    next(error);
  }
});

// Create new item
router.post('/', 
  authenticate, 
  upload.array('images', 5),
  async (req, res, next) => {
    try {
      const itemData = {
        ...req.body,
        owner: {
          userId: req.user.id,
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
          imageUrl: req.user.imageUrl
        }
      };

      // Upload images to Cloudinary
      if (req.files && req.files.length > 0) {
        const imageUploads = await Promise.all(
          req.files.map(file => uploadToCloudinary(file, 'items'))
        );
        itemData.images = imageUploads;
      }

      const item = await Item.create(itemData);

      res.status(201).json({
        status: 'success',
        data: { item }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update item
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.owner.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this item'
      });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      data: { item: updatedItem }
    });
  } catch (error) {
    next(error);
  }
});

// Delete item
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.owner.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this item'
      });
    }

    // Soft delete
    item.isActive = false;
    await item.save();

    res.json({
      status: 'success',
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user's items
router.get('/user/:userId', async (req, res, next) => {
  try {
    const items = await Item.find({
      'owner.userId': req.params.userId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: { items }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
