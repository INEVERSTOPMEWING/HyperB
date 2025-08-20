require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Sicherheitsmaßnahmen (CORS-Konfiguration) wurde entfernt
app.use(cors()); // Erlaubt alle Origins. ⚠️ NUR FÜR TESTZWECKE!

app.use(express.json());

const Skey = process.env.SHAPES_KEY;
const NKey = process.env.NEWS_KEY;

// 📰 News API-Endpunkt
app.get('/api/news', async (req, res) => {
  try {
    const news = req.query.name;
    const lagu = req.query.lang;

    const result = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: news,
        language: lagu,
        sortBy: 'publishedAt',
        apiKey: NKey
      }
    });

    res.json(result.data);
  } catch (e) {
    const statusCode = e.response ? e.response.status : 500;
    res.status(statusCode).json({ error: 'News API Error', detail: e.message });
  }
});

// 🤖 AI API-Endpunkt
app.get('/api/ai', async (req, res) => {
  try {
    const { message, sender, shapeUsername } = req.query;

    const result = await axios.post(
      'https://api.shapes.inc/v1/chat/completions',
      {
        model: `shapesinc/${shapeUsername}`,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${Skey}`,
          'Content-Type': 'application/json',
          'X-User-Id': sender,
        },
      }
    );

    res.json(result.data);
  } catch (e) {
    const statusCode = e.response ? e.response.status : 500;
    res
      .status(statusCode)
      .json({ error: 'Shapes API Error', detail: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy läuft auf Port: ${PORT}`));
