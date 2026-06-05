# User Service

Backend service for parent and child authentication, child profile creation, and session JWTs.

## Run Locally

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` and `JWT_SECRET`.
3. From `EX2`, run:

```powershell
npm.cmd run dev:user-service
```

Default URL: `http://localhost:4001`

## Endpoints

- `GET /health`
- `POST /api/users/parents/register`
- `POST /api/users/parents/login`
- `POST /api/users/children`
- `POST /api/users/children/login`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users/children`

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

## API Gateway

`../api-gateway/src/routes/usersProxy.js` forwards `/api/users` requests to `USER_SERVICE_URL` or `http://localhost:4001`.
