# ESG Compliance Auditor - AI Not Working? Here's the Fix

## 🔴 The Issue

The ESG demo on your portfolio page shows the **UI perfectly** ✅ but the **AI features don't work** ❌

This is because the demo needs two servers running:

| Component | Status | Issue |
|-----------|--------|-------|
| 🎨 **Frontend UI** (React/Vite) | ✅ Works | Loads and renders in iframe |
| 🤖 **Backend API** (Node.js) | ❌ Not Running | Needs to be started manually |

Without the backend, users can see the interface but get errors when trying to analyze documents.

---

## ✅ Solution: Start the Backend Server

The backend is not running because it requires:
1. **Node.js installation** with npm
2. **Google Cloud credentials** for Vertex AI access
3. **Manual startup** on port 5000

### Step-by-Step Fix

#### Step 1: Check Node.js is Installed
```bash
node --version    # Should show v18 or higher
npm --version     # Should show v9 or higher
```

#### Step 2: Authenticate with Google Cloud (First Time Only)
```bash
gcloud auth application-default login
```

This opens a browser where you authorize access to your Google Cloud project.

#### Step 3: Navigate to Backend Directory
```bash
cd /Users/olakunleshopeju/Documents/luxival/_site/portfolio/esg-compliance-auditor/backend
```

#### Step 4: Install Dependencies
```bash
npm install
```

This downloads the Node packages (express, google-auth, etc.)

#### Step 5: Start the Backend Server
```bash
node server.js
```

You should see:
```
✓ Backend server is running on http://127.0.0.1:5000
```

#### Step 6: Keep This Terminal Open
The backend runs forever until you press `Ctrl+C`.

#### Step 7: In a NEW Terminal, Start the Frontend Dev Server
```bash
cd /Users/olakunleshopeju/Documents/luxival
npm run dev
```

#### Step 8: Visit the Portfolio Page
Go to: **http://localhost:8080/portfolio**

Scroll to the **ESG Compliance Auditor** section and test it!

---

## 📍 Location Reference

```
luxival/
├── _site/
│   └── portfolio/
│       └── esg-compliance-auditor/
│           ├── backend/              ← START HERE: npm install && node server.js
│           │   ├── server.js
│           │   └── .env.local        ← Contains Google Cloud config
│           └── frontend/
│               └── dist/             ← Built React app served in iframe
├── apps/
│   └── esg-backend/                ← Alternative location (setup instructions)
└── ESG-BACKEND-SETUP.md            ← Full detailed guide
```

---

## 🔧 Configuration Details

### Environment Variables (`.env.local`)

```env
API_BACKEND_HOST = "127.0.0.1"                      # Localhost only (secure)
API_BACKEND_PORT = 5000                              # Backend port
GOOGLE_CLOUD_PROJECT = "silver-area-373314"          # Your GCP project
GOOGLE_CLOUD_LOCATION = "global"                     # Vertex AI location  
PROXY_HEADER = "S3PqV29jKSqE8Ntb8pXLucIRSnOwaapk"   # API security token
```

### What Each Part Does

| Part | Role |
|------|------|
| **Frontend** `_site/portfolio/esg-compliance-auditor/frontend/dist/` | React UI that users interact with |
| **Backend** `_site/portfolio/esg-compliance-auditor/backend/server.js` | Node.js server that connects to Google Vertex AI |
| **Google Vertex AI** | The actual AI model that analyzes ESG documents |

---

## ⚙️ How It All Works Together

```
User visits http://localhost:8080/portfolio
           ↓
Browser loads portfolio page with ESG iframe
           ↓
Iframe loads frontend from: /portfolio/esg-compliance-auditor/frontend/dist/
           ↓
User uploads ESG document in the UI
           ↓
Frontend calls backend API: http://localhost:5000/api-proxy
           ↓
Backend authenticates with Google Cloud
           ↓
Backend sends document to Google Vertex AI
           ↓
Vertex AI analyzes document with Gemini LLM
           ↓
Backend returns analysis results to frontend
           ↓
Frontend displays results in the UI
```

---

## 🐛 Troubleshooting

### "Cannot GET /api-proxy"
**Problem:** Backend isn't running

**Fix:**
```bash
cd _site/portfolio/esg-compliance-auditor/backend
node server.js
```

Check the other terminal - you should see the backend starting message.

### "Error: GOOGLE_CLOUD_PROJECT is not set"
**Problem:** `.env.local` file is missing or invalid

**Fix:**
Check that this file exists:
```bash
ls _site/portfolio/esg-compliance-auditor/backend/.env.local
```

It should contain the Google Cloud project ID.

### "npm ERR! 403 Forbidden"
**Problem:** Network/npm registry issue (common in sandboxes)

**Fix:**
Try running outside VS Code, or run the command in your system terminal directly.

### "gcloud: command not found"
**Problem:** Google Cloud SDK not installed

**Fix:**
```bash
# Install gcloud CLI from: https://cloud.google.com/sdk/docs/install
brew install --cask google-cloud-sdk  # On macOS
```

Then authenticate:
```bash
gcloud auth application-default login
```

### "Error: Cannot find module 'express'"
**Problem:** Dependencies not installed

**Fix:**
```bash
cd _site/portfolio/esg-compliance-auditor/backend
npm install
```

---

## ✨ Testing the Backend

### Test 1: Check Backend Health
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok"}
```

### Test 2: Check Frontend Loads
```bash
curl http://localhost:8080/portfolio/esg-compliance-auditor/frontend/dist/
```

Should return the HTML page.

### Test 3: Browser Console
1. Visit portfolio page
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Try uploading an ESG document
5. Watch for network requests and errors

---

## 🚀 Quick Reference

**For Development:**

Terminal 1 (Backend):
```bash
cd _site/portfolio/esg-compliance-auditor/backend
node server.js
# Keep running - don't close this terminal
```

Terminal 2 (Frontend):
```bash
npm run dev
# Visit http://localhost:8080/portfolio
```

**To Stop:**
- Backend: Press `Ctrl+C` in Terminal 1
- Frontend: Press `Ctrl+C` in Terminal 2

**To Restart:**
Just repeat the commands above.

---

## 📞 Getting Help

When troubleshooting, check:

1. **Is Node.js installed?**
   ```bash
   node --version
   ```

2. **Is the backend running?**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Are Google Cloud credentials set?**
   ```bash
   echo $GOOGLE_APPLICATION_CREDENTIALS
   # Or check: ~/.config/gcloud/application_default_credentials.json
   ```

4. **Is the frontend dev server running?**
   - Visit http://localhost:8080 in your browser

5. **Check the logs**
   - Look at the terminal where you ran `node server.js`
   - Look at browser DevTools Console (F12)

---

## 📋 Environment Checklist

Before running the backend, verify:

- [ ] Node.js v18+ installed
- [ ] `gcloud` CLI installed
- [ ] Authenticated: `gcloud auth application-default login`
- [ ] Backend `.env.local` file exists
- [ ] `GOOGLE_CLOUD_PROJECT` is set to `silver-area-373314`
- [ ] `GOOGLE_CLOUD_LOCATION` is set to `global`

---

## 🎯 Success Indicators

When everything is working:

✅ Backend terminal shows: `Backend server is running on http://127.0.0.1:5000`
✅ Frontend loads at: `http://localhost:8080/portfolio`
✅ ESG iframe displays: `http://localhost:8080/portfolio/esg-compliance-auditor/frontend/dist/`
✅ Document upload button works without errors
✅ Analysis completes and shows results

---

## 🔄 Next Steps

1. **Get the backend running** following the steps above
2. **Test with a sample ESG document** 
3. **Collect feedback** on the analysis quality
4. **Plan production deployment** (different hosting approach)

---

**Last updated:** May 20, 2026
**Status:** Local development environment setup
