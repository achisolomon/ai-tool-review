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
end
