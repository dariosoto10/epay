FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

# Remove any existing node_modules and package-lock.json
RUN rm -rf node_modules package-lock.json
RUN npm cache clean --force

# Fresh install
RUN npm install --legacy-peer-deps

COPY . .

# Update to use the exposed port of wallet-api-service
ENV REACT_APP_API_URL=http://localhost:5001

EXPOSE 3000

CMD ["npm", "start"] 