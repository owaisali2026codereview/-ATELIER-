import mongoose from 'mongoose';

export const connectDB = async () => {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        family: 4,
      });
      console.log(`[MongoDB Connected]: ${conn.connection.host} / ${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.warn(`[MongoDB Connection Attempt ${attempts} Failed]: ${error.message}`);
      if (attempts < maxAttempts) {
        await new Promise((res) => setTimeout(res, 1500));
      } else {
        if (process.env.NODE_ENV === 'production') {
          console.error('[Fatal Error]: Cannot start server without persistent database connection in production.');
          process.exit(1);
        }
        console.warn('[MongoDB Warning]: Running in decoupled mode for development. Ensure MongoDB is active for persistence.');
      }
    }
  }
};
