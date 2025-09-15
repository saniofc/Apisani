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

  // Verificação de chave (se definida no Render)
  if (process.env.API_KEY && key !== process.env.API_KEY) {
    return res.status(403).send('❌ Chave inválida');
  }

  if (!url) return res.status(400).send('❌ Falta parâmetro url');

  const outputPath = path.join(TMP_DIR, `audio_${Date.now()}.mp3`);

  try {
    // Baixa o áudio com limite de tamanho
    await ytdlp(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath,
      format: 'bestaudio[filesize<50M]', // máximo 50 MB
      maxFilesize: '50M'
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    // Limpa arquivo quando terminar
    stream.on('close', () => {
      fs.unlink(outputPath, (err) => {
        if (err) console.error("Erro ao deletar arquivo tmp:", err);
      });
    });
  } catch (err) {
    console.error("Erro no yt-dlp:", err);
    // Limpa se arquivo foi criado antes do erro
    if (fs.existsSync(outputPath)) {
      fs.unlink(outputPath, () => {});
    }
    res.status(500).send('❌ Erro ao processar áudio: ' + err.message);
  }
});

// Porta Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API rodando na porta ${PORT}`));
