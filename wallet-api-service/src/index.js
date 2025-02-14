const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query
  });
  next();
});

const DB_SERVICE_URL = process.env.DB_SERVICE_URL || 'http://db-api:5002';

// Define routes
const router = express.Router();

// Create client
router.post('/clients', async (req, res) => {
  try {
    console.log('Creating client:', req.body);
    const response = await axios.post(`${DB_SERVICE_URL}/clients`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating client:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
});

// Recharge wallet
router.post('/recharge', async (req, res) => {
  try {
    console.log('Processing recharge:', req.body);
    const response = await axios.post(`${DB_SERVICE_URL}/recharge`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error processing recharge:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
});

// Process payment
router.post('/pay', async (req, res) => {
  try {
    console.log('Processing payment:', req.body);
    const response = await axios.post(`${DB_SERVICE_URL}/pay`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error processing payment:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
});

// Confirm payment
router.post('/confirm-payment', async (req, res) => {
  try {
    console.log('Confirming payment:', req.body);
    
    const { sessionId, token } = req.body;
    if (!sessionId || !token) {
      return res.status(400).json({
        success: false,
        error: 'SessionId and token are required'
      });
    }

    const response = await axios.post(`${DB_SERVICE_URL}/confirm-payment`, {
      sessionId,
      token
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error confirming payment:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
});

// Get balance
router.get('/balance', async (req, res) => {
  try {
    const response = await axios.get(`${DB_SERVICE_URL}/balance`, {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error getting balance:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${DB_SERVICE_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message
    });
  }
});

// Use router
app.use('/', router);

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Service running on port ${PORT}`);
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DB_SERVICE_URL
  });
  
  // Print registered routes
  console.log('Registered routes:');
  router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      Object.keys(r.route.methods).forEach((method) => {
        console.log(`${method.toUpperCase()} ${r.route.path}`);
      });
    }
  });
});
