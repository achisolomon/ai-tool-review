# Test Plan: Tags & Cross-Category Discovery

## Overview
Testing the tags feature implemented in this session, including filtering, URL parameters, UI components, and build-time validation.

**Test Environment:** http://localhost:8080

---

## 1. Search & Hero Toggle

### 1.1 Basic Search Toggle
- [ ] Load homepage - hero section visible, search results hidden
- [ ] Type "Claude" in search - hero hides, results show
- [ ] Press Escape - hero returns, results hide
- [ ] Click "Code Assistant" chip - hero hides, results show

### 1.2 URL Parameter on Load
- [ ] Navigate to `/?q=Code+Assistant` - hero hidden, results visible
- [ ] Navigate to `/?tag=api-available` - hero hidden, results visible
- [ ] Navigate to `/?subcategory=voice-agents` - hero hidden, results visible
- [ ] Navigate to `/` (no params) - hero visible, results hidden

---

## 2. Tag Filtering

### 2.1 Single Tag Filter
- [ ] `/?tag=api-available` - shows tools with API available tag
- [ ] `/?tag=enterprise` - shows tools with enterprise tag
- [ ] `/?tag=open-source` - shows tools with open-source tag
- [ ] `/?tag=mcp-server` - shows tools with MCP server integration

### 2.2 Multiple Tags (AND Logic)
- [ ] `/?tag=api-available,python` - shows only tools with BOTH tags
- [ ] `/?tag=enterprise,api-available` - intersection of both tags
- [ ] Verify result count is less than or equal to single tag count

### 2.3 Invalid Tags
- [ ] `/?tag=nonexistent-tag` - shows empty results gracefully
- [ ] `/?tag=` (empty) - shows homepage/hero

---

## 3. Tag Badges on Result Cards

### 3.1 Badge Display
- [ ] Search for tools - verify tag badges appear on result cards
- [ ] Badges show max 3 tags per card
- [ ] Badges are styled with gray background (default style)

### 3.2 Badge Interaction
- [ ] Click a tag badge on a result card
- [ ] Verify URL changes to `/?tag=<clicked-tag>`
- [ ] Verify results filter to that tag
- [ ] Verify clicking badge doesn't navigate to tool page (stopPropagation)

---

## 4. Tool Detail Pages

### 4.1 Breadcrumb Navigation
- [ ] Open any tool page (e.g., `/tools/cursor/`)
- [ ] Verify breadcrumb shows: Category > Subcategory
- [ ] Click breadcrumb - navigates to `/?subcategory=<id>`
- [ ] Verify results show for that subcategory

### 4.2 Additional Categories
- [ ] Find a tool with `additional_categories` in frontmatter
- [ ] Verify multiple breadcrumb links appear
- [ ] Each breadcrumb navigates to correct subcategory

### 4.3 Tags on Tool Page
- [ ] Verify all tags display (not limited to 3)
- [ ] Click a tag - navigates to `/?tag=<tag>`
- [ ] Verify tag filter works from tool page

---

## 5. Category Filtering

### 5.1 Subcategory Filter
- [ ] `/?subcategory=voice-agents` - shows voice agent tools
- [ ] `/?subcategory=coding-agents` - shows coding agent tools
- [ ] Verify result count matches tools in that subcategory

### 5.2 Category Filter
- [ ] `/?category=ai-coding` - shows all AI coding tools
- [ ] Verify includes tools from all subcategories

---

## 6. Browser Navigation

### 6.1 History Navigation
- [ ] Search for "Claude", then "GPT", then "Cursor"
- [ ] Press browser Back button - returns to "GPT" results
- [ ] Press Back again - returns to "Claude" results
- [ ] Press Forward - returns to "GPT" results

### 6.2 Direct URL Entry
- [ ] Copy URL with `?tag=enterprise`, open in new tab
- [ ] Verify correct results load
- [ ] Verify search input shows tag name

---

## 7. Build-Time Validation

### 7.1 Tag Validation Script
```bash
cd ai-tool-review
ruby scripts/validate_tags.rb
```
- [ ] Script exits with code 0 (no errors)
- [ ] No "Invalid tag" warnings
- [ ] No "Duplicate tag" warnings

### 7.2 Invalid Tag Detection
- [ ] Add invalid tag to a tool file: `tags: [fake-tag]`
- [ ] Run `ruby scripts/validate_tags.rb`
- [ ] Verify script reports error and exits with code 1
- [ ] Remove the invalid tag

---

## 8. Edge Cases

### 8.1 URL Encoding
- [ ] `/?q=Code%20Assistant` (encoded space) - works correctly
- [ ] `/?q=Code+Assistant` (+ as space) - works correctly
- [ ] `/?tag=api-available%2Cpython` (encoded comma) - works correctly

### 8.2 Empty States
- [ ] `/?tag=very-rare-tag-combination` - shows "No tools found" message
- [ ] Empty search input - shows hero, not empty results

### 8.3 Special Characters
- [ ] Search for "C++" - handles + character
- [ ] Search for "node.js" - handles . character

---

## 9. Performance

### 9.1 Large Result Sets
- [ ] `/?tag=api-available` - loads within 1 second
- [ ] Scrolling through 50+ results - smooth performance

### 9.2 Data Loading
- [ ] Hard refresh (Cmd+Shift+R) - data loads correctly
- [ ] No console errors during load

---

## Quick Smoke Test (5 min)

1. [ ] Load http://localhost:8080 - hero visible
2. [ ] Click "Code Assistant" - results show, hero hides
3. [ ] Click a tag badge on a result - filters to that tag
4. [ ] Click a tool to open detail page - breadcrumbs visible
5. [ ] Click breadcrumb - returns to filtered homepage
6. [ ] Press Escape - hero returns
7. [ ] Run `ruby scripts/validate_tags.rb` - exits 0

---

## Files Changed This Session

| File | Change |
|------|--------|
| `data/_tools/_tags.yaml` | New - tag vocabulary |
| `scripts/validate_tags.rb` | New - validation script |
| `scripts/generate_json_lib.rb` | Modified - tags in JSON |
| `js/app.js` | Modified - filtering, hero toggle |
| `css/style.css` | Modified - tag badge styles |
| `_layouts/tool.html` | Modified - breadcrumbs, tags |
| 228 tool files | Modified - cleaned invalid tags |
