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

class TestBuildQuery < Minitest::Test
  def test_builds_aliased_query_for_each_repo
    repos = [
      { slug: 'tool-a', repo: { owner: 'o', name: 'a' } },
      { slug: 'tool-b', repo: { owner: 'p', name: 'b-1' } }
    ]
    q = StarsLib.build_graphql_query(repos)
    assert_includes q, 'r0: repository(owner: "o", name: "a") { stargazerCount }'
    assert_includes q, 'r1: repository(owner: "p", name: "b-1") { stargazerCount }'
    assert q.start_with?('query {')
    assert q.strip.end_with?('}')
  end

  def test_escapes_double_quotes_in_names
    repos = [{ slug: 's', repo: { owner: 'o"x', name: 'n' } }]
    q = StarsLib.build_graphql_query(repos)
    assert_includes q, 'owner: "o\\"x"'
  end
end

class TestMergeResults < Minitest::Test
  def test_updates_counts_from_response
    repos = [
      { slug: 'tool-a', repo: { owner: 'o', name: 'a' } },
      { slug: 'tool-b', repo: { owner: 'o', name: 'b' } }
    ]
    response = { 'data' => { 'r0' => { 'stargazerCount' => 142318 }, 'r1' => { 'stargazerCount' => 18204 } } }
    result = StarsLib.merge_results(repos, response, {}, now: '2026-06-13T04:00:00Z')
    assert_equal 142318, result['stars']['tool-a']['count']
    assert_equal '2026-06-13T04:00:00Z', result['stars']['tool-a']['fetched_at']
    assert_equal 18204, result['stars']['tool-b']['count']
    assert_equal '2026-06-13T04:00:00Z', result['generated_at']
  end

  def test_keeps_previous_entry_when_repo_is_null
    repos = [{ slug: 'tool-a', repo: { owner: 'o', name: 'a' } }]
    response = { 'data' => { 'r0' => nil } }
    previous = { 'stars' => { 'tool-a' => { 'count' => 99999, 'fetched_at' => '2026-06-10T04:00:00Z' } } }
    result = StarsLib.merge_results(repos, response, previous, now: '2026-06-13T04:00:00Z')
    assert_equal 99999, result['stars']['tool-a']['count']
    assert_equal '2026-06-10T04:00:00Z', result['stars']['tool-a']['fetched_at']
  end

  def test_omits_repo_with_no_data_and_no_previous
    repos = [{ slug: 'tool-a', repo: { owner: 'o', name: 'a' } }]
    response = { 'data' => { 'r0' => nil } }
    result = StarsLib.merge_results(repos, response, {}, now: '2026-06-13T04:00:00Z')
    refute result['stars'].key?('tool-a')
  end

  def test_records_errors_for_null_repos
    repos = [{ slug: 'tool-a', repo: { owner: 'o', name: 'a' } }]
    response = { 'data' => { 'r0' => nil }, 'errors' => [{ 'message' => "Could not resolve to a Repository with the name 'o/a'." }] }
    result = StarsLib.merge_results(repos, response, {}, now: '2026-06-13T04:00:00Z')
    assert_equal 1, result[:errors].length
    assert_includes result[:errors].first, 'tool-a'
  end
end

class TestUpdateFrontmatter < Minitest::Test
  def test_replaces_existing_github_stars_value
    Tempfile.create(['tool', '.md']) do |f|
      f.write("---\nslug: \"x\"\ngithub_stars: 100\ngithub_url: \"https://github.com/o/x\"\n---\n\nBody.\n")
      f.flush
      StarsLib.update_frontmatter_stars(f.path, 54321)
      content = File.read(f.path)
      assert_includes content, 'github_stars: 54321'
      refute_includes content, 'github_stars: 100'
      assert_includes content, 'github_url: "https://github.com/o/x"'
      assert_includes content, "\nBody.\n"
    end
  end

  def test_inserts_github_stars_when_absent
    Tempfile.create(['tool', '.md']) do |f|
      f.write("---\nslug: \"x\"\ngithub_url: \"https://github.com/o/x\"\n---\n\nBody.\n")
      f.flush
      StarsLib.update_frontmatter_stars(f.path, 777)
      assert_includes File.read(f.path), 'github_stars: 777'
    end
  end

  def test_noop_when_value_unchanged_returns_false
    Tempfile.create(['tool', '.md']) do |f|
      f.write("---\nslug: \"x\"\ngithub_stars: 500\n---\n\nBody.\n")
      f.flush
      changed = StarsLib.update_frontmatter_stars(f.path, 500)
      refute changed
    end
  end
end

class TestSerialize < Minitest::Test
  def test_sorts_slugs_alphabetically
    merged = { 'generated_at' => 'T', 'stars' => {
      'zeta' => { 'count' => 1, 'fetched_at' => 'T' },
      'alpha' => { 'count' => 2, 'fetched_at' => 'T' }
    }, errors: [] }
    json = StarsLib.serialize(merged)
    assert json.index('"alpha"') < json.index('"zeta"')
    refute_includes json, 'errors'  # internal field not serialized
    assert json.end_with?("\n")
    refute json.end_with?("\n\n")
    parsed = JSON.parse(json)
    assert_equal 2, parsed['stars']['alpha']['count']
  end
end

class TestFetchGraphql < Minitest::Test
  def test_posts_query_with_auth_and_parses_json
    captured = {}
    fake_poster = lambda do |uri, body, headers|
      captured[:uri] = uri
      captured[:body] = body
      captured[:headers] = headers
      '{"data":{"r0":{"stargazerCount":5}}}'
    end
    result = StarsLib.fetch_graphql('query { r0 }', token: 'TKN', poster: fake_poster)
    assert_equal 'https://api.github.com/graphql', captured[:uri]
    assert_equal 'bearer TKN', captured[:headers]['Authorization']
    assert_includes captured[:body], 'query { r0 }'
    assert_equal 5, result['data']['r0']['stargazerCount']
  end

  def test_raises_on_empty_token
    assert_raises(StarsLib::AuthError) do
      StarsLib.fetch_graphql('query {}', token: nil, poster: ->(*) { '{}' })
    end
  end

  def test_raises_on_blank_token
    assert_raises(StarsLib::AuthError) do
      StarsLib.fetch_graphql('query {}', token: '', poster: ->(*) { '{}' })
    end
  end
end

class TestCliComposition < Minitest::Test
  def test_run_refresh_composes_pipeline
    repos = [{ slug: 'tool-a', repo: { owner: 'o', name: 'a' }, path: '/x' }]
    fake_fetch = ->(query) { { 'data' => { 'r0' => { 'stargazerCount' => 42 } } } }
    out = StarsLib.run_refresh(repos, previous: {}, now: 'T', fetch: fake_fetch)
    assert_equal 42, out[:merged]['stars']['tool-a']['count']
    assert_includes out[:json], '"tool-a"'
  end
end
