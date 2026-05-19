const express = require('express');
const cors = require('cors');

const rawMaterialRoutes = require('./routes/rawMaterialRoutes');
const productRoutes = require('./routes/productRoutes');
const accessRoutes = require('./routes/accessRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.send('Backend running');
});

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

app.use('/api/access', accessRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/materials', rawMaterialRoutes);
app.use('/api/products', productRoutes);

app.use(errorHandler);

module.exports = app;
