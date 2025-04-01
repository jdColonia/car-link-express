import dotenv from "dotenv";
import connectDB from "./infrastructure/config/database";
import app from "./presentation/app";

// Load environment variables from a .env file
dotenv.config();

// Establish a connection to MongoDB
connectDB();

// Set the port for the server to listen on (default to 3000 if not defined)
const PORT = process.env.PORT || 3000;

// Start the Express server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});