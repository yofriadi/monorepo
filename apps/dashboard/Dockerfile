# Base stage with Bun alpine
FROM oven/bun:alpine AS base
WORKDIR /app

# Install stage using pnpm for dependency management
FROM base AS builder
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest

COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .

COPY apps/dashboard ./apps/dashboard
COPY packages/ui ./packages/ui

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/dashboard
RUN bun run build

FROM oven/bun:alpine
WORKDIR /app

COPY --from=base /app/apps/dashboard .

ENV NEXT_PUBLIC_API_URL=http://localhost:3002

EXPOSE 3001
CMD ["bun", "./server.js"]
