# Stage 1: Build
FROM node:18-alpine AS builder

# Install Ghostscript and pnpm
RUN apk add --no-cache ghostscript \
    && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if it exists)
COPY package.json ./
# For pnpm
COPY pnpm-lock.yaml ./ 

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN pnpm run build

# Stage 2: Run
FROM node:18-alpine

# Install Ghostscript and pnpm
RUN apk add --no-cache ghostscript \
    && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy built code and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copy package.json and pnpm-lock.yaml
COPY package.json ./
# For pnpm
COPY pnpm-lock.yaml ./ 

# Install only production dependencies
RUN pnpm install --prod

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]
