#!/usr/bin/env ruby
# One-time backfill: find github_url for tools that have github_stars but no URL.
require_relative 'stars_lib'
require 'json'
require 'net/http'
require 'uri'

tools_dir = ARGV[0] || 'data/_tools'
token = ENV['GITHUB_TOKEN']
abort 'Missing GITHUB_TOKEN' if token.nil? || token.empty?
threshold = 0.8

def search(name, token)
  uri = URI("https://api.github.com/search/repositories?q=#{URI.encode_www_form_component(name)}&per_page=5")
  http = Net::HTTP.new(uri.host, uri.port); http.use_ssl = true
  http.open_timeout = 10
  http.read_timeout = 30
  req = Net::HTTP::Get.new(uri)
  req['Authorization'] = "bearer #{token}"
  req['User-Agent'] = 'ai-tool-review-star-refresh'
  res = http.request(req)
  unless res.code.to_i == 200
    warn "  ! search HTTP #{res.code} for #{name.inspect} (treated as no candidate)"
    return []
  end
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
  sleep 3 # GitHub Search API allows 30 req/min; 3s leaves margin
end

puts "\nAuto-resolved: #{auto}"
puts "Needs manual review: #{manual.size}"
manual.each { |m| puts "  #{m}" }
