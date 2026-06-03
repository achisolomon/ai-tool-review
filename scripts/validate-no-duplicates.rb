#!/usr/bin/env ruby
# Validates that no duplicate slugs exist across tool files
# Run before generate-json.rb to catch duplicates early
# Exit code 1 if duplicates found, 0 if clean

require 'yaml'
require 'date'

def parse_frontmatter(file_path)
  content = File.read(file_path)
  if content =~ /\A---\s*\n(.*?)\n---\s*\n/m
    YAML.safe_load($1, permitted_classes: [Date])
  else
    nil
  end
rescue => e
  puts "Warning: Could not parse #{file_path}: #{e.message}"
  nil
end

def validate_no_duplicates(tools_dir)
  slug_to_files = {}

  Dir.glob(File.join(tools_dir, '**/*.md')).each do |file|
    next if File.basename(file).start_with?('_')

    frontmatter = parse_frontmatter(file)
    next unless frontmatter

    slug = frontmatter['slug']
    next unless slug

    relative_path = file.sub("#{tools_dir}/", '')
    slug_to_files[slug] ||= []
    slug_to_files[slug] << relative_path
  end

  duplicates = slug_to_files.select { |slug, files| files.length > 1 }

  if duplicates.empty?
    puts "✓ No duplicate slugs found (#{slug_to_files.length} unique tools)"
    return true
  else
    puts "✗ Found #{duplicates.length} duplicate slug(s):\n\n"

    duplicates.each do |slug, files|
      puts "  slug: \"#{slug}\" appears in #{files.length} files:"
      files.each { |f| puts "    - #{f}" }
      puts
    end

    puts "Fix: Keep only one file per slug, or use additional_categories"
    puts "     in a single file to list a tool in multiple categories."
    return false
  end
end

# Main
tools_dir = ARGV[0] || 'data/_tools'

unless Dir.exist?(tools_dir)
  puts "Error: Directory not found: #{tools_dir}"
  exit 1
end

success = validate_no_duplicates(tools_dir)
exit(success ? 0 : 1)
