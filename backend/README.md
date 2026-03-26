# KMRL Backend

Express + MongoDB backend for the KMRL App mobile client.

## Features

- JWT authentication with `staff` and `admin` roles
- Document upload and management
- Search and filter documents by tag, category, uploader, and summary status
- Mock-first AI summarization with optional OpenAI-compatible integration
- Meeting scheduling
- Notifications and alerts
- User profile and settings

## Folder Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
```

## Run

1. Create `.env` from `.env.example`
2. Install dependencies with `npm install`
3. Start the API with `npm run dev`

## Core API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/profile/me`
- `PATCH /api/profile/me`
- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents?search=policy&tag=URGENT&category=operations`
- `POST /api/documents/:id/summarize`
- `POST /api/meetings`
- `GET /api/meetings`
- `GET /api/notifications`
