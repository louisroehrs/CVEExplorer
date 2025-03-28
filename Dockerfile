# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Vite"

# Vite app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS builder

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev
RUN npm install -g typescript

# Copy application code
COPY . .

WORKDIR /app/client
RUN npm install
# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev

WORKDIR /app

# Final stage for app image
FROM node:${NODE_VERSION}-slim AS production

# Copy built application
COPY --from=builder /app/api ./
COPY --from=builder /app/dist ./dist

# Start the server by default, this can be overwritten at runtime
EXPOSE 80
CMD [ "node", "server.js" ]
