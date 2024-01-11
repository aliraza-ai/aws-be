const verifyToken = require("../config/middleware");
const express = require("express");
const axios = require("axios");
const userService = require("../services/UserService");
const User = require("../models/User");

const router = express.Router();

router.post("/generate-prompt", verifyToken, async (req, res) => {
  const { prompt, userId } = req.body;
  const user = await User.findByPk(userId);

  if (typeof prompt !== "string") {
    return res.status(400).json({ error: "Invalid prompt" });
  }

  if (user.words_left <= 0) {
    return res.status(400).json({ error: "Out of Word limit!" });
  }

  const openaiApiEndpoint =
    "https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions";

  try {
    const response = await axios.post(
      openaiApiEndpoint,
      {
        prompt: prompt,
        max_tokens: 800,
        temperature: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ data: response.data.choices[0].text });
    const wordCount = countWords(response.data.choices[0].text);
    await userService.updateUserwords_left(userId, wordCount);
  } catch (error) {
    const errorMessage = error.message || "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
});

// words count function
function countWords(chatMessage) {
  const wordsArray = chatMessage.trim().split(/\s+/);
  const filteredWords = wordsArray.filter((word) => /[a-zA-Z0-9]+/.test(word));
  return filteredWords.length;
}

module.exports = router;
