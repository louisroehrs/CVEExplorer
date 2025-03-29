# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Vite"
WORKDIR /app
ENV NODE_ENV="production"

# ========== Builder ==========
FROM base AS frontend-builder

# 👇 Ensure dev dependencies are installed
ENV NODE_ENV=development

# Install build tools
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# -----------------------------
# Install frontend dependencies
# -----------------------------
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci

# Build Vite frontend
COPY client ./
RUN npm run build

# -----------------------------
# Install backend dependencies
# -----------------------------
FROM base AS backend-builder    

# 👇 Ensure dev dependencies are installed
ENV NODE_ENV=production

WORKDIR /app/api
COPY api/package*.json ./
RUN npm ci

# Copy backend code
COPY api ./

# Copy built frontend into backend
COPY --from=frontend-builder /app/client/dist /app/api/dist

# ========== Final Stage ==========
FROM node:${NODE_VERSION}-slim AS production
WORKDIR /app

RUN npm ci --omit=dev

# Copy backend + built UI from builder
COPY --from=backend-builder /app/api ./

EXPOSE 80
CMD ["node", "server.js"]
