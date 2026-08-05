require('dotenv').config();

const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function createAdmin() {
  const uri = process.env.MONGO_URI;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables');
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log(`Admin already exists: ${existing.email}`);
      return;
    }

    const admin = await Admin.create({
      email,
      password,
      role: 'admin',
    });

    console.log(`Admin created: ${admin.email} (role: ${admin.role})`);
  } catch (error) {
    console.error('createAdmin failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

createAdmin();
