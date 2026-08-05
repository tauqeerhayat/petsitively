require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const refundRoutes = require('./routes/refunds');
const customerRoutes = require('./routes/customers');
const adminRoutes = require('./routes/admin');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.use(cors());
    app.use(express.json());
    app.use(express.static('public'));

    app.get('/', (req, res) => {
      res.json({ success: true, message: 'Petsitively API is running' });
    });

    app.use('/api/products', productRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/contact', contactRoutes);
    app.use('/api/refunds', refundRoutes);
    app.use('/api/customers', customerRoutes);
    app.use('/api/admin', adminRoutes);

    app.use(notFound);
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
