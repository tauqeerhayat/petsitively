const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const customerAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET is not configured',
      });
    }

    const decoded = jwt.verify(token, secret);

    if (decoded.type !== 'customer') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — customer token required',
      });
    }

    const customer = await Customer.findById(decoded.id).select(
      '-password -resetPasswordToken -resetPasswordExpires'
    );

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — customer not found',
      });
    }

    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid or expired token',
    });
  }
};

/**
 * Soft auth for checkout: attaches req.customer when a valid customer JWT
 * is present; otherwise continues as guest (does not fail the request).
 */
const optionalCustomerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!token || !secret) {
      return next();
    }

    const decoded = jwt.verify(token, secret);
    if (decoded.type !== 'customer') {
      return next();
    }

    const customer = await Customer.findById(decoded.id).select(
      '-password -resetPasswordToken -resetPasswordExpires'
    );
    if (customer) {
      req.customer = customer;
    }
  } catch (error) {
    // Invalid/expired token → treat as guest checkout
  }

  return next();
};

module.exports = customerAuthMiddleware;
module.exports.optionalCustomerAuth = optionalCustomerAuth;
