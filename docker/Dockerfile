# Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:20-alpine

# Install bash
RUN apk add --no-cache bash

WORKDIR /app

# Copy dependencies and source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose backend port
EXPOSE 3000

# Set bash as default shell
SHELL ["/bin/bash", "-c"]

# Start the production server
CMD ["/bin/bash", "-c", "npm start"]

