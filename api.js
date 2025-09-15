const express = require('express');
const path = require('path');
const fs = require('fs');
const ytdlp = require('yt-dlp-exec');

const app = express();

// Pasta temporária
const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// Endpoint /ytaudio
app.get('/ytaudio', async (req, res) => {
  const url = req.query.url;
  const key = req.query.key || null;

  if (process.env.API_KEY && key !== process.env.API_KEY)
    return res.status(403).send('Chave inválida');

  if (!url) return res.status(400).send('Falta parâmetro url');

  const outputPath = path.join(TMP_DIR, `audio_${Date.now()}.mp3`);

  try {
    await ytdlp(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    stream.on('end', () => fs.unlink(outputPath, () => {}));
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao processar áudio');
  }
});

// Porta Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
