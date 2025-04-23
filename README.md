# Overview

This monorepo holds 2 apps, one is a rest api and the other is a nextjs app.
Check their respective README.md for more information.

## CI/CD

This project already has CI/CD configured, so you can just push to the `main` branch and it will build and deploy.
the file you should look for is `.github/workflows/docker-build.yml`.

## Deployment

This is apply to any of the apps, because we use Docker, just look for the compose.yml file.

1. Change to root user `sudo su`.
2. Change to root directory by `cd` then look for the folder project.
3. Inside the project directory, check the `compose.yml` file.
4. Run `docker compose -p=<project> up -d`.

## ws-app-1

### Traefik configuration

Structure of Traefik configuration is modular as follows in `/root/scraping`:
```bash
scraping/
├── .htpasswd # password file for basic auth in Traefik dashboard.
├── *.env # environment variables for any services that need them, prefixed with their service name.
├── certs/ # holds SSL certificates for Traefik.
├── logs/ # holds Traefik logs.
└── config/ # holds Traefik configuration files for services and middlewares.
    ├── dynamic
    │   ├── dynamic.yml # Traefik dashboard config file.
    │   ├── middlewares.yml # Middlewares config file.
    │   ├── scraping.yml # App & API Traefik config file.
    │   └── stackauth.yml # StackAuth Traefik config file.
    └── traefik.yml # main Traefik configuration file.
```

### Deploying

1. Change to root user `sudo su`.
2. Change to root directory by `cd` then look for the folder `scraping`.
3. Inside the project directory, check the `compose.yml` file.
4. Run `docker compose -p=scraping up -d`.

## ws-dbs-1

1. Change to root user `sudo su`.
2. Change to root directory by `cd` then look for the folder `scraping`.
3. Inside the project directory, check the `compose.yml` file.
4. Run `docker compose -p=scraping up -d`.

## ws-worker-1

Worker VM also has the same Traefik structure and configuration.
1. Change to root user `sudo su`.
2. Change to root directory by `cd` then look for the folder `scraping`.
3. Inside the project directory, check the `compose.yml` file.
4. Run `docker compose -p=scraping up -d`.
