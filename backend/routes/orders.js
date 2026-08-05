const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Refund = require('../models/Refund');
const authMiddleware = require('../middleware/authMiddleware');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const { optionalCustomerAuth } = require('../middleware/customerAuthMiddleware');
const { sendOrderConfirmationEmail } = require('../utils/mailer');
const { getChargePrice } = require('../utils/pricing');

const router = express.Router();

const PRODUCT_POPULATE = 'name sellingPrice discountedPrice images category';

// POST /api/orders
router.post('/', optionalCustomerAuth, async (req, res, next) => {
  try {
    const { customerName, email, shippingAddress, items, paymentStatus } = req.body;

    if (!customerName || !email || !shippingAddress || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'customerName, email, shippingAddress, and a non-empty items array are required',
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Each item must include a valid product ID and quantity (>= 1)',
        });
      }

      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${item.product}`,
        });
      }

      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`,
        });
      }

      const priceAtPurchase = getChargePrice(product);
      const costAtPurchase = Number(product.costPrice);
      const lineTotal = priceAtPurchase * item.quantity;
      totalAmount += lineTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: priceAtPurchase,
        priceAtPurchase,
        costAtPurchase,
      });
    }

    const order = await Order.create({
      customerId: req.customer?._id || null,
      customerName,
      email,
      shippingAddress,
      items: orderItems,
      totalAmount,
      paymentStatus: paymentStatus || 'pending',
    });

    // Decrement stock after successful order creation
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Send confirmation email (do not fail the order if email fails)
    let emailSent = false;
    try {
      await sendOrderConfirmationEmail(order);
      emailSent = true;
      console.log(`Order confirmation email sent to ${order.email}`);
    } catch (mailError) {
      console.error(`Failed to send order email: ${mailError.message}`);
    }

    res.status(201).json({ success: true, data: order, emailSent });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders — list all (admin)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/my — logged-in customer's orders
router.get('/my', customerAuthMiddleware, async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.customer._id })
      .sort({ createdAt: -1 })
      .populate('items.product', PRODUCT_POPULATE);

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/track?email=&orderId=
router.get('/track', optionalCustomerAuth, async (req, res, next) => {
  try {
    const email =
      typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
    const rawOrderId =
      typeof req.query.orderId === 'string' ? req.query.orderId.trim() : '';

    if (!email || !rawOrderId) {
      return res.status(400).json({
        success: false,
        message: 'email and orderId are required',
      });
    }

    const orderId = rawOrderId.replace(/^#/, '').trim();
    const shortId = orderId.slice(-8).toUpperCase();
    const populate = ['items.product', PRODUCT_POPULATE];

    let order = null;

    // Full Mongo ObjectId lookup
    if (
      mongoose.Types.ObjectId.isValid(orderId) &&
      String(new mongoose.Types.ObjectId(orderId)) === orderId.toLowerCase()
    ) {
      order = await Order.findOne({
        _id: orderId.toLowerCase(),
        $or: [
          { email },
          ...(req.customer ? [{ customerId: req.customer._id }] : []),
        ],
      }).populate(...populate);
    }

    // Short confirmation code (last 8 chars) — match by email and/or logged-in customer
    if (!order && /^[A-F0-9]{6,8}$/i.test(shortId)) {
      const filters = [{ email }];
      if (req.customer) {
        filters.push({ customerId: req.customer._id });
      }

      const candidates = await Order.find({ $or: filters })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate(...populate);

      order =
        candidates.find(
          (candidate) => String(candidate._id).slice(-8).toUpperCase() === shortId
        ) || null;
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found for that email and order ID',
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id/cancel — customer (owner) or guest (matching email)
router.put('/:id/cancel', optionalCustomerAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const guestEmail =
      typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    const ownsAsCustomer =
      req.customer &&
      order.customerId &&
      String(order.customerId) === String(req.customer._id);

    const ownsAsGuest = guestEmail && order.email === guestEmail;

    // Logged-in customers may also cancel by matching the order email on their account
    const ownsByAccountEmail =
      req.customer && req.customer.email && order.email === req.customer.email;

    if (!ownsAsCustomer && !ownsAsGuest && !ownsByAccountEmail) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message:
          'This order is already being processed and cannot be cancelled — please contact support.',
      });
    }

    order.orderStatus = 'cancelled';
    order.cancelledBy = 'customer';
    await order.save();

    const refund = await Refund.create({
      orderId: order._id,
      customerName: order.customerName,
      email: order.email,
      amount: order.totalAmount,
      reason: 'Customer cancelled order',
      status: 'Pending',
    });

    res.json({
      success: true,
      message: 'Order cancelled',
      data: {
        order,
        refund,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id — update status fields (admin)
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const updates = {};
    if (req.body.orderStatus !== undefined) {
      updates.orderStatus = req.body.orderStatus;
      if (String(req.body.orderStatus).toLowerCase() === 'cancelled') {
        updates.cancelledBy = 'admin';
      }
    }
    if (req.body.paymentStatus !== undefined) {
      updates.paymentStatus = req.body.paymentStatus;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide orderStatus and/or paymentStatus to update',
      });
    }

    const order = await Order.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Reserved path segments handled by dedicated routes above
    if (id === 'track' || id === 'my') {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id).populate('items.product', PRODUCT_POPULATE);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
