import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from a .env file
dotenv.config();

/**
 * Function to establish a connection to MongoDB.
 * It checks for the MONGO_URI environment variable and attempts to connect to the MongoDB database.
 * If the connection fails, it logs an error and exits the process.
 */
const connectDB = async () => {
  try {
    // Check if the MONGO_URI environment variable is defined
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }

    // Connect to MongoDB using the URI from the environment variable
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    // Log error if the connection fails
    console.error("Error connecting MongoDB", error);
    // Exit the process if there is a connection failure
    process.exit(1);
  }
};

// Export the connectDB function to be used in other modules
export default connectDB;