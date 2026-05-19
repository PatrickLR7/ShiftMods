# ShiftMods AI API

FastAPI backend for the ShiftMods Build Advisor — handles authentication, car profiles, and AI-powered product recommendations.

## Architecture

```
Browser (Next.js on Vercel)
        │
        │  httpOnly cookies (access + refresh tokens)
        ▼
Next.js API Routes (/api/auth/*)   ←── proxies auth endpoints so cookies
        │                               stay on the Vercel domain
        │  JWT in Authorization / cookie
        ▼
FastAPI on Render  ──► Supabase PostgreSQL (shift-mods schema)
        │
        ├──► Shopify Storefront API  (fetch product catalog)
        └──► Google Gemini Flash     (AI recommendations)
```

**Key design decisions:**
- Cookies are set by the Next.js proxy, not FastAPI directly, so `httpOnly` tokens stay on the frontend domain
- JWT verification runs at the Next.js Edge (middleware) using `jose` — no round-trip to the API for protected page loads
- Migrations run in Render's **build** step (once, before the process starts), not at startup

---

## Requirements

- Python 3.11+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) package manager
- A Supabase PostgreSQL database with the `shift-mods` schema

## Local Setup

```bash
cd shift-mods-api

# Install dependencies into .venv (created automatically by uv)
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your actual values

# Run database migrations
uv run alembic upgrade head

# Start the dev server
uv run uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Health check: `GET http://localhost:8000/health`
Interactive docs: `http://localhost:8000/docs`

## Development Commands

```bash
uv sync                                           # install all deps into .venv
uv sync --group dev                               # include dev dependencies
uv run uvicorn app.main:app --reload --port 8000  # run dev server
uv run pytest                                     # run tests
uv add <package>                                  # add a runtime dep
uv add --dev <package>                            # add a dev dep
```

---

## Environment Variables

See `.env.example` for the full template. All variables are required unless a default is noted.

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Async PostgreSQL URL (`postgresql+asyncpg://...`) | — |
| `SUPABASE_DB_SCHEMA` | Supabase schema name | `shift-mods` |
| `JWT_SECRET` | Strong random secret for signing JWTs | — |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime (rotating) | `7` |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `SHOPIFY_STOREFRONT_API_URL` | Shopify Storefront GraphQL endpoint | — |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Shopify Storefront access token | — |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | — |

Generate a strong `JWT_SECRET`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Generating the First Admin User

The first admin must be inserted directly — no invites exist yet to bootstrap through the API.

**Step 1 — Generate a bcrypt hash for your password:**

```bash
cd shift-mods-api
uv run python -c "import bcrypt; print(bcrypt.hashpw(b'your-password-here', bcrypt.gensalt()).decode())"
```

**Step 2 — Insert the admin user in Supabase SQL editor:**

```sql
INSERT INTO "shift-mods".users (email, hashed_password, role)
VALUES ('admin@example.com', '<paste-bcrypt-hash-here>', 'admin');
```

**Step 3 — Log in and generate invite tokens:**

```bash
# Login — saves the auth cookie to cookies.txt
curl -X POST https://<your-render-url>/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password-here"}' \
  -c cookies.txt

# Generate an invite (valid for 7 days)
curl -X POST https://<your-render-url>/v1/admin/invites \
  -H "Content-Type: application/json" \
  -d '{"expires_in_days":7}' \
  -b cookies.txt
```

Or use the interactive docs at `https://<your-render-url>/docs`.

---

## Database Migrations

```bash
# Apply all pending migrations
uv run alembic upgrade head

# Create a new migration after changing models
uv run alembic revision --autogenerate -m "describe change"
```

---

## Deployment (Render)

The repo includes `render.yaml` at the repository root for Render Blueprint deploys.

### Deploy steps

1. Push the repo to GitHub
2. In Render dashboard → **New** → **Blueprint** → connect the repo
3. Render will detect `render.yaml` and create the `shiftmods-api` web service
4. Set the secret environment variables manually in the Render dashboard (marked `sync: false` in `render.yaml`):
   - `DATABASE_URL` — Supabase pooler connection string
   - `JWT_SECRET` — your generated secret
   - `GEMINI_API_KEY`
   - `SHOPIFY_STOREFRONT_API_URL`
   - `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
   - `ALLOWED_ORIGINS` — set to your production Vercel URL, e.g. `https://shiftmods.vercel.app`
5. Deploy — Render will run `uv sync` + `alembic upgrade head` in the build step, then start uvicorn

### Verify deployment

```bash
curl https://<your-render-url>/health
# → {"status":"ok"}
```

Check the Render build logs to confirm migrations ran without errors.

### Connect the frontend (Vercel)

In the Vercel dashboard for the Next.js app, set:
- `NEXT_PUBLIC_API_URL` → `https://<your-render-url>/v1`
- `JWT_SECRET` → same value as in Render (used by Next.js middleware to verify tokens at the Edge)
