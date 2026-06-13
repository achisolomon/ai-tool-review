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

  # Parse YAML frontmatter from a markdown file. Returns Hash or nil.
  def self.parse_frontmatter(path)
    content = File.read(path)
    return nil unless content =~ /\A---\s*\n(.*?)\n---\s*\n/m
    YAML.safe_load($1, permitted_classes: [Date])
  rescue Psych::SyntaxError
    nil
  end

  # Build a single GraphQL query that aliases each repo as r0, r1, ...
  # The index aligns with the input array order for response mapping.
  def self.build_graphql_query(repos)
    fields = repos.each_with_index.map do |entry, i|
      o = entry[:repo][:owner].gsub('"') { '\\"' }
      n = entry[:repo][:name].gsub('"') { '\\"' }
      "  r#{i}: repository(owner: \"#{o}\", name: \"#{n}\") { stargazerCount }"
    end
    "query {\n#{fields.join("\n")}\n}"
  end

  # Scan tools_dir for files with a parseable github_url.
  # Returns array of { slug:, repo: {owner:, name:}, path: }.
  def self.scan_tools(tools_dir)
    results = []
    Dir.glob(File.join(tools_dir, '**/*.md')).sort.each do |path|
      next if File.basename(path).start_with?('_')
      fm = parse_frontmatter(path)
      next unless fm && fm['github_url'] && fm['slug']
      repo = parse_repo(fm['github_url'])
      next unless repo
      results << { slug: fm['slug'], repo: repo, path: path }
    end
    results
  end

  # Set github_stars: <count> in a file's frontmatter.
  # Line-level edit to preserve comments/formatting elsewhere in the file.
  # Returns true if the file changed, false if already correct.
  def self.update_frontmatter_stars(path, count)
    content = File.read(path)
    return false unless content =~ /\A(---\s*\n)(.*?)(\n---\s*\n)/m
    head, fm, tail = $1, $2, $3
    rest = content[($1.length + $2.length + $3.length)..-1]

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

  # Merge a GraphQL response into a stars.json structure.
  # repos: array in the same order used to build the query.
  # response: parsed JSON Hash (may contain "data" and "errors"); nil-safe.
  # previous: prior stars.json Hash (for keep-on-error); nil-safe.
  # now: ISO8601 timestamp string applied to freshly-fetched entries.
  # Returns a Hash with STRING keys "generated_at" and "stars"
  #   ("stars" => { slug => { "count" => Integer, "fetched_at" => String } })
  # plus a SYMBOL key :errors => [String]. The symbol key is intentional:
  # :errors is internal-only and is dropped before JSON serialization.
  # Note: a stargazerCount of 0 is stored normally (0 is truthy in Ruby).
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
        stars[slug] = prev_stars[slug].dup
        errors << "#{slug} (#{entry[:repo][:owner]}/#{entry[:repo][:name]}): no data, kept previous"
      else
        errors << "#{slug} (#{entry[:repo][:owner]}/#{entry[:repo][:name]}): no data, no previous"
      end
    end

    { 'generated_at' => now, 'stars' => stars, errors: errors }
  end

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

  # Insert github_url: into frontmatter if absent. Returns true if changed.
  def self.update_frontmatter_url(path, url)
    content = File.read(path)
    return false unless content =~ /\A(---\s*\n)(.*?)(\n---\s*\n)/m
    head, fm, tail = $1, $2, $3
    rest = content[($1.length + $2.length + $3.length)..-1]
    return false if fm =~ /^github_url:/
    new_content = "#{head}#{fm}\ngithub_url: \"#{url}\"#{tail}#{rest}"
    File.write(path, new_content)
    true
  end

  class AuthError < StandardError; end
  class ApiError < StandardError; end

  # Default poster using Net::HTTP. Returns the raw response body string.
  def self.default_poster
    require 'net/http'
    require 'uri'
    lambda do |uri, body, headers|
      u = URI(uri)
      http = Net::HTTP.new(u.host, u.port)
      http.use_ssl = true
      http.open_timeout = 10
      http.read_timeout = 30
      req = Net::HTTP::Post.new(u, headers)
      req.body = body
      res = http.request(req)
      raise ApiError, "GitHub API HTTP #{res.code}: #{res.body}" unless res.code.to_i == 200
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

  # Orchestrate one refresh from already-scanned repos. fetch is injectable.
  def self.run_refresh(repos, previous:, now:, fetch:)
    query = build_graphql_query(repos)
    response = fetch.call(query)
    merged = merge_results(repos, response, previous, now: now)
    { merged: merged, json: serialize(merged) }
  end

  # Serialize a merged result to pretty JSON with sorted slugs.
  # The internal :errors key is dropped.
  def self.serialize(merged)
    sorted = merged['stars'].keys.sort.each_with_object({}) { |k, h| h[k] = merged['stars'][k] }
    JSON.pretty_generate({ 'generated_at' => merged['generated_at'], 'stars' => sorted }) + "\n"
  end

  # Default PATCH poster for Supabase PostgREST. Returns response body string.
  def self.default_patcher
    require 'net/http'
    require 'uri'
    lambda do |url, body, headers|
      u = URI(url)
      http = Net::HTTP.new(u.host, u.port)
      http.use_ssl = true
      http.open_timeout = 10
      http.read_timeout = 30
      req = Net::HTTP::Patch.new(u, headers)
      req.body = body
      res = http.request(req)
      raise ApiError, "Supabase HTTP #{res.code}: #{res.body}" unless res.code.to_i.between?(200, 299)
      res.body
    end
  end

  # Sync canonical counts into the Supabase `tools` table (github_stars +
  # github_stars_updated_at), one PATCH per slug. patcher injectable for tests.
  # Returns the number of slugs synced.
  def self.sync_supabase(stars, url:, service_key:, now:, patcher: nil)
    raise AuthError, 'Missing Supabase URL/key' if url.nil? || url.empty? || service_key.nil? || service_key.empty?
    require 'uri'
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
end
