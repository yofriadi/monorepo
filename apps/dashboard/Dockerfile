# ---- Base Stage: Use the Bun image as our sole runtime & package manager ----
FROM oven/bun:alpine AS base
WORKDIR /app

# ---- Dependencies Stage: Install all workspace dependencies ----
FROM base AS installer
# Install pnpm
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest

# Copy package files first to leverage layer caching
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/ui/package.json ./packages/ui/
COPY apps/dashboard/package.json ./apps/dashboard/

# Create necessary directories for workspace
RUN mkdir -p packages/ui apps/dashboard

# Copy the rest of the source code
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# ---- Builder Stage: Build the Next.js app ----
FROM base AS builder
# Install pnpm
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest

WORKDIR /app

# Copy all source files
COPY . .
# Copy pnpm files
COPY --from=installer /app/pnpm-lock.yaml ./
COPY --from=installer /app/package.json ./

# Install dependencies again in builder stage
RUN pnpm install --frozen-lockfile

ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js app in apps/dashboard
RUN cd apps/dashboard && pnpm run build

# ---- Runner Stage: Create the minimal production image ----
FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create necessary directories
RUN mkdir -p apps/dashboard

# Copy the standalone build
COPY --from=builder /app/apps/dashboard/.next/standalone/ ./

# Copy the UI components - this is critical for shadcn/ui
COPY --from=builder /app/packages/ui ./packages/ui

# Copy Next.js specific files
COPY --from=builder /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
#COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public

EXPOSE 3000

# Start the production server
WORKDIR /app/apps/dashboard
CMD ["bun", "run", "server.js"]

