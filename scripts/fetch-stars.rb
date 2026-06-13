#!/usr/bin/env ruby
require 'json'
require_relative 'stars_lib'

tools_dir = ARGV[0] || 'data/_tools'
stars_path = ARGV[1] || 'data/stars.json'

token = ENV['GITHUB_TOKEN']
now = Time.now.utc.strftime('%Y-%m-%dT%H:%M:%SZ')

repos = StarsLib.scan_tools(tools_dir)
abort 'No repos with github_url found' if repos.empty?

# Tolerate a corrupt prior stars.json (e.g. a partial write from a killed run)
# rather than failing every future run — keep-previous simply degrades to empty.
previous =
  if File.exist?(stars_path)
    begin
      JSON.parse(File.read(stars_path))
    rescue JSON::ParserError
      warn "Existing #{stars_path} is unparseable; ignoring previous counts."
      {}
    end
  else
    {}
  end

fetch = ->(query) { StarsLib.fetch_graphql(query, token: token) }
out = StarsLib.run_refresh(repos, previous: previous, now: now, fetch: fetch)

# Write canonical cache atomically: write to a temp file then rename (atomic on
# POSIX), so an interrupted run can never leave a half-written stars.json.
tmp_path = "#{stars_path}.tmp"
File.write(tmp_path, out[:json])
File.rename(tmp_path, stars_path)
puts "Wrote #{stars_path} (#{out[:merged]['stars'].size} tools)"

# Derive frontmatter (#1). Guard on Integer so a malformed API value can never
# write a non-integer into a tool's frontmatter (matches sync_supabase's guard).
changed = 0
repos.each do |entry|
  star = out[:merged]['stars'][entry[:slug]]
  next unless star && star['count'].is_a?(Integer)
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
