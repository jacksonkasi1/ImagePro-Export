# Stage 1: Build
FROM node:18 AS builder

# Install Ghostscript and pnpm
RUN apt-get update && apt-get install -y ghostscript pdftk \
    && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if it exists)
COPY package.json ./ 
COPY pnpm-lock.yaml ./ 

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN pnpm run build

# Stage 2: Run
FROM node:18

# Install Ghostscript and PDFtk
RUN apt-get update && apt-get install -y ghostscript pdftk \
    && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy built code and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copy package.json and pnpm-lock.yaml
COPY package.json ./ 
COPY pnpm-lock.yaml ./ 

# Install only production dependencies
RUN pnpm install --prod

# Create the uploads directory and set permissions
RUN mkdir -p /app/uploads /app/public/assets && chmod -R 777 /app/uploads /app/public/assets

# Expose port
EXPOSE 7860

# Start the server
CMD ["node", "dist/index.js", "--host", "0.0.0.0", "--port", "7860"]
