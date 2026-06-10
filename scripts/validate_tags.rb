#!/usr/bin/env ruby
require 'yaml'
require 'set'
require 'date'

# Load valid tags from _tags.yaml
def load_valid_tags(tags_file)
  return Set.new unless File.exist?(tags_file)

  content = File.read(tags_file)
  return Set.new if content.strip.empty?

  tags_data = YAML.safe_load(content)
  return Set.new unless tags_data.is_a?(Hash)

  valid_tags = Set.new
  tags_data.each do |_group, tags_list|
    next unless tags_list.is_a?(Array)
    tags_list.each do |tag|
      valid_tags.add(tag['slug']) if tag['slug']
    end
  end

  valid_tags
end

# Load category/subcategory names from _categories.yaml
def load_category_names(categories_file)
  return Set.new unless File.exist?(categories_file)

  content = File.read(categories_file)
  return Set.new if content.strip.empty?

  categories = YAML.safe_load(content)
  return Set.new unless categories.is_a?(Hash)

  names = Set.new

  categories.each do |_track, cats|
    next unless cats.is_a?(Hash)
    cats.each do |cat_id, cat_data|
      names.add(cat_id)
      names.add(cat_data['name']&.downcase&.gsub(/\s+/, '-')) if cat_data['name']
      (cat_data['subcategories'] || {}).each do |subcat_id, subcat_data|
        names.add(subcat_id)
        names.add(subcat_data['name']&.downcase&.gsub(/\s+/, '-')) if subcat_data['name']
      end
    end
  end

  names
end

# Parse frontmatter from MD file
def parse_frontmatter(file_path)
  content = File.read(file_path)
  if content =~ /\A---\s*\n(.*?)\n---\s*\n/m
    YAML.safe_load($1, permitted_classes: [Date])
  else
    nil
  end
end

# Main validation
def validate_tags(tools_dir, tags_file, categories_file)
  valid_tags = load_valid_tags(tags_file)
  category_names = load_category_names(categories_file)

  errors = []
  warnings = []

  Dir.glob(File.join(tools_dir, '**/*.md')).each do |file|
    next if File.basename(file).start_with?('_')  # Skip _schema.md, _categories.yaml, etc.

    frontmatter = parse_frontmatter(file)
    next unless frontmatter

    tool_name = frontmatter['name'] || File.basename(file, '.md')
    tags = frontmatter['tags'] || []

    # Check for duplicate tags
    if tags.length != tags.uniq.length
      duplicates = tags.group_by(&:itself).select { |_, v| v.length > 1 }.keys
      errors << "#{tool_name}: Duplicate tags: #{duplicates.join(', ')}"
    end

    tags.each do |tag|
      # Check if tag exists in vocabulary
      unless valid_tags.include?(tag)
        errors << "#{tool_name}: Unknown tag '#{tag}' - add it to _tags.yaml or remove it"
      end

      # Check if tag matches a category name
      if category_names.include?(tag)
        errors << "#{tool_name}: Tag '#{tag}' matches a category/subcategory name - use categories for navigation, not tags"
      end
    end
  end

  { errors: errors, warnings: warnings }
end

# Run validation
if __FILE__ == $0
  tools_dir = ARGV[0] || File.join(File.dirname(__FILE__), '..', 'data', '_tools')
  tags_file = File.join(tools_dir, '_tags.yaml')
  categories_file = File.join(tools_dir, '_categories.yaml')

  puts "Validating tags..."
  puts "  Tools dir: #{tools_dir}"
  puts "  Tags file: #{tags_file}"
  puts "  Categories file: #{categories_file}"
  puts

  result = validate_tags(tools_dir, tags_file, categories_file)

  if result[:warnings].any?
    puts "Warnings:"
    result[:warnings].each { |w| puts "  ⚠️  #{w}" }
    puts
  end

  if result[:errors].any?
    puts "Errors:"
    result[:errors].each { |e| puts "  ❌ #{e}" }
    puts
    puts "Build FAILED: #{result[:errors].length} tag validation error(s)"
    exit 1
  else
    puts "✅ All tags valid"
    exit 0
  end
end
