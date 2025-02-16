# ---- Base Stage: Use the Bun image as our sole runtime & package manager ----
FROM oven/bun:alpine AS base
WORKDIR /app

# ---- Dependencies Stage: Install all workspace dependencies ----
FROM base AS deps
# Install pnpm
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest
# Copy root files for the monorepo (adjust as needed)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Copy the Next.js app’s essential files from apps/dashboard
COPY apps/dashboard/package.json apps/dashboard/next.config.mjs apps/dashboard/tsconfig.json* apps/dashboard/
# Copy the entire repository so all workspace packages are available
COPY . .
# Install all dependencies in the workspace using Bun
RUN pnpm install --frozen-lockfile

# ---- Builder Stage: Build the Next.js app ----
FROM base AS builder
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest
WORKDIR /app
# Bring in the full repository (with dependencies installed)
COPY --from=deps /app .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Build the Next.js app in apps/dashboard
RUN cd apps/dashboard && pnpm run build

# ---- Runner Stage: Create the minimal production image ----
FROM oven/bun:alpine AS runner
# Set working directory to the Next.js app folder
WORKDIR /app
ENV NODE_ENV=production

# Copy only runtime files:
# • package.json (if needed for runtime scripts)
# • Public assets
# • The standalone build output; note the trailing slash to copy its CONTENTS
# • Static files from .next/static
#COPY --from=builder /app/apps/dashboard/package.json ./
COPY --from=builder /app/apps/dashboard/.next/standalone/ ./
COPY --from=builder /app/apps/dashboard/.next/static ./.next/static

EXPOSE 3000

# Start the production server (server.js is generated in the standalone output)
WORKDIR /app/apps/dashboard
CMD ["bun", "run", "server.js"]

