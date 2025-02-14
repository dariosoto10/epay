const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const app = express();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-password'
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced debug middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  next();
});

console.log('Starting database service with config:', {
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.POSTGRES_DB || 'wallet_db',
  username: process.env.POSTGRES_USER || 'postgres'
});

// Database connection
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'wallet_db',
  logging: console.log
});

// Models
const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  document: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  emailFlagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: true  // Default to true
  }
});

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
});

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('CREDIT', 'DEBIT'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING'
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Relationships
Client.hasOne(Wallet);
Wallet.belongsTo(Client);
Wallet.hasMany(Transaction);
Transaction.belongsTo(Wallet);

// Sync models
const initDb = async () => {
  try {
    await sequelize.sync({ force: true }); // Be careful with force: true in production
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
};

// Initialize database before starting server
initDb().then(() => {
  // Start server code here
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Routes
  app.post('/clients', async (req, res) => {
    try {
      console.log('Creating client:', req.body);
      const client = await Client.create(req.body);
      const wallet = await Wallet.create({ ClientId: client.id });
      console.log('Client created:', { client, wallet });
      res.status(201).json({ client, wallet });
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/balance', async (req, res) => {
    try {
      const { document, phone } = req.query;
      const client = await Client.findOne({
        where: { document, phone },
        include: [{ model: Wallet, include: [Transaction] }]
      });
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      res.json(client.Wallet);
    } catch (error) {
      console.error('Error getting balance:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/health', async (req, res) => {
    try {
      await sequelize.authenticate();
      res.json({ status: 'ok' });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Recharge wallet
  app.post('/recharge', async (req, res) => {
    try {
      console.log('Processing recharge request:', req.body);
      const { document, phone, amount } = req.body;

      if (!document || !phone || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Document, phone, and amount are required'
        });
      }

      const result = await sequelize.transaction(async (t) => {
        // Find client and their wallet
        const client = await Client.findOne({
          where: { document, phone },
          include: [Wallet],
          transaction: t
        });

        if (!client) {
          throw new Error('Client not found');
        }

        // Create transaction record
        const transaction = await Transaction.create({
          WalletId: client.Wallet.id,
          type: 'CREDIT',
          amount: amount,
          status: 'COMPLETED'
        }, { transaction: t });

        // Update wallet balance
        await client.Wallet.increment('balance', {
          by: amount,
          transaction: t
        });

        // Get updated wallet
        const updatedWallet = await Wallet.findByPk(client.Wallet.id, {
          transaction: t
        });

        return {
          transaction,
          currentBalance: updatedWallet.balance
        };
      });

      console.log('Recharge successful:', result);
      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Recharge error:', error);
      res.status(error.message === 'Client not found' ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Helper function to generate session ID and token
  const generateSessionData = () => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit token
    return { sessionId, token };
  };

  // Process payment
  app.post('/pay', async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      console.log('Processing payment request:', req.body);
      const { document, phone, amount } = req.body;

      if (!document || !phone || !amount) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: 'Document, phone, and amount are required'
        });
      }

      const client = await Client.findOne({
        where: { document, phone },
        include: [Wallet],
        transaction: t
      });

      if (!client) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      if (parseFloat(client.Wallet.balance) < parseFloat(amount)) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: 'Insufficient funds'
        });
      }

      // Generate session data if email is flagged
      let sessionData = null;
      if (client.emailFlagged) {
        sessionData = generateSessionData();
        
        // Send verification email only for flagged emails
        try {
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: client.email,
            subject: 'Payment Verification Required',
            text: `Please verify your payment using the following token: ${sessionData.token}`,
            html: `
              <h1>Payment Verification Required</h1>
              <p>Please verify your payment using the following information:</p>
              <p>Session ID: ${sessionData.sessionId}</p>
              <p>Token: ${sessionData.token}</p>
              <p>Amount: ${amount}</p>
            `
          });
          console.log('Verification email sent to:', client.email);
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          // Continue with transaction even if email fails
        }
      }

      const transaction = await Transaction.create({
        WalletId: client.Wallet.id,
        type: 'DEBIT',
        amount: amount,
        status: 'PENDING',
        sessionId: sessionData?.sessionId,
        token: sessionData?.token
      }, { transaction: t });

      await client.Wallet.decrement('balance', {
        by: amount,
        transaction: t
      });

      await t.commit();

      const updatedWallet = await Wallet.findByPk(client.Wallet.id);

      const result = {
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          status: transaction.status,
          type: transaction.type,
          ...(sessionData && {
            sessionId: sessionData.sessionId,
            token: sessionData.token
          })
        },
        currentBalance: updatedWallet.balance,
        requiresVerification: client.emailFlagged
      };

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      await t.rollback();
      console.error('Payment error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Confirm payment
  app.post('/confirm-payment', async (req, res) => {
    try {
      console.log('Processing payment confirmation:', req.body);
      const { sessionId, token } = req.body;

      if (!sessionId || !token) {
        return res.status(400).json({
          success: false,
          error: 'SessionId and token are required'
        });
      }

      const result = await sequelize.transaction(async (t) => {
        // Find transaction by sessionId and token
        const transaction = await Transaction.findOne({
          where: {
            sessionId,
            token,
            status: 'PENDING'
          },
          include: [{
            model: Wallet,
            include: [Client]
          }],
          transaction: t
        });

        if (!transaction) {
          throw new Error('Invalid session ID or token, or transaction already processed');
        }

        // Update transaction status
        await transaction.update({
          status: 'COMPLETED'
        }, { transaction: t });

        return {
          transaction,
          currentBalance: transaction.Wallet.balance
        };
      });

      console.log('Payment confirmation successful:', result);
      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Payment confirmation error:', error);
      let status = 500;
      if (error.message === 'Invalid session ID or token, or transaction already processed') status = 400;
      
      res.status(status).json({
        success: false,
        error: error.message
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

  const PORT = process.env.PORT || 5002;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Database service running on port ${PORT}`);
  });
}); 