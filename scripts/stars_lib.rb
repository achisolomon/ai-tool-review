#!/usr/bin/env ruby
require 'yaml'
require 'json'
require 'date'

module StarsLib
  # Extract { owner:, name: } from a GitHub repo URL, or nil if it isn't one.
  def self.parse_repo(url)
    return nil unless url.is_a?(String)
    m = url.match(%r{\Ahttps?://github\.com/([^/\s]+)/([^/\s]+?)(?:\.git)?(?:[/#?].*)?\z})
    return nil unless m
    owner, name = m[1], m[2]
    return nil if owner.empty? || name.empty?
    { owner: owner, name: name }
  end
end
