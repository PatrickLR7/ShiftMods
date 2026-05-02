# ShiftMods AI API

FastAPI backend for the ShiftMods Build Advisor feature.

## Requirements

- Python 3.12+
- A Supabase PostgreSQL database with the `shift-mods` schema

## Setup

```bash
cd shift-mods-api

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your actual values
```

## Running the server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Health check: `GET http://localhost:8000/health`

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Async PostgreSQL connection string (`postgresql+asyncpg://...`) |
| `SUPABASE_DB_SCHEMA` | Supabase schema name (default: `shift-mods`) |
| `JWT_SECRET` | Strong random secret for signing JWTs |
| `JWT_ALGORITHM` | JWT signing algorithm (default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime (default: `15`) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime (default: `7`) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `SHOPIFY_STOREFRONT_API_URL` | Shopify Storefront GraphQL endpoint |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Shopify Storefront access token |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |

## Generating the first admin invite

Once the service is running and the database is migrated, use the admin endpoint to create the first invite. The first admin account must be seeded directly in the database:

```sql
-- Run in Supabase SQL editor (replace values)
INSERT INTO "shift-mods".users (email, hashed_password, role)
VALUES ('admin@example.com', '<bcrypt_hash>', 'admin');
```

Then log in and call `POST /v1/admin/invites` with your admin token.

## Database Migrations

```bash
alembic upgrade head
```
