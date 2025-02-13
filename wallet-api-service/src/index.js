const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

const dbServiceUrl = process.env.DB_SERVICE_URL;

// Proxy endpoints to db service
app.post('/wallets', async (req, res) => {
  try {
    const response = await axios.post(`${dbServiceUrl}/wallets`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

app.get('/wallets/:userId', async (req, res) => {
  try {
    const response = await axios.get(`${dbServiceUrl}/wallets/${req.params.userId}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

app.post('/transactions', async (req, res) => {
  try {
    const response = await axios.post(`${dbServiceUrl}/transactions`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// Client Registration
app.post('/clients', async (req, res) => {
  try {
    console.log('[Post]: clients', req.body, dbServiceUrl);
    const response = await axios.post(`${dbServiceUrl}/clients`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// Wallet Recharge
app.post('/recharge', async (req, res) => {
  try {
    const response = await axios.post(`${dbServiceUrl}/recharge`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// Payment Initiation
app.post('/pay', async (req, res) => {
  try {
    const response = await axios.post(`${dbServiceUrl}/pay`, req.body);
    
    // Add logging to debug
    console.log('DB service payment response:', response.data);
    
    // Make sure we're forwarding the complete response
    res.json(response.data);
  } catch (error) {
    console.error('Payment proxy error:', error.response?.data || error);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// Payment Confirmation
app.post('/confirm-payment', async (req, res) => {
  try {
    const response = await axios.post(`${dbServiceUrl}/confirm-payment`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// Balance Query
app.get('/balance', async (req, res) => {
  try {
    const response = await axios.get(`${dbServiceUrl}/balance`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Wallet API Service running on port ${PORT}`);
});
