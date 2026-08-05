require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const sampleCategoryNames = [
  'Grooming',
  'Feeding & Enrichment',
  'Toys',
  'Bedding',
  'Food',
];

const sampleProducts = [
  {
    name: 'Organic Salmon Dog Kibble',
    description:
      'Grain-free dry food made with wild-caught salmon, sweet potato, and omega-rich oils to support coat shine and joint health for adult dogs.',
    costPrice: 24.0,
    sellingPrice: 42.99,
    discountedPrice: 36.99,
    images: [
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80',
    ],
    categoryKey: 'Food',
    stock: 48,
    featured: true,
  },
  {
    name: 'Chicken & Rice Cat Pâté (12-Pack)',
    description:
      'Smooth wet food cups with real chicken and rice. Easy to digest and ideal for picky eaters or cats needing extra moisture.',
    costPrice: 14.0,
    sellingPrice: 24.5,
    discountedPrice: null,
    images: [
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80',
    ],
    categoryKey: 'Food',
    stock: 72,
    featured: true,
  },
  {
    name: 'Braided Cotton Rope Toy',
    description:
      'Durable triple-braided rope for tug-of-war and chewing. Helps clean teeth while keeping energetic dogs busy.',
    costPrice: 5.5,
    sellingPrice: 12.99,
    discountedPrice: 9.99,
    images: [
      'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800&q=80',
    ],
    categoryKey: 'Toys',
    stock: 120,
  },
  {
    name: 'Feather Wand Cat Teaser',
    description:
      'Interactive wand with replaceable feather attachments that triggers natural hunting instincts and encourages daily play.',
    costPrice: 3.25,
    sellingPrice: 9.75,
    discountedPrice: null,
    images: [
      'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&q=80',
    ],
    categoryKey: 'Toys',
    stock: 95,
  },
  {
    name: 'Orthopedic Memory Foam Dog Bed',
    description:
      'Supportive memory foam mattress with a removable, machine-washable cover. Designed for medium to large breeds and senior dogs.',
    costPrice: 42.0,
    sellingPrice: 79.0,
    discountedPrice: 64.0,
    images: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
    ],
    categoryKey: 'Bedding',
    stock: 26,
    featured: true,
  },
  {
    name: 'Adjustable Reflective Nylon Leash',
    description:
      '6-foot padded-handle leash with reflective stitching for safer evening walks. Fits most standard clip collars and harnesses.',
    costPrice: 8.5,
    sellingPrice: 18.25,
    discountedPrice: null,
    images: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
    ],
    categoryKey: 'Feeding & Enrichment',
    stock: 64,
  },
  {
    name: 'Stainless Steel Elevated Bowl Set',
    description:
      'Two dishwasher-safe bowls on a non-slip bamboo stand. Elevates feeding height to promote better posture for dogs and cats.',
    costPrice: 16.0,
    sellingPrice: 34.99,
    discountedPrice: null,
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    ],
    categoryKey: 'Feeding & Enrichment',
    stock: 41,
  },
  {
    name: 'Calming Lavender Pet Shampoo',
    description:
      'Gentle, tear-free formula with colloidal oatmeal and lavender scent. Suitable for dogs with sensitive skin; rinse thoroughly after use.',
    costPrice: 7.25,
    sellingPrice: 15.49,
    discountedPrice: 12.99,
    images: [
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80',
    ],
    categoryKey: 'Grooming',
    stock: 58,
  },
  {
    name: 'Natural Dental Chew Sticks (30 Count)',
    description:
      'Vet-inspired dental chews that help reduce plaque buildup. Made without artificial colors; sized for dogs 15–40 lbs.',
    costPrice: 10.5,
    sellingPrice: 21.0,
    discountedPrice: null,
    images: [
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
    ],
    categoryKey: 'Food',
    stock: 83,
    featured: true,
  },
  {
    name: 'Cozy Fleece Cat Cave',
    description:
      'Soft enclosed hideaway that holds shape and washes easily. Perfect for cats who love tucked-away naps and quiet corners.',
    costPrice: 14.5,
    sellingPrice: 29.95,
    discountedPrice: null,
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80',
    ],
    categoryKey: 'Bedding',
    stock: 37,
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);

    // Clear both collections before inserting fresh data
    const deletedProducts = await Product.deleteMany({});
    const deletedCategories = await Category.deleteMany({});
    console.log(
      `Cleared ${deletedProducts.deletedCount} products and ${deletedCategories.deletedCount} categories`
    );

    const categories = await Category.insertMany(
      sampleCategoryNames.map((name) => ({
        name,
        slug: Category.slugify(name),
      }))
    );
    console.log(`Inserted ${categories.length} categories:`);
    categories.forEach((category) => {
      console.log(`  - ${category.name} (${category.slug})`);
    });

    const categoryByName = Object.fromEntries(
      categories.map((category) => [category.name, category._id])
    );

    const productsToInsert = sampleProducts.map(({ categoryKey, ...product }) => ({
      ...product,
      category: categoryByName[categoryKey],
    }));

    const products = await Product.insertMany(productsToInsert);
    console.log(`Inserted ${products.length} sample products:`);
    products.forEach((product) => {
      const charge =
        product.discountedPrice != null && product.discountedPrice < product.sellingPrice
          ? product.discountedPrice
          : product.sellingPrice;
      console.log(`  - ${product.name} ($${charge})`);
    });
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

seed();
