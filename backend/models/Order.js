const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    // Charged unit price at purchase (kept for older orders / display)
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    // Explicit snapshot of what the customer paid per unit
    priceAtPurchase: {
      type: Number,
      required: true,
      min: [0, 'Price at purchase cannot be negative'],
    },
    // Snapshot of product cost at purchase — for historical profit
    costAtPurchase: {
      type: Number,
      required: true,
      min: [0, 'Cost at purchase cannot be negative'],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping address is required'],
    trim: true,
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order must include at least one item'],
    validate: {
      validator: (items) => Array.isArray(items) && items.length > 0,
      message: 'Order must include at least one item',
    },
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'admin'],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
