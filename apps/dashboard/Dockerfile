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

# Copy entire workspace configs and project files
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config
COPY packages/ui ./packages/ui
COPY apps/dashboard ./apps/dashboard

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/dashboard
RUN bun run build

FROM oven/bun:alpine
WORKDIR /app

COPY --from=builder /app/apps/dashboard/.next ./.next
COPY --from=builder /app/apps/dashboard/package.json .
COPY --from=builder /app/apps/dashboard/node_modules ./node_modules

ENV NEXT_PUBLIC_API_URL=http://localhost:3002

EXPOSE 3001
CMD ["bun", "run", "start"]
