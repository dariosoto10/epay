FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies in specific order with exact versions
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm install --legacy-peer-deps && \
    npm install ajv@8.12.0 --save-exact && \
    npm install ajv-keywords@5.1.0 --save-exact && \
    npm install webpack@5.75.0 --save-exact && \
    npm install schema-utils@4.0.1 --save-exact && \
    npm install webpack-dev-server@4.11.1 --save-exact && \
    npm install react-scripts@5.0.1 --save-exact

# Copy the rest of the application
COPY . .

# Set environment variables
ENV REACT_APP_API_URL=http://localhost:5001
ENV NODE_ENV=development
ENV CI=true

EXPOSE 3000

# Start the app
CMD ["npm", "start"] 