
const PORT = process.env.PORT || 7000;
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import forecastRoutes from "./routes/forecast.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Intelligent Freight Forecasting Server");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});