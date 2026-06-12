#!/usr/bin/env ruby
require 'minitest/autorun'
require_relative 'stars_lib'

class TestParseRepo < Minitest::Test
  def test_parses_standard_url
    assert_equal({ owner: 'n8n-io', name: 'n8n' }, StarsLib.parse_repo('https://github.com/n8n-io/n8n'))
  end

  def test_parses_url_with_trailing_slash
    assert_equal({ owner: 'BerriAI', name: 'litellm' }, StarsLib.parse_repo('https://github.com/BerriAI/litellm/'))
  end

  def test_parses_url_with_extra_path
    assert_equal({ owner: 'vllm-project', name: 'vllm' }, StarsLib.parse_repo('https://github.com/vllm-project/vllm/tree/main'))
  end

  def test_strips_dot_git_suffix
    assert_equal({ owner: 'obsidianmd', name: 'obsidian-releases' }, StarsLib.parse_repo('https://github.com/obsidianmd/obsidian-releases.git'))
  end

  def test_returns_nil_for_non_repo_url
    assert_nil StarsLib.parse_repo('https://github.com/n8n-io')
  end

  def test_returns_nil_for_non_github_url
    assert_nil StarsLib.parse_repo('https://gitlab.com/foo/bar')
  end

  def test_returns_nil_for_nil
    assert_nil StarsLib.parse_repo(nil)
  end
end

require 'tempfile'
require 'fileutils'

class TestScanTools < Minitest::Test
  def with_tools_dir
    Dir.mktmpdir do |dir|
      yield dir
    end
  end

  def write_tool(dir, rel, frontmatter)
    path = File.join(dir, rel)
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, "---\n#{frontmatter}\n---\n\nBody text.\n")
    path
  end

  def test_collects_slug_and_url_for_files_with_github_url
    with_tools_dir do |dir|
      write_tool(dir, 'a/tool-a.md', "slug: \"tool-a\"\ngithub_url: \"https://github.com/o/a\"")
      write_tool(dir, 'b/tool-b.md', "slug: \"tool-b\"\ngithub_url: \"https://github.com/o/b\"")
      result = StarsLib.scan_tools(dir)
      assert_equal 2, result.length
      assert_includes result, { slug: 'tool-a', repo: { owner: 'o', name: 'a' }, path: File.join(dir, 'a/tool-a.md') }
    end
  end

  def test_skips_files_without_github_url
    with_tools_dir do |dir|
      write_tool(dir, 'c/tool-c.md', "slug: \"tool-c\"\ngithub_stars: 100")
      assert_empty StarsLib.scan_tools(dir)
    end
  end

  def test_skips_underscore_files
    with_tools_dir do |dir|
      write_tool(dir, '_schema.md', "slug: \"x\"\ngithub_url: \"https://github.com/o/x\"")
      assert_empty StarsLib.scan_tools(dir)
    end
  end

  def test_skips_files_with_unparseable_url
    with_tools_dir do |dir|
      write_tool(dir, 'd/tool-d.md', "slug: \"tool-d\"\ngithub_url: \"https://example.com/foo\"")
      assert_empty StarsLib.scan_tools(dir)
    end
  end
end
