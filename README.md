# NexDesk

SaaS-ready MERN application scaffold.

## Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Frontend | React, Vite, Material UI |
| Backend  | Node.js, Express        |
| Database | MongoDB, Mongoose       |
| Auth     | JWT                     |

## Project Structure

```
NexDesk/
├── backend/
│   └── src/
│       ├── config/          # Environment & database
│       ├── constants/       # Shared constants (roles)
│       ├── controllers/     # Route handlers (empty)
│       ├── middleware/      # Auth, error handling
│       ├── models/          # Mongoose models (empty)
│       ├── routes/
│       │   └── v1/          # Versioned API routes
│       ├── services/        # Business logic (empty)
│       ├── utils/           # Helpers (JWT, ApiError)
│       └── validators/      # Request validation (empty)
│
└── frontend/
    └── src/
        ├── api/             # Axios client with JWT interceptors
        ├── components/      # UI components (empty)
        ├── config/          # Environment config
        ├── constants/       # Shared constants (roles)
        ├── context/         # Auth context
        ├── hooks/           # Custom hooks (empty)
        ├── pages/           # Page components (empty)
        ├── routes/          # Routing & protected routes
        ├── services/        # API services (empty)
        ├── theme/           # MUI theme
        └── utils/           # Utilities (empty)
```

## Roles

- **Master** — Full platform access
- **Admin** — Organization management
- **Customer** — End-user access

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Health check: `GET http://localhost:5000/api/v1/health`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## API Versioning

All endpoints are prefixed with `/api/v1`.

## Next Steps

Business modules (auth, users, etc.) are not yet implemented. Placeholders are ready in:

- `backend/src/controllers/`
- `backend/src/models/`
- `backend/src/services/`
- `frontend/src/pages/`
- `frontend/src/services/`
