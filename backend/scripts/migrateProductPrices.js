/**
 * Migrate legacy `price` → sellingPrice / costPrice / discountedPrice.
 * Cost defaults to 55% of selling when unknown. Does not wipe existing data.
 *
 * Usage: node scripts/migrateProductPrices.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined');

  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('products');

  const legacy = await collection
    .find({
      $or: [{ price: { $exists: true } }, { sellingPrice: { $exists: false } }],
    })
    .toArray();

  let modified = 0;

  for (const doc of legacy) {
    const selling =
      doc.sellingPrice != null
        ? Number(doc.sellingPrice)
        : doc.price != null
          ? Number(doc.price)
          : 0;

    const cost =
      doc.costPrice != null
        ? Number(doc.costPrice)
        : Math.round(selling * 0.55 * 100) / 100;

    const discounted =
      doc.discountedPrice !== undefined ? doc.discountedPrice : null;

    const result = await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          sellingPrice: selling,
          costPrice: cost,
          discountedPrice: discounted,
        },
        $unset: { price: '' },
      }
    );

    if (result.modifiedCount) modified += 1;
  }

  console.log(
    JSON.stringify(
      {
        scanned: legacy.length,
        modified,
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
