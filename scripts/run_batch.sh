#!/bin/bash
# Batch process tool pages
# Usage: ./run_batch.sh [--ai] [category]

set -e
cd "$(dirname "$0")/.."

# Install dependencies if needed
if ! python3 -c "import requests, bs4, yaml" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -r scripts/requirements.txt
fi

AI_FLAG=""
CATEGORY=""

for arg in "$@"; do
    case $arg in
        --ai) AI_FLAG="--ai" ;;
        *) CATEGORY="$arg" ;;
    esac
done

if [ -n "$CATEGORY" ]; then
    echo "Processing category: $CATEGORY"
    python3 scripts/generate_tool_page.py --batch "data/_tools/$CATEGORY" $AI_FLAG
else
    echo "Processing all incomplete tools..."
    python3 scripts/generate_tool_page.py --all $AI_FLAG
fi

echo "Done!"
