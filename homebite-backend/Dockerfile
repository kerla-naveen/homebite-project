# -------- 1. Build Stage --------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (with caching)
COPY package.json package-lock.json ./
# -------- 1. Install Dependencies --------
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Security
USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/index.js"]