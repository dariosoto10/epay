FROM node:18-alpine

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose both PostgreSQL and HTTP API ports
EXPOSE 5432 5002

# Start the application
CMD ["npm", "start"] 