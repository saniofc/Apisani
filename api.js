const express = require('express');
const fs = require('fs');
const path = require('path');
const ytdl = require('yt-dlp-exec'); // ✅ npm package

const app = express();

const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

app.get('/ytaudio', async (req, res) => {
  try {
    const url = req.query.url;
    const key = req.query.key || null;

    if (process.env.API_KEY && key !== process.env.API_KEY) {
      return res.status(403).send('Chave de API inválida');
    }

    if (!url) return res.status(400).send('Falta parâmetro: url');

    const outputPath = path.join(TMP_DIR, `audio_${Date.now()}.mp3`);

    await ytdl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath
    });

    const stream = fs.createReadStream(outputPath);
    res.setHeader('Content-Type', 'audio/mpeg');
    stream.pipe(res);
    stream.on('end', () => fs.unlink(outputPath, () => {}));

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro interno da API');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
