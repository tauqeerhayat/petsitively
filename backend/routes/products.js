const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/authMiddleware');
const { normalizeDiscountedPrice } = require('../utils/pricing');

const router = express.Router();

const CATEGORY_POPULATE = { path: 'category', select: 'name slug' };

function parseRequiredPrice(value, label) {
  if (value === undefined || value === null || value === '') {
    return { error: `${label} is required` };
  }
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) {
    return { error: `${label} must be a non-negative number` };
  }
  return { value: num };
}

async function resolveCategoryId(categoryValue) {
  if (categoryValue == null || categoryValue === '') {
    return { error: 'category is required' };
  }

  const id =
    typeof categoryValue === 'object' && categoryValue._id
      ? String(categoryValue._id)
      : String(categoryValue);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: 'Invalid category ID' };
  }

  const category = await Category.findById(id).select('_id');
  if (!category) {
    return { error: 'Category not found' };
  }

  return { value: category._id };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseOptionalPrice(value, label) {
  if (value === undefined || value === null || value === '') {
    return { value: null };
  }
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) {
    return { error: `${label} must be a non-negative number` };
  }
  return { value: num };
}

// Effective storefront price: discountedPrice when active, otherwise sellingPrice
const EFFECTIVE_PRICE_EXPR = {
  $cond: {
    if: {
      $and: [
        { $ne: ['$discountedPrice', null] },
        { $lt: ['$discountedPrice', '$sellingPrice'] },
      ],
    },
    then: '$discountedPrice',
    else: '$sellingPrice',
  },
};

// GET /api/products
// Optional query: search, category, minPrice, maxPrice, sort (price-asc|price-desc|newest)
router.get('/', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const categoryParam =
      typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const sortParam = typeof req.query.sort === 'string' ? req.query.sort.trim() : 'newest';

    const minParsed = parseOptionalPrice(req.query.minPrice, 'minPrice');
    const maxParsed = parseOptionalPrice(req.query.maxPrice, 'maxPrice');

    if (minParsed.error || maxParsed.error) {
      return res.status(400).json({
        success: false,
        message: minParsed.error || maxParsed.error,
      });
    }

    if (
      minParsed.value != null &&
      maxParsed.value != null &&
      minParsed.value > maxParsed.value
    ) {
      return res.status(400).json({
        success: false,
        message: 'minPrice cannot be greater than maxPrice',
      });
    }

    const match = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      match.$or = [{ name: regex }, { description: regex }];
    }

    if (categoryParam) {
      if (!mongoose.Types.ObjectId.isValid(categoryParam)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }
      match.category = new mongoose.Types.ObjectId(categoryParam);
    }

    let sortStage = { createdAt: -1 };
    if (sortParam === 'price-asc') {
      sortStage = { effectivePrice: 1, createdAt: -1 };
    } else if (sortParam === 'price-desc') {
      sortStage = { effectivePrice: -1, createdAt: -1 };
    } else if (sortParam !== 'newest' && sortParam !== '') {
      return res.status(400).json({
        success: false,
        message: "sort must be one of: 'price-asc', 'price-desc', 'newest'",
      });
    }

    const pipeline = [
      { $match: match },
      { $addFields: { effectivePrice: EFFECTIVE_PRICE_EXPR } },
    ];

    const priceMatch = {};
    if (minParsed.value != null) priceMatch.$gte = minParsed.value;
    if (maxParsed.value != null) priceMatch.$lte = maxParsed.value;
    if (Object.keys(priceMatch).length) {
      pipeline.push({ $match: { effectivePrice: priceMatch } });
    }

    pipeline.push(
      { $sort: sortStage },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDoc',
        },
      },
      {
        $addFields: {
          category: {
            $cond: {
              if: { $gt: [{ $size: '$categoryDoc' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$categoryDoc._id', 0] },
                name: { $arrayElemAt: ['$categoryDoc.name', 0] },
                slug: { $arrayElemAt: ['$categoryDoc.slug', 0] },
              },
              else: null,
            },
          },
        },
      },
      {
        $project: {
          categoryDoc: 0,
          effectivePrice: 0,
          __v: 0,
        },
      }
    );

    const products = await Product.aggregate(pipeline);

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(id).populate(CATEGORY_POPULATE);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// POST /api/products
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, images, stock, featured } = req.body;

    const cost = parseRequiredPrice(req.body.costPrice, 'costPrice');
    const selling = parseRequiredPrice(req.body.sellingPrice, 'sellingPrice');
    const category = await resolveCategoryId(req.body.category);

    if (!name || !description || cost.error || selling.error || category.error) {
      return res.status(400).json({
        success: false,
        message:
          category.error ||
          cost.error ||
          selling.error ||
          'name, description, costPrice, sellingPrice, and category are required',
      });
    }

    const discountedPrice = normalizeDiscountedPrice(req.body.discountedPrice);

    if (
      discountedPrice != null &&
      (Number.isNaN(Number(discountedPrice)) || discountedPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'discountedPrice must be a non-negative number or null',
      });
    }

    const product = await Product.create({
      name,
      description,
      costPrice: cost.value,
      sellingPrice: selling.value,
      discountedPrice,
      images: images || [],
      category: category.value,
      stock: stock ?? 0,
      featured: featured ?? false,
    });

    await product.populate(CATEGORY_POPULATE);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.name !== undefined) product.name = req.body.name;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.images !== undefined) product.images = req.body.images;
    if (req.body.stock !== undefined) product.stock = req.body.stock;
    if (req.body.featured !== undefined) product.featured = req.body.featured;

    if (req.body.category !== undefined) {
      const category = await resolveCategoryId(req.body.category);
      if (category.error) {
        return res.status(400).json({ success: false, message: category.error });
      }
      product.category = category.value;
    }

    if (req.body.costPrice !== undefined) {
      const cost = parseRequiredPrice(req.body.costPrice, 'costPrice');
      if (cost.error) {
        return res.status(400).json({ success: false, message: cost.error });
      }
      product.costPrice = cost.value;
    }

    if (req.body.sellingPrice !== undefined) {
      const selling = parseRequiredPrice(req.body.sellingPrice, 'sellingPrice');
      if (selling.error) {
        return res.status(400).json({ success: false, message: selling.error });
      }
      product.sellingPrice = selling.value;
    }

    // Always apply when the key is present — including null (clear promo)
    if (Object.prototype.hasOwnProperty.call(req.body, 'discountedPrice')) {
      const discountedPrice = normalizeDiscountedPrice(req.body.discountedPrice);
      if (
        discountedPrice != null &&
        (Number.isNaN(Number(discountedPrice)) || discountedPrice < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: 'discountedPrice must be a non-negative number or null',
        });
      }
      product.set('discountedPrice', discountedPrice);
    }

    await product.save();
    await product.populate(CATEGORY_POPULATE);

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted', data: product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
