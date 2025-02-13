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

## .ENV file

- create a .env file in the root of the project
- add the following variables

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=wallet_db
EMAIL_USER=email    # Replace with your Gmail
EMAIL_PASSWORD=password   # Use an App Password from Google Account
```




