require('dotenv').config();
const express = require('express');
const path = require('path');
const initializeStorage = require('./config/database');
const app = express();
const port = process.env.PORT || 3000;
const infographicRoutes = require('./routes/infographicRoutes');
const pricingRoutes = require('./routes/pricingRoutes'); 
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

initializeStorage(); 

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Stripe webhook route
app.post('/stripe/webhook', express.raw({type: 'application/json'}), require('./controllers/PaymentController').handleWebhook);

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'temp')));
app.use(express.static(path.join(__dirname, 'public')));

// Serve generated images
app.use('/generated-images', express.static(path.join(__dirname, 'generated-images')));

// Use routes
app.use('/', infographicRoutes);
app.use('/', pricingRoutes);
app.use('/', userRoutes);
app.use('/', paymentRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
