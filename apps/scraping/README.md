# Next.js shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/ui/button"
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## Directory Structure
```
apps/
└── scraping/
```

When pushed to the `main` branch, the application will be built automatically.
We can pull this image from the registry and run it with docker.

## Production

```bash
docker pull ghcr.io/luxehouze/scraping:latest
```

Then just run with other images, see `compose.yml`:

```bash
docker compose -p=scraping up -d
```

replace -p with whatever context you want.
Make sure our subdomain is set to our VM IP external and Traefik is running and configured correctly.
