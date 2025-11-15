const express = require("express");
const router = express.Router();
const axios = require("axios");
const Message = require("../models/Message");
const verifyToken = require("../middleware/verifyToken");
require("dotenv").config();

/**
 * POST /api/chat
 * Sends user's message to OpenRouter and stores both user + bot messages in MongoDB
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    // Save user message to DB
    const userMessage = await Message.create({
      userId,
      sender: "user",
      message,
      createdAt: new Date(),
    });

    let aiResponse = "";

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            { role: "system", content: "You are a friendly and helpful AI assistant." },
            { role: "user", content: message },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AI Chatbot",
          },
        }
      );

      aiResponse =
        response.data?.choices?.[0]?.message?.content?.trim() ||
        "I couldn’t generate a reply.";
    } catch (apiError) {
      console.error("OpenRouter API Error:", apiError.response?.data || apiError.message);
      aiResponse = generateFallbackResponse(message);
    }

    // Save bot message to DB
    const botMessage = await Message.create({
      userId,
      sender: "bot",
      message: aiResponse,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      userMessage,
      botMessage,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ success: false, message: "Error processing chat message." });
  }
});

/**
 * DELETE /api/chat/session
 * Clears all previous messages for the logged-in user (start fresh)
 */
router.delete("/session", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    await Message.deleteMany({ userId });
    res.json({ success: true, message: "Chat session cleared." });
  } catch (error) {
    console.error("Failed to clear session:", error);
    res.status(500).json({ success: false, message: "Failed to clear chat session." });
  }
});

/**
 * Fallback responses if API fails
 */
function generateFallbackResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi"))
    return "Hello! How can I help you today?";
  if (lower.includes("bye"))
    return "Goodbye! Have a great day!";
  return "I'm here to help! Could you please rephrase your question?";
}

module.exports = router;
