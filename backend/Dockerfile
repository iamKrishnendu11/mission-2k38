FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend source files
COPY . .

# Expose Node.js API port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
