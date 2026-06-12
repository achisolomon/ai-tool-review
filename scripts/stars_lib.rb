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
end
