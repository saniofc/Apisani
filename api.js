const express = require("express");
const ytdlp = require("yt-dlp-exec");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// rota para baixar áudio
app.get("/ytaudio", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ erro: "URL obrigatória" });

  try {
    const filePath = path.join(__dirname, "temp", `${Date.now()}.mp3`);
    await ytdlp(url, {
      extractAudio: true,
      audioFormat: "mp3",
      output: filePath
    });

    res.download(filePath, "audio.mp3", () => {
      fs.unlinkSync(filePath); // apaga depois de enviar
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// rota para baixar vídeo
app.get("/ytvideo", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ erro: "URL obrigatória" });

  try {
    const filePath = path.join(__dirname, "temp", `${Date.now()}.mp4`);
    await ytdlp(url, {
      format: "mp4",
      output: filePath
    });

    res.download(filePath, "video.mp4", () => {
      fs.unlinkSync(filePath);
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 API rodando na porta ${PORT}`));
