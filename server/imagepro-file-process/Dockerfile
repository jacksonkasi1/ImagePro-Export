# Stage 1: Build
FROM node:18 AS builder

# Install Ghostscript, PDFtk, and pnpm
RUN apt-get update && apt-get install -y ghostscript pdftk \
    && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN pnpm run build

# Stage 2: Run
FROM node:18

# Install Ghostscript, PDFtk, and cron
RUN apt-get update && apt-get install -y ghostscript pdftk cron

# Set working directory
WORKDIR /app

# Copy built code and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies using pnpm
RUN pnpm install --prod

# Create the uploads directory and set permissions
RUN mkdir -p /app/uploads /app/public/assets \
    && chmod -R 755 /app/uploads /app/public/assets

# Copy the cron scripts
COPY cron/clean-files.sh /etc/cron.hourly/clean-files
COPY cron/reset-log.sh /etc/cron.weekly/reset-log

# Ensure the cron scripts are executable
RUN chmod +x /etc/cron.hourly/clean-files /etc/cron.weekly/reset-log

# Set up the cron jobs with the correct user field
RUN echo "0 * * * * root /etc/cron.hourly/clean-files" > /etc/cron.d/cleanup-cron \
    && echo "0 0 * * 0 root /etc/cron.weekly/reset-log" >> /etc/cron.d/cleanup-cron

# Set permissions for cron job file
RUN chmod 0644 /etc/cron.d/cleanup-cron

# Copy the start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 7860

# Start the application
CMD ["/app/start.sh"]
