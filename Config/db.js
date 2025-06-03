// db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      console.log("DB URL is Missing");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB connected!...");
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1); // Exit process if connection fails
  }
};

export default connectDB;
