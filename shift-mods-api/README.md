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

## Generating the first admin user

The first admin cannot be created through the API (there are no invites yet). Insert them directly in the Supabase SQL editor.

**Step 1 — Generate a bcrypt hash for your password:**

```bash
cd shift-mods-api
.venv/Scripts/python -c "import bcrypt; print(bcrypt.hashpw(b'your-password-here', bcrypt.gensalt()).decode())"
```

**Step 2 — Insert the admin user in Supabase SQL editor:**

```sql
INSERT INTO "shift-mods".users (email, hashed_password, role)
VALUES ('admin@example.com', '<paste-bcrypt-hash-here>', 'admin');
```

**Step 3 — Log in and generate invites via the API:**

```bash
# Login
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password-here"}' \
  -c cookies.txt

# Generate an invite (cookies.txt holds the auth cookie)
curl -X POST http://localhost:8000/v1/admin/invites \
  -H "Content-Type: application/json" \
  -d '{"expires_in_days":7}' \
  -b cookies.txt
```

Or use the interactive docs at `http://localhost:8000/docs`.

## Database Migrations

```bash
alembic upgrade head
```
