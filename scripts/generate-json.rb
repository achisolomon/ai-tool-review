#!/usr/bin/env ruby
require 'yaml'
require 'json'
require 'date'

# Parse frontmatter from MD file
def parse_frontmatter(file_path)
  content = File.read(file_path)
  if content =~ /\A---\s*\n(.*?)\n---\s*\n/m
    YAML.safe_load($1, permitted_classes: [Date])
  else
    nil
  end
end

# Build tools data structure
def build_tools_json(tools_dir)
  tools_by_track = { 'users' => {}, 'developers' => {} }

  Dir.glob(File.join(tools_dir, '**/*.md')).each do |file|
    next if File.basename(file).start_with?('_')  # Skip schema, categories

    frontmatter = parse_frontmatter(file)
    next unless frontmatter

    track = frontmatter['track'] || 'developers'
    track = 'developers' if track == 'both'  # Default to developers for 'both'
    category = frontmatter['category']
    subcategory = frontmatter['subcategory']

    next unless category && subcategory

    tools_by_track[track][category] ||= { 'subcategories' => {} }
    tools_by_track[track][category]['subcategories'][subcategory] ||= []

    tools_by_track[track][category]['subcategories'][subcategory] << {
      'name' => frontmatter['name'],
      'slug' => frontmatter['slug'],
      'url' => frontmatter['url'],
      'description' => frontmatter['description'],
      'type' => frontmatter['type'],
      'github_stars' => frontmatter['github_stars'],
      'pricing_model' => frontmatter['pricing_model']
    }

    # Handle additional categories
    (frontmatter['additional_categories'] || []).each do |add_cat|
      add_track = track  # Keep same track for additional categories
      add_category = add_cat['category']
      add_subcategory = add_cat['subcategory']

      tools_by_track[add_track][add_category] ||= { 'subcategories' => {} }
      tools_by_track[add_track][add_category]['subcategories'][add_subcategory] ||= []

      tools_by_track[add_track][add_category]['subcategories'][add_subcategory] << {
        'name' => frontmatter['name'],
        'slug' => frontmatter['slug'],
        'url' => frontmatter['url'],
        'description' => frontmatter['description'],
        'type' => frontmatter['type'],
        'github_stars' => frontmatter['github_stars'],
        'pricing_model' => frontmatter['pricing_model']
      }
    end
  end

  # Convert to final structure
  result = { 'users' => [], 'developers' => [] }

  tools_by_track.each do |track, categories|
    categories.each do |cat_id, cat_data|
      category_obj = {
        'id' => cat_id,
        'name' => cat_id.split('-').map(&:capitalize).join(' '),
        'track' => track,
        'subcategories' => []
      }

      cat_data['subcategories'].each do |subcat_id, tools|
        category_obj['subcategories'] << {
          'id' => subcat_id,
          'name' => subcat_id.split('-').map(&:capitalize).join(' '),
          'tools' => tools.uniq { |t| t['slug'] }
        }
      end

      result[track] << category_obj
    end
  end

  result
end

# Main
tools_dir = ARGV[0] || 'data/tools'
output_file = ARGV[1] || 'data/tools.json'

tools_data = build_tools_json(tools_dir)

File.write(output_file, JSON.pretty_generate(tools_data))
File.write(output_file.sub('.json', '.min.json'), JSON.generate(tools_data))

puts "Generated #{output_file} and #{output_file.sub('.json', '.min.json')}"
puts "Total tools: #{Dir.glob(File.join(tools_dir, '**/*.md')).reject { |f| File.basename(f).start_with?('_') }.count}"
