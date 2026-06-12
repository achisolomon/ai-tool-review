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
