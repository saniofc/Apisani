// API.js - pronta para Render + Bot
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

// Pasta temporária para armazenar mp3
const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// Endpoint: /ytaudio?url=LINK&key=SUA_CHAVE
app.get('/ytaudio', async (req, res) => {
  try {
    const url = req.query.url;
    const key = req.query.key || null;

    // Checagem chave de API (opcional)
    if (process.env.API_KEY && key !== process.env.API_KEY) {
      return res.status(403).send('Chave de API inválida');
    }

    if (!url) return res.status(400).send('Falta parâmetro: url');

    const outputPath = path.join(TMP_DIR, `audio_${Date.now()}.mp3`);

    // Baixa áudio via yt-dlp
    exec(`yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro ao processar áudio');
      }

      // Envia arquivo pro bot
      const stream = fs.createReadStream(outputPath);
      res.setHeader('Content-Type', 'audio/mpeg');
      stream.pipe(res);

      // Remove arquivo depois de enviado
      stream.on('end', () => fs.unlink(outputPath, () => {}));
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro interno da API');
  }
});

// Porta do Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));