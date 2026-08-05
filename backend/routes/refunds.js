const express = require('express');
const mongoose = require('mongoose');
const Refund = require('../models/Refund');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const ORDER_POPULATE = {
  path: 'orderId',
  select: 'customerName email totalAmount paymentStatus orderStatus items createdAt',
};

const TERMINAL_STATUSES = new Set(['Approved', 'Rejected', 'Completed']);

// POST /api/refunds
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { orderId, customerName, email, reason, amount, status, adminNotes } = req.body;

    if (!orderId || !customerName || !email || !reason || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'orderId, customerName, email, reason, and amount are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    if (Number(amount) < 0 || Number.isNaN(Number(amount))) {
      return res.status(400).json({ success: false, message: 'Invalid refund amount' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const refund = await Refund.create({
      orderId,
      customerName,
      email,
      reason,
      amount: Number(amount),
      status: status || 'Pending',
      adminNotes: adminNotes || '',
      resolvedAt: TERMINAL_STATUSES.has(status) ? new Date() : null,
    });

    await refund.populate(ORDER_POPULATE);

    res.status(201).json({ success: true, data: refund });
  } catch (error) {
    next(error);
  }
});

// GET /api/refunds
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const refunds = await Refund.find()
      .sort({ requestedAt: -1 })
      .populate(ORDER_POPULATE);

    res.json({ success: true, count: refunds.length, data: refunds });
  } catch (error) {
    next(error);
  }
});

// PUT /api/refunds/:id
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid refund ID' });
    }

    const refund = await Refund.findById(id);
    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund not found' });
    }

    const updates = {};

    if (req.body.status !== undefined) {
      updates.status = req.body.status;
    }

    if (req.body.adminNotes !== undefined) {
      updates.adminNotes = req.body.adminNotes;
    }

    if (req.body.resolvedAt !== undefined) {
      updates.resolvedAt = req.body.resolvedAt ? new Date(req.body.resolvedAt) : null;
    } else if (req.body.status && TERMINAL_STATUSES.has(req.body.status) && !refund.resolvedAt) {
      updates.resolvedAt = new Date();
    } else if (req.body.status === 'Pending') {
      updates.resolvedAt = null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide status, adminNotes, and/or resolvedAt to update',
      });
    }

    const updated = await Refund.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate(ORDER_POPULATE);

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
