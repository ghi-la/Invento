import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const options: mongoose.ConnectOptions = {};
    if (process.env.DB_NAME) {
      options.dbName = process.env.DB_NAME;
    }
    await mongoose.connect(process.env.MONGO_URI as string, options);

    console.log('✅ MongoDB Connected Successfully');
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Stop the application if DB connection fails
  }
};

export default connectDB;
