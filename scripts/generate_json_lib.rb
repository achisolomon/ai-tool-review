#!/usr/bin/env ruby
require 'yaml'
require 'json'
require 'date'

# Load category names from _categories.yaml (single source of truth)
def load_category_names(categories_file)
  return {} unless File.exist?(categories_file)

  content = File.read(categories_file)
  return {} if content.strip.empty?

  categories = YAML.safe_load(content)
  return {} unless categories.is_a?(Hash)

  names = {}

  categories.each do |track, cats|
    next unless cats.is_a?(Hash)
    cats.each do |cat_id, cat_data|
      names[cat_id] = cat_data['name'] if cat_data['name']
      (cat_data['subcategories'] || {}).each do |subcat_id, subcat_data|
        names[subcat_id] = subcat_data['name'] if subcat_data['name']
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

# Load full taxonomy (ids + names + descriptions) for the picker UIs.
def load_taxonomy(categories_file, tags_file)
  categories = File.exist?(categories_file) ? (YAML.safe_load(File.read(categories_file)) || {}) : {}
  tags = File.exist?(tags_file) ? (YAML.safe_load(File.read(tags_file)) || {}) : {}
  { 'categories' => categories, 'tags' => tags }
end

# Load the append-only contributor changelog (newest first).
def load_changelog(changelog_file)
  return [] unless File.exist?(changelog_file)
  data = YAML.safe_load(File.read(changelog_file), permitted_classes: [Date]) || {}
  entries = data['entries'] || []
  entries.sort_by { |e| e['date'].to_s }.reverse
end

# Build tools data structure
def build_tools_json(tools_dir, category_names = {})
  tools_by_track = { 'users' => {}, 'developers' => {} }

  Dir.glob(File.join(tools_dir, '**/*.md')).each do |file|
    next if File.basename(file).start_with?('_')  # Skip schema, categories

    frontmatter = parse_frontmatter(file)
    next unless frontmatter

    track = frontmatter['track'] || 'developers'
    track = 'developers' if track == 'both'  # Default to developers for 'both'
    category = frontmatter['category']
    # Flat categories (no subcategories defined) use the category id as the subcategory.
    # This means subcategory is never required in frontmatter.
    subcategory = frontmatter['subcategory'] || category

    next unless category

    tools_by_track[track][category] ||= { 'subcategories' => {} }
    tools_by_track[track][category]['subcategories'][subcategory] ||= []

    tools_by_track[track][category]['subcategories'][subcategory] << {
      'name' => frontmatter['name'],
      'slug' => frontmatter['slug'],
      'url' => frontmatter['website'] || frontmatter['url'],
      'desc' => frontmatter['description'],
      'type' => frontmatter['type'],
      'github_stars' => frontmatter['github_stars'],
      'pricing_model' => frontmatter['pricing_model'],
      'pricing_starting' => frontmatter['pricing_starting'],
      'user_count' => frontmatter['user_count'],
      # New fields for tags & cross-category discovery
      'tags' => (frontmatter['tags'] || []).take(3),  # Max 3 for display
      'all_tags' => frontmatter['tags'] || [],
      'category_id' => category,
      'category_name' => category_names[category] || category.split('-').map(&:capitalize).join(' '),
      'subcategory_id' => subcategory,
      'subcategory_name' => category_names[subcategory] || subcategory.split('-').map(&:capitalize).join(' '),
      'additional_categories' => (frontmatter['additional_categories'] || []).map do |ac|
        {
          'category_id' => ac['category'],
          'category_name' => category_names[ac['category']] || ac['category'].split('-').map(&:capitalize).join(' '),
          'subcategory_id' => ac['subcategory'],
          'subcategory_name' => category_names[ac['subcategory']] || ac['subcategory'].split('-').map(&:capitalize).join(' ')
        }
      end
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
        'url' => frontmatter['website'] || frontmatter['url'],
        'desc' => frontmatter['description'],
        'type' => frontmatter['type'],
        'github_stars' => frontmatter['github_stars'],
        'pricing_model' => frontmatter['pricing_model'],
        'pricing_starting' => frontmatter['pricing_starting'],
        'user_count' => frontmatter['user_count'],
        # New fields for tags & cross-category discovery
        'tags' => (frontmatter['tags'] || []).take(3),
        'all_tags' => frontmatter['tags'] || [],
        'category_id' => category,  # Primary category
        'category_name' => category_names[category] || category.split('-').map(&:capitalize).join(' '),
        'subcategory_id' => subcategory,  # Primary subcategory
        'subcategory_name' => category_names[subcategory] || subcategory.split('-').map(&:capitalize).join(' '),
        'additional_categories' => (frontmatter['additional_categories'] || []).map do |ac|
          {
            'category_id' => ac['category'],
            'category_name' => category_names[ac['category']] || ac['category'].split('-').map(&:capitalize).join(' '),
            'subcategory_id' => ac['subcategory'],
            'subcategory_name' => category_names[ac['subcategory']] || ac['subcategory'].split('-').map(&:capitalize).join(' ')
          }
        end
      }
    end
  end

  # Convert to final structure
  result = { 'users' => [], 'developers' => [] }

  tools_by_track.each do |track, categories|
    categories.each do |cat_id, cat_data|
      category_obj = {
        'id' => cat_id,
        'name' => category_names[cat_id] || cat_id.split('-').map(&:capitalize).join(' '),
        'track' => track,
        'subcategories' => []
      }

      cat_data['subcategories'].each do |subcat_id, tools|
        category_obj['subcategories'] << {
          'id' => subcat_id,
          'name' => category_names[subcat_id] || subcat_id.split('-').map(&:capitalize).join(' '),
          'tools' => tools.uniq { |t| t['slug'] }
        }
      end

      result[track] << category_obj
    end
  end

  result
end
