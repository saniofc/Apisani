const express = require('express');
const path = require('path');
const fs = require('fs');
const ytdlp = require('yt-dlp-exec');

const app = express();
const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

app.get('/ytaudio', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('❌ Falta parâmetro url');

  const outputPath = path.join(TMP_DIR, `audio_${Date.now()}.mp3`);

  try {
    await ytdlp(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath,
      // Removido filesize e cookie
      format: 'bestaudio'
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    stream.on('close', () => {
      fs.unlink(outputPath, () => {});
    });
  } catch (err) {
    console.error("Erro no yt-dlp:", err.message || err);
    if (fs.existsSync(outputPath)) fs.unlink(outputPath, () => {});
    res.status(500).send('❌ Erro ao processar áudio. Alguns vídeos exigem login ou restrição de idade.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API rodando na porta ${PORT}`));
