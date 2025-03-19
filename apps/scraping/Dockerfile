# ---- Base Stage: Use the Bun image as our sole runtime & package manager ----
FROM oven/bun:alpine AS base
WORKDIR /app

# ---- Dependencies Stage: Install all workspace dependencies ----
FROM base AS installer

# Install pnpm
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest

# Set non-interactive environment to avoid prompts
ENV CI=true

# Copy package files first to leverage layer caching
COPY package.json pnpm-lock.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY apps/scraping/package.json ./apps/scraping/

# Create necessary directories for workspace
RUN mkdir -p packages/ui apps/scraping

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

# Set non-interactive environment to avoid prompts
ENV CI=true

# Copy all source files
COPY . .

# Copy pnpm files
COPY --from=installer /app/pnpm-lock.yaml ./
COPY --from=installer /app/package.json ./

# Install dependencies again in builder stage
RUN pnpm install --frozen-lockfile

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STACK_PROJECT_ID
ARG NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
ARG STACK_SECRET_SERVER_KEY

# Set environment variables for the build step using the ARG values
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_STACK_PROJECT_ID=${NEXT_PUBLIC_STACK_PROJECT_ID} \
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=${NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY} \
    STACK_SECRET_SERVER_KEY=${STACK_SECRET_SERVER_KEY}

RUN pnpm run build

# ---- Runner Stage: Create the minimal production image ----
FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create necessary directories
RUN mkdir -p apps/scraping

# Copy the standalone build
COPY --from=builder /app/apps/scraping/.next/standalone/ ./

# Copy the UI components - this is critical for shadcn/ui
COPY --from=builder /app/packages/ui ./packages/ui

# Copy Next.js specific files
COPY --from=builder /app/apps/scraping/.next/static ./apps/scraping/.next/static

EXPOSE 3000

WORKDIR /app/apps/scraping

CMD ["bun", "run", "server.js"]

