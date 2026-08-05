const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const { sendPasswordResetEmail } = require('../utils/mailer');

const router = express.Router();

function customerProfilePayload(customer) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    shippingAddress: customer.shippingAddress || '',
    city: customer.city || '',
    zipcode: customer.zipcode || '',
    createdAt: customer.createdAt,
  };
}


function signCustomerToken(customer) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error('JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign(
    {
      id: customer._id,
      email: customer.email,
      type: 'customer',
    },
    secret,
    { expiresIn: '7d' }
  );
}

// POST /api/customers/register
router.post('/register', async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const customer = await Customer.create({ name, email, password });
    const token = signCustomerToken(customer);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/customers/login
router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
    }

    const customer = await Customer.findOne({ email });

    if (!customer || !(await customer.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signCustomerToken(customer);

    res.json({
      success: true,
      token,
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/customers/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'email is required',
      });
    }

    const customer = await Customer.findOne({ email });

    // Always return the same message to avoid revealing whether the email exists
    const successMessage =
      'If an account with that email exists, a password reset link has been sent';

    if (!customer) {
      return res.json({ success: true, message: successMessage });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    customer.resetPasswordToken = resetToken;
    customer.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await customer.save();

    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${frontendBase}/reset-password/${resetToken}`;

    await sendPasswordResetEmail({
      name: customer.name,
      email: customer.email,
      resetUrl,
    });

    res.json({ success: true, message: successMessage });
  } catch (error) {
    next(error);
  }
});

// POST /api/customers/reset-password/:token
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'password is required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const customer = await Customer.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    customer.password = password;
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/profile — current logged-in customer
router.get('/profile', customerAuthMiddleware, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: customerProfilePayload(req.customer),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customers/profile — update name + shipping fields only (never email)
router.put('/profile', customerAuthMiddleware, async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    if (typeof req.body.name === 'string') {
      const name = req.body.name.trim();
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'name cannot be empty',
        });
      }
      customer.name = name;
    }

    if (typeof req.body.shippingAddress === 'string') {
      customer.shippingAddress = req.body.shippingAddress.trim();
    }

    if (typeof req.body.city === 'string') {
      customer.city = req.body.city.trim();
    }

    if (typeof req.body.zipcode === 'string') {
      customer.zipcode = req.body.zipcode.trim();
    }

    await customer.save();

    res.json({
      success: true,
      message: 'Profile updated',
      data: customerProfilePayload(customer),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/orders — logged-in customer's order history
router.get('/orders', customerAuthMiddleware, async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.customer._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name sellingPrice discountedPrice images category');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
