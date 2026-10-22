import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const clearDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB with retry...');
    let connected = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000, family: 4 });
        connected = true;
        break;
      } catch (e) {
        console.warn(`Connection attempt ${attempt} failed: ${e.message}. Retrying in 1.5s...`);
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    if (!connected) throw new Error('Could not connect to MongoDB after 5 attempts.');
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Existing collections:', collections.map((c) => c.name));

    // 1. Clear products
    const prodBefore = await db.collection('products').countDocuments();
    await db.collection('products').deleteMany({});
    console.log(`Cleared products collection (deleted ${prodBefore} documents).`);

    // 2. Clear non-admin users, keeping only super_admin from env
    const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const envAdminPass = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const envAdminName = process.env.ADMIN_NAME || 'Admin';

    const usersBefore = await db.collection('users').countDocuments();
    await db.collection('users').deleteMany({ email: { $ne: envAdminEmail } });
    console.log(`Cleared dummy users (was ${usersBefore} documents).`);

    // Ensure super_admin exists
    const adminUser = await db.collection('users').findOne({ email: envAdminEmail });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(envAdminPass, salt);
      await db.collection('users').insertOne({
        firstName: envAdminName,
        lastName: 'Admin',
        email: envAdminEmail,
        password: hashedPassword,
        role: 'super_admin',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created fresh super_admin user: ${envAdminEmail}`);
    } else {
      console.log(`Confirmed super_admin user preserved: ${envAdminEmail}`);
    }

    // 3. Clear orders and custom requests
    if (collections.some((c) => c.name === 'orders')) {
      const ordCount = await db.collection('orders').countDocuments();
      await db.collection('orders').deleteMany({});
      console.log(`Cleared orders (deleted ${ordCount} documents).`);
    }

    if (collections.some((c) => c.name === 'customrequests')) {
      const reqCount = await db.collection('customrequests').countDocuments();
      await db.collection('customrequests').deleteMany({});
      console.log(`Cleared customrequests (deleted ${reqCount} documents).`);
    }

    const prodAfter = await db.collection('products').countDocuments();
    const userAfter = await db.collection('users').countDocuments();
    console.log(`Current DB State -> Products: ${prodAfter}, Users: ${userAfter}`);

    await mongoose.disconnect();
    console.log('Database cleanup completed successfully.');
  } catch (err) {
    console.error('Database cleanup error:', err);
    process.exit(1);
  }
};

clearDatabase();
