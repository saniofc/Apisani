const express = require("express");
const ytdlp = require("yt-dlp-exec");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// cria pasta temp se não existir
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// rota para baixar áudio
app.get("/ytaudio", async (req, res) => {
  const url = req.query.url;
  const apikey = req.query.apikey;
  if (!url) return res.status(400).json({ erro: "URL obrigatória" });
  if (apikey !== "Labareta007") return res.status(403).json({ erro: "Chave inválida" });

  try {
    const filePath = path.join(tempDir, `${Date.now()}.mp3`);

    // adiciona timeout e tratamento de erro
    await ytdlp(url, {
      extractAudio: true,
      audioFormat: "mp3",
      output: filePath,
      // para vídeos que exigem login, usar --cookies
      // cookies: '/caminho/para/cookies.txt' 
    });

    res.download(filePath, "audio.mp3", () => {
      try { fs.unlinkSync(filePath); } catch {}
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível baixar este vídeo (restrição do YouTube ou erro interno)." });
  }
});

// rota para baixar vídeo
app.get("/ytvideo", async (req, res) => {
  const url = req.query.url;
  const apikey = req.query.apikey;
  if (!url) return res.status(400).json({ erro: "URL obrigatória" });
  if (apikey !== "Labareta007") return res.status(403).json({ erro: "Chave inválida" });

  try {
    const filePath = path.join(tempDir, `${Date.now()}.mp4`);

    await ytdlp(url, {
      format: "mp4",
      output: filePath,
      // cookies: '/caminho/para/cookies.txt' 
    });

    res.download(filePath, "video.mp4", () => {
      try { fs.unlinkSync(filePath); } catch {}
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível baixar este vídeo (restrição do YouTube ou erro interno)." });
  }
});

app.listen(PORT, () => console.log(`🚀 API rodando na porta ${PORT}`));
