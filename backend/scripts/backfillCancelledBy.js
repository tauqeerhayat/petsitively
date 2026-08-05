require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Refund = require('../models/Refund');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const refunds = await Refund.find({ reason: 'Customer cancelled order' }).select('orderId');
  const orderIds = refunds.map((r) => r.orderId);

  const result = await Order.updateMany(
    {
      _id: { $in: orderIds },
      orderStatus: 'cancelled',
      $or: [{ cancelledBy: null }, { cancelledBy: { $exists: false } }],
    },
    { $set: { cancelledBy: 'customer' } }
  );

  const sample = await Order.find({ orderStatus: 'cancelled' }).select('_id orderStatus cancelledBy');
  console.log(
    JSON.stringify(
      {
        refundMatches: orderIds.length,
        matched: result.matchedCount,
        modified: result.modifiedCount,
        cancelledOrders: sample,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
})().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
