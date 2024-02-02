const verifyToken = require("../config/middleware");
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const tempAudioFilePath = path.join(__dirname, "..", "temp_audio.mp3");

router.post("/generate-voice", verifyToken, async (req, res) => {
  const { prompt, voice, userId } = req.body;
  const endpoint = "https://api.openai.com/v1/audio/speech";
  try {
    const response = await axios.post(
      endpoint,
      {
        model: "tts-1",
        voice: voice,
        input: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_VOICE_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    // Send the audio data directly to the client
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Content-Length": response.data.length
    });
    res.end(response.data);

  } catch (error) {
    res.status(500).json({ error: "Failed to generate audio file" });
  }
});

module.exports = router;
