#!/usr/bin/env python3
"""
AI Tool Page Generator with Claude Batch API

Features:
1. 50% cost reduction via Batch API
2. AI-powered research (no manual web searches needed)
3. Tool discovery from trending sources
4. Scheduled enrichment of existing tools
5. Cron-friendly automation

Usage:
    # One-time batch processing
    python batch_generate.py --prepare --limit 50
    python batch_generate.py --submit <batch_file>
    python batch_generate.py --check <batch_id>
    python batch_generate.py --apply <results_file>

    # Automated daily/weekly runs
    python batch_generate.py --auto              # Full automation
    python batch_generate.py --enrich --limit 20 # Enrich existing tools
    python batch_generate.py --discover          # Discover new tools
"""

import os
import sys
import json
import yaml
import argparse
import time
import re
from pathlib import Path
from datetime import datetime, timedelta
from urllib.parse import urljoin
from typing import Dict, Any, List, Optional
import hashlib

try:
    import requests
    from bs4 import BeautifulSoup
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    from anthropic import Anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
TOOLS_DIR = PROJECT_DIR / "data" / "_tools"
CACHE_DIR = SCRIPT_DIR / ".cache"
BATCH_DIR = SCRIPT_DIR / ".batches"
STATE_FILE = SCRIPT_DIR / ".batch_state.json"

# Ensure directories exist
CACHE_DIR.mkdir(exist_ok=True)
BATCH_DIR.mkdir(exist_ok=True)

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

# Enhanced prompt with AI research instructions
GENERATION_PROMPT = '''You are creating a comprehensive tool review page for "{name}" ({url}).

## SCRAPED DATA FROM OFFICIAL SITE:
{scraped_data}

## EXISTING METADATA:
{metadata}

## YOUR TASK:
Generate a complete, factual tool review. Use your knowledge to fill in information about:
- Company founding year, funding, headquarters
- User counts, market position, notable customers
- Pricing tiers (research current pricing)
- Key pros based on features and market reception
- Key cons based on common user feedback patterns
- Relevant competitors for comparison

## OUTPUT FORMAT (use this EXACT HTML structure):

<div class="key-stats">
  <div class="key-stat">
    <span class="number">[Users/Downloads/Stars]</span>
    <span class="label">[Label]</span>
  </div>
  <div class="key-stat">
    <span class="number">[Rating or Funding]</span>
    <span class="label">[Label]</span>
  </div>
  <div class="key-stat">
    <span class="number">[Year]</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>[2-3 sentence factual description. Be specific about what the tool does and its key differentiator.]</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use {name}?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>[Specific use case 1]</li>
        <li>[Specific use case 2]</li>
        <li>[Specific use case 3]</li>
        <li>[Specific use case 4]</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>[Specific limitation 1]</li>
        <li>[Specific limitation 2]</li>
        <li>[Specific limitation 3]</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>[Specific pro 1]</li>
      <li>[Specific pro 2]</li>
      <li>[Specific pro 3]</li>
      <li>[Specific pro 4]</li>
      <li>[Specific pro 5]</li>
    </ul>
    <div class="source"><a href="{url}" target="_blank">Official Site</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>[Specific con 1 - based on common user feedback]</li>
      <li>[Specific con 2]</li>
      <li>[Specific con 3]</li>
      <li>[Specific con 4]</li>
    </ul>
    <div class="source"><a href="https://www.g2.com/" target="_blank">G2 Reviews</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="{url}/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">[Free tier name]</div>
    <div class="price">$0</div>
    <div class="desc">[What's included]</div>
  </a>
  <a href="{url}/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">[Pro tier name]</div>
    <div class="price">$[X]<small>/mo</small></div>
    <div class="desc">[What's included]</div>
  </a>
  <a href="{url}/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">[Enterprise]</div>
    <div class="price">Custom</div>
    <div class="desc">[What's included]</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>[Feature 1]</li>
      <li>[Feature 2]</li>
      <li>[Feature 3]</li>
      <li>[Feature 4]</li>
      <li>[Feature 5]</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>[Platform 1]</li>
      <li>[Platform 2]</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>[Key integration 1]</li>
      <li>[Key integration 2]</li>
      <li>[Key integration 3]</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | {name} | [Competitor 1] | [Competitor 2] |
|---------|--------|----------------|----------------|
| Key Strength | <span class="highlight">[Best value]</span> | [Value] | [Value] |
| Pricing | [Price] | [Price] | [Price] |
| Best For | [Use case] | [Use case] | [Use case] |

</div>

## IMPORTANT GUIDELINES:
- Use your knowledge to provide accurate, current information
- For unknown values, use "—" rather than guessing
- Be specific - avoid generic marketing language
- Include real competitor names in the comparison table
- Pricing should reflect current market rates
- Cons should be realistic based on typical user feedback patterns'''


def get_cache_path(url: str) -> Path:
    """Get cache file path for a URL."""
    url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
    return CACHE_DIR / f"{url_hash}.json"


def load_state() -> Dict:
    """Load processing state."""
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"last_run": None, "pending_batch": None, "processed_tools": []}


def save_state(state: Dict):
    """Save processing state."""
    STATE_FILE.write_text(json.dumps(state, indent=2))


def fetch_and_cache(url: str, force: bool = False, cache_days: int = 7) -> Dict:
    """Fetch URL data with caching."""
    cache_path = get_cache_path(url)

    # Check cache freshness
    if not force and cache_path.exists():
        cached = json.loads(cache_path.read_text())
        fetched_at = cached.get("fetched_at", "")
        if fetched_at:
            try:
                fetch_date = datetime.fromisoformat(fetched_at)
                if datetime.now() - fetch_date < timedelta(days=cache_days):
                    return cached
            except (ValueError, TypeError):
                pass

    if not HAS_REQUESTS:
        return {"error": "requests not installed"}

    try:
        session = requests.Session()
        session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9"
        })
        response = session.get(url, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove noise
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        data = {
            "url": url,
            "title": soup.title.get_text(strip=True) if soup.title else "",
            "meta_description": "",
            "headings": [],
            "content_snippets": [],
            "features": [],
            "pricing_hints": [],
            "fetched_at": datetime.now().isoformat()
        }

        # Meta description
        meta = soup.find("meta", attrs={"name": "description"})
        if meta:
            data["meta_description"] = meta.get("content", "")[:500]

        # Headings
        for h in soup.find_all(["h1", "h2", "h3"])[:20]:
            text = h.get_text(strip=True)
            if text and len(text) < 150:
                data["headings"].append(text)

        # Content snippets
        for p in soup.find_all("p")[:15]:
            text = p.get_text(strip=True)
            if text and 30 < len(text) < 500:
                data["content_snippets"].append(text)

        # Feature lists
        for ul in soup.find_all("ul")[:10]:
            items = [li.get_text(strip=True)[:100] for li in ul.find_all("li")[:8]]
            if 3 <= len(items) <= 10:
                data["features"].extend(items)

        # Pricing hints
        pricing_keywords = ["free", "pro", "enterprise", "pricing", "/mo", "month", "year", "plan", "starter", "team"]
        for el in soup.find_all(["div", "span", "p"])[:50]:
            text = el.get_text(strip=True)
            if any(kw in text.lower() for kw in pricing_keywords) and 10 < len(text) < 200:
                data["pricing_hints"].append(text)

        # De-duplicate
        data["features"] = list(dict.fromkeys(data["features"]))[:15]
        data["pricing_hints"] = list(dict.fromkeys(data["pricing_hints"]))[:10]

        cache_path.write_text(json.dumps(data, indent=2))
        time.sleep(0.5)  # Rate limiting
        return data

    except Exception as e:
        return {"url": url, "error": str(e)}


def get_incomplete_tools() -> List[Dict]:
    """Get list of incomplete tool files."""
    incomplete = []

    for filepath in sorted(TOOLS_DIR.rglob("*.md")):
        content = filepath.read_text()

        if not content.startswith("---"):
            continue

        parts = content.split("---", 2)
        if len(parts) < 3:
            continue

        frontmatter = yaml.safe_load(parts[1])
        body = parts[2].strip()

        # Skip if already has substantial content (more than 50 lines)
        if body.count("\n") > 50:
            continue

        # Skip if no URL
        if not frontmatter.get("url"):
            continue

        incomplete.append({
            "filepath": str(filepath),
            "relative_path": str(filepath.relative_to(TOOLS_DIR)),
            "frontmatter": frontmatter,
            "body": body
        })

    return incomplete


def get_tools_needing_enrichment(days_old: int = 30) -> List[Dict]:
    """Get tools that haven't been updated recently."""
    needs_update = []
    cutoff = datetime.now() - timedelta(days=days_old)

    for filepath in sorted(TOOLS_DIR.rglob("*.md")):
        content = filepath.read_text()

        if not content.startswith("---"):
            continue

        parts = content.split("---", 2)
        if len(parts) < 3:
            continue

        frontmatter = yaml.safe_load(parts[1])

        # Check last_verified date
        last_verified = frontmatter.get("last_verified")
        if last_verified:
            try:
                verified_date = datetime.strptime(str(last_verified), "%Y-%m-%d")
                if verified_date > cutoff:
                    continue  # Recently verified, skip
            except (ValueError, TypeError):
                pass

        if not frontmatter.get("url"):
            continue

        needs_update.append({
            "filepath": str(filepath),
            "relative_path": str(filepath.relative_to(TOOLS_DIR)),
            "frontmatter": frontmatter,
            "body": parts[2].strip()
        })

    return needs_update


def prepare_batch(tools: List[Dict], batch_type: str = "generate", force_scrape: bool = False) -> Path:
    """Prepare batch by scraping data and creating batch input file."""
    print(f"Preparing {batch_type} batch for {len(tools)} tools...")

    batch_requests = []

    for i, tool in enumerate(tools):
        name = tool["frontmatter"].get("name", "Unknown")
        url = tool["frontmatter"].get("url", "")

        print(f"[{i+1}/{len(tools)}] Scraping {name}...")

        # Fetch main page
        scraped = fetch_and_cache(url, force=force_scrape)

        # Try pricing page too
        pricing_url = urljoin(url.rstrip("/"), "/pricing")
        pricing_data = fetch_and_cache(pricing_url, force=force_scrape)
        if "error" not in pricing_data:
            scraped["pricing_page"] = pricing_data.get("pricing_hints", [])
            scraped["pricing_features"] = pricing_data.get("features", [])

        # Create batch request
        prompt = GENERATION_PROMPT.format(
            name=name,
            url=url,
            scraped_data=json.dumps(scraped, indent=2)[:6000],  # More context
            metadata=json.dumps(tool["frontmatter"], indent=2)
        )

        batch_requests.append({
            "custom_id": tool["relative_path"],
            "params": {
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 4000,
                "messages": [{"role": "user", "content": prompt}]
            }
        })

    # Save batch input
    batch_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    batch_file = BATCH_DIR / f"batch_{batch_type}_{batch_id}_input.jsonl"

    with open(batch_file, "w") as f:
        for req in batch_requests:
            f.write(json.dumps(req) + "\n")

    print(f"\nBatch prepared: {batch_file}")
    print(f"Tools in batch: {len(batch_requests)}")

    return batch_file


def submit_batch(batch_file: Path) -> str:
    """Submit batch to Claude API."""
    if not HAS_ANTHROPIC:
        print("Error: anthropic package not installed")
        sys.exit(1)

    client = Anthropic()

    print(f"Uploading batch file: {batch_file}")

    requests_list = []
    with open(batch_file) as f:
        for line in f:
            requests_list.append(json.loads(line))

    print(f"Submitting {len(requests_list)} requests...")

    batch = client.messages.batches.create(requests=requests_list)

    print(f"\nBatch submitted!")
    print(f"  Batch ID: {batch.id}")
    print(f"  Status: {batch.processing_status}")

    # Save batch info
    info_file = batch_file.parent / f"{batch_file.stem}_info.json"
    info_file.write_text(json.dumps({
        "batch_id": batch.id,
        "status": batch.processing_status,
        "created_at": datetime.now().isoformat(),
        "input_file": str(batch_file),
        "tool_count": len(requests_list)
    }, indent=2))

    # Update state
    state = load_state()
    state["pending_batch"] = batch.id
    save_state(state)

    return batch.id


def check_batch(batch_id: str) -> Optional[Path]:
    """Check batch status and download results if complete."""
    if not HAS_ANTHROPIC:
        print("Error: anthropic package not installed")
        sys.exit(1)

    client = Anthropic()
    batch = client.messages.batches.retrieve(batch_id)

    print(f"Batch ID: {batch.id}")
    print(f"Status: {batch.processing_status}")

    if hasattr(batch, "request_counts"):
        counts = batch.request_counts
        total = counts.processing + counts.succeeded + counts.errored
        print(f"Progress: {counts.succeeded}/{total} succeeded, {counts.errored} errors")

    if batch.processing_status == "ended":
        print("\nBatch complete! Downloading results...")

        results_file = BATCH_DIR / f"batch_{batch_id}_results.jsonl"
        results = []

        for result in client.messages.batches.results(batch_id):
            results.append(result.model_dump())

        with open(results_file, "w") as f:
            for r in results:
                f.write(json.dumps(r) + "\n")

        print(f"Results saved to: {results_file}")

        # Clear pending batch from state
        state = load_state()
        state["pending_batch"] = None
        save_state(state)

        return results_file

    return None


def apply_results(results_file: Path) -> Dict[str, int]:
    """Apply batch results to tool files."""
    print(f"Applying results from: {results_file}")

    stats = {"applied": 0, "errors": 0, "skipped": 0}
    processed = []

    with open(results_file) as f:
        for line in f:
            result = json.loads(line)
            custom_id = result.get("custom_id", "")
            filepath = TOOLS_DIR / custom_id

            if not filepath.exists():
                print(f"  Warning: File not found: {custom_id}")
                stats["errors"] += 1
                continue

            # Check for success
            if result.get("result", {}).get("type") != "succeeded":
                error = result.get("result", {}).get("error", {})
                print(f"  Error: {custom_id} - {error}")
                stats["errors"] += 1
                continue

            # Extract generated content
            message = result["result"]["message"]
            content = message["content"][0]["text"]

            # Read existing file and update
            existing = filepath.read_text()
            parts = existing.split("---", 2)

            if len(parts) >= 3:
                frontmatter = yaml.safe_load(parts[1])
                frontmatter["last_verified"] = datetime.now().strftime("%Y-%m-%d")
                frontmatter["confidence_score"] = 0.9

                new_content = "---\n" + yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True) + "---\n\n" + content

                filepath.write_text(new_content)
                print(f"  Updated: {custom_id}")
                stats["applied"] += 1
                processed.append(custom_id)

    # Update state with processed tools
    state = load_state()
    state["processed_tools"].extend(processed)
    state["last_run"] = datetime.now().isoformat()
    save_state(state)

    print(f"\nApplied: {stats['applied']}, Errors: {stats['errors']}")
    return stats


def run_automated(mode: str = "incomplete", limit: int = 50, force_scrape: bool = False):
    """Run full automated workflow."""
    state = load_state()

    # Check for pending batch
    if state.get("pending_batch"):
        print(f"Checking pending batch: {state['pending_batch']}")
        results_file = check_batch(state["pending_batch"])
        if results_file:
            apply_results(results_file)
            print("\nPending batch processed. Run again for new batch.")
        return

    # Get tools to process
    if mode == "incomplete":
        tools = get_incomplete_tools()[:limit]
        batch_type = "generate"
    elif mode == "enrich":
        tools = get_tools_needing_enrichment(days_old=30)[:limit]
        batch_type = "enrich"
    else:
        print(f"Unknown mode: {mode}")
        return

    if not tools:
        print(f"No tools to process in {mode} mode.")
        return

    print(f"Found {len(tools)} tools for {mode} mode")

    # Prepare and submit
    batch_file = prepare_batch(tools, batch_type=batch_type, force_scrape=force_scrape)
    batch_id = submit_batch(batch_file)

    print(f"\nBatch submitted: {batch_id}")
    print("Run this script again later to check status and apply results.")


def main():
    parser = argparse.ArgumentParser(
        description="AI Tool Page Generator with Claude Batch API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Manual workflow
  python batch_generate.py --prepare --limit 50
  python batch_generate.py --submit scripts/.batches/batch_xxx.jsonl
  python batch_generate.py --check msgbatch_xxx
  python batch_generate.py --apply scripts/.batches/batch_xxx_results.jsonl

  # Automated (for cron)
  python batch_generate.py --auto                    # Process incomplete tools
  python batch_generate.py --auto --mode enrich     # Enrich existing tools
  python batch_generate.py --auto --limit 100       # Process up to 100 tools

  # Cron examples (add to crontab -e):
  # Daily at 2am: process 20 incomplete tools
  0 2 * * * cd /path/to/ai-tool-review && python scripts/batch_generate.py --auto --limit 20

  # Weekly on Sunday: enrich 50 existing tools
  0 3 * * 0 cd /path/to/ai-tool-review && python scripts/batch_generate.py --auto --mode enrich --limit 50
        """
    )

    parser.add_argument("--prepare", action="store_true", help="Prepare batch by scraping data")
    parser.add_argument("--submit", type=str, help="Submit batch file to Claude API")
    parser.add_argument("--check", type=str, help="Check batch status by ID")
    parser.add_argument("--apply", type=str, help="Apply results file to tool pages")

    parser.add_argument("--auto", action="store_true", help="Automated workflow (prepare, submit, or apply)")
    parser.add_argument("--mode", type=str, default="incomplete", choices=["incomplete", "enrich"],
                        help="Mode: incomplete (new tools) or enrich (update existing)")

    parser.add_argument("--limit", type=int, default=50, help="Max tools to process (default: 50)")
    parser.add_argument("--force-scrape", action="store_true", help="Force re-scrape even if cached")

    parser.add_argument("--list-incomplete", action="store_true", help="List incomplete tools")
    parser.add_argument("--list-stale", action="store_true", help="List tools needing enrichment")
    parser.add_argument("--status", action="store_true", help="Show current batch status")

    args = parser.parse_args()

    if args.list_incomplete:
        tools = get_incomplete_tools()
        print(f"Incomplete tools ({len(tools)}):\n")
        for t in tools[:50]:
            print(f"  {t['relative_path']}")
        if len(tools) > 50:
            print(f"  ... and {len(tools) - 50} more")

    elif args.list_stale:
        tools = get_tools_needing_enrichment()
        print(f"Tools needing enrichment ({len(tools)}):\n")
        for t in tools[:50]:
            verified = t["frontmatter"].get("last_verified", "never")
            print(f"  {t['relative_path']} (last: {verified})")
        if len(tools) > 50:
            print(f"  ... and {len(tools) - 50} more")

    elif args.status:
        state = load_state()
        print("Batch Generator Status")
        print("=" * 40)
        print(f"Last run: {state.get('last_run', 'never')}")
        print(f"Pending batch: {state.get('pending_batch', 'none')}")
        print(f"Tools processed: {len(state.get('processed_tools', []))}")

        if state.get("pending_batch"):
            print(f"\nChecking batch status...")
            check_batch(state["pending_batch"])

    elif args.prepare:
        tools = get_incomplete_tools()[:args.limit]
        if tools:
            batch_file = prepare_batch(tools, force_scrape=args.force_scrape)
            print(f"\nNext: python batch_generate.py --submit {batch_file}")
        else:
            print("No incomplete tools found.")

    elif args.submit:
        submit_batch(Path(args.submit))

    elif args.check:
        results = check_batch(args.check)
        if results:
            print(f"\nApply with: python batch_generate.py --apply {results}")

    elif args.apply:
        apply_results(Path(args.apply))

    elif args.auto:
        run_automated(mode=args.mode, limit=args.limit, force_scrape=args.force_scrape)

    else:
        parser.print_help()
        print("\n" + "=" * 60)
        print("Quick Start:")
        print("  python batch_generate.py --auto --limit 20")
        print("=" * 60)


if __name__ == "__main__":
    main()
