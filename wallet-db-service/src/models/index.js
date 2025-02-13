const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'postgres',
});

const Client = sequelize.define('Client', {
  document: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  balance: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false
  }
});

const Transaction = sequelize.define('Transaction', {
  clientId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  type: {
    type: Sequelize.ENUM('RECHARGE', 'PAYMENT'),
    allowNull: false
  },
  amount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('PENDING', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING'
  },
  sessionId: {
    type: Sequelize.STRING,
    unique: true
  },
  token: {
    type: Sequelize.STRING
  }
});

Client.hasMany(Transaction);
Transaction.belongsTo(Client);

module.exports = {
  sequelize,
  Client,
  Transaction
}; 