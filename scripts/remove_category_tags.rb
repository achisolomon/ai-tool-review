#!/usr/bin/env ruby
# Remove tags that match category/subcategory names from tool files

require 'yaml'
require 'date'
require 'set'

# Tags to remove (match category/subcategory names)
TAGS_TO_REMOVE = Set.new(%w[
  open-source
  enterprise
  evaluation
  mlops
])

# Also remove these unknown tags that aren't in vocabulary
UNKNOWN_TAGS_TO_REMOVE = Set.new(%w[
  search
  payments
  fintech
  blockchain
  crypto
  cards
  framework
])

ALL_TAGS_TO_REMOVE = TAGS_TO_REMOVE | UNKNOWN_TAGS_TO_REMOVE

tools_dir = File.expand_path('../data/_tools', __dir__)
modified_count = 0

Dir.glob(File.join(tools_dir, '**/*.md')).each do |file|
  next if File.basename(file).start_with?('_')

  content = File.read(file)
  next unless content =~ /\A---\s*\n(.*?)\n---\s*\n/m

  frontmatter_str = $1
  body = content[($&.length)..]

  begin
    frontmatter = YAML.safe_load(frontmatter_str, permitted_classes: [Date])
  rescue => e
    puts "Error parsing #{file}: #{e.message}"
    next
  end

  next unless frontmatter.is_a?(Hash) && frontmatter['tags'].is_a?(Array)

  original_tags = frontmatter['tags'].dup
  frontmatter['tags'] = frontmatter['tags'].reject { |t| ALL_TAGS_TO_REMOVE.include?(t) }

  removed = original_tags - frontmatter['tags']
  next if removed.empty?

  # Remove empty tags array
  frontmatter.delete('tags') if frontmatter['tags'].empty?

  # Rebuild file
  new_content = "---\n#{YAML.dump(frontmatter).sub(/\A---\n/, '')}---\n#{body}"
  File.write(file, new_content)

  puts "#{frontmatter['name']}: removed #{removed.join(', ')}"
  modified_count += 1
end

puts "\nModified #{modified_count} files"
