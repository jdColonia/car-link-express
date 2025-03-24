import dotenv from "dotenv";
import connectDB from "./infrastructure/config/database";

dotenv.config();
connectDB();
