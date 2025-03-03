# ---- Build Stage ----
FROM oven/bun:alpine AS build
WORKDIR /app

# Install pnpm with a custom home directory so that it's available in PATH
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest

# Copy monorepo configuration files and lockfile
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .

# Copy the relevant Turborepo packages
COPY apps/rest ./apps/rest
COPY packages/db ./packages/db

# Install all monorepo dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Switch to the REST app folder and build your Elysia server into a runnable script
WORKDIR /app/apps/rest
RUN bun build \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile index \
    ./src/index.ts

# ---- Final Stage (Using Bun as the runtime) ----
FROM oven/bun:alpine
WORKDIR /app

# Copy the built script from the build stage
COPY --from=build /app/apps/rest/index .

EXPOSE 3001

# Run the built script using Bun
CMD ["bun", "run", "./index"]
