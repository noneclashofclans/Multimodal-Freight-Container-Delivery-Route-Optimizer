import express from "express";
import { createForecast } from "../controllers/forecastController.js";

const router = express.Router();

router.post("/", createForecast);

export default router;