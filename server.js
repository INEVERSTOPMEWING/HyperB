// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// 🌐 Nur diese Domain darf zugreifen:
const allowedOrigins = [
  'https://mattisweb.de',
  'https://hyper-b.mattisweb.de'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS BLOCKED: code 403 Forbidden!'));
    }
  }
}));

app.use(express.json());

// 🛡️ Zusätzlicher Schutz: Blockiere direkte Aufrufe ohne erlaubten Referer/Origin
app.use((req, res, next) => {
  const origin = req.get('origin') || '';
  const referer = req.get('referer') || '';

  const isAllowed = allowedOrigins.some(o =>
    origin.startsWith(o) || referer.startsWith(o)
  );

  if (isAllowed) {
    next();
  } else {
    res.status(403).json({ error: 'Access only allowed via mattisweb.de or hyper-b.mattisweb.de' });
  }
});


const Skey = process.env.SHAPES_KEY;
const NKey = process.env.NEWS_KEY;

// 🔁 Hypixel Guild-Stats weiterleiten
app.get('/api/news', async (req, res) => {
  try {
    const news = req.query.name;      
    const lagu = req.query.lang;      

    const result = await axios.get(`https://newsapi.org/v2/everything`, {
      params: {
        q: news,
        language: lagu,
        sortBy: "publishedAt",
        apiKey: NKey
      }
    });

    res.json(result.data);
  } catch (e) {
    res.status(500).json({ error: 'News API Error', detail: e.message });
  }
});

// AI 
app.get('/api/ai', async (req, res) => {
  try {
    const { message, sender, shapeUsername } = req.query;

    const result = await axios.post(
      "https://api.shapes.inc/v1/chat/completions",
      {
        model: `shapesinc/${shapeUsername}`,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${Skey}`,
          "Content-Type": "application/json",
          "X-User-Id": sender, 
        },
      }
    );

    res.json(result.data);
  } catch (e) {
    res
      .status(500)
      .json({ error: "Shapes API Error", detail: e.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy: ${PORT}`));
