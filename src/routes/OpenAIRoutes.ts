import verifyToken from "../config/middleware";
import express, { Request, Response } from "express";
import axios from "axios";
import userService from "../services/UserService";

const router = express.Router();
router.post(
  "/generate-prompt",
  verifyToken,
  async (req: Request, res: Response) => {
    const { prompt, userId } = req.body;

    if (typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    const openaiApiEndpoint =
      "https://api.openai.com/v1/engines/text-davinci-003/completions";

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
    } catch (error: any) {
      const errorMessage = (error as Error).message || "Internal Server Error";
      res.status(500).json({ error: errorMessage });
    }
  }
);

//  words count function
function countWords(chatMessage: string): number {
  const wordsArray = chatMessage.trim().split(/\s+/);
  const filteredWords = wordsArray.filter((word) => /[a-zA-Z0-9]+/.test(word));
  return filteredWords.length;
}

export default router;
