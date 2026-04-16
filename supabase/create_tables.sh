#!/usr/bin/env bash
# Create Luxival Supabase tables using the Supabase CLI.
# Usage: supabase db query < supabase/create_tables.sql
# Or run this script if the CLI is installed and configured:
#   ./supabase/create_tables.sh

set -euo pipefail

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI not found. Install it first: https://supabase.com/docs/guides/cli"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SQL_FILE="$SCRIPT_DIR/create_tables.sql"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "SQL file not found: $SQL_FILE"
  exit 1
fi

echo "Applying Supabase table schema from $SQL_FILE..."
supabase db query < "$SQL_FILE"

echo "Done. Tables created or verified."