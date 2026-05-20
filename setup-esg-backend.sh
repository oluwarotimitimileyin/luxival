#!/bin/bash

# ESG Compliance Auditor - Backend Setup & Start Script
# This script sets up and starts the ESG backend server

set -e

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
BACKEND_DIR="$PROJECT_ROOT/_site/portfolio/esg-compliance-auditor/backend"
FRONTEND_DIR="$PROJECT_ROOT/_site/portfolio/esg-compliance-auditor/frontend"

echo "═══════════════════════════════════════════════════════"
echo "ESG Compliance Auditor - Backend Setup"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Error: Backend directory not found at:"
    echo "   $BACKEND_DIR"
    echo ""
    echo "Make sure you have built the site with:"
    echo "   npm run build"
    exit 1
fi

echo "📁 Backend directory: $BACKEND_DIR"
echo ""

# Check environment file
if [ ! -f "$BACKEND_DIR/.env.local" ]; then
    echo "❌ Error: .env.local not found in backend directory"
    echo "   Backend cannot start without environment variables"
    exit 1
fi

echo "✓ Environment file found"

# Check for Google Cloud credentials
if ! command -v gcloud &> /dev/null; then
    echo "⚠️  Warning: 'gcloud' CLI not found. Make sure you have:"
    echo "   - Google Cloud SDK installed"
    echo "   - Configured with: gcloud auth application-default login"
    echo ""
fi

# Install dependencies if not already installed
echo ""
echo "📦 Checking dependencies..."

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm install
    cd "$PROJECT_ROOT"
else
    echo "✓ Backend dependencies already installed"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Setup complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🚀 To start the backend server, run:"
echo ""
echo "   cd $BACKEND_DIR"
echo "   node server.js"
echo ""
echo "📝 Environment variables in $BACKEND_DIR/.env.local:"
grep -v "^#" "$BACKEND_DIR/.env.local" | grep "=" | sed 's/^/   - /'
echo ""
echo "💡 The backend will start on: http://localhost:5000"
echo "   The frontend will connect to this for AI analysis"
echo ""
echo "🌐 Once both servers are running:"
echo "   - Frontend dev: npm run dev (already running on port 8080)"
echo "   - Backend:      $BACKEND_DIR/server.js (port 5000)"
echo "   - Portfolio page: http://localhost:8080/portfolio/"
echo ""
