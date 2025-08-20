require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// 🌐 Liste der erlaubten Domains für CORS-Anfragen
// ⚠️ Füge hier nur deine eigenen Domains hinzu.
const allowedOrigins = [
  'https://mattisweb.de',
  'https://www.mattisweb.de', // Wichtig: Füge www. hinzu
  'https://hyper-b.mattisweb.de'
];

// 🛡️ Verwende die offizielle `cors` Middleware, um den Zugriff
//    von den oben genannten Origins zu erlauben.
app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());

const Skey = process.env.SHAPES_KEY;
const NKey = process.env.NEWS_KEY;

// 📰 News API-Endpunkt
app.get('/api/news', async (req, res) => {
  try {
    const news = req.query.name;
    const lagu = req.query.lang;

    // Serverseitiger Aufruf an newsapi.org. CORS wird hier nicht angewendet.
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
    // Fange den Statuscode der externen API ab, wenn verfügbar.
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
