# Montage Graphics — API

FastAPI + MongoDB (Motor, async) + Cloudinary. Serves the public data your
React frontend reads (client logos, work images) and a JWT-protected admin
API for managing them.

```
app/
  main.py                  app factory: wires routers, CORS, DB lifecycle
  config.py                settings loaded from environment variables
  database.py               Motor client setup + index creation
  core/
    security.py             JWT create/verify, password check
    deps.py                 get_current_admin — guards admin routes
  schemas/
    common.py                ObjectId <-> str helper for Pydantic models
    client.py                Client request/response shapes
    work_image.py             WorkImage request/response shapes
    auth.py                   Login + upload-signature response shapes
    invoice.py                Invoice request/response shapes
  routers/
    clients.py               GET /clients                  (public)
    work.py                  GET /clients/{slug}/work       (public)
    auth.py                  POST /auth/login
    public_invoices.py       GET /i/{public_id}             (public)
                              GET /i/{public_id}/pdf         (public)
    admin_clients.py         POST/PATCH/DELETE /admin/clients   (protected)
    admin_work.py            POST/DELETE /admin/.../work        (protected)
    upload.py                GET /admin/upload-signature         (protected)
    admin_invoices.py        POST /admin/invoices                (protected)
                              GET /admin/invoices                 (protected)
                              GET /admin/invoices/{public_id}     (protected)
                              POST /admin/invoices/{public_id}/void (protected)
  services/
    cloudinary_service.py    signs direct-to-Cloudinary uploads
    invoice_service.py       invoice numbering, totals, create/void
    verification_service.py  HMAC anti-forgery code for printed invoices
    pdf_service.py           Jinja2 render -> WeasyPrint, embeds QR code
  templates/
    invoice.html              Jinja2 template, shared by the HTML view and PDF
```

## Data model (MongoDB)

**clients**
| field | type | notes |
|---|---|---|
| name | str | |
| slug | str | unique, used in URLs |
| logo_url | str | Cloudinary URL |
| trusted_by_order | int | display order in the logo reel |
| is_visible | bool | hide without deleting |

**work_images**
| field | type | notes |
|---|---|---|
| client_id | str | references a client's `_id` |
| image_url | str | Cloudinary URL |
| caption | str | |
| display_order | int | order within that client's grid |

**invoices**
| field | type | notes |
|---|---|---|
| public_id | str | unique, random (`secrets.token_urlsafe(16)`) — the shareable link, never guessable |
| invoice_number | str | e.g. `MG-INV-2026-014`, atomic per-year counter |
| client_name | str | |
| date / due_date | date | |
| items | list | embedded `{description, quantity, unit_price}` |
| subtotal / tax / total / balance | float | computed server-side at creation |
| verification_code | str | HMAC-derived, printed with a QR code on the PDF |
| voided | bool | invoices are immutable once issued — corrections are a new invoice, not an edit |
| created_by | str | admin username |

Routes:
- `POST /admin/invoices` (protected) — admin fills a form, backend computes totals + numbering
- `GET /i/{public_id}` (public) — HTML view, printable
- `GET /i/{public_id}/pdf` (public) — same template through WeasyPrint
- `POST /admin/invoices/{public_id}/void` (protected) — flags a record, doesn't delete/edit it

## Setup

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `.env`:
- `MONGODB_URI` — from MongoDB Atlas (free tier is fine) or a local instance
- `CLOUDINARY_*` — from your Cloudinary dashboard's "API Environment variable"
- `ADMIN_PASSWORD_HASH` — generate with:
  ```bash
  python -c "from passlib.hash import bcrypt; print(bcrypt.hash('yourpassword'))"
  ```
- `CORS_ORIGINS` — include your local Vite URL and your deployed frontend URL

## Run locally

```bash
uvicorn app.main:app --reload
```

API docs (interactive) at `http://localhost:8000/docs`.

## How uploads work

1. Frontend admin panel calls `GET /admin/upload-signature` (JWT required)
2. Backend returns a signed payload (timestamp, signature, api key, cloud
   name) — the Cloudinary **secret** never leaves the server
3. Browser uploads the file **directly to Cloudinary** using that signed
   payload — the image bytes never pass through this API
4. Cloudinary responds with the resulting URL
5. Frontend sends just that URL + metadata to `POST /admin/clients` or
   `POST /admin/clients/{id}/work` to save it

## Deployment

This API is **not** meant to run as a Vercel serverless function — MongoDB
connections and always-on processes are a poor fit for that model. Deploy
it instead to Railway, Render, or Fly.io (all have FastAPI-friendly free/low
tiers), then point your Vercel-hosted frontend at that URL via an
environment variable (e.g. `VITE_API_URL`).

Typical Railway/Render start command:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Invoice PDFs need a Dockerfile, not the native buildpack.** WeasyPrint
depends on system libraries (Pango, Cairo, GDK-PixBuf) that Render's plain
Python buildpack won't install — only `pip install` runs there. A
`Dockerfile` is included in this folder with those `apt-get` packages
pinned. On Render: change the service's environment to **Docker** (instead
of "Python 3"), point it at this `backend/` folder, and it will pick up
the Dockerfile automatically. No start command override needed — the
Dockerfile's `CMD` handles it, but Render still needs `$PORT` respected;
if your plan requires binding to Render's injected port, override the
`CMD` to `uvicorn app.main:app --host 0.0.0.0 --port $PORT` in the
service settings.
