# Stage 1: Build
FROM node:18 AS builder

# Install Ghostscript, PDFtk, and pnpm
RUN apt-get update && apt-get install -y ghostscript pdftk \
    && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN pnpm run build

# Stage 2: Run
FROM node:18

# Install Ghostscript, PDFtk, and pnpm
RUN apt-get update && apt-get install -y ghostscript pdftk \
    && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy built code and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies using pnpm
RUN pnpm install --prod

# Create necessary directories
RUN mkdir -p /app/uploads /app/public/assets /app/logs \
    && chmod -R 755 /app/uploads /app/public/assets /app/logs

# Expose port
EXPOSE 7860

# Start both server and cron tasks
CMD ["sh", "-c", "node dist/index.js --host 0.0.0.0 --port 7860 & node cron/cron-tasks.js"]
