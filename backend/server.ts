import "dotenv/config";
import sequelize from "./config/db";

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database conneection established successfully");
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

connectDB();

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
