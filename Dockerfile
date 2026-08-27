# ==========================================
# Base Image
# ==========================================
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies needed across stages
COPY package*.json ./

# ==========================================
# Development Target (with live reload)
# ==========================================
FROM base AS dev
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ==========================================
# Production Dependencies Builder
# ==========================================
FROM base AS prod-deps
ENV NODE_ENV=production
RUN npm ci --omit=dev

# ==========================================
# Production Release Target
# ==========================================
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# Security: Create logs directory with proper permissions for non-root user
RUN mkdir -p logs && chown -R node:node /app

# Copy production dependencies and app source
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ ./src/
COPY --chown=node:node drizzle/ ./drizzle/
COPY --chown=node:node drizzle.config.js ./

# Switch to non-root user for security
USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
