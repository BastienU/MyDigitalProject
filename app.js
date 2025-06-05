const express = require('express');
const pool = require('./config/db');
const userRoutes = require('./routes/userRoute');
require('dotenv').config();
const authRoutes = require('./routes/authRoute');
const productRoutes = require('./routes/productRoute');
const wishlistRoutes = require('./routes/wishlistRoute');
const corsMiddleware = require('./middlewares/corsMiddleware');


const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(corsMiddleware);
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use((req, res, next) => {
  console.log('Requête reçue depuis :', req.headers.origin);
  next();
});

app.options('*', cors());

app.use(cors({
  origin: ['https://webappmdpdeployed-production.up.railway.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.get('/proxy', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).send("URL manquante !");
  
    try {
        const response = await fetch(imageUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!response.ok) return res.status(response.status).send("Erreur lors du chargement !");
        
        response.body.pipe(res);
    } catch (error) {
        res.status(500).send("Erreur serveur !");
    }
});



app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Hour on server : ${result.rows[0].now}`);
  } catch (error) {
    res.status(500).send('Error : ' + error.message);
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});