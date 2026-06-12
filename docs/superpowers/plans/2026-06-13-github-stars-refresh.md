# GitHub Stars Single-Source-of-Truth + Daily Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `data/stars.json` (fetched daily from GitHub) the single source of truth for star counts, so every surface derives from it and no two pages can disagree.

**Architecture:** A pure Ruby lib (`scripts/stars_lib.rb`) holds all testable logic — frontmatter scanning, URL→owner/repo parsing, GraphQL query building, response merging, frontmatter rewriting, JSON serialization. Thin CLIs (`fetch-stars.rb`, `resolve-github-urls.rb`) wire the lib to the network and filesystem. A client script (`js/stars.js`) reads `data/stars.json` and renders the badge. A daily GitHub Action runs the fetcher and commits. This mirrors the existing `generate_json_lib.rb` / `generate-json.rb` split.

**Tech Stack:** Ruby + minitest (unit tests, already in Gemfile), GitHub GraphQL API + REST search API (`Net::HTTP`, stdlib), vanilla JS, Playwright (E2E, already configured), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-06-13-github-stars-refresh-design.md`

**Conventions discovered (follow these exactly):**
- Frontmatter parsing already exists: `parse_frontmatter(path)` in `scripts/generate_json_lib.rb` (returns a Hash or nil; uses `YAML.safe_load(..., permitted_classes: [Date])`).
- Ruby tests: minitest, file named `scripts/test_<name>.rb`, run with `ruby scripts/test_<name>.rb`. Pattern reference: `scripts/test_generate_json.rb` (uses `Tempfile.create`, `require_relative`).
- Tool files: `data/_tools/**/*.md`; skip basenames starting with `_`. Each has `slug:`, optionally `github_url:`, optionally `github_stars:`.
- Slug is already exposed to JS on the tool page: `_layouts/tool.html:210` has `data-tool-slug="{{ page.slug }}"`.
- Badge markup: `_layouts/tool.html:171-172`, `.star-count` rendered as `{{ page.github_stars | divided_by: 1000 }}k`. Supabase override at ~line 338.
- Assets use relative paths (empty `baseurl`, custom domain `aitoolreview.ai`) with a `?t=` cache-bust convention (see `index.html:136`).
- Playwright specs live in `tests/*.spec.js`; tool-page spec is `tests/tool-page.spec.js`.

---

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `scripts/stars_lib.rb` | All pure, testable star logic (no network/FS side effects in the core fns) | Create |
| `scripts/fetch-stars.rb` | Thin CLI: scan files → GraphQL fetch → write stars.json + frontmatter + (optional) Supabase | Create |
| `scripts/resolve-github-urls.rb` | Thin CLI: one-time backfill of `github_url:` via GitHub search | Create |
| `scripts/test_stars_lib.rb` | minitest unit tests for `stars_lib.rb` | Create |
| `data/stars.json` | Canonical star cache (committed) | Create (seeded by first run) |
| `js/stars.js` | Client: fetch stars.json, render `.star-count` | Create |
| `_layouts/tool.html` | Load `js/stars.js`; remove Supabase badge override (#5) | Modify |
| `tests/tool-page.spec.js` | Playwright: badge renders from stars.json + fallback | Modify |
| `tests/data-integrity.spec.js` | Add: no hardcoded star figures in description prose | Modify |
| `.github/workflows/refresh-stars.yml` | Daily cron → run fetcher → commit | Create |
| `data/_tools/**/*.md` (~40) | Remove star figures from prose | Modify (one-time) |

---

## Task 1: Library scaffold + URL parsing

**Files:**
- Create: `scripts/stars_lib.rb`
- Create: `scripts/test_stars_lib.rb`

- [ ] **Step 1: Write the failing test**

`scripts/test_stars_lib.rb`:
```ruby
#!/usr/bin/env ruby
require 'minitest/autorun'
require_relative 'stars_lib'

class TestParseRepo < Minitest::Test
  def test_parses_standard_url
    assert_equal({ owner: 'n8n-io', name: 'n8n' }, StarsLib.parse_repo('https://github.com/n8n-io/n8n'))
  end

  def test_parses_url_with_trailing_slash
    assert_equal({ owner: 'BerriAI', name: 'litellm' }, StarsLib.parse_repo('https://github.com/BerriAI/litellm/'))
  end

  def test_parses_url_with_extra_path
    assert_equal({ owner: 'vllm-project', name: 'vllm' }, StarsLib.parse_repo('https://github.com/vllm-project/vllm/tree/main'))
  end

  def test_strips_dot_git_suffix
    assert_equal({ owner: 'obsidianmd', name: 'obsidian-releases' }, StarsLib.parse_repo('https://github.com/obsidianmd/obsidian-releases.git'))
  end

  def test_returns_nil_for_non_repo_url
    assert_nil StarsLib.parse_repo('https://github.com/n8n-io')
  end

  def test_returns_nil_for_non_github_url
    assert_nil StarsLib.parse_repo('https://gitlab.com/foo/bar')
  end

  def test_returns_nil_for_nil
    assert_nil StarsLib.parse_repo(nil)
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `cannot load such file -- ./stars_lib` (or `uninitialized constant StarsLib`).

- [ ] **Step 3: Write minimal implementation**

`scripts/stars_lib.rb`:
```ruby
#!/usr/bin/env ruby
require 'yaml'
require 'json'
require 'date'

module StarsLib
  # Extract { owner:, name: } from a GitHub repo URL, or nil if it isn't one.
  def self.parse_repo(url)
    return nil unless url.is_a?(String)
    m = url.match(%r{\Ahttps?://github\.com/([^/\s]+)/([^/\s]+?)(?:\.git)?(?:[/#?].*)?\z})
    return nil unless m
    owner, name = m[1], m[2]
    return nil if owner.empty? || name.empty?
    { owner: owner, name: name }
  end
end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS (7 assertions).

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/test_stars_lib.rb
git commit -m "feat(stars): add GitHub repo URL parser with tests"
```

---

## Task 2: Scan tool files for slug + github_url

**Files:**
- Modify: `scripts/stars_lib.rb`
- Modify: `scripts/test_stars_lib.rb`

- [ ] **Step 1: Write the failing test**

Append to `scripts/test_stars_lib.rb`:
```ruby
require 'tempfile'
require 'fileutils'

class TestScanTools < Minitest::Test
  def with_tools_dir
    Dir.mktmpdir do |dir|
      yield dir
    end
  end

  def write_tool(dir, rel, frontmatter)
    path = File.join(dir, rel)
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, "---\n#{frontmatter}\n---\n\nBody text.\n")
    path
  end

  def test_collects_slug_and_url_for_files_with_github_url
    with_tools_dir do |dir|
      write_tool(dir, 'a/tool-a.md', "slug: \"tool-a\"\ngithub_url: \"https://github.com/o/a\"")
      write_tool(dir, 'b/tool-b.md', "slug: \"tool-b\"\ngithub_url: \"https://github.com/o/b\"")
      result = StarsLib.scan_tools(dir)
      assert_equal 2, result.length
      assert_includes result, { slug: 'tool-a', repo: { owner: 'o', name: 'a' }, path: File.join(dir, 'a/tool-a.md') }
    end
  end

  def test_skips_files_without_github_url
    with_tools_dir do |dir|
      write_tool(dir, 'c/tool-c.md', "slug: \"tool-c\"\ngithub_stars: 100")
      assert_empty StarsLib.scan_tools(dir)
    end
  end

  def test_skips_underscore_files
    with_tools_dir do |dir|
      write_tool(dir, '_schema.md', "slug: \"x\"\ngithub_url: \"https://github.com/o/x\"")
      assert_empty StarsLib.scan_tools(dir)
    end
  end

  def test_skips_files_with_unparseable_url
    with_tools_dir do |dir|
      write_tool(dir, 'd/tool-d.md', "slug: \"tool-d\"\ngithub_url: \"https://example.com/foo\"")
      assert_empty StarsLib.scan_tools(dir)
    end
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `undefined method 'scan_tools' for StarsLib`.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/stars_lib.rb` inside `module StarsLib`:
```ruby
  # Parse YAML frontmatter from a markdown file. Returns Hash or nil.
  def self.parse_frontmatter(path)
    content = File.read(path)
    return nil unless content =~ /\A---\s*\n(.*?)\n---\s*\n/m
    YAML.safe_load($1, permitted_classes: [Date])
  rescue Psych::SyntaxError
    nil
  end

  # Scan tools_dir for files with a parseable github_url.
  # Returns array of { slug:, repo: {owner:, name:}, path: }.
  def self.scan_tools(tools_dir)
    Dir.glob(File.join(tools_dir, '**/*.md')).sort.filter_map do |path|
      next if File.basename(path).start_with?('_')
      fm = parse_frontmatter(path)
      next unless fm && fm['github_url'] && fm['slug']
      repo = parse_repo(fm['github_url'])
      next unless repo
      { slug: fm['slug'], repo: repo, path: path }
    end
  end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS (all tests so far).

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/test_stars_lib.rb
git commit -m "feat(stars): scan tool files for slug + github repo"
```

---

## Task 3: Build the batched GraphQL query

**Files:**
- Modify: `scripts/stars_lib.rb`
- Modify: `scripts/test_stars_lib.rb`

- [ ] **Step 1: Write the failing test**

Append to `scripts/test_stars_lib.rb`:
```ruby
class TestBuildQuery < Minitest::Test
  def test_builds_aliased_query_for_each_repo
    repos = [
      { slug: 'tool-a', repo: { owner: 'o', name: 'a' } },
      { slug: 'tool-b', repo: { owner: 'p', name: 'b-1' } }
    ]
    q = StarsLib.build_graphql_query(repos)
    assert_includes q, 'r0: repository(owner: "o", name: "a") { stargazerCount }'
    assert_includes q, 'r1: repository(owner: "p", name: "b-1") { stargazerCount }'
    assert q.start_with?('query {')
    assert q.strip.end_with?('}')
  end

  def test_escapes_double_quotes_in_names
    repos = [{ slug: 's', repo: { owner: 'o"x', name: 'n' } }]
    q = StarsLib.build_graphql_query(repos)
    assert_includes q, 'owner: "o\\"x"'
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `undefined method 'build_graphql_query'`.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/stars_lib.rb`:
```ruby
  # Build a single GraphQL query that aliases each repo as r0, r1, ...
  # The index aligns with the input array order for response mapping.
  def self.build_graphql_query(repos)
    fields = repos.each_with_index.map do |entry, i|
      o = entry[:repo][:owner].gsub('"', '\\"')
      n = entry[:repo][:name].gsub('"', '\\"')
      "  r#{i}: repository(owner: \"#{o}\", name: \"#{n}\") { stargazerCount }"
    end
    "query {\n#{fields.join("\n")}\n}"
  end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/test_stars_lib.rb
git commit -m "feat(stars): build batched GraphQL query for repos"
```

---

## Task 4: Merge GraphQL response into stars.json (keep-previous-on-error)

This is the core resilience logic from the spec: a null/errored repo keeps its previous entry; good repos update.

**Files:**
- Modify: `scripts/stars_lib.rb`
- Modify: `scripts/test_stars_lib.rb`

- [ ] **Step 1: Write the failing test**

Append to `scripts/test_stars_lib.rb`:
```ruby
class TestMergeResults < Minitest::Test
  def test_updates_counts_from_response
    repos = [
      { slug: 'tool-a', repo: { owner: 'o', name: 'a' } },
      { slug: 'tool-b', repo: { owner: 'o', name: 'b' } }
    ]
    response = { 'data' => { 'r0' => { 'stargazerCount' => 142318 }, 'r1' => { 'stargazerCount' => 18204 } } }
    result = StarsLib.merge_results(repos, response, {}, now: '2026-06-13T04:00:00Z')
    assert_equal 142318, result['stars']['tool-a']['count']
    assert_equal '2026-06-13T04:00:00Z', result['stars']['tool-a']['fetched_at']
    assert_equal 18204, result['stars']['tool-b']['count']
    assert_equal '2026-06-13T04:00:00Z', result['generated_at']
  end

  def test_keeps_previous_entry_when_repo_is_null
    repos = [{ slug: 'tool-a', repo: { owner: 'o', name: 'a' } }]
    response = { 'data' => { 'r0' => nil } }
    previous = { 'stars' => { 'tool-a' => { 'count' => 99999, 'fetched_at' => '2026-06-10T04:00:00Z' } } }
    result = StarsLib.merge_results(repos, response, previous, now: '2026-06-13T04:00:00Z')
    assert_equal 99999, result['stars']['tool-a']['count']
    assert_equal '2026-06-10T04:00:00Z', result['stars']['tool-a']['fetched_at']
  end

  def test_omits_repo_with_no_data_and_no_previous
    repos = [{ slug: 'tool-a', repo: { owner: 'o', name: 'a' } }]
    response = { 'data' => { 'r0' => nil } }
    result = StarsLib.merge_results(repos, response, {}, now: '2026-06-13T04:00:00Z')
    refute result['stars'].key?('tool-a')
  end

  def test_records_errors_for_null_repos
    repos = [{ slug: 'tool-a', repo: { owner: 'o', name: 'a' } }]
    response = { 'data' => { 'r0' => nil }, 'errors' => [{ 'message' => "Could not resolve to a Repository with the name 'o/a'." }] }
    result = StarsLib.merge_results(repos, response, {}, now: '2026-06-13T04:00:00Z')
    assert_equal 1, result[:errors].length
    assert_includes result[:errors].first, 'tool-a'
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `undefined method 'merge_results'`.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/stars_lib.rb`:
```ruby
  # Merge a GraphQL response into a stars.json structure.
  # repos: array in the same order used to build the query.
  # response: parsed JSON Hash (may contain "data" and "errors").
  # previous: prior stars.json Hash (for keep-on-error).
  # Returns { "generated_at" =>, "stars" => { slug => { "count", "fetched_at" } }, errors: [...] }.
  def self.merge_results(repos, response, previous, now:)
    data = (response && response['data']) || {}
    prev_stars = (previous && previous['stars']) || {}
    stars = {}
    errors = []

    repos.each_with_index do |entry, i|
      slug = entry[:slug]
      node = data["r#{i}"]
      if node && node['stargazerCount']
        stars[slug] = { 'count' => node['stargazerCount'], 'fetched_at' => now }
      elsif prev_stars[slug]
        stars[slug] = prev_stars[slug]
        errors << "#{slug} (#{entry[:repo][:owner]}/#{entry[:repo][:name]}): no data, kept previous"
      else
        errors << "#{slug} (#{entry[:repo][:owner]}/#{entry[:repo][:name]}): no data, no previous"
      end
    end

    { 'generated_at' => now, 'stars' => stars, errors: errors }
  end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/test_stars_lib.rb
git commit -m "feat(stars): merge GraphQL results, keep previous on error"
```

---

## Task 5: Rewrite github_stars in frontmatter (#1 derived)

**Files:**
- Modify: `scripts/stars_lib.rb`
- Modify: `scripts/test_stars_lib.rb`

- [ ] **Step 1: Write the failing test**

Append to `scripts/test_stars_lib.rb`:
```ruby
class TestUpdateFrontmatter < Minitest::Test
  def test_replaces_existing_github_stars_value
    Tempfile.create(['tool', '.md']) do |f|
      f.write("---\nslug: \"x\"\ngithub_stars: 100\ngithub_url: \"https://github.com/o/x\"\n---\n\nBody.\n")
      f.flush
      StarsLib.update_frontmatter_stars(f.path, 54321)
      content = File.read(f.path)
      assert_includes content, 'github_stars: 54321'
      refute_includes content, 'github_stars: 100'
      assert_includes content, 'github_url: "https://github.com/o/x"'
      assert_includes content, "\nBody.\n"
    end
  end

  def test_inserts_github_stars_when_absent
    Tempfile.create(['tool', '.md']) do |f|
      f.write("---\nslug: \"x\"\ngithub_url: \"https://github.com/o/x\"\n---\n\nBody.\n")
      f.flush
      StarsLib.update_frontmatter_stars(f.path, 777)
      assert_includes File.read(f.path), 'github_stars: 777'
    end
  end

  def test_noop_when_value_unchanged_returns_false
    Tempfile.create(['tool', '.md']) do |f|
      f.write("---\nslug: \"x\"\ngithub_stars: 500\n---\n\nBody.\n")
      f.flush
      changed = StarsLib.update_frontmatter_stars(f.path, 500)
      refute changed
    end
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `undefined method 'update_frontmatter_stars'`.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/stars_lib.rb`. Uses line-level edit (not YAML round-trip) to preserve comments/formatting in the rest of the frontmatter:
```ruby
  # Set github_stars: <count> in a file's frontmatter.
  # Returns true if the file changed, false if already correct.
  def self.update_frontmatter_stars(path, count)
    content = File.read(path)
    return false unless content =~ /\A(---\s*\n)(.*?)(\n---\s*\n)/m
    head, fm, tail = $1, $2, $3
    rest = content[($1.length + $2.length + $3.length)..]

    if fm =~ /^github_stars:.*$/
      new_fm = fm.sub(/^github_stars:.*$/, "github_stars: #{count}")
    else
      new_fm = "#{fm}\ngithub_stars: #{count}"
    end

    new_content = "#{head}#{new_fm}#{tail}#{rest}"
    return false if new_content == content
    File.write(path, new_content)
    true
  end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/test_stars_lib.rb
git commit -m "feat(stars): rewrite github_stars frontmatter from canonical count"
```

---

## Task 6: Serialize stars.json deterministically

Deterministic key order means the daily commit diff only changes when a count actually changes (avoids noisy diffs / spurious deploys).

**Files:**
- Modify: `scripts/stars_lib.rb`
- Modify: `scripts/test_stars_lib.rb`

- [ ] **Step 1: Write the failing test**

Append to `scripts/test_stars_lib.rb`:
```ruby
class TestSerialize < Minitest::Test
  def test_sorts_slugs_alphabetically
    merged = { 'generated_at' => 'T', 'stars' => {
      'zeta' => { 'count' => 1, 'fetched_at' => 'T' },
      'alpha' => { 'count' => 2, 'fetched_at' => 'T' }
    }, errors: [] }
    json = StarsLib.serialize(merged)
    assert json.index('"alpha"') < json.index('"zeta"')
    refute_includes json, 'errors'  # internal field not serialized
    parsed = JSON.parse(json)
    assert_equal 2, parsed['stars']['alpha']['count']
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `undefined method 'serialize'`.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/stars_lib.rb`:
```ruby
  # Serialize a merged result to pretty JSON with sorted slugs.
  # The internal :errors key is dropped.
  def self.serialize(merged)
    sorted = merged['stars'].keys.sort.each_with_object({}) { |k, h| h[k] = merged['stars'][k] }
    JSON.pretty_generate({ 'generated_at' => merged['generated_at'], 'stars' => sorted }) + "\n"
  end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/test_stars_lib.rb
git commit -m "feat(stars): deterministic stars.json serialization"
```

---

## Task 7: GraphQL HTTP client (thin, isolated)

Network code kept minimal and separate so the pure logic above stays test-covered. Tested for request shape via a stubbed poster.

**Files:**
- Modify: `scripts/stars_lib.rb`
- Modify: `scripts/test_stars_lib.rb`

- [ ] **Step 1: Write the failing test**

Append to `scripts/test_stars_lib.rb`:
```ruby
class TestFetchGraphql < Minitest::Test
  def test_posts_query_with_auth_and_parses_json
    captured = {}
    fake_poster = lambda do |uri, body, headers|
      captured[:uri] = uri
      captured[:body] = body
      captured[:headers] = headers
      '{"data":{"r0":{"stargazerCount":5}}}'
    end
    result = StarsLib.fetch_graphql('query { r0 }', token: 'TKN', poster: fake_poster)
    assert_equal 'https://api.github.com/graphql', captured[:uri]
    assert_equal 'bearer TKN', captured[:headers]['Authorization']
    assert_includes captured[:body], 'query { r0 }'
    assert_equal 5, result['data']['r0']['stargazerCount']
  end

  def test_raises_on_empty_token
    assert_raises(StarsLib::AuthError) do
      StarsLib.fetch_graphql('query {}', token: nil, poster: ->(*) { '{}' })
    end
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `undefined method 'fetch_graphql'` / `uninitialized constant StarsLib::AuthError`.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/stars_lib.rb`:
```ruby
  class AuthError < StandardError; end

  # Default poster using Net::HTTP. Returns the raw response body string.
  def self.default_poster
    require 'net/http'
    require 'uri'
    lambda do |uri, body, headers|
      u = URI(uri)
      http = Net::HTTP.new(u.host, u.port)
      http.use_ssl = true
      req = Net::HTTP::Post.new(u, headers)
      req.body = body
      res = http.request(req)
      raise "GitHub API HTTP #{res.code}: #{res.body}" unless res.code.to_i == 200
      res.body
    end
  end

  # POST a GraphQL query. poster is injectable for tests.
  def self.fetch_graphql(query, token:, poster: nil)
    raise AuthError, 'Missing GITHUB_TOKEN' if token.nil? || token.empty?
    poster ||= default_poster
    headers = {
      'Authorization' => "bearer #{token}",
      'Content-Type' => 'application/json',
      'User-Agent' => 'ai-tool-review-star-refresh'
    }
    body = JSON.generate({ query: query })
    JSON.parse(poster.call('https://api.github.com/graphql', body, headers))
  end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/test_stars_lib.rb
git commit -m "feat(stars): GraphQL HTTP client with injectable poster"
```

---

## Task 8: fetch-stars.rb CLI (wires lib → filesystem)

**Files:**
- Create: `scripts/fetch-stars.rb`
- Create: `data/stars.json` (produced by running it)

- [ ] **Step 1: Write the failing test (smoke via dry run)**

There is no network in CI for this script's unit layer (logic is covered in Tasks 1–7). Add a thin integration check: run the CLI against a fixture dir with an injected poster env. Append to `scripts/test_stars_lib.rb`:
```ruby
class TestCliComposition < Minitest::Test
  # Verifies the CLI's pure composition path produces a stars.json string.
  def test_run_refresh_composes_pipeline
    repos = [{ slug: 'tool-a', repo: { owner: 'o', name: 'a' }, path: '/x' }]
    fake_fetch = ->(query) { { 'data' => { 'r0' => { 'stargazerCount' => 42 } } } }
    out = StarsLib.run_refresh(repos, previous: {}, now: 'T', fetch: fake_fetch)
    assert_equal 42, out[:merged]['stars']['tool-a']['count']
    assert_includes out[:json], '"tool-a"'
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `undefined method 'run_refresh'`.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/stars_lib.rb`:
```ruby
  # Orchestrate one refresh from already-scanned repos. fetch is injectable.
  def self.run_refresh(repos, previous:, now:, fetch:)
    query = build_graphql_query(repos)
    response = fetch.call(query)
    merged = merge_results(repos, response, previous, now: now)
    { merged: merged, json: serialize(merged) }
  end
```

Create `scripts/fetch-stars.rb`:
```ruby
#!/usr/bin/env ruby
require_relative 'stars_lib'

tools_dir = ARGV[0] || 'data/_tools'
stars_path = ARGV[1] || 'data/stars.json'

token = ENV['GITHUB_TOKEN']
now = Time.now.utc.strftime('%Y-%m-%dT%H:%M:%SZ')

repos = StarsLib.scan_tools(tools_dir)
abort 'No repos with github_url found' if repos.empty?

previous = File.exist?(stars_path) ? JSON.parse(File.read(stars_path)) : {}

fetch = ->(query) { StarsLib.fetch_graphql(query, token: token) }
out = StarsLib.run_refresh(repos, previous: previous, now: now, fetch: fetch)

# Write canonical cache.
File.write(stars_path, out[:json])
puts "Wrote #{stars_path} (#{out[:merged]['stars'].size} tools)"

# Derive frontmatter (#1).
changed = 0
repos.each do |entry|
  star = out[:merged]['stars'][entry[:slug]]
  next unless star
  changed += 1 if StarsLib.update_frontmatter_stars(entry[:path], star['count'])
end
puts "Updated frontmatter in #{changed} files"

# Derive Supabase column (#4). Opt-in: only runs when DB creds are present,
# so local runs without secrets still succeed. Non-fatal on DB errors.
if ENV['SUPABASE_URL'] && ENV['SUPABASE_SERVICE_KEY']
  begin
    synced = StarsLib.sync_supabase(
      out[:merged]['stars'],
      url: ENV['SUPABASE_URL'],
      service_key: ENV['SUPABASE_SERVICE_KEY'],
      now: now
    )
    puts "Synced #{synced} rows to Supabase"
  rescue => e
    warn "Supabase sync skipped (non-fatal): #{e.class}: #{e.message}"
  end
else
  puts "Supabase creds absent; skipping DB sync"
end

# Report per-repo errors but do not fail the run for them.
unless out[:merged][:errors].empty?
  warn "Per-repo issues (#{out[:merged][:errors].size}):"
  out[:merged][:errors].each { |e| warn "  - #{e}" }
end
```

- [ ] **Step 4: Run test to verify it passes; then do a live first run**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS.

Live seed (requires a token locally):
Run: `GITHUB_TOKEN=$(gh auth token) ruby scripts/fetch-stars.rb data/_tools data/stars.json`
Expected: prints "Wrote data/stars.json (N tools)" and "Updated frontmatter in M files".

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/fetch-stars.rb data/stars.json
git commit -m "feat(stars): fetch-stars CLI seeds canonical stars.json + frontmatter"
```

---

## Task 8b: Supabase column sync (#4 derived)

The tool page reads `github_stars` from Supabase (`_layouts/tool.html:275`) and feeds it
into the reviews component (`githubStars: tool.github_stars`, line 338). So the DB column
is a real renderer and must be kept in sync from the canonical counts. The sync uses
Supabase's PostgREST endpoint (`PATCH /rest/v1/tools?slug=eq.<slug>`) via `Net::HTTP` —
no gem. The HTTP layer is injectable so the batching/payload logic is unit-tested without
network. The service-role key is required (RLS bypass for writes) and is provided in CI
as a secret.

**Files:**
- Modify: `scripts/stars_lib.rb`
- Modify: `scripts/test_stars_lib.rb`

- [ ] **Step 1: Write the failing test**

Append to `scripts/test_stars_lib.rb`:
```ruby
class TestSupabaseSync < Minitest::Test
  def test_patches_each_slug_with_count_and_timestamp
    calls = []
    fake_patch = lambda do |url, body, headers|
      calls << { url: url, body: JSON.parse(body), headers: headers }
      '' # PostgREST returns empty body with return=minimal
    end
    stars = {
      'n8n' => { 'count' => 142318, 'fetched_at' => '2026-06-13T04:00:00Z' },
      'litellm-proxy' => { 'count' => 18204, 'fetched_at' => '2026-06-13T04:00:00Z' }
    }
    synced = StarsLib.sync_supabase(
      stars, url: 'https://x.supabase.co', service_key: 'SRV',
      now: '2026-06-13T04:00:00Z', patcher: fake_patch
    )
    assert_equal 2, synced
    n8n_call = calls.find { |c| c[:url].include?('slug=eq.n8n') }
    refute_nil n8n_call
    assert_equal 142318, n8n_call[:body]['github_stars']
    assert_equal '2026-06-13T04:00:00Z', n8n_call[:body]['github_stars_updated_at']
    assert_equal 'Bearer SRV', n8n_call[:headers]['Authorization']
    assert_equal 'SRV', n8n_call[:headers]['apikey']
  end

  def test_raises_on_missing_creds
    assert_raises(StarsLib::AuthError) do
      StarsLib.sync_supabase({ 'x' => { 'count' => 1 } }, url: nil, service_key: 'k', now: 'T', patcher: ->(*) { '' })
    end
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `undefined method 'sync_supabase'`.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/stars_lib.rb`:
```ruby
  # Default PATCH poster for Supabase PostgREST. Returns response body string.
  def self.default_patcher
    require 'net/http'
    require 'uri'
    lambda do |url, body, headers|
      u = URI(url)
      http = Net::HTTP.new(u.host, u.port)
      http.use_ssl = true
      req = Net::HTTP::Patch.new(u, headers)
      req.body = body
      res = http.request(req)
      raise "Supabase HTTP #{res.code}: #{res.body}" unless res.code.to_i.between?(200, 299)
      res.body
    end
  end

  # Sync canonical counts into the Supabase `tools` table (github_stars +
  # github_stars_updated_at), one PATCH per slug. patcher injectable for tests.
  # Returns the number of slugs synced.
  def self.sync_supabase(stars, url:, service_key:, now:, patcher: nil)
    raise AuthError, 'Missing Supabase URL/key' if url.nil? || url.empty? || service_key.nil? || service_key.empty?
    patcher ||= default_patcher
    base = url.chomp('/')
    headers = {
      'apikey' => service_key,
      'Authorization' => "Bearer #{service_key}",
      'Content-Type' => 'application/json',
      'Prefer' => 'return=minimal'
    }
    count = 0
    stars.each do |slug, entry|
      next unless entry['count'].is_a?(Integer)
      endpoint = "#{base}/rest/v1/tools?slug=eq.#{URI.encode_www_form_component(slug)}"
      payload = JSON.generate({ 'github_stars' => entry['count'], 'github_stars_updated_at' => now })
      patcher.call(endpoint, payload, headers)
      count += 1
    end
    count
  end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/test_stars_lib.rb
git commit -m "feat(stars): sync canonical counts into Supabase column"
```

---

## Task 9: Client renderer js/stars.js

**Files:**
- Create: `js/stars.js`
- Modify: `_layouts/tool.html` (load the script; pass slug)

- [ ] **Step 1: Write the failing test (Playwright)**

Add to `tests/tool-page.spec.js`:
```javascript
const { test, expect } = require('@playwright/test');

test('star badge renders count from stars.json (formatted k)', async ({ page }) => {
  // Stub the stars.json fetch with a known value before navigation.
  await page.route('**/data/stars.json*', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ generated_at: 'T', stars: { 'n8n': { count: 142318, fetched_at: 'T' } } })
  }));
  await page.goto('/tools/n8n/');
  await expect(page.locator('.tool-stars .star-count')).toHaveText('142k');
});

test('star badge keeps build-time fallback when stars.json fails', async ({ page }) => {
  await page.route('**/data/stars.json*', route => route.fulfill({ status: 500, body: '' }));
  await page.goto('/tools/n8n/');
  // Fallback is the build-time rendered value; assert it is a non-empty "...k".
  await expect(page.locator('.tool-stars .star-count')).toHaveText(/\d+k/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/tool-page.spec.js -g "stars.json"`
Expected: FAIL — badge does not update / `js/stars.js` not loaded (first test fails; the slug used must be a real OSS tool page — if `n8n` isn't built, substitute a tool slug that exists with a github_url).

- [ ] **Step 3: Write minimal implementation**

Create `js/stars.js`:
```javascript
// Renders the canonical GitHub star count from data/stars.json into the
// tool-page badge. Single source of truth: data/stars.json.
(function () {
  function formatK(n) {
    return Math.round(n / 1000) + 'k';
  }

  async function render() {
    var badge = document.querySelector('.tool-stars .star-count');
    var slugEl = document.querySelector('[data-tool-slug]');
    if (!badge || !slugEl) return;
    var slug = slugEl.getAttribute('data-tool-slug');
    if (!slug) return;

    try {
      var res = await fetch('/data/stars.json', { cache: 'no-cache' });
      if (!res.ok) return; // keep build-time fallback
      var data = await res.json();
      var entry = data.stars && data.stars[slug];
      if (entry && typeof entry.count === 'number') {
        badge.textContent = formatK(entry.count);
      }
    } catch (e) {
      // network/parse failure: keep build-time fallback, never hide
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
```

Modify `_layouts/tool.html`: add before the closing `</body>` (or alongside existing script tags), and ensure a slug carrier exists. The badge already lives near `data-tool-slug="{{ page.slug }}"` at line 210, so `js/stars.js` can read it. Add:
```html
<script src="/js/stars.js?t={{ site.time | date: '%s' }}"></script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/tool-page.spec.js -g "stars.json"`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add js/stars.js _layouts/tool.html tests/tool-page.spec.js
git commit -m "feat(stars): client renders canonical star count with fallback"
```

---

## Task 10: Remove the Supabase badge override (#5)

**Files:**
- Modify: `_layouts/tool.html` (~line 338)

- [ ] **Step 1: Write the failing test**

Add to `tests/tool-page.spec.js`:
```javascript
test('star badge is not overwritten by Supabase value', async ({ page }) => {
  await page.route('**/data/stars.json*', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ generated_at: 'T', stars: { 'n8n': { count: 142318, fetched_at: 'T' } } })
  }));
  // Even if Supabase returns a different number, the badge must reflect stars.json.
  await page.goto('/tools/n8n/');
  await page.waitForTimeout(500); // allow any late Supabase code to run
  await expect(page.locator('.tool-stars .star-count')).toHaveText('142k');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/tool-page.spec.js -g "not overwritten"`
Expected: FAIL if the Supabase block still writes `.star-count` after `js/stars.js`.

- [ ] **Step 3: Implement — remove the override**

In `_layouts/tool.html`, locate the Supabase render path (around line 338, `githubStars: tool.github_stars`). Remove the line/branch that writes the fetched Supabase star value into the `.star-count` element. Keep fetching the column if used elsewhere, but do not render it into the badge. (Exact removal: delete the DOM write to `.star-count` in the Supabase `.then(...)`; leave the GraphQL/`js/stars.js` path as the only badge writer.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/tool-page.spec.js -g "not overwritten"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add _layouts/tool.html tests/tool-page.spec.js
git commit -m "fix(stars): stop Supabase from overriding the star badge"
```

---

## Task 11: Backfill resolver — scoring logic

**Files:**
- Modify: `scripts/stars_lib.rb`
- Modify: `scripts/test_stars_lib.rb`

- [ ] **Step 1: Write the failing test**

Append to `scripts/test_stars_lib.rb`:
```ruby
class TestResolveScoring < Minitest::Test
  def candidates
    [
      { 'full_name' => 'n8n-io/n8n', 'stargazent_count' => nil, 'stargazers_count' => 140000 },
      { 'full_name' => 'someone/n8n-clone', 'stargazers_count' => 12 }
    ]
  end

  def test_high_confidence_exact_name_and_close_stars
    best = StarsLib.best_candidate('n8n', 138000, candidates)
    assert_equal 'n8n-io/n8n', best[:full_name]
    assert best[:confidence] >= 0.8
  end

  def test_low_confidence_when_star_counts_diverge
    cands = [{ 'full_name' => 'x/n8n', 'stargazers_count' => 5 }]
    best = StarsLib.best_candidate('n8n', 140000, cands)
    assert best[:confidence] < 0.8
  end

  def test_nil_when_no_candidates
    assert_nil StarsLib.best_candidate('n8n', 100, [])
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `undefined method 'best_candidate'`.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/stars_lib.rb`:
```ruby
  # Choose the best repo candidate for a tool. Returns
  # { full_name:, confidence: 0.0..1.0 } or nil. Confidence combines
  # name match with proximity of candidate stars to the known count.
  def self.best_candidate(tool_name, known_stars, candidates)
    return nil if candidates.nil? || candidates.empty?
    scored = candidates.map do |c|
      repo_name = c['full_name'].to_s.split('/').last.to_s.downcase
      name_score = repo_name == tool_name.to_s.downcase ? 1.0 :
                   repo_name.include?(tool_name.to_s.downcase) ? 0.5 : 0.0
      cstars = c['stargazers_count'].to_i
      star_score =
        if known_stars.to_i <= 0 || cstars <= 0
          0.5
        else
          ratio = [cstars, known_stars].min.to_f / [cstars, known_stars].max
          ratio # 1.0 when equal, →0 as they diverge
        end
      { full_name: c['full_name'], confidence: (name_score * 0.6 + star_score * 0.4).round(3) }
    end
    scored.max_by { |s| s[:confidence] }
  end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/test_stars_lib.rb
git commit -m "feat(stars): repo backfill candidate scoring"
```

---

## Task 12: Backfill resolver CLI

**Files:**
- Create: `scripts/resolve-github-urls.rb`

- [ ] **Step 1: Write the failing test**

Append to `scripts/test_stars_lib.rb`:
```ruby
class TestResolveFrontmatter < Minitest::Test
  def test_inserts_github_url_when_high_confidence
    Tempfile.create(['tool', '.md']) do |f|
      f.write("---\nslug: \"x\"\ngithub_stars: 100\n---\n\nBody.\n")
      f.flush
      changed = StarsLib.update_frontmatter_url(f.path, 'https://github.com/o/x')
      assert changed
      assert_includes File.read(f.path), 'github_url: "https://github.com/o/x"'
    end
  end

  def test_does_not_overwrite_existing_github_url
    Tempfile.create(['tool', '.md']) do |f|
      f.write("---\nslug: \"x\"\ngithub_url: \"https://github.com/o/orig\"\n---\n\nB.\n")
      f.flush
      changed = StarsLib.update_frontmatter_url(f.path, 'https://github.com/o/new')
      refute changed
      assert_includes File.read(f.path), 'orig'
    end
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ruby scripts/test_stars_lib.rb`
Expected: FAIL — `undefined method 'update_frontmatter_url'`.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/stars_lib.rb`:
```ruby
  # Insert github_url: into frontmatter if absent. Returns true if changed.
  def self.update_frontmatter_url(path, url)
    content = File.read(path)
    return false unless content =~ /\A(---\s*\n)(.*?)(\n---\s*\n)/m
    head, fm, tail = $1, $2, $3
    rest = content[($1.length + $2.length + $3.length)..]
    return false if fm =~ /^github_url:/
    new_content = "#{head}#{fm}\ngithub_url: \"#{url}\"#{tail}#{rest}"
    File.write(path, new_content)
    true
  end
```

Create `scripts/resolve-github-urls.rb`:
```ruby
#!/usr/bin/env ruby
# One-time backfill: find github_url for tools that have github_stars but no URL.
require_relative 'stars_lib'
require 'net/http'
require 'uri'

tools_dir = ARGV[0] || 'data/_tools'
token = ENV['GITHUB_TOKEN']
abort 'Missing GITHUB_TOKEN' if token.nil? || token.empty?
threshold = 0.8

def search(name, token)
  uri = URI("https://api.github.com/search/repositories?q=#{URI.encode_www_form_component(name)}&per_page=5")
  http = Net::HTTP.new(uri.host, uri.port); http.use_ssl = true
  req = Net::HTTP::Get.new(uri)
  req['Authorization'] = "bearer #{token}"
  req['User-Agent'] = 'ai-tool-review-star-refresh'
  res = http.request(req)
  return [] unless res.code.to_i == 200
  JSON.parse(res.body)['items'] || []
end

manual = []
auto = 0
Dir.glob(File.join(tools_dir, '**/*.md')).sort.each do |path|
  next if File.basename(path).start_with?('_')
  fm = StarsLib.parse_frontmatter(path)
  next unless fm && fm['slug']
  next if fm['github_url']           # already has one
  next unless fm['github_stars']     # only tools that claim stars

  candidates = search(fm['name'] || fm['slug'], token)
  best = StarsLib.best_candidate(fm['name'] || fm['slug'], fm['github_stars'], candidates)
  if best && best[:confidence] >= threshold
    StarsLib.update_frontmatter_url(path, "https://github.com/#{best[:full_name]}")
    auto += 1
    puts "AUTO  #{fm['slug']} -> #{best[:full_name]} (#{best[:confidence]})"
  else
    label = best ? "#{best[:full_name]} (#{best[:confidence]})" : 'no candidate'
    manual << "MANUAL #{fm['slug']} -> #{label}"
  end
  sleep 2 # stay polite to the search API rate limit
end

puts "\nAuto-resolved: #{auto}"
puts "Needs manual review: #{manual.size}"
manual.each { |m| puts "  #{m}" }
```

- [ ] **Step 4: Run test to verify it passes; then run the backfill once**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS.

Run (one-time): `GITHUB_TOKEN=$(gh auth token) ruby scripts/resolve-github-urls.rb data/_tools`
Expected: prints AUTO lines, then a MANUAL list. **Human reviews the MANUAL list** and adds `github_url:` by hand where correct; leaves closed-source tools with none.

- [ ] **Step 5: Commit**

```bash
git add scripts/stars_lib.rb scripts/resolve-github-urls.rb data/_tools
git commit -m "feat(stars): one-time github_url backfill resolver"
```

---

## Task 13: Strip hardcoded star figures from description prose (#2)

**Files:**
- Modify: ~40 files under `data/_tools/**/*.md`
- Modify: `tests/data-integrity.spec.js`

- [ ] **Step 1: Write the failing test (guard against regressions)**

Add to `tests/data-integrity.spec.js`:
```javascript
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name.endsWith('.md') && !e.name.startsWith('_')) out.push(p);
  }
  return out;
}

test('no tool description prose hardcodes a GitHub star figure', () => {
  const offenders = [];
  // Star figures inside prose, e.g. "57K+ GitHub stars", "96,700+ stars", "nearly 100K stars".
  const re = /\b\d[\d.,]*\s*[kK]?\+?\s*(github\s+)?stars?\b/i;
  for (const file of walk('data/_tools')) {
    const content = fs.readFileSync(file, 'utf8');
    const body = content.replace(/^---[\s\S]*?---/, ''); // strip frontmatter
    if (re.test(body)) offenders.push(path.relative('data/_tools', file));
  }
  expect(offenders, `Star figures must live only in the badge:\n${offenders.join('\n')}`).toEqual([]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/data-integrity.spec.js -g "hardcodes a GitHub star"`
Expected: FAIL — lists ~40 offending files.

- [ ] **Step 3: Fix the prose**

For each offending file, reword the sentence/table cell to drop the number. Examples:
- `with nearly 100K GitHub stars` → `one of the fastest-growing browser automation frameworks`
- `<li>57,400+ GitHub stars</li>` → remove the bullet (the badge shows the count)
- `<li>Strong OSS community (57K+ GitHub stars)</li>` → `<li>Strong OSS community</li>`
- `Yes (22K stars)` (comparison table) → `Yes`

Work through the failing list until the test passes. Do not touch frontmatter `github_stars:` (that's the badge source).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/data-integrity.spec.js -g "hardcodes a GitHub star"`
Expected: PASS (offenders empty).

- [ ] **Step 5: Commit**

```bash
git add data/_tools tests/data-integrity.spec.js
git commit -m "refactor(stars): remove hardcoded star figures from tool prose"
```

---

## Task 14: Daily GitHub Action

**Files:**
- Create: `.github/workflows/refresh-stars.yml`

**Prerequisite — add repo secrets (one-time, manual):** the Supabase sync (Task 8b)
needs two Actions secrets on the repo. The `github_url` fetch uses the auto-provided
`GITHUB_TOKEN` (no setup). Run:
```bash
gh secret set SUPABASE_URL --body "https://<project>.supabase.co"
gh secret set SUPABASE_SERVICE_KEY --body "<service-role-key>"
```
If these are absent, the run still succeeds — the fetcher logs "Supabase creds absent;
skipping DB sync" — but the DB column won't refresh, so add them for the full SSOT.

- [ ] **Step 1: Write the failing test (workflow validation)**

The repo already validates workflows via `node scripts/validate-workflows.js` (see `package.json`). That script is the gate. First add the workflow file, then run the validator.

- [ ] **Step 2: Create the workflow**

`.github/workflows/refresh-stars.yml`:
```yaml
name: Refresh GitHub Stars

on:
  schedule:
    - cron: '0 4 * * *'   # daily 04:00 UTC
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: refresh-stars
  cancel-in-progress: false

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true

      - name: Run unit tests
        run: ruby scripts/test_stars_lib.rb

      - name: Fetch stars
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: ruby scripts/fetch-stars.rb data/_tools data/stars.json

      - name: Regenerate js/data.js
        run: ruby scripts/generate-json.rb data/_tools

      - name: Commit if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          if [[ -n "$(git status --porcelain data/stars.json data/_tools js/data.js)" ]]; then
            git add data/stars.json data/_tools js/data.js
            git commit -m "chore(stars): daily refresh"
            git push
          else
            echo "No star changes."
          fi
```

Note: do **not** add `[skip ci]` to the commit — option (b) below relies on this push
triggering `deploy.yml`'s path filter. `[skip ci]` would suppress it.

- [ ] **Step 3: Validate the workflow**

Run: `node scripts/validate-workflows.js`
Expected: prints `Checking refresh-stars.yml...` and `All workflows valid`.

- [ ] **Step 4: Verify deploy chain trigger (the one open risk from the spec)**

`deploy.yml` triggers on `workflow_run` of "Tests" on `main`. A bot push of `data/stars.json` will NOT trigger `deploy.yml` directly. Decide one:
- **(a)** Append a deploy trigger to `refresh-stars.yml`: after push, `gh workflow run deploy.yml` (needs `gh` + token), OR
- **(b)** Add `push: { branches: [main], paths: ['data/stars.json'] }` trigger to `deploy.yml`, OR
- **(c)** Build Jekyll and deploy within `refresh-stars.yml` itself.

Implement **(b)** as the lowest-coupling option: edit `.github/workflows/deploy.yml` `on:` to add:
```yaml
  push:
    branches: [main]
    paths: ['data/stars.json']
```
Re-run `node scripts/validate-workflows.js` → expect valid.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/refresh-stars.yml .github/workflows/deploy.yml
git commit -m "ci(stars): daily star refresh workflow + deploy trigger"
```

---

## Task 15: Full-suite verification

**Files:** none (verification only)

- [ ] **Step 1: Run Ruby unit tests**

Run: `ruby scripts/test_stars_lib.rb`
Expected: PASS, all assertions.

- [ ] **Step 2: Run data + workflow validators**

Run: `npm run validate && npm run generate && npm run validate:data && npm run validate:workflows`
Expected: all green; `js/data.js` regenerates with refreshed counts.

- [ ] **Step 3: Run Playwright tool-page + data-integrity specs**

Run: `npx playwright test tests/tool-page.spec.js tests/data-integrity.spec.js`
Expected: PASS — badge renders from stars.json, fallback works, no prose star figures.

- [ ] **Step 4: Manual consistency spot-check**

Pick one tool (e.g. n8n). Confirm the same number appears on: the tool page badge, the landscape card, and search results, and that `data/stars.json`, the tool's frontmatter `github_stars:`, and `js/data.js` all agree.

- [ ] **Step 5: Commit any fixes and finalize**

```bash
git add -A
git commit -m "test(stars): full-suite verification green"
```

---

## Self-Review

**Spec coverage:**
- SSOT via stars.json — Tasks 4, 6, 8, 9 ✓
- Daily fetcher, token-free, GraphQL batched, keep-on-error — Tasks 3, 4, 7, 8 ✓
- Frontmatter #1 derived — Task 5, 8 ✓
- `js/data.js` #3 derived — Task 14 (regen step) + existing generator ✓
- Supabase #4 — synced from canonical counts — Task 8b (lib + test) + Task 14 (CI secrets) ✓
- Supabase override #5 removed — Task 10 ✓
- Client renderer, format-k, always-last-known fallback — Task 9 ✓
- One-time URL backfill resolver — Tasks 11, 12 ✓
- Prose cleanup #2 — Task 13 ✓
- Daily Action + deploy trigger + freshness marker (`generated_at`) — Task 14, and `generated_at` written in Task 4 ✓
- Staleness: always-last-known + loud failure (token missing aborts; per-repo logged) — Tasks 7, 8 ✓

**Note on Supabase column (#4):** Codebase inspection confirmed the DB column IS a live
renderer — `_layouts/tool.html:275` selects `github_stars` from Supabase and feeds it into
the reviews component (line 338). So the sync is required, not optional. Task 8b syncs the
column from the canonical counts (PostgREST PATCH per slug, injectable HTTP for tests), and
Task 14 wires the `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` secrets. The sync is opt-in by
env presence so local runs without DB creds still succeed (logged + skipped, non-fatal).
This restores full SSOT across all five surfaces.

**Placeholder scan:** No TBD/TODO; every code step has full code. ✓

**Type/name consistency:** `StarsLib.parse_repo`, `scan_tools`, `build_graphql_query`, `merge_results`, `serialize`, `fetch_graphql`, `run_refresh`, `update_frontmatter_stars`, `update_frontmatter_url`, `best_candidate`, `sync_supabase` — names used consistently across tasks and CLIs. stars.json shape (`generated_at`, `stars[slug].count/.fetched_at`) identical in Ruby (Task 4/6), client (Task 9), Supabase sync (Task 8b), and Playwright stubs (Tasks 9, 10). Supabase columns `github_stars` + `github_stars_updated_at` match the schema (`supabase/migrations/001_create_schema.sql:19-20`). ✓
