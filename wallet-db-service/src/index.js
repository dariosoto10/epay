const express = require('express');
const cors = require('cors');
const { sequelize, Client, Transaction } = require('./models');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());
app.use(express.json());

// Email configuration (you should use environment variables for these)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 1. Client Registration
app.post('/clients', async (req, res) => {
  try {
    const { document, name, email, phone } = req.body;

    if (!document || !name || !email || !phone) {
      return res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'All fields are required'
      });
    }

    const client = await Client.create({
      document,
      name,
      email,
      phone
    });

    res.status(201).json({
      code: 'SUCCESS',
      message: 'Client registered successfully',
      data: client
    });
  } catch (error) {
    res.status(400).json({
      code: 'ERROR',
      message: error.message
    });
  }
});

// 2. Wallet Recharge
app.post('/recharge', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { document, phone, amount } = req.body;

    // Validate amount is positive
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      await t.rollback();
      return res.status(400).json({
        code: 'INVALID_AMOUNT',
        message: 'Amount must be greater than 0'
      });
    }

    const client = await Client.findOne({
      where: { document, phone }
    }, { transaction: t });

    if (!client) {
      await t.rollback();
      return res.status(404).json({
        code: 'CLIENT_NOT_FOUND',
        message: 'Client not found'
      });
    }

    await client.increment('balance', {
      by: numAmount,
      transaction: t
    });

    await Transaction.create({
      clientId: client.id,
      type: 'RECHARGE',
      amount: numAmount,
      status: 'COMPLETED'
    }, { transaction: t });

    await t.commit();

    res.json({
      code: 'SUCCESS',
      message: 'Recharge successful',
      balance: client.balance + numAmount
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json({
      code: 'ERROR',
      message: error.message
    });
  }
});

// 3. Payment Initiation
app.post('/pay', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { document, phone, amount } = req.body;

    // Validate amount is positive
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      await t.rollback();
      return res.status(400).json({
        code: 'INVALID_AMOUNT',
        message: 'Amount must be greater than 0'
      });
    }

    const client = await Client.findOne({
      where: { document, phone }
    }, { transaction: t });

    if (!client) {
      await t.rollback();
      return res.status(404).json({
        code: 'CLIENT_NOT_FOUND',
        message: 'Client not found'
      });
    }

    if (client.balance < numAmount) {
      await t.rollback();
      return res.status(400).json({
        code: 'INSUFFICIENT_FUNDS',
        message: 'Insufficient funds'
      });
    }

    const sessionId = uuidv4();
    const token = Math.random().toString().slice(2, 8);

    const transaction = await Transaction.create({
      clientId: client.id,
      type: 'PAYMENT',
      amount: numAmount,
      status: 'PENDING',
      sessionId,
      token
    }, { transaction: t });

    // Check EMAIL_FEATURE flag first
    const emailFeatureEnabled = process.env.EMAIL_FEATURE === 'true';

    if (emailFeatureEnabled) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: client.email,
          subject: 'Payment Confirmation Token',
          text: `Your payment confirmation token is: ${token}`
        });
        
        await t.commit();
        
        res.json({
          code: 'TOKEN_SENT',
          message: 'Confirmation token has been sent to your email',
          sessionId: sessionId
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        await t.commit();
        
        // If email fails, return token in response
        res.json({
          code: 'TOKEN_GENERATED',
          message: 'Email delivery failed, using direct token delivery',
          sessionId: sessionId,
          token: token
        });
      }
    } else {
      // When email feature is disabled, return token directly
      await t.commit();
      
      res.json({
        code: 'TOKEN_GENERATED',
        message: 'Token generated (email feature disabled)',
        sessionId: sessionId,
        token: token
      });
    }

  } catch (error) {
    await t.rollback();
    console.error('Payment error:', error);
    res.status(400).json({
      code: 'ERROR',
      message: error.message
    });
  }
});

// Payment Confirmation
app.post('/confirm-payment', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { sessionId, token } = req.body;
    
    console.log('Confirming payment with:', { sessionId, token });

    // First, let's find all pending transactions to debug
    const allPendingTransactions = await Transaction.findAll({
      where: { status: 'PENDING' },
      raw: true
    });
    console.log('All pending transactions:', allPendingTransactions);

    // Modified query to match exactly what we're looking for
    const transaction = await Transaction.findOne({
      where: { 
        sessionId: sessionId, 
        token: token, 
        status: 'PENDING' 
      }
    });

    console.log('Found transaction:', transaction);

    if (!transaction) {
      await t.rollback();
      return res.status(404).json({
        code: 'INVALID_SESSION',
        message: 'Invalid session or token',
        debug: {
          providedSession: sessionId,
          providedToken: token,
          pendingTransactions: allPendingTransactions
        }
      });
    }

    // Now get the client separately
    const client = await Client.findByPk(transaction.clientId);
    console.log('Found client:', client);

    if (!client) {
      await t.rollback();
      return res.status(404).json({
        code: 'CLIENT_NOT_FOUND',
        message: 'Client not found'
      });
    }

    // Update client balance
    const previousBalance = client.balance;
    await client.decrement('balance', {
      by: transaction.amount,
      transaction: t
    });

    // Update transaction status
    transaction.status = 'COMPLETED';
    await transaction.save({ transaction: t });

    await t.commit();

    // Get the updated client to return the new balance
    const updatedClient = await Client.findByPk(client.id);
    console.log('Balance update:', {
      previous: previousBalance,
      new: updatedClient.balance,
      deducted: transaction.amount
    });

    res.json({
      code: 'SUCCESS',
      message: 'Payment completed successfully',
      balance: updatedClient.balance
    });
  } catch (error) {
    await t.rollback();
    console.error('Confirmation error:', error);
    res.status(400).json({
      code: 'ERROR',
      message: error.message,
      details: error.stack
    });
  }
});

// 4. Balance Query with Full Transaction History
app.get('/balance', async (req, res) => {
  try {
    const { document, phone, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const client = await Client.findOne({
      where: { document, phone }
    });

    if (!client) {
      return res.status(404).json({
        code: 'CLIENT_NOT_FOUND',
        message: 'Client not found'
      });
    }

    // Get total count of transactions
    const totalTransactions = await Transaction.count({
      where: { clientId: client.id }
    });

    // Get paginated transactions
    const transactions = await Transaction.findAll({
      where: { clientId: client.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id',
        'type',
        'amount',
        'status',
        'createdAt'
      ]
    });

    res.json({
      code: 'SUCCESS',
      balance: client.balance,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        date: t.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTransactions / limit),
        totalItems: totalTransactions,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Balance query error:', error);
    res.status(400).json({
      code: 'ERROR',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    await sequelize.sync({ force: false });
    
    app.listen(PORT, () => {
      console.log(`Wallet DB Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer(); 