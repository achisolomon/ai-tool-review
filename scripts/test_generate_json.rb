#!/usr/bin/env ruby
require 'minitest/autorun'
require 'yaml'
require 'json'
require 'tempfile'
require 'fileutils'

# Load the functions from generate-json.rb
require_relative 'generate_json_lib'

class TestCategoryNames < Minitest::Test
  def test_load_category_names_extracts_all_names
    yaml_content = <<~YAML
      users:
        ai-chat:
          name: "AI Chat Assistants"
          subcategories:
            chat-bots:
              name: "Chat Bots"
      developers:
        ai-coding:
          name: "AI Coding Tools"
          subcategories:
            ai-ides:
              name: "AI IDEs & Editors"
    YAML

    Tempfile.create(['categories', '.yaml']) do |f|
      f.write(yaml_content)
      f.flush

      names = load_category_names(f.path)

      assert_equal "AI Chat Assistants", names['ai-chat']
      assert_equal "Chat Bots", names['chat-bots']
      assert_equal "AI Coding Tools", names['ai-coding']
      assert_equal "AI IDEs & Editors", names['ai-ides']
    end
  end

  def test_load_category_names_preserves_acronyms
    yaml_content = <<~YAML
      developers:
        llm-frameworks:
          name: "LLM Application Frameworks"
          subcategories:
            api-gateways:
              name: "API Gateways"
            ml-ops:
              name: "MLOps & Training"
    YAML

    Tempfile.create(['categories', '.yaml']) do |f|
      f.write(yaml_content)
      f.flush

      names = load_category_names(f.path)

      assert_equal "LLM Application Frameworks", names['llm-frameworks']
      assert_equal "API Gateways", names['api-gateways']
      assert_equal "MLOps & Training", names['ml-ops']
    end
  end

  def test_load_category_names_returns_empty_hash_for_missing_file
    names = load_category_names('/nonexistent/path/categories.yaml')
    assert_equal({}, names)
  end

  def test_load_category_names_handles_empty_yaml
    Tempfile.create(['categories', '.yaml']) do |f|
      f.write("")
      f.flush

      names = load_category_names(f.path)
      assert_equal({}, names)
    end
  end
end

class TestBuildToolsJson < Minitest::Test
  def setup
    @temp_dir = Dir.mktmpdir

    # Create categories file
    categories_content = <<~YAML
      developers:
        ai-coding:
          name: "AI Coding & Developer Tools"
          subcategories:
            ai-ides:
              name: "AI IDEs & Editors"
    YAML
    File.write(File.join(@temp_dir, '_categories.yaml'), categories_content)

    # Create a tool markdown file
    FileUtils.mkdir_p(File.join(@temp_dir, 'developers', 'ai-coding', 'ai-ides'))
    tool_content = <<~MD
      ---
      name: "Test IDE"
      slug: "test-ide"
      url: "https://example.com"
      description: "A test IDE"
      type: "commercial"
      track: "developers"
      category: "ai-coding"
      subcategory: "ai-ides"
      ---
      Content here
    MD
    File.write(File.join(@temp_dir, 'developers', 'ai-coding', 'ai-ides', 'test-ide.md'), tool_content)
  end

  def teardown
    FileUtils.remove_entry(@temp_dir)
  end

  def test_build_tools_json_uses_yaml_names
    category_names = load_category_names(File.join(@temp_dir, '_categories.yaml'))
    result = build_tools_json(@temp_dir, category_names)

    dev_categories = result['developers']
    ai_coding = dev_categories.find { |c| c['id'] == 'ai-coding' }

    assert_equal "AI Coding & Developer Tools", ai_coding['name']

    ai_ides = ai_coding['subcategories'].find { |s| s['id'] == 'ai-ides' }
    assert_equal "AI IDEs & Editors", ai_ides['name']
  end

  def test_build_tools_json_fallback_when_name_missing
    # Use empty category names to test fallback
    result = build_tools_json(@temp_dir, {})

    dev_categories = result['developers']
    ai_coding = dev_categories.find { |c| c['id'] == 'ai-coding' }

    # Fallback capitalizes each word
    assert_equal "Ai Coding", ai_coding['name']
  end

  def test_build_tools_json_sorts_categories_by_rank
    FileUtils.mkdir_p(File.join(@temp_dir, 'developers', 'ai-cost', 'token-optimization'))
    File.write(File.join(@temp_dir, 'developers', 'ai-cost', 'token-optimization', 'squeeze.md'), <<~MD)
      ---
      name: "Squeeze"
      slug: "squeeze"
      track: "developers"
      category: "ai-cost"
      subcategory: "token-optimization"
      ---
    MD

    result = build_tools_json(@temp_dir, {}, { 'ai-cost' => 1, 'ai-coding' => 2 })

    assert_equal %w[ai-cost ai-coding], result['developers'].map { |c| c['id'] }
    assert_equal 1, result['developers'].first['rank']
  end

  def test_build_tools_json_sorts_subcategories_by_yaml_order
    FileUtils.mkdir_p(File.join(@temp_dir, 'developers', 'ai-coding', 'coding-agents'))
    File.write(File.join(@temp_dir, 'developers', 'ai-coding', 'coding-agents', 'agent.md'), <<~MD)
      ---
      name: "Agent"
      slug: "agent"
      track: "developers"
      category: "ai-coding"
      subcategory: "coding-agents"
      ---
    MD

    result = build_tools_json(@temp_dir, {}, {}, { 'coding-agents' => 0, 'ai-ides' => 1 })
    ai_coding = result['developers'].find { |c| c['id'] == 'ai-coding' }

    assert_equal %w[coding-agents ai-ides], ai_coding['subcategories'].map { |s| s['id'] }
  end
end

class TestLoadCategoryRanks < Minitest::Test
  def test_every_real_category_has_a_unique_rank
    file = File.join(__dir__, '..', 'data', '_tools', '_categories.yaml')
    ids = YAML.safe_load(File.read(file)).values.flat_map(&:keys)
    ranks = load_category_ranks(file)

    assert_equal ids.sort, ranks.keys.sort, 'every category needs a rank'
    assert_equal ranks.values.uniq.size, ranks.size, 'ranks must be unique'
  end
end

class TestRealCategoriesFile < Minitest::Test
  def test_all_names_in_real_categories_file_are_loaded
    categories_file = File.join(__dir__, '..', 'data', '_tools', '_categories.yaml')
    skip "Categories file not found" unless File.exist?(categories_file)

    names = load_category_names(categories_file)

    # Check specific acronyms are preserved
    assert_equal "AI IDEs & Editors", names['ai-ides'], "AI IDEs name should be preserved"
    assert_equal "LLM Application Frameworks", names['llm-frameworks'], "LLM name should be preserved"
    assert_equal "AI Infrastructure (Inference, Compute, Routing)", names['ai-infrastructure'], "AI Infrastructure name should be preserved"

    # Ensure no name has the bad "Ai " pattern (capital A, lowercase i)
    names.each do |id, name|
      refute_match(/\bAi\b/, name, "Name '#{name}' for id '#{id}' contains 'Ai' instead of 'AI'")
      refute_match(/\bApi\b/, name, "Name '#{name}' for id '#{id}' contains 'Api' instead of 'API'")
      refute_match(/\bLlm\b/, name, "Name '#{name}' for id '#{id}' contains 'Llm' instead of 'LLM'")
    end
  end
end
