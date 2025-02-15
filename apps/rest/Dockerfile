FROM oven/bun:alpine AS build

WORKDIR /app

RUN apk update && \
    apk add --no-cache npm && \
    npm install -g pnpm@latest

# Cache packages
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .

COPY apps/rest/package.json ./apps/rest/package.json
COPY packages/db/package.json ./packages/db/package.json

RUN pnpm install --frozen-lockfile

COPY /apps/rest ./apps/rest
COPY /packages/db ./packages/db

ENV NODE_ENV=production

WORKDIR apps/rest
RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
	./src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/apps/rest/server server

WORKDIR /app

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3002
