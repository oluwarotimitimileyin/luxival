# Luxival Audit Backend — Fly.io Deployment

## First-time setup

```bash
# 1. Install Fly CLI (macOS)
brew install flyctl

# 2. Login to Fly.io
fly auth login

# 3. From the backend/ directory, launch the app
cd backend/
fly launch --name luxival-audit-api --region arn --no-deploy

# 4. Set environment secrets
fly secrets set \
  SUMUP_WEBHOOK_SECRET="your_sumup_webhook_secret" \
  SUPABASE_URL="https://your-project.supabase.co" \
  SUPABASE_ANON_KEY="your_supabase_anon_key"

# 5. Deploy
fly deploy
```

## After deploy

Your API will be live at: `https://luxival-audit-api.fly.dev`

The `audit.html` `BACKEND_API_URL` constant is already set to this URL.

## Set SumUp webhook

In your SumUp dashboard → Integrations → Webhooks:
- URL: `https://luxival-audit-api.fly.dev/webhook/sumup`
- Events: `PAYMENT_COMPLETED`
- Copy the signing secret → add to Fly secrets as `SUMUP_WEBHOOK_SECRET`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| POST | `/scan/free` | Free 12-check scan (rate limited: 10/hour) |
| POST | `/scan/premium` | Full 7-flow scan (rate limited: 5/hour) |
| POST | `/webhook/sumup` | SumUp payment webhook |

## Local development

```bash
cd backend/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env  # fill in values
uvicorn main:app --reload --port 8080
```

## Re-deploy after code changes

```bash
cd backend/
fly deploy
```
