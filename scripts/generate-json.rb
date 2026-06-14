#!/usr/bin/env ruby
require 'json'
require_relative 'generate_json_lib'

# Main
tools_dir = ARGV[0] || 'data/_tools'
output_file = ARGV[1] || 'js/data.js'
categories_file = File.join(tools_dir, '_categories.yaml')

category_names = load_category_names(categories_file)
tools_data = build_tools_json(tools_dir, category_names)

taxonomy = load_taxonomy(categories_file, File.join(tools_dir, '_tags.yaml'))
changelog = load_changelog(File.join(tools_dir, '..', '_landscape_changelog.yaml'))

output = tools_data.merge('taxonomy' => taxonomy, 'changelog' => changelog)

# Output as JavaScript module
js_content = <<~JS
// AI Landscape Data
// Auto-generated from markdown files - DO NOT EDIT MANUALLY

const landscapeData = #{JSON.pretty_generate(output)};
if (typeof window !== 'undefined') window.landscapeData = landscapeData;
JS

File.write(output_file, js_content)

puts "Generated #{output_file}"
puts "Total tools: #{Dir.glob(File.join(tools_dir, '**/*.md')).reject { |f| File.basename(f).start_with?('_') }.count}"
