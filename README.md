# Full Stack Mono Repo

This repository contains the **Utro** full stack application for [inspirationparticle.com](https://inspirationparticle.com), featuring a Spring Boot backend using Protocol Buffers and a Next.js frontend using Connect RPC.

## Structure

- `api` - Spring Boot application with JWT authentication, Google OAuth login, and Actuator enabled. Protobuf definitions are compiled here.
- `proto` - `.proto` files shared between backend and frontend. TypeScript stubs are generated under `web/generated`.
- `web` - Next.js application using Connect RPC clients generated from protobuf definitions and Material UI for the UI.

## Usage

Generate protobuf code:

```bash
buf generate
```

Run backend:

```bash
cd api/app
mvn spring-boot:run
```

Run frontend:

```bash
cd web
npm install
npm run dev
```

## Docker

Build images and run with Docker Compose:

```bash
docker compose up --build
```

The web app will be available at `http://localhost:3000` and the API at `http://localhost:8080`.

## Kubernetes

Example manifests are provided in `k8s/`:

```bash
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
```

This deploys both services with an ingress exposing the web frontend.

This setup demonstrates authenticated (`/secret`) and unauthenticated (`/public`) endpoints.
