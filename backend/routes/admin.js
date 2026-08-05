const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Refund = require('../models/Refund');
const ContactMessage = require('../models/ContactMessage');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// POST /api/admin/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET is not configured',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, type: 'admin' },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

function isDateOnly(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function parseRangeBound(startDate, endDate) {
  if (!startDate || !endDate) {
    return { error: 'startDate and endDate are required (ISO date strings)' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: 'startDate and endDate must be valid ISO date strings' };
  }

  if (isDateOnly(startDate)) {
    start.setHours(0, 0, 0, 0);
  }

  if (isDateOnly(endDate)) {
    end.setHours(23, 59, 59, 999);
  }

  if (start > end) {
    return { error: 'startDate must be before or equal to endDate' };
  }

  return { start, end };
}

function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildRevenueByDaySeries(dailyRows, start, end) {
  const byDate = new Map(
    (dailyRows || []).map((row) => [
      row._id,
      {
        revenue: row.revenue || 0,
        orderCount: row.orderCount || 0,
      },
    ])
  );

  const series = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (cursor <= endDay) {
    const key = formatLocalDate(cursor);
    const day = byDate.get(key) || { revenue: 0, orderCount: 0 };
    series.push({
      date: key,
      revenue: day.revenue,
      orderCount: day.orderCount,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return series;
}

function emptyOrdersByStatus() {
  return {
    Pending: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };
}

// GET /api/admin/stats?startDate=&endDate=
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const range = parseRangeBound(req.query.startDate, req.query.endDate);
    if (range.error) {
      return res.status(400).json({ success: false, message: range.error });
    }

    const { start, end } = range;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const [facet, pendingRefundsCount, unreadMessagesCount] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  totalOrders: { $sum: 1 },
                },
              },
            ],
            revenue: [
              { $match: { orderStatus: { $ne: 'cancelled' } } },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$totalAmount' },
                  nonCancelledOrders: { $sum: 1 },
                },
              },
            ],
            byStatus: [
              {
                $group: {
                  _id: '$orderStatus',
                  count: { $sum: 1 },
                },
              },
            ],
            revenueByDay: [
              { $match: { orderStatus: { $ne: 'cancelled' } } },
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: '$createdAt',
                      timezone,
                    },
                  },
                  revenue: { $sum: '$totalAmount' },
                  orderCount: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            topProducts: [
              { $match: { orderStatus: { $ne: 'cancelled' } } },
              { $unwind: '$items' },
              {
                $group: {
                  _id: '$items.product',
                  name: { $first: '$items.name' },
                  totalQuantity: { $sum: '$items.quantity' },
                  totalRevenue: {
                    $sum: {
                      $multiply: [
                        {
                          $ifNull: ['$items.priceAtPurchase', '$items.price'],
                        },
                        '$items.quantity',
                      ],
                    },
                  },
                },
              },
              { $sort: { totalQuantity: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  productId: '$_id',
                  name: 1,
                  totalQuantity: 1,
                  totalRevenue: 1,
                },
              },
            ],
            profit: [
              { $match: { orderStatus: { $ne: 'cancelled' } } },
              { $unwind: '$items' },
              {
                $group: {
                  _id: null,
                  totalProfit: {
                    $sum: {
                      $multiply: [
                        {
                          $subtract: [
                            {
                              $ifNull: ['$items.priceAtPurchase', '$items.price'],
                            },
                            { $ifNull: ['$items.costAtPurchase', 0] },
                          ],
                        },
                        '$items.quantity',
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ]),
      Refund.countDocuments({ status: 'Pending' }),
      ContactMessage.countDocuments({ replied: false }),
    ]);

    const result = facet[0] || {};
    const totals = result.totals?.[0] || { totalOrders: 0 };
    const revenue = result.revenue?.[0] || { totalRevenue: 0, nonCancelledOrders: 0 };
    const profitRow = result.profit?.[0] || { totalProfit: 0 };

    const ordersByStatus = emptyOrdersByStatus();
    for (const row of result.byStatus || []) {
      const statusKey = row._id || 'pending';
      const label = STATUS_LABELS[statusKey] || 'Pending';
      ordersByStatus[label] = (ordersByStatus[label] || 0) + (row.count || 0);
    }

    const totalOrders = totals.totalOrders || 0;
    const totalRevenue = revenue.totalRevenue || 0;
    const nonCancelledOrders = revenue.nonCancelledOrders || 0;
    const averageOrderValue =
      nonCancelledOrders > 0 ? totalRevenue / nonCancelledOrders : 0;
    const totalProfit = profitRow.totalProfit || 0;
    const profitMarginPercent =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalOrders,
        totalRevenue,
        totalProfit,
        profitMarginPercent,
        averageOrderValue,
        ordersByStatus,
        revenueByDay: buildRevenueByDaySeries(result.revenueByDay, start, end),
        topProducts: result.topProducts || [],
        pendingRefundsCount,
        unreadMessagesCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
