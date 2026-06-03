#!/usr/bin/env python3
"""
Tool Page Generator for AI Tool Review Site

This script generates full tool pages by:
1. Reading the existing minimal tool file for URL/metadata
2. Fetching data from official sources via web scraping
3. Searching for reviews and pricing info
4. Generating the full HTML/markdown content
5. Writing the updated file

Usage:
    python generate_tool_page.py <tool_file.md>
    python generate_tool_page.py --batch <directory>
    python generate_tool_page.py --all
"""

import os
import sys
import re
import json
import yaml
import argparse
import time
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse, urljoin
from typing import Optional, Dict, Any, List

# Optional imports - graceful degradation
try:
    import requests
    from bs4 import BeautifulSoup
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    print("Warning: requests/beautifulsoup4 not installed. Run: pip install requests beautifulsoup4")

try:
    from anthropic import Anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False

# Configuration
TOOLS_DIR = Path(__file__).parent.parent / "data" / "_tools"
REFERENCE_FILE = TOOLS_DIR / "developers" / "ai-coding" / "coding-agents" / "claude-code.md"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
REQUEST_TIMEOUT = 15
RATE_LIMIT_DELAY = 1.0  # seconds between requests


class ToolPageGenerator:
    """Generates full tool pages from minimal stubs."""

    def __init__(self, use_ai: bool = False):
        self.use_ai = use_ai and HAS_ANTHROPIC
        self.session = requests.Session() if HAS_REQUESTS else None
        if self.session:
            self.session.headers.update({"User-Agent": USER_AGENT})
            self.session.headers.update({"Accept": "text/html,application/xhtml+xml"})
            self.session.headers.update({"Accept-Language": "en-US,en;q=0.9"})

        if self.use_ai:
            self.client = Anthropic()

    def extract_pricing_data(self, html: str, url: str) -> List[Dict]:
        """Extract pricing tiers from a pricing page."""
        if not html:
            return []

        soup = BeautifulSoup(html, "html.parser")
        pricing_tiers = []

        # Common pricing patterns
        # Pattern 1: Look for pricing cards/boxes
        price_containers = soup.find_all(["div", "section"], class_=lambda x: x and any(
            kw in str(x).lower() for kw in ["pricing", "plan", "tier", "package"]
        ))

        # Pattern 2: Look for price amounts ($XX or XX/mo patterns)
        price_pattern = re.compile(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:/\s*(?:mo|month|yr|year|user|seat))?', re.I)

        # Find all text with prices
        for element in soup.find_all(text=price_pattern):
            parent = element.parent
            if parent:
                container = parent.find_parent(["div", "li", "section"])
                if container:
                    text = container.get_text(" ", strip=True)
                    prices = price_pattern.findall(text)

                    # Try to find plan name nearby
                    plan_name = ""
                    for tag in ["h2", "h3", "h4", "strong", "b"]:
                        header = container.find(tag)
                        if header:
                            plan_name = header.get_text(strip=True)[:30]
                            break

                    if prices and plan_name:
                        pricing_tiers.append({
                            "name": plan_name,
                            "price": f"${prices[0]}",
                            "description": text[:100]
                        })

        # Look for "Free" tier
        free_elements = soup.find_all(text=re.compile(r'\bfree\b', re.I))
        for el in free_elements[:3]:
            parent = el.find_parent(["div", "section", "li"])
            if parent:
                nearby_text = parent.get_text(" ", strip=True)[:100]
                if "free" in nearby_text.lower() and not any(t["name"].lower() == "free" for t in pricing_tiers):
                    pricing_tiers.append({
                        "name": "Free",
                        "price": "$0",
                        "description": nearby_text[:60]
                    })
                    break

        # Deduplicate and limit
        seen = set()
        unique_tiers = []
        for tier in pricing_tiers[:6]:
            key = tier["name"].lower()
            if key not in seen:
                seen.add(key)
                unique_tiers.append(tier)

        return unique_tiers[:4]  # Max 4 tiers

    def fetch_g2_data(self, tool_name: str) -> Dict:
        """Fetch review data from G2."""
        if not self.session:
            return {}

        # Search G2 for the product
        search_url = f"https://www.g2.com/search?query={tool_name.replace(' ', '+')}"

        try:
            html = self.fetch_url(search_url)
            if not html:
                return {}

            soup = BeautifulSoup(html, "html.parser")
            data = {"pros": [], "cons": [], "rating": "", "reviews_count": ""}

            # Try to find rating
            rating_el = soup.find(class_=lambda x: x and "rating" in str(x).lower())
            if rating_el:
                rating_text = rating_el.get_text(strip=True)
                rating_match = re.search(r'(\d+\.?\d*)\s*(?:/\s*5|out of 5)?', rating_text)
                if rating_match:
                    data["rating"] = f"{rating_match.group(1)}/5"

            # Look for review count
            review_count = soup.find(text=re.compile(r'\d+\s*reviews?', re.I))
            if review_count:
                count_match = re.search(r'(\d+(?:,\d{3})*)\s*reviews?', str(review_count), re.I)
                if count_match:
                    data["reviews_count"] = count_match.group(1)

            return data

        except Exception as e:
            print(f"  G2 fetch error: {e}")
            return {}

    def extract_company_info(self, html: str) -> Dict:
        """Extract company info like founded year, headquarters, user count."""
        if not html:
            return {}

        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(" ", strip=True)
        info = {}

        # Founded year
        founded_match = re.search(r'(?:founded|established|since)\s*(?:in\s*)?(\d{4})', text, re.I)
        if founded_match:
            year = int(founded_match.group(1))
            if 1990 <= year <= 2026:
                info["founded_year"] = year

        # User count patterns
        user_patterns = [
            r'(\d+(?:\.\d+)?)\s*(?:million|M)\+?\s*(?:users|customers|people)',
            r'(\d+(?:,\d{3})+)\+?\s*(?:users|customers|teams|companies)',
            r'(?:used by|trusted by|serving)\s*(\d+(?:\.\d+)?)\s*(?:million|M|K)?',
        ]
        for pattern in user_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                num = match.group(1).replace(",", "")
                if "million" in text[match.start():match.end()+20].lower() or "M" in match.group(0):
                    info["user_count"] = f"{num}M+"
                elif "K" in match.group(0):
                    info["user_count"] = f"{num}K+"
                else:
                    info["user_count"] = f"{num}+"
                break

        # Look for Fortune 500 or enterprise mentions
        if re.search(r'fortune\s*500|enterprise|leading\s*companies', text, re.I):
            info["enterprise"] = True

        return info

    def fetch_github_stars(self, github_url: str) -> Optional[int]:
        """Fetch actual GitHub star count via API."""
        if not github_url or not self.session:
            return None

        # Extract owner/repo from URL
        # Handle: https://github.com/owner/repo or github.com/owner/repo
        match = re.search(r'github\.com/([^/]+)/([^/\s]+)', github_url)
        if not match:
            return None

        owner, repo = match.groups()
        repo = repo.rstrip('/')  # Remove trailing slash if present

        api_url = f"https://api.github.com/repos/{owner}/{repo}"

        try:
            headers = {
                "Accept": "application/vnd.github+json",
                "User-Agent": USER_AGENT,
            }
            response = self.session.get(api_url, timeout=10, headers=headers)
            if response.status_code == 200:
                data = response.json()
                stars = data.get('stargazers_count')
                if stars:
                    print(f"  GitHub stars: {stars:,}")
                    return stars
            elif response.status_code == 403:
                print(f"  Warning: GitHub API rate limited")
            else:
                print(f"  Warning: GitHub API returned {response.status_code}")
        except Exception as e:
            print(f"  Warning: Failed to fetch GitHub stars: {e}")

        return None

    def read_tool_file(self, filepath: Path) -> Dict[str, Any]:
        """Read and parse a tool markdown file."""
        content = filepath.read_text()

        # Split frontmatter and body
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                frontmatter = yaml.safe_load(parts[1])
                body = parts[2].strip()
                return {"frontmatter": frontmatter, "body": body, "raw": content}

        return {"frontmatter": {}, "body": content, "raw": content}

    def fetch_url(self, url: str) -> Optional[str]:
        """Fetch a URL and return the HTML content."""
        if not self.session:
            return None

        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            time.sleep(RATE_LIMIT_DELAY)
            return response.text
        except Exception as e:
            print(f"  Warning: Failed to fetch {url}: {e}")
            return None

    def extract_text_content(self, html: str, url: str) -> Dict[str, Any]:
        """Extract relevant text content from HTML."""
        if not html:
            return {}

        soup = BeautifulSoup(html, "html.parser")

        # Remove script and style elements
        for element in soup(["script", "style", "nav", "footer", "header"]):
            element.decompose()

        # Extract key elements
        data = {
            "title": "",
            "description": "",
            "h1_texts": [],
            "h2_texts": [],
            "paragraphs": [],
            "pricing_hints": [],
            "features": [],
        }

        # Title
        title_tag = soup.find("title")
        if title_tag:
            data["title"] = title_tag.get_text(strip=True)

        # Meta description
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc:
            data["description"] = meta_desc.get("content", "")

        # Headings
        for h1 in soup.find_all("h1"):
            text = h1.get_text(strip=True)
            if text and len(text) < 200:
                data["h1_texts"].append(text)

        for h2 in soup.find_all("h2"):
            text = h2.get_text(strip=True)
            if text and len(text) < 200:
                data["h2_texts"].append(text)

        # First few paragraphs
        for p in soup.find_all("p")[:10]:
            text = p.get_text(strip=True)
            if text and len(text) > 50:
                data["paragraphs"].append(text[:500])

        # Look for pricing-related content
        pricing_keywords = ["pricing", "price", "plan", "tier", "free", "pro", "enterprise", "month", "/mo", "subscription"]
        for element in soup.find_all(["div", "section", "span", "p"]):
            text = element.get_text(strip=True).lower()
            if any(kw in text for kw in pricing_keywords) and len(text) < 300:
                data["pricing_hints"].append(element.get_text(strip=True))

        # Look for feature lists
        for ul in soup.find_all("ul"):
            items = ul.find_all("li")
            if 3 <= len(items) <= 20:
                feature_list = [li.get_text(strip=True)[:100] for li in items[:10]]
                if feature_list:
                    data["features"].extend(feature_list)

        return data

    def generate_content_with_ai(self, tool_data: Dict, scraped_data: Dict) -> str:
        """Use Claude to generate the full page content."""
        if not self.use_ai:
            return self.generate_content_template(tool_data, scraped_data)

        prompt = f"""Generate a full tool review page for {tool_data.get('name', 'Unknown Tool')}.

Based on this scraped data:
{json.dumps(scraped_data, indent=2)[:3000]}

And this existing metadata:
{json.dumps(tool_data, indent=2)}

Generate the content following this exact HTML structure (no frontmatter, just the body content):

<div class="key-stats">
  <div class="key-stat">
    <span class="number">[STAT]</span>
    <span class="label">[LABEL]</span>
  </div>
  <!-- 2-3 key stats -->
</div>

## Overview

<div class="overview">
<p>[2-3 sentence description from official source]</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use [Tool]?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul><li>...</li></ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul><li>...</li></ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul><li>...</li></ul>
    <div class="source"><a href="URL">Source</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul><li>...</li></ul>
    <div class="source"><a href="URL">Source</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="[pricing_url]" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">[Plan]</div>
    <div class="price">$X<small>/mo</small></div>
    <div class="desc">[Brief description]</div>
  </a>
  <!-- Add "featured" class to recommended plan -->
</div>

<details class="more-details">
<summary>View all features & details</summary>
<div class="detail-grid">
  <div class="detail-section">
    <h4>[Category]</h4>
    <ul><li>...</li></ul>
  </div>
</div>
</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | {tool_data.get('name', 'This Tool')} | Competitor 1 | Competitor 2 |
|---------|-----------|--------------|--------------|
| Feature | <span class="highlight">Best</span> | Good | OK |

</div>

Be factual and cite sources. Use <span class="highlight"> for standout features."""

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.content[0].text

    def generate_content_template(self, tool_data: Dict, scraped_data: Dict) -> str:
        """Generate a template-based content (no AI)."""
        name = tool_data.get("name", "Unknown Tool")
        url = tool_data.get("url", "")
        description = scraped_data.get("description", tool_data.get("description", ""))

        # Extract some data from scraped content
        features = scraped_data.get("features", [])[:6]
        paragraphs = scraped_data.get("paragraphs", [])
        pricing_tiers = scraped_data.get("pricing_tiers", [])
        company_info = scraped_data.get("company_info", {})
        g2_data = scraped_data.get("g2_data", {})

        overview = description
        if paragraphs and len(paragraphs[0]) > len(description):
            overview = paragraphs[0]

        # Build key stats - prefer GitHub stars for open-source tools
        github_stars = scraped_data.get("github_stars") or tool_data.get("github_stars")
        if github_stars:
            # Format stars: 14200 -> "14.2K+"
            if github_stars >= 1000:
                stat1_num = f"{github_stars / 1000:.1f}K+".replace('.0K', 'K')
            else:
                stat1_num = str(github_stars)
            stat1_label = "GitHub Stars"
        else:
            stat1_num = company_info.get("user_count", "—")
            stat1_label = "Users" if stat1_num != "—" else "Users"

        stat2_num = g2_data.get("rating", "—")
        stat2_label = "G2 Rating" if stat2_num != "—" else "Rating"
        stat3_num = str(company_info.get("founded_year", "—"))
        stat3_label = "Founded"

        # Normalize URL (remove trailing slash for joining)
        base_url = url.rstrip("/")
        pricing_url = f"{base_url}/pricing"

        # Build pricing cards
        if pricing_tiers:
            # Sort: Free first, then by price, Enterprise/Custom last
            def sort_key(t):
                name = t.get("name", "").lower()
                price = t.get("price", "")
                if "free" in name or price == "$0":
                    return (0, 0)
                if "enterprise" in name or "custom" in price.lower():
                    return (2, 999)
                # Extract numeric price for sorting
                match = re.search(r'\$(\d+)', price)
                return (1, int(match.group(1)) if match else 50)

            sorted_tiers = sorted(pricing_tiers[:4], key=sort_key)

            pricing_html = ""
            for i, tier in enumerate(sorted_tiers):
                # Mark the middle paid tier as featured
                featured = ' featured' if i == 1 and len(sorted_tiers) > 1 else ''
                price_display = tier.get("price", "$—")
                if "/mo" not in price_display.lower() and price_display not in ["$0", "Custom", "Free"]:
                    price_display = f'{price_display}<small>/mo</small>'
                tier_name = tier.get("name", "Plan").title()
                pricing_html += f'''  <a href="{pricing_url}" class="pricing-card{featured}" target="_blank" rel="noopener">
    <div class="plan-name">{tier_name}</div>
    <div class="price">{price_display}</div>
    <div class="desc">{tier.get("description", "")[:50]}</div>
  </a>
'''
        else:
            pricing_html = f'''  <a href="{pricing_url}" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">[Verify on official site]</div>
  </a>
  <a href="{pricing_url}" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">$—<small>/mo</small></div>
    <div class="desc">[Verify on official site]</div>
  </a>
  <a href="{pricing_url}" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Contact sales</div>
  </a>
'''

        # Build pros list from features
        pros_items = ""
        for f in features[:5]:
            pros_items += f"      <li>{f}</li>\n"
        if not pros_items:
            pros_items = "      <li>[Add pro 1]</li>\n      <li>[Add pro 2]</li>\n"

        # Build cons from G2 if available
        cons_items = ""
        for con in g2_data.get("cons", [])[:4]:
            cons_items += f"      <li>{con}</li>\n"
        if not cons_items:
            cons_items = "      <li>[Research G2/Capterra for cons]</li>\n      <li>[Add con 2]</li>\n"

        template = f'''<div class="key-stats">
  <div class="key-stat">
    <span class="number">{stat1_num}</span>
    <span class="label">{stat1_label}</span>
  </div>
  <div class="key-stat">
    <span class="number">{stat2_num}</span>
    <span class="label">{stat2_label}</span>
  </div>
  <div class="key-stat">
    <span class="number">{stat3_num}</span>
    <span class="label">{stat3_label}</span>
  </div>
</div>

## Overview

<div class="overview">
<p>{overview[:500] if overview else f"{name} is an AI-powered tool. [Add description from official source]"}</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use {name}?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>[Add best use case 1]</li>
        <li>[Add best use case 2]</li>
        <li>[Add best use case 3]</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>[Add limitation 1]</li>
        <li>[Add limitation 2]</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
{pros_items}    </ul>
    <div class="source"><a href="{url}" target="_blank">Official Site</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
{cons_items}    </ul>
    <div class="source"><a href="https://www.g2.com/" target="_blank">G2 Reviews</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
{pricing_html}</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      {"".join(f"<li>{f}</li>" for f in features[:6]) if features else "<li>[Add features]</li>"}
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>[Add supported platforms]</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | {name} | Competitor 1 | Competitor 2 |
|---------|--------|--------------|--------------|
| Key Feature | — | — | — |
| Pricing | — | — | — |
| Best For | — | — | — |

</div>
'''
        return template

    def process_tool(self, filepath: Path, use_ai: bool = None) -> bool:
        """Process a single tool file."""
        if use_ai is None:
            use_ai = self.use_ai

        print(f"\nProcessing: {filepath.name}")

        # Read existing file
        tool_data = self.read_tool_file(filepath)
        frontmatter = tool_data.get("frontmatter", {})
        body = tool_data.get("body", "")

        # Check if already has full content (more than 50 lines)
        if body.count("\n") > 50:
            print(f"  Skipping: Already has full content ({body.count(chr(10))} lines)")
            return False

        # Get URL from frontmatter
        url = frontmatter.get("url", "")
        if not url:
            print(f"  Error: No URL in frontmatter")
            return False

        print(f"  URL: {url}")

        # Fetch and scrape official site
        scraped_data = {}
        if HAS_REQUESTS:
            html = self.fetch_url(url)
            if html:
                scraped_data = self.extract_text_content(html, url)
                scraped_data["company_info"] = self.extract_company_info(html)
                print(f"  Scraped: {len(scraped_data.get('paragraphs', []))} paragraphs, {len(scraped_data.get('features', []))} features")

            # Try pricing page
            pricing_url = urljoin(url, "/pricing")
            pricing_html = self.fetch_url(pricing_url)
            if pricing_html:
                pricing_data = self.extract_text_content(pricing_html, pricing_url)
                scraped_data["pricing_page"] = pricing_data.get("pricing_hints", [])
                scraped_data["pricing_tiers"] = self.extract_pricing_data(pricing_html, pricing_url)
                if scraped_data["pricing_tiers"]:
                    print(f"  Found {len(scraped_data['pricing_tiers'])} pricing tiers")

            # Note: G2 blocks automated requests, skip for now
            # To add G2 data, manually research and add to frontmatter
            scraped_data["g2_data"] = {}

            # Fetch GitHub stars if github_url is present
            github_url = frontmatter.get("github_url", "")
            if github_url:
                stars = self.fetch_github_stars(github_url)
                if stars:
                    scraped_data["github_stars"] = stars
                    frontmatter["github_stars"] = stars

        # Generate content
        if use_ai and HAS_ANTHROPIC:
            print("  Generating with AI...")
            new_body = self.generate_content_with_ai(frontmatter, scraped_data)
        else:
            print("  Generating from template...")
            new_body = self.generate_content_template(frontmatter, scraped_data)

        # Update frontmatter
        frontmatter["last_verified"] = datetime.now().strftime("%Y-%m-%d")
        if "confidence_score" not in frontmatter:
            frontmatter["confidence_score"] = 0.7 if use_ai else 0.5

        # Write updated file
        new_content = "---\n" + yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True) + "---\n\n" + new_body

        filepath.write_text(new_content)
        print(f"  Written: {filepath}")
        return True

    def process_directory(self, directory: Path, use_ai: bool = None) -> int:
        """Process all tool files in a directory."""
        count = 0
        for filepath in sorted(directory.rglob("*.md")):
            if self.process_tool(filepath, use_ai):
                count += 1
        return count

    def process_all_incomplete(self, use_ai: bool = None) -> int:
        """Process all incomplete tool files."""
        count = 0
        for filepath in sorted(TOOLS_DIR.rglob("*.md")):
            tool_data = self.read_tool_file(filepath)
            body = tool_data.get("body", "")
            # Only process files with less than 50 lines of content
            if body.count("\n") < 50:
                if self.process_tool(filepath, use_ai):
                    count += 1
        return count


def main():
    parser = argparse.ArgumentParser(description="Generate AI tool review pages")
    parser.add_argument("path", nargs="?", help="Path to tool file or directory")
    parser.add_argument("--batch", action="store_true", help="Process all files in directory")
    parser.add_argument("--all", action="store_true", help="Process all incomplete tools")
    parser.add_argument("--ai", action="store_true", help="Use Claude AI for content generation")
    parser.add_argument("--list-incomplete", action="store_true", help="List incomplete tool files")

    args = parser.parse_args()

    if args.list_incomplete:
        print("Incomplete tool files (< 50 lines):\n")
        count = 0
        for filepath in sorted(TOOLS_DIR.rglob("*.md")):
            content = filepath.read_text()
            body_lines = content.split("---", 2)[-1].count("\n") if "---" in content else content.count("\n")
            if body_lines < 50:
                print(f"  {filepath.relative_to(TOOLS_DIR)}")
                count += 1
        print(f"\nTotal: {count} files")
        return

    generator = ToolPageGenerator(use_ai=args.ai)

    if args.all:
        print("Processing all incomplete tools...")
        count = generator.process_all_incomplete()
        print(f"\nProcessed {count} tools")
    elif args.batch and args.path:
        directory = Path(args.path)
        if not directory.is_dir():
            print(f"Error: {args.path} is not a directory")
            sys.exit(1)
        count = generator.process_directory(directory)
        print(f"\nProcessed {count} tools")
    elif args.path:
        filepath = Path(args.path)
        if not filepath.exists():
            print(f"Error: {args.path} does not exist")
            sys.exit(1)
        generator.process_tool(filepath)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
