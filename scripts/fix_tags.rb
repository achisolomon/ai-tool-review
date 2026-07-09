#!/usr/bin/env ruby
# frozen_string_literal: true

require 'yaml'

# Valid tags from _tags.yaml
VALID_TAGS = %w[
  reasoning agents multimodal rag real-time fine-tuning
  api-available mcp-server python typescript vscode-extension
  enterprise open-source self-hosted serverless
  no-code workflow-automation browser-automation evaluation observability
  cost-reduction
].freeze

# Category/subcategory names that should NOT be used as tags
CATEGORY_NAMES = %w[
  image-generation video-generation voice-speech music-generation 3d-other
  chat-assistants ai-search writing-tools notetakers browsers
  workflow-builders legal healthcare sales-marketing customer-support
  finance education recruiting design enterprise voice-agents contact-center
  closed-frontier open-source model-hubs ai-ides coding-agents app-builders
  code-review spec-driven testing-sensors code-intelligence dev-environment
  agent-platforms code-first browser-agents protocols
  tool-integrations agent-memory durable-execution agent-identity
  app-frameworks prompt-engineering inference-apis gpu-providers model-routers
  ml-frameworks fine-tuning mlops experiment-tracking data-labeling
  embeddings data-ingestion lakehouse-semantic dedicated extensions rag-kg
  llm-observability evaluation guardrails red-teaming app-observability
].freeze

# Tag consolidation rules
TAG_MAPPINGS = {
  # Consolidate agent variants
  'ai-agents' => 'agents',
  'multi-agent' => 'agents',
  'autonomous-agents' => 'agents',
  'autonomous-agent' => 'agents',

  # Consolidate enterprise variants
  'enterprise-ready' => 'enterprise',

  # Consolidate evaluation variants
  'evaluations' => 'evaluation',

  # Rename old reduces-costs tag
  'reduces-costs' => 'cost-reduction',

  # SDK consolidation
  'sdk-python' => 'python',
  'sdk-typescript' => 'typescript',
}.freeze

def process_file(file_path)
  content = File.read(file_path)

  # Extract frontmatter
  unless content =~ /\A---\n(.*?)\n---\n/m
    puts "  ⚠️  No frontmatter found in #{file_path}"
    return false
  end

  frontmatter_text = $1
  rest_of_content = $'

  begin
    frontmatter = YAML.load(frontmatter_text)
  rescue => e
    puts "  ❌ Failed to parse YAML in #{file_path}: #{e.message}"
    return false
  end

  return false unless frontmatter['tags']&.any?

  original_tags = frontmatter['tags'].dup
  tags = frontmatter['tags']

  # Apply transformations
  tags = tags.map do |tag|
    # Apply mapping if exists
    TAG_MAPPINGS[tag] || tag
  end

  # Remove category/subcategory names
  tags = tags.reject { |tag| CATEGORY_NAMES.include?(tag) }

  # Remove invalid tags (not in vocabulary)
  tags = tags.select { |tag| VALID_TAGS.include?(tag) }

  # Remove duplicates
  tags = tags.uniq

  # Sort for consistency
  tags = tags.sort

  # Check if anything changed
  return false if tags == original_tags.sort

  # Find the tags section in the frontmatter text and replace it
  if tags.empty?
    # Remove the entire tags section
    new_frontmatter = frontmatter_text.gsub(/^tags:\s*\n(?:  - .+\n)+/, '')
  else
    # Build new tags YAML
    tags_yaml = "tags:\n" + tags.map { |t| "  - #{t}" }.join("\n") + "\n"

    # Replace tags section
    new_frontmatter = frontmatter_text.sub(/^tags:\s*\n(?:  - .+\n)+/, tags_yaml)
  end

  # Ensure proper newline before closing ---
  new_frontmatter = new_frontmatter.chomp + "\n" unless new_frontmatter.end_with?("\n")

  # Rebuild file
  new_content = "---\n#{new_frontmatter}---\n#{rest_of_content}"

  File.write(file_path, new_content)

  tool_name = frontmatter['name'] || File.basename(file_path, '.md')
  puts "  ✅ #{tool_name}: #{original_tags.sort.inspect} → #{tags.inspect}"

  true
rescue => e
  puts "  ❌ Error processing #{file_path}: #{e.message}"
  puts e.backtrace.first(3).join("\n")
  false
end

# Main execution
tools_dir = ARGV[0] || 'data/_tools'

unless Dir.exist?(tools_dir)
  puts "❌ Directory not found: #{tools_dir}"
  exit 1
end

puts "Fixing tags in #{tools_dir}..."
puts

changed_count = 0
total_count = 0

Dir.glob("#{tools_dir}/**/*.md").sort.each do |file|
  next if File.basename(file).start_with?('_')

  total_count += 1
  changed_count += 1 if process_file(file)
end

puts
puts "=" * 60
puts "Processed: #{total_count} files"
puts "Changed: #{changed_count} files"
puts "=" * 60
