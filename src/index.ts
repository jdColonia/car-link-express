import dotenv from "dotenv";
import connectDB from "./infrastructure/config/database";
import app from "./presentation/app";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
