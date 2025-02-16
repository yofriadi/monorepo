# Base stage with Bun alpine
FROM oven/bun:alpine AS base
WORKDIR /app

# Install stage using pnpm for dependency management
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest

COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .

COPY apps/worker ./apps/worker
COPY packages/db ./packages/db

RUN pnpm install --frozen-lockfile

# Compile the worker into a runnable script
WORKDIR /app/apps/worker
RUN bun build \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile index \
  ./index.ts

# Build as release
FROM oven/bun:alpine
WORKDIR /app

COPY --from=base /app/apps/worker/index .

EXPOSE 3003
CMD ["bun", "run", "./index"]
