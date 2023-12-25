import verifyToken from "../config/middleware";
import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();
router.post(
  "/generate-prompt",
  verifyToken,
  async (req: Request, res: Response) => {
    const { prompt } = req.body;

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
    } catch (error: any) {
      const errorMessage = (error as Error).message || "Internal Server Error";
      res.status(500).json({ error: errorMessage });
    }
  }
);

export default router;
