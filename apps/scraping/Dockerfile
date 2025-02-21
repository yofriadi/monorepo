FROM oven/bun:alpine AS base
WORKDIR /app

FROM base AS installer
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/ui/package.json ./packages/ui/
COPY apps/scraping/package.json ./apps/scraping/
RUN mkdir -p packages/ui apps/scraping
COPY . .
RUN pnpm install --frozen-lockfile

FROM base AS builder
RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest
WORKDIR /app
COPY . .
COPY --from=installer /app/pnpm-lock.yaml ./
COPY --from=installer /app/package.json ./
RUN pnpm install --frozen-lockfile
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN cd apps/scraping && pnpm run build

FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN mkdir -p apps/scraping
COPY --from=builder /app/apps/scraping/.next/standalone/ ./
COPY --from=builder /app/packages/ui ./packages/ui
COPY --from=builder /app/apps/scraping/.next/static ./apps/scraping/.next/static
EXPOSE 3000
WORKDIR /app/apps/scraping
CMD ["bun", "run", "server.js"]

