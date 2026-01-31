# =============================================================================
# FIAP Tech Challenge - K8s Main Service Dockerfile
# =============================================================================
# Multi-stage build for production-ready Node.js application
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Disable husky git hooks in Docker
ENV HUSKY=0

# Install dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Disable husky git hooks in Docker
ENV HUSKY=0

COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate || true

# Build application
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Copy Prisma schema and generated client
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/main.js"]
