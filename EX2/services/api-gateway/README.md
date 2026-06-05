# API Gateway

Routing gateway for frontend requests into backend microservices.

## Run Locally

1. Copy `.env.example` to `.env`.
2. Start the User Service on port `4001`.
3. From `EX2`, run:

```powershell
npm.cmd run dev:api-gateway
```

Default URL: `http://localhost:4000`

## Routes

- `GET /health`
- `/api/users/*` forwards to `USER_SERVICE_URL`

The frontend should call User Service endpoints through this gateway URL, for example:

```text
POST http://localhost:4000/api/users/parents/login
```
