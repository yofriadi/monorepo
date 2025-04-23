# ElysiaJS

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3001/api/swagger with your browser to see the swagger documentation.

## Directory Structure
```
apps/
└── rest/
    ├── src/
    │   ├── api/
```

When pushed to the `main` branch, the application will be built automatically.
We can pull this image from the registry and run it with docker.

## Production

```bash
docker pull ghcr.io/luxehouze/rest:latest
```

Then just run with other images, see `compose.yml`:

```bash
docker compose -p=scraping up -d
```

replace -p with whatever context you want.
Make sure our subdomain is set to our VM IP external and Traefik is running and configured correctly.


# trigger.dev

🚀 Overview

trigger.dev allows you to run background tasks and workflows using plain async code.
The self-hosting guide provides two setups:

* Single Machine Setup: All components run on one server.
* Split Setup: The webapp and worker components run on separate machines.

We are using single machine setup using Docker and Docker Compose.
Directory structure is as follows only:

```
apps/
└── rest/
    ├── src/
    │   ├── script/
    │   └── trigger/
```

🛠️ Setup Steps

## Local Worker Service Setup
1. Initialize `pnpm dlx trigger.dev@latest init`.
2. Run `pnpm dlx trigger.dev@latest dev`.
3. Open `localhost:3040` in your browser.

## Production/Staging Worker Service Setup
1. Set up .env file, see .env.example for reference.
2. Check `compose.yml`.
3. Run with `docker compose -p=scraping up -d`. replace -p with whatever context you want.
4. Make sure domain is set to the service, see in our Vercel dashboard make sure it set to our VM IP external and Traefik is running and configured correctly.

## Deploying tasks
1. Login first `pnpm dlx trigger.dev@latest login -a https://scrapy-app-cron.luxehouze.store`. Change url if it different.
2. Make sure it can access Container Registry as definedd in `.env` file.
See official docs here https://trigger.dev/docs/open-source-self-hosting#registry-setup.
Usually it is like this get inside the container`docker exec -ti scraping-trigger-provider-1`, login `docker login -u luxehouze ghcr.io`.
It will prompt for password, use access token from the Registry provider.
In GitHub, go to https://github.com/settings/tokens, generate new classic token with `read:packages` scope.
4. Deploy with this command, in `/apps/rest` directory
```bash
pnpm dlx trigger.dev@latest deploy \
    --api-url https://scrapy-app-cron.luxehouze.store \
    --self-hosted \
    --load-image \
    --push \
    --registry ghcr.io \
    --namespace luxehouze \
    --skip-telemetry \
    --env-file .env```
5. Test new deployed task, if it picked up by the worker.
