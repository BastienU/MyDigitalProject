const express = require('express');
const pool = require('./config/db');
const userRoutes = require('./routes/userRoute');
require('dotenv').config();
const authRoutes = require('./routes/authRoute');
const productRoutes = require('./routes/productRoute');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

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