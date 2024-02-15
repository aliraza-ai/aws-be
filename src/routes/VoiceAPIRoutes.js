const verifyToken = require("../config/middleware");
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const UserService = require("../services/UserService");
const User = require("../models/User");

const router = express.Router();
const tempAudioFilePath = path.join(__dirname, "..", "templates", "temp_audio.mp3");

router.post("/generate-voice", verifyToken, async (req, res) => {
  const { prompt, voice, userId } = req.body;
  const user = await User.findByPk(userId);

  // if (user.voice_count <= 0) {
  //   return res.status(400).json({ error: "Voice over out of limit!" });
  // }
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

    fs.writeFileSync(tempAudioFilePath, response.data);
    res.sendFile(tempAudioFilePath);
    await UserService.updateUserVoice_left(userId);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate audio file" });
  }
});

module.exports = router;
