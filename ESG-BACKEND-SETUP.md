# ESG Compliance Auditor - AI Backend Setup Guide

## 🔍 What's the Problem?

✅ **Frontend**: Working perfectly - UI loads in the iframe
❌ **Backend**: Not running - AI analysis can't execute

The ESG app has two parts:
- **Frontend** (React/Vite): UI that displays analysis forms and results
- **Backend** (Node.js/Express): Connects to Google Vertex AI to perform actual ESG analysis

Without the backend running, users see the UI but get errors when trying to analyze documents.

## 🛠️ Setup Requirements

Before starting the backend, make sure you have:

1. **Google Cloud Project** - Already configured in `.env.local`:
   - Project ID: `silver-area-373314`
   - Location: `global`
   - Proxy header: Set

2. **Google Cloud Credentials** - Run this once:
   ```bash
   gcloud auth application-default login
   ```
   This authenticates your local machine to use Google Cloud APIs.

3. **Node.js 18+** - Check with:
   ```bash
   node --version
   ```

## 🚀 Quick Start

### Step 1: Install Backend Dependencies
```bash
cd /Users/olakunleshopeju/Documents/luxival/_site/portfolio/esg-compliance-auditor/backend
npm install
```

### Step 2: Authenticate with Google Cloud (One-time)
```bash
gcloud auth application-default login
```
This opens a browser to authenticate. Choose the Google account with access to the `silver-area-373314` project.

### Step 3: Start the Backend Server
```bash
cd /Users/olakunleshopeju/Documents/luxival/_site/portfolio/esg-compliance-auditor/backend
node server.js
```

You should see:
```
Backend server running on http://127.0.0.1:5000
```

### Step 4: In a New Terminal, Start the Dev Server
```bash
cd /Users/olakunleshopeju/Documents/luxival
npm run dev
```

### Step 5: Test the ESG Demo
Visit: **http://localhost:8080/portfolio**

Scroll to the **ESG Compliance Auditor** section and try the demo!

---

## 📋 Environment File Reference

Location: `_site/portfolio/esg-compliance-auditor/backend/.env.local`

```env
# Backend server config
API_BACKEND_HOST = "127.0.0.1"          # Only localhost (secure)
API_BACKEND_PORT = 5000                 # Port for backend

# Google Cloud config
GOOGLE_CLOUD_LOCATION = "global"        # Vertex AI location
GOOGLE_CLOUD_PROJECT = "silver-area-373314"  # Your GCP project

# Security
PROXY_HEADER = "S3PqV29jKSqE8Ntb8pXLucIRSnOwaapk"  # API security token
```

---

## 🔗 API Routes

Once running, the backend exposes:

- `POST /api-proxy` - Forward requests to Vertex AI
- `GET /health` - Health check endpoint

The frontend automatically connects to `http://localhost:5000` when analyzing documents.

---

## ⚠️ Troubleshooting

### "Cannot connect to backend"
- Make sure `node server.js` is running in another terminal
- Check: `curl http://localhost:5000/health`

### "Permission denied" when installing
- Try: `chmod -R 755 _site/portfolio/esg-compliance-auditor/backend`
- Then: `npm install` again

### "Google Cloud authentication failed"
- Run: `gcloud auth application-default login`
- Make sure you're logged into the correct Google account
- Verify the project ID in `.env.local` matches your GCP project

### "EPERM: operation not permitted" errors
- The `.vscode/tmp` sandboxing is causing issues
- These errors don't affect the app - ignore them

---

## 📦 What Gets Installed

```
backend/node_modules/
├── express              - Web server
├── google-auth-library  - GCP authentication
├── node-fetch           - HTTP client
├── ws                   - WebSocket support
└── express-rate-limit   - API rate limiting
```

Total: ~150 packages, ~50MB

---

## 🎯 Production Deployment

For production, you'll need to:

1. **Move backend outside `_site/`** (it gets rebuilt/deleted)
2. **Use environment variables** from your hosting (Fly.io, Vercel, etc.)
3. **Set up HTTPS** for the API
4. **Configure CORS** if frontend and backend are on different domains

Current setup is **local development only**.

---

## ✅ Testing the Full Flow

### Test 1: Backend Health
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

### Test 2: Frontend Direct
Visit: `http://localhost:8080/portfolio/esg-compliance-auditor/frontend/dist/`

### Test 3: Portfolio Page
Visit: `http://localhost:8080/portfolio/`
Scroll to ESG section and try a demo analysis.

---

## 📞 Need Help?

Check the browser console for errors:
1. Open DevTools (F12 on portfolio page)
2. Go to **Console** tab
3. Try analyzing a document
4. Look for error messages

Common errors:
- `ERR_HTTP_REQUEST_TIMEOUT` → Backend not running
- `CORS error` → Backend not accepting requests
- `401 Unauthorized` → Google Cloud credentials not set up

---

## 🔄 Next Steps

Once the backend is working:

1. **Test the demo** with sample ESG documents
2. **Collect user feedback** on the UI
3. **Plan production deployment**
4. **Set up error logging** for debugging issues

---

Last updated: May 20, 2026
