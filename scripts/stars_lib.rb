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

  # Serialize a merged result to pretty JSON with sorted slugs.
  # The internal :errors key is dropped.
  def self.serialize(merged)
    sorted = merged['stars'].keys.sort.each_with_object({}) { |k, h| h[k] = merged['stars'][k] }
    JSON.pretty_generate({ 'generated_at' => merged['generated_at'], 'stars' => sorted }) + "\n"
  end
end
