# E-Wallet System

## Prerequisites
- Docker
- Docker Compose

## Quick Start

1. Clone the repository
```bash
git clone <repository-url>
cd e-wallet-system
```

2. Create environment files

```bash
# Create .env files for each service (examples provided)
cp .env.example .env
```

Update the .env file with your configuration:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=wallet_db
EMAIL_USER=email    # Replace with your Gmail
EMAIL_PASSWORD=password   # Use an App Password from Google Account
```

3. Build and run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Run in detached mode (background)
docker-compose up -d --build
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:5001
- Database: http://localhost:5432

## Docker Commands

```bash
# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f client-1
docker-compose logs -f wallet-api-service-1
docker-compose logs -f wallet-db-service-1

# Rebuild specific service
docker-compose up -d --build <service-name>

# Remove all containers and volumes
docker-compose down -v
```

## Services Architecture
- **client**: React frontend application
- **wallet-api-service**: Node.js API service
- **wallet-db-service**: PostgreSQL database service

## Troubleshooting

1. Port Conflicts
   - Ensure ports 3000, 5001, and 5432 are available
   - Modify ports in docker-compose.yml if needed

2. Database Connection Issues
   - Check database logs: `docker-compose logs db`
   - Verify environment variables in .env

3. Container Issues
   ```bash
   # Remove all containers and volumes and rebuild
   docker-compose down -v
   docker-compose up --build
   ```

## Development

For local development without Docker:
1. Install Node.js and PostgreSQL
2. Follow the setup in each service's README
3. Use `npm install` and `npm start` in each directory

# E-Wallet System API Documentation

## Base URL 

## Endpoints

### 1. Register Client
Register a new client in the system. 

#### Request Body
```json
{
  "document": "string",
  "name": "string",
  "email": "string",
  "phone": "string"
}
``` 

#### Response
```json
{
  "success": true,
  "message": "Client registered successfully",
  "data": {
    "id": "string",
    "document": "string",
    "name": "string",
    "email": "string",
    "phone": "string"
  }
}
``` 

### 2. Recharge Wallet
Add funds to a client's wallet.

#### Request Body
```json
{
  "document": "string",
  "phone": "string",
  "amount": "number"
}
```

#### Response
```json
{
  "success": true,
  "message": "Wallet recharged successfully",
  "data": {
    "balance": "number",
    "transactionId": "string"
  }
}
``` 

### 3. Initiate Payment
Start a payment transaction.

#### Request Body
```json
{
  "document": "string",
  "phone": "string",
  "amount": "number"
}
```

#### Response
```json
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "sessionId": "string",
    "isMocked": "boolean",
    "token": "string" // Only present if isMocked is true
  }
}
``` 

### 4. Confirm Payment
Confirm a payment transaction using the session ID and token.

#### Request Body
```json
{
  "sessionId": "string",
  "token": "string"
}
```

#### Response
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "transactionId": "string",
    "amount": "number",
    "newBalance": "number"
  }
}
``` 

### 5. Check Balance
Get client's balance and transaction history.

## Error Responses
All endpoints may return the following error structure:

```json
{
  "success": false,
  "message": "Error description"
}
``` 

### Common Error Codes
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Authentication required
- `404`: Not Found - Resource not found
- `500`: Internal Server Error

## Testing
For testing purposes, when `isMocked` is true in the payment response, use the provided token to confirm the payment. In production, the token will be sent to the client's email/phone.

## Rate Limiting
- Maximum 100 requests per minute per IP
- Maximum 1000 requests per hour per IP

## Notes
- All amounts are in the system's default currency
- Transactions are processed in real-time
- Session IDs expire after 15 minutes
- Confirmation tokens are 6 digits long

## Database Access

### Connect to PostgreSQL Container

```bash
# Access the PostgreSQL container
docker exec -it wallet-db-service-1 psql -U postgres -d wallet_db
```

### Useful PostgreSQL Commands

```sql
-- List all tables
\dt

-- Show table structure
\d+ clients
\d+ transactions
\d+ wallets

-- Basic Queries Examples
-- Get all clients
SELECT * FROM clients;

-- Get client by document
SELECT * FROM clients WHERE document = '123456789';

-- Get wallet balance
SELECT balance FROM wallets WHERE client_id = 1;

-- Get recent transactions
SELECT 
    t.id,
    t.type,
    t.amount,
    t.status,
    t.created_at
FROM transactions t
WHERE t.wallet_id = 1
ORDER BY t.created_at DESC
LIMIT 10;

-- Get total transactions by type
SELECT 
    type,
    COUNT(*) as total_count,
    SUM(amount) as total_amount
FROM transactions
GROUP BY type;

-- Get client with their wallet balance
SELECT 
    c.name,
    c.document,
    w.balance
FROM clients c
JOIN wallets w ON w.client_id = c.id
WHERE c.document = '123456789';

-- Get failed transactions
SELECT * FROM transactions 
WHERE status = 'FAILED'
ORDER BY created_at DESC;

-- Get today's transactions
SELECT * FROM transactions 
WHERE DATE(created_at) = CURRENT_DATE;
```

### Database Backup & Restore

```bash
# Create backup
docker exec -t wallet-db-service-1 pg_dump -U postgres wallet_db > backup.sql

# Restore backup
docker exec -i wallet-db-service-1 psql -U postgres wallet_db < backup.sql
```

### Common Tasks

1. Reset a client's password
```sql
UPDATE clients 
SET password_hash = NULL 
WHERE document = '123456789';
```

2. Update wallet balance
```sql
UPDATE wallets 
SET balance = balance + 100 
WHERE client_id = 1;
```

3. Cancel pending transactions
```sql
UPDATE transactions 
SET status = 'CANCELLED' 
WHERE status = 'PENDING' 
AND created_at < NOW() - INTERVAL '15 minutes';
```

4. Get transaction summary by client
```sql
SELECT 
    c.name,
    c.document,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN t.type = 'PAYMENT' THEN t.amount ELSE 0 END) as total_payments,
    SUM(CASE WHEN t.type = 'RECHARGE' THEN t.amount ELSE 0 END) as total_recharges
FROM clients c
JOIN wallets w ON w.client_id = c.id
JOIN transactions t ON t.wallet_id = w.id
GROUP BY c.id, c.name, c.document;
```
