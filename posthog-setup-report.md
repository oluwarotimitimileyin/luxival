<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Luxival Audit Platform FastAPI backend.

## Summary of changes

**`backend/requirements.txt`** — added `posthog>=3.0.0`.

**`backend/.env`** — set `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` (EU region).

**`backend/main.py`** — the following were added:
- `from posthog import Posthog` import alongside `atexit` and `asynccontextmanager`.
- A `_user_id(email)` helper that SHA-256 hashes the email to produce a stable, non-PII `distinct_id`.
- An `asynccontextmanager` lifespan that initialises `Posthog(enable_exception_autocapture=True)` on startup, registers `posthog_client.shutdown` with `atexit`, and calls `posthog_client.shutdown()` on graceful shutdown.
- The `FastAPI` app was updated to pass `lifespan=lifespan`.
- Eight `posthog_client.capture()` calls inserted across the three API routes (see table below). All `distinct_id` values are hashed; no raw email or PII appears in event properties.

## Events

| Event | Description | File |
|---|---|---|
| `free_scan_requested` | User submits a free website audit scan request | `backend/main.py` |
| `free_scan_completed` | Free scan finishes successfully; properties include `scan_id`, `score`, `max_score`, `tier` | `backend/main.py` |
| `free_scan_failed` | Free scan raises a `RuntimeError`; request returns 422 | `backend/main.py` |
| `premium_scan_requested` | User submits a premium scan after payment is verified | `backend/main.py` |
| `premium_scan_completed` | Premium scan finishes successfully; properties include `scan_id`, `overall_score`, `max_score`, `tier` | `backend/main.py` |
| `premium_scan_failed` | Premium scan raises a `RuntimeError`; request returns 422 | `backend/main.py` |
| `payment_verified` | SumUp webhook received and payment marked paid; property: `checkout_id` | `backend/main.py` |
| `payment_rejected` | Premium scan attempted with missing or unverified token; property: `reason` | `backend/main.py` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/713855)
- [Scan volume — free vs premium](/insights/6KDeyLfc)
- [Free scan completion funnel](/insights/esEFq4ik)
- [Full monetisation funnel](/insights/5hhF8Baq)
- [Payment rejections over time](/insights/QBP8Qfe0)
- [Scan failures — free vs premium](/insights/N4nCAja9)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
