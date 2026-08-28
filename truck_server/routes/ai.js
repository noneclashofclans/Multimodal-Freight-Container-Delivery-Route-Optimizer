import express from "express";
import { generateChat } from "../services/geminiService.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { analysis, question } = req.body;
  if (!question || typeof question !== "string" || question.trim() === "") {
    return res.status(400).json({ error: "Question is required" });
  }
  try {
    const reply = await generateChat({ analysis, question });
    return res.json({ reply });
  } catch (err) {
    console.error("/api/ai/chat error:", err);
    return res.status(500).json({ error: "AI service error" });
  }
});

export default router;
