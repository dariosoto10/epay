const { Sequelize } = require('sequelize');

console.log('Database configuration:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER
});

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'db',  // Match the service name in docker-compose
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'wallet_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 5,
    timeout: 3000
  }
});

// Test and log the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    });
  } catch (error) {
    console.error('Database connection error:', {
      error: error.message,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    });
    // Don't exit, let the application retry
  }
};

testConnection();

module.exports = sequelize; 