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

# Install dependencies
RUN pnpm install --frozen-lockfile

# Now copy the rest of the source code
COPY . .

# ---- Builder Stage: Build the Next.js app ----
FROM base AS builder
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest

WORKDIR /app
# Bring in the full repository with dependencies installed
COPY --from=installer /app .

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

