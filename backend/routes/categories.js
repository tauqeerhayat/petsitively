const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/categories — public
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    const counts = await Product.aggregate([
      { $group: { _id: '$category', productCount: { $sum: 1 } } },
    ]);

    const countById = new Map(
      counts.map((row) => [String(row._id), row.productCount])
    );

    const data = categories.map((category) => ({
      ...category,
      productCount: countById.get(String(category._id)) || 0,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/categories — admin
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'name is required',
      });
    }

    const category = await Category.create({ name });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists',
      });
    }
    next(error);
  }
});

// PUT /api/categories/:id — admin
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'name is required',
      });
    }

    category.name = name;
    await category.save();

    res.json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists',
      });
    }
    next(error);
  }
});

// DELETE /api/categories/:id — admin
// Optional body: { reassignTo: categoryId } — required when products use this category
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const productCount = await Product.countDocuments({ category: id });

    if (productCount > 0) {
      const reassignTo =
        typeof req.body?.reassignTo === 'string' ? req.body.reassignTo.trim() : '';

      if (!reassignTo) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete — ${productCount} products use this category. Choose another category to move them to.`,
          code: 'REASSIGN_REQUIRED',
          productCount,
        });
      }

      if (!mongoose.Types.ObjectId.isValid(reassignTo)) {
        return res.status(400).json({ success: false, message: 'Invalid reassignment category ID' });
      }

      if (String(reassignTo) === String(id)) {
        return res.status(400).json({
          success: false,
          message: 'Choose a different category to move products to',
        });
      }

      const target = await Category.findById(reassignTo);

      if (!target) {
        return res.status(404).json({
          success: false,
          message: 'Reassignment category not found',
        });
      }

      await Product.updateMany({ category: id }, { $set: { category: target._id } });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message:
        productCount > 0
          ? `Category deleted — ${productCount} product${productCount === 1 ? '' : 's'} moved`
          : 'Category deleted',
      data: category,
      movedCount: productCount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
