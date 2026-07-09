#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_BACKEND=false
SKIP_SEO_CHECK=false
ALLOW_DIRTY=false
SKIP_PUSH=false

usage() {
  cat <<'EOF'
Usage: bash scripts/deploy-luxival.sh [options]

Options:
  --backend         Deploy backend after frontend deploy checks pass
  --skip-seo-check  Run build only, skip seo:deploy-check
  --allow-dirty     Continue even if git working tree is dirty
  --skip-push       Run validation only, do not push to origin/main
  --help            Show this help message

Default behavior:
  1. Require a clean git working tree.
  2. Run npm run seo:deploy-check.
  3. Push main to origin.
  4. Optionally run backend/fly deploy.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backend)
      DEPLOY_BACKEND=true
      ;;
    --skip-seo-check)
      SKIP_SEO_CHECK=true
      ;;
    --allow-dirty)
      ALLOW_DIRTY=true
      ;;
    --skip-push)
      SKIP_PUSH=true
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
}

require_clean_worktree() {
  local changed_files
  changed_files="$(git status --short)"

  if [[ -n "$changed_files" && "$ALLOW_DIRTY" != true ]]; then
    echo "Refusing to deploy with uncommitted changes:" >&2
    echo "$changed_files" >&2
    echo >&2
    echo "Commit or stash the changes first, or rerun with --allow-dirty if you intentionally want to deploy the current checkout." >&2
    exit 1
  fi
}

require_main_branch() {
  local branch
  branch="$(git branch --show-current)"

  if [[ "$branch" != "main" && "$SKIP_PUSH" != true ]]; then
    echo "Current branch is '$branch'. Switch to 'main' before running this script, or rerun with --skip-push for validation only." >&2
    exit 1
  fi
}

run_frontend_checks() {
  cd "$ROOT_DIR"
  if [[ "$SKIP_SEO_CHECK" == true ]]; then
    npm run clean
    npm run build
  else
    npm run seo:deploy-check
  fi
}

push_frontend() {
  if [[ "$SKIP_PUSH" == true ]]; then
    echo "Skipping git push because --skip-push was provided."
    return
  fi

  git push origin main
}

deploy_backend() {
  cd "$ROOT_DIR/backend"
  require_command fly
  fly deploy
}

main() {
  require_command git
  require_command npm

  cd "$ROOT_DIR"
  require_clean_worktree
  require_main_branch
  run_frontend_checks
  push_frontend

  if [[ "$DEPLOY_BACKEND" == true ]]; then
    deploy_backend
  fi
}

main