# Stage 1: Build
FROM node:18-alpine AS builder

# Install Ghostscript
RUN apk add --no-cache ghostscript

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Run
FROM node:18-alpine

# Install Ghostscript
RUN apk add --no-cache ghostscript

# Set working directory
WORKDIR /app

# Copy built code and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]
