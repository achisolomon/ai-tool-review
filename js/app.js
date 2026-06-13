// AI Tool Review - Homepage Search Application

// Populate hero subtitle counts from live data
(function updateHeroCounts() {
    if (typeof landscapeData === 'undefined') return;
    let toolCount = 0, catCount = 0;
    for (const track of ['users', 'developers']) {
        if (!landscapeData[track]) continue;
        catCount += landscapeData[track].length;
        for (const cat of landscapeData[track]) {
            for (const sub of cat.subcategories) {
                toolCount += sub.tools.length;
            }
        }
    }
    const tcEl = document.getElementById('hero-tool-count');
    const ccEl = document.getElementById('hero-cat-count');
    if (tcEl) tcEl.textContent = toolCount + '+';
    if (ccEl) ccEl.textContent = catCount + '+';
})();

document.addEventListener('DOMContentLoaded', () => {
    // State
    let searchQuery = '';

    // Generate URL-friendly slug from tool name
    function generateSlug(name) {
        return name.toLowerCase()
            .replace(/[·]/g, '-')           // Replace middle dot with hyphen
            .replace(/[^\w\s-]/g, '')       // Remove other special chars
            .replace(/\s+/g, '-')           // Replace spaces with hyphens
            .replace(/-+/g, '-')            // Replace multiple hyphens with single
            .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
    }

    // Look up category by ID
    function findCategoryById(categoryId) {
        for (const track of ['users', 'developers']) {
            if (!landscapeData[track]) continue;
            for (const category of landscapeData[track]) {
                if (category.id === categoryId) {
                    return { type: 'category', ...category, track };
                }
            }
        }
        return null;
    }

    // Look up subcategory by ID
    function findSubcategoryById(subcategoryId) {
        for (const track of ['users', 'developers']) {
            if (!landscapeData[track]) continue;
            for (const category of landscapeData[track]) {
                for (const subcategory of category.subcategories) {
                    if (subcategory.id === subcategoryId) {
                        return {
                            type: 'subcategory',
                            ...subcategory,
                            categoryName: category.name,
                            categoryId: category.id,
                            track
                        };
                    }
                }
            }
        }
        return null;
    }

    // Initialize from URL parameters
    function initFromURL() {
        const params = new URLSearchParams(window.location.search);
        const subcategoryId = params.get('subcategory');
        const categoryId = params.get('category');
        const tagParam = params.get('tag');
        const query = params.get('q');

        // Check in order of precedence: tag > subcategory > category > q
        if (tagParam) {
            const tagSlugs = tagParam.split(',').map(t => t.trim()).filter(Boolean);
            if (tagSlugs.length > 0) {
                const tools = getToolsByTags(tagSlugs);
                const displayName = tagSlugs.join(' + ');
                actionInput.value = displayName;
                showSearchResults();
                renderSearchResults(tools);
                updatePageTitle(displayName);
                return;
            }
        }

        if (subcategoryId) {
            const subcategory = findSubcategoryById(subcategoryId);
            if (subcategory) {
                actionInput.value = subcategory.name;
                selectAutocompleteItem(subcategory);
                updatePageTitle(subcategory.name);
            } else {
                // Invalid subcategory - show empty results
                actionInput.value = subcategoryId;
                showSearchResults();
                renderSearchResults([]);
            }
        } else if (categoryId) {
            const category = findCategoryById(categoryId);
            if (category) {
                actionInput.value = category.name;
                selectAutocompleteItem(category);
                updatePageTitle(category.name);
            } else {
                // Invalid category - show empty results
                actionInput.value = categoryId;
                showSearchResults();
                renderSearchResults([]);
            }
        } else if (query && query.trim()) {
            actionInput.value = query;
            handleSearch(query);
            updatePageTitle(query);
        }
    }

    // Update page title
    function updatePageTitle(searchTerm) {
        document.title = `${searchTerm} - AI Tool Review`;
    }

    // Update URL with current search/filter state
    function updateURL(type, value) {
        const url = new URL(window.location.href);
        url.searchParams.delete('category');
        url.searchParams.delete('subcategory');
        url.searchParams.delete('tag');
        url.searchParams.delete('q');
        if (value) {
            url.searchParams.set(type, value);
        }
        history.pushState({ type, value }, '', url.toString());
    }

    // Clear URL parameters
    function clearURL() {
        const url = new URL(window.location.href);
        url.searchParams.delete('category');
        url.searchParams.delete('subcategory');
        url.searchParams.delete('tag');
        url.searchParams.delete('q');
        history.pushState({}, '', url.toString());
        document.title = 'AI Tool Review - Find the Right AI Tool for the Job';
    }

    // Copy current URL to clipboard
    async function copyLink() {
        if (!copyLinkButton) return;

        const copyText = copyLinkButton.querySelector('.copy-text');
        if (!copyText) return;

        try {
            await navigator.clipboard.writeText(window.location.href);
            copyLinkButton.classList.add('copied');
            copyText.textContent = 'Copied!';

            setTimeout(() => {
                copyLinkButton.classList.remove('copied');
                copyText.textContent = 'Copy Link';
            }, 1500);
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = window.location.href;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            copyLinkButton.classList.add('copied');
            copyText.textContent = 'Copied!';

            setTimeout(() => {
                copyLinkButton.classList.remove('copied');
                copyText.textContent = 'Copy Link';
            }, 1500);
        }
    }

    // Format star count (e.g., 15400 -> "15.4k")
    function formatStars(count) {
        if (!count || count < 0) return null;
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (count >= 1000) {
            return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return count.toString();
    }

    // Simple stemmer to handle common word endings
    function stem(word) {
        if (word.length < 4) return word;

        // Order matters - check longer suffixes first
        const suffixes = [
            'ation', 'ition', 'ement', 'ment', 'ness', 'able', 'ible',
            'ting', 'sing', 'ing', 'tion', 'sion',
            'ies', 'ied', 'ier',
            'es', 'ed', 'er', 'ly', 's'
        ];

        for (const suffix of suffixes) {
            if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
                return word.slice(0, -suffix.length);
            }
        }
        return word;
    }

    // Check if two words match (including stem matching)
    function wordsMatch(queryWord, targetWord) {
        // Exact substring match
        if (targetWord.includes(queryWord)) return true;

        // Stem-based matching
        const queryStem = stem(queryWord);
        const targetStem = stem(targetWord);

        // Stems match exactly
        if (queryStem === targetStem) return true;

        // One stem contains the other (handles prefixes)
        if (queryStem.length >= 3 && targetStem.length >= 3) {
            if (targetStem.includes(queryStem) || queryStem.includes(targetStem)) {
                return true;
            }
        }

        return false;
    }

    // Check if query word matches any word in text
    function matchesText(queryWord, text) {
        const textWords = text.split(/\s+/);
        return textWords.some(textWord => wordsMatch(queryWord, textWord));
    }

    // DOM Elements
    const actionInput = document.getElementById('action-input');
    const searchResults = document.getElementById('search-results');
    const resultsGrid = document.getElementById('results-grid');
    const resultsCount = document.getElementById('results-count');
    const resultsLoading = document.getElementById('results-loading');
    const clearSearch = document.getElementById('clear-search');
    const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
    const copyLinkButton = document.getElementById('copy-link');
    const heroSection = document.getElementById('hero-action');

    // Helper functions to toggle search results view
    function showSearchResults() {
        searchResults.classList.remove('hidden');
    }

    function hideSearchResults() {
        searchResults.classList.add('hidden');
    }

    // Show/hide loading state
    function showLoading() {
        if (resultsLoading) {
            resultsLoading.classList.remove('hidden');
            resultsGrid.classList.add('hidden');
        }
    }

    function hideLoading() {
        if (resultsLoading) {
            resultsLoading.classList.add('hidden');
            resultsGrid.classList.remove('hidden');
        }
    }

    // Autocomplete state
    let autocompleteItems = [];
    let selectedAutocompleteIndex = -1;
    let isSelectingFromAutocomplete = false;

    // Get all categories and subcategories for autocomplete
    function getCategoriesAndSubcategories() {
        const items = [];
        ['users', 'developers'].forEach(track => {
            if (!landscapeData[track]) return;
            landscapeData[track].forEach(category => {
                // Add category
                items.push({
                    type: 'category',
                    name: category.name,
                    id: category.id,
                    track: track,
                    toolCount: category.subcategories.reduce((sum, sub) => sum + sub.tools.length, 0)
                });
                // Add subcategories
                category.subcategories.forEach(subcategory => {
                    items.push({
                        type: 'subcategory',
                        name: subcategory.name,
                        id: subcategory.id,
                        categoryName: category.name,
                        categoryId: category.id,
                        track: track,
                        toolCount: subcategory.tools.length
                    });
                });
            });
        });
        return items;
    }

    // Get tools by category or subcategory
    function getToolsByCategory(categoryId, subcategoryId = null) {
        const tools = [];
        ['users', 'developers'].forEach(track => {
            if (!landscapeData[track]) return;
            landscapeData[track].forEach(category => {
                if (category.id === categoryId || category.name.toLowerCase() === categoryId.toLowerCase()) {
                    category.subcategories.forEach(subcategory => {
                        if (!subcategoryId || subcategory.id === subcategoryId || subcategory.name.toLowerCase() === subcategoryId.toLowerCase()) {
                            subcategory.tools.forEach(tool => {
                                tools.push({
                                    ...tool,
                                    categoryName: category.name,
                                    subcategoryName: subcategory.name,
                                    track: track
                                });
                            });
                        }
                    });
                }
            });
        });
        return tools;
    }

    // Get all subcategories organized for browsing
    function getAllSubcategoriesForBrowsing() {
        const items = [];
        ['users', 'developers'].forEach(track => {
            if (!landscapeData[track]) return;
            landscapeData[track].forEach(category => {
                category.subcategories.forEach(subcategory => {
                    items.push({
                        type: 'subcategory',
                        name: subcategory.name,
                        id: subcategory.id,
                        categoryName: category.name,
                        categoryId: category.id,
                        track: track,
                        toolCount: subcategory.tools.length
                    });
                });
            });
        });
        return items;
    }

    // Search autocomplete suggestions
    function searchAutocomplete(query, showAllOnEmpty = false) {
        const categoriesAndSubs = getCategoriesAndSubcategories();

        // If empty query and showAllOnEmpty, show browseable subcategories
        if (!query || query.trim().length < 1) {
            if (showAllOnEmpty) {
                return getAllSubcategoriesForBrowsing()
                    .sort((a, b) => b.toolCount - a.toolCount)
                    .slice(0, 15)
                    .map(item => ({ ...item, priority: 50 }));
            }
            return [];
        }

        const queryLower = query.toLowerCase().trim();
        const allTools = getAllTools();

        // Matched categories, ordered by tool count (most tools first)
        const categoryMatches = categoriesAndSubs
            .filter(item => item.type === 'category' && item.name.toLowerCase().includes(queryLower))
            .sort((a, b) => b.toolCount - a.toolCount);

        // Matched subcategories, ordered by tool count (most tools first)
        const subcategoryMatches = categoriesAndSubs
            .filter(item => item.type === 'subcategory' && item.name.toLowerCase().includes(queryLower))
            .sort((a, b) => b.toolCount - a.toolCount);

        // Matched tools, ranked by where the query hit: name (3) > category /
        // subcategory (2) > description (1). The category/subcategory tier surfaces
        // the whole cluster behind a hit like "LLM Skills"; the description tier
        // brings the dropdown in line with the fuller results grid below.
        const toolMatches = allTools
            .map(tool => {
                const nameLower = tool.name.toLowerCase();
                const subLower = (tool.subcategoryName || '').toLowerCase();
                const catLower = (tool.categoryName || '').toLowerCase();
                const descLower = (tool.desc || '').toLowerCase();
                let rank = 0;
                if (nameLower.includes(queryLower)) rank = 3;
                else if (subLower.includes(queryLower) || catLower.includes(queryLower)) rank = 2;
                else if (descLower.includes(queryLower)) rank = 1;
                return { tool, rank };
            })
            .filter(item => item.rank > 0)
            .sort((a, b) => b.rank - a.rank)
            .map(({ tool }) => ({
                type: 'tool',
                name: tool.name,
                slug: tool.slug || generateSlug(tool.name),
                categoryName: tool.categoryName,
                subcategoryName: tool.subcategoryName
            }));

        // Categories, then subcategories (each sorted most-tools-first), then tools
        return [...categoryMatches, ...subcategoryMatches, ...toolMatches].slice(0, 12);
    }

    // Render autocomplete dropdown
    function renderAutocomplete(items, isBrowseMode = false) {
        if (items.length === 0) {
            autocompleteDropdown.classList.add('hidden');
            autocompleteItems = [];
            selectedAutocompleteIndex = -1;
            return;
        }

        autocompleteItems = items;
        selectedAutocompleteIndex = -1;

        let html = '';

        // Add browse mode header
        if (isBrowseMode) {
            html += `<div class="autocomplete-section-header">Browse by Category</div>`;
        }

        let currentSection = isBrowseMode ? 'subcategory' : '';

        items.forEach((item, index) => {
            // Add section headers (only when not in browse mode)
            if (!isBrowseMode && item.type !== currentSection) {
                currentSection = item.type;
                const sectionLabel = item.type === 'category' ? 'Categories' :
                                    item.type === 'subcategory' ? 'Subcategories' : 'Tools';
                html += `<div class="autocomplete-section-header">${sectionLabel}</div>`;
            }

            const icon = item.type === 'category' ? '📁' :
                        item.type === 'subcategory' ? '📂' : '🔧';

            const meta = item.type === 'tool'
                ? `${item.subcategoryName} • ${item.categoryName}`
                : item.type === 'subcategory'
                    ? `${item.categoryName} • ${item.toolCount} tools`
                    : `${item.toolCount} tools`;

            html += `
                <div class="autocomplete-item" data-index="${index}" data-type="${item.type}">
                    <span class="autocomplete-item-icon">${icon}</span>
                    <div class="autocomplete-item-content">
                        <div class="autocomplete-item-name">${item.name}</div>
                        <div class="autocomplete-item-meta">${meta}</div>
                    </div>
                    <span class="autocomplete-item-type ${item.type}">${item.type}</span>
                </div>
            `;
        });

        autocompleteDropdown.innerHTML = html;
        autocompleteDropdown.classList.remove('hidden');
    }

    // Handle autocomplete selection
    function selectAutocompleteItem(item) {
        autocompleteDropdown.classList.add('hidden');

        // Set flag to prevent input event from triggering search
        isSelectingFromAutocomplete = true;
        actionInput.value = item.name;
        // Reset flag after a short delay
        setTimeout(() => { isSelectingFromAutocomplete = false; }, 50);

        if (item.type === 'category') {
            // Show all tools in this category
            showSearchResults();
            showLoading();
            setTimeout(() => {
                try {
                    const tools = getToolsByCategory(item.id || item.name);
                    renderSearchResults(tools, item.name);
                    updateURL('category', item.id);
                    updatePageTitle(item.name);
                } catch (error) {
                    console.error('Category load error:', error);
                    hideLoading();
                }
            }, 50);
        } else if (item.type === 'subcategory') {
            // Show all tools in this subcategory
            showSearchResults();
            showLoading();
            setTimeout(() => {
                try {
                    const tools = getToolsByCategory(item.categoryId || item.categoryName, item.id || item.name);
                    renderSearchResults(tools, item.name);
                    updateURL('subcategory', item.id);
                    updatePageTitle(item.name);
                } catch (error) {
                    console.error('Subcategory load error:', error);
                    hideLoading();
                }
            }, 50);
        } else if (item.type === 'tool') {
            // Navigate to tool page
            window.location.href = `/tools/${item.slug}/`;
        }
    }

    // Update selected autocomplete item
    function updateAutocompleteSelection(newIndex) {
        const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
        items.forEach((el, i) => {
            el.classList.toggle('selected', i === newIndex);
        });
        selectedAutocompleteIndex = newIndex;

        // Scroll into view
        if (newIndex >= 0 && items[newIndex]) {
            items[newIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    // Get all tools as flat array for searching
    function getAllTools() {
        const tools = [];
        ['users', 'developers'].forEach(track => {
            if (!landscapeData[track]) return;
            landscapeData[track].forEach(category => {
                category.subcategories.forEach(subcategory => {
                    subcategory.tools.forEach(tool => {
                        tools.push({
                            ...tool,
                            categoryName: category.name,
                            subcategoryName: subcategory.name,
                            track: track
                        });
                    });
                });
            });
        });
        return tools;
    }

    // Get all tools that have a specific tag
    function getToolsByTag(tagSlug) {
        const tools = [];
        ['users', 'developers'].forEach(track => {
            if (!landscapeData[track]) return;
            landscapeData[track].forEach(category => {
                category.subcategories.forEach(subcategory => {
                    subcategory.tools.forEach(tool => {
                        const toolTags = tool.all_tags || tool.tags || [];
                        if (toolTags.includes(tagSlug)) {
                            tools.push({
                                ...tool,
                                categoryName: category.name,
                                subcategoryName: subcategory.name,
                                track: track
                            });
                        }
                    });
                });
            });
        });
        // Deduplicate by slug (tool may appear in multiple categories)
        const seen = new Set();
        return tools.filter(tool => {
            if (seen.has(tool.slug)) return false;
            seen.add(tool.slug);
            return true;
        });
    }

    // Get tools matching multiple tags (AND logic)
    function getToolsByTags(tagSlugs) {
        if (!tagSlugs || tagSlugs.length === 0) return [];
        if (tagSlugs.length === 1) return getToolsByTag(tagSlugs[0]);

        // Start with first tag, then filter by remaining tags
        let tools = getToolsByTag(tagSlugs[0]);
        for (let i = 1; i < tagSlugs.length; i++) {
            tools = tools.filter(tool => {
                const toolTags = tool.all_tags || tool.tags || [];
                return toolTags.includes(tagSlugs[i]);
            });
        }
        return tools;
    }

    // Search by intent - enhanced search with relevance scoring
    function searchByIntent(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const queryLower = query.toLowerCase().trim();
        const words = queryLower.split(/\s+/).filter(w => w.length > 1);

        if (words.length === 0) {
            return [];
        }

        const allTools = getAllTools();

        return allTools
            .map(tool => ({
                tool,
                score: calculateRelevanceScore(tool, words, queryLower)
            }))
            .filter(item => item.score > 0)
            // Sort by relevance first, then by popularity (github stars)
            .sort((a, b) => {
                // If scores are similar (within 10 points), sort by popularity
                if (Math.abs(a.score - b.score) <= 10) {
                    const starsA = a.tool.github_stars || 0;
                    const starsB = b.tool.github_stars || 0;
                    return starsB - starsA;
                }
                return b.score - a.score;
            })
            .slice(0, 40)
            .map(item => item.tool);
    }

    // Calculate relevance score for a tool
    function calculateRelevanceScore(tool, queryWords, fullQuery) {
        let score = 0;
        const nameLower = tool.name.toLowerCase();
        const descLower = tool.desc.toLowerCase();
        const categoryLower = tool.categoryName?.toLowerCase() || '';
        const subcategoryLower = tool.subcategoryName?.toLowerCase() || '';

        // Exact name match (highest priority)
        if (nameLower === fullQuery) {
            score += 100;
        }

        // Name contains full query
        if (nameLower.includes(fullQuery)) {
            score += 50;
        }

        // Word-by-word matching with stem support
        for (const word of queryWords) {
            // Name matches
            if (matchesText(word, nameLower)) {
                score += 15;
            }

            // Subcategory matches (very relevant for intent)
            if (matchesText(word, subcategoryLower)) {
                score += 12;
            }

            // Category matches
            if (matchesText(word, categoryLower)) {
                score += 8;
            }

            // Description matches
            if (matchesText(word, descLower)) {
                score += 5;
            }
        }

        // Boost for matching multiple words
        const matchedWords = queryWords.filter(word =>
            matchesText(word, nameLower) ||
            matchesText(word, descLower) ||
            matchesText(word, categoryLower) ||
            matchesText(word, subcategoryLower)
        );

        if (matchedWords.length > 1) {
            score += matchedWords.length * 3;
        }

        return score;
    }

    // Get popular search suggestions for empty state
    function getPopularSuggestions() {
        const suggestions = [
            { query: 'Code Assistant', label: 'Code Assistants' },
            { query: 'Agent Frameworks', label: 'Agent Frameworks' },
            { query: 'Image Generation', label: 'Image Generation' },
            { query: 'RAG', label: 'RAG Tools' },
            { query: 'LLM Observability', label: 'Observability' }
        ];
        // Return 3 random suggestions
        return suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    // Render search results in flat grid
    function renderSearchResults(tools, query = '') {
        hideLoading();

        if (tools.length === 0) {
            const suggestions = getPopularSuggestions();
            const suggestionButtons = suggestions.map(s =>
                `<button class="action-chip" data-query="${s.query}">${s.label}</button>`
            ).join('');

            const searchTerm = query || actionInput?.value || '';
            const message = searchTerm
                ? `No tools match "${searchTerm}". Try a different search term or explore these categories:`
                : 'Enter a search term to find AI tools, or try one of these popular categories:';

            resultsGrid.innerHTML = `
                <div class="no-results">
                    <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                        <path d="M8 8l6 6M14 8l-6 6" stroke-width="1.5"/>
                    </svg>
                    <h3 class="no-results-title">No tools found</h3>
                    <p class="no-results-message">${message}</p>
                    <div class="no-results-suggestions">
                        ${suggestionButtons}
                    </div>
                    <a href="landscape.html" class="browse-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        Browse Full Landscape
                    </a>
                </div>
            `;
            resultsCount.textContent = '0 tools found';

            // Re-attach click handlers to suggestion chips
            resultsGrid.querySelectorAll('.action-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const query = chip.dataset.query;
                    actionInput.value = query;
                    handleSearch(query);
                });
            });

            return;
        }

        resultsCount.textContent = `${tools.length} tool${tools.length === 1 ? '' : 's'} found`;

        // Group large result sets by category so long lists read like a map,
        // preserving relevance order (first hit decides group position)
        const categories = [...new Set(tools.map(t => t.categoryName))];
        if (tools.length > 9 && categories.length > 1) {
            let html = '';
            for (const cat of categories) {
                const group = tools.filter(t => t.categoryName === cat);
                html += `<div class="results-group-header"><span class="results-group-name">${cat}</span><span class="results-group-count">${group.length}</span></div>`;
                html += group.map(tool => createResultCardHTML(tool)).join('');
            }
            resultsGrid.innerHTML = html;
        } else {
            resultsGrid.innerHTML = tools.map(tool => createResultCardHTML(tool)).join('');
        }
    }

    // Create result card HTML - compact, info-dense design
    function createResultCardHTML(tool) {
        const initial = tool.name.charAt(0).toUpperCase();
        const slug = tool.slug || generateSlug(tool.name);
        const badgeClass = `badge-${tool.type}`;
        const typeLabel = (tool.type === 'oss' || tool.type === 'open-source') ? 'OSS' : tool.type === 'saas' ? 'SaaS' : 'Commercial';

        let domain = '';
        try {
            domain = new URL(tool.url).hostname.replace('www.', '');
        } catch (e) {
            domain = '';
        }

        const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';

        // GitHub stars (show for any tool with github_stars)
        const stars = formatStars(tool.github_stars);
        const starsHtml = stars
            ? `<span class="stars-badge" title="${tool.github_stars.toLocaleString()} GitHub stars"><svg class="star-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/></svg>${stars}</span>`
            : '';

        // Build clickable category path
        const subcatId = tool.subcategory_id || '';
        const catId = tool.category_id || '';
        const categoryLink = subcatId || catId
            ? `<a href="/?subcategory=${subcatId}" class="result-breadcrumb-link" onclick="event.stopPropagation();">${tool.subcategoryName || ''}</a> <span class="separator">•</span> <a href="/?category=${catId}" class="result-breadcrumb-link" onclick="event.stopPropagation();">${tool.categoryName || ''}</a>`
            : `<span>${[tool.subcategoryName, tool.categoryName].filter(Boolean).join(' • ')}</span>`;

        // Build tag badges (max 3)
        const tags = tool.tags || [];
        const tagBadgesHtml = tags.length > 0
            ? `<div class="tag-badges">${tags.slice(0, 3).map(tag =>
                `<a href="/?tag=${tag}" class="tag-badge default" onclick="event.stopPropagation();">${tag.replace(/-/g, ' ')}</a>`
              ).join('')}</div>`
            : '';

        return `
            <div class="result-card"
                 tabindex="0"
                 role="link"
                 aria-label="${tool.name}: ${(tool.desc || 'AI tool').replace(/"/g, '&quot;')}"
                 data-name="${tool.name}"
                 data-slug="${slug}"
                 data-url="${tool.url}"
                 data-desc="${tool.desc || ''}"
                 data-type="${tool.type}"
                 data-track="${tool.track || ''}"
                 data-category="${tool.categoryName || ''}"
                 data-subcategory="${tool.subcategoryName || ''}">
                <div class="result-icon" data-initial="${initial}">
                    ${logoUrl ? `<img src="${logoUrl}" alt="${tool.name}" loading="lazy" onerror="this.parentElement.textContent=this.parentElement.dataset.initial">` : initial}
                </div>
                <div class="result-header">
                    <div class="result-name" title="${tool.name}">${tool.name}</div>
                    <div class="result-desc">${tool.desc || 'No description available'}</div>
                    <div class="result-meta">
                        <span class="result-category">${categoryLink}</span>
                        ${tagBadgesHtml}
                        <div class="result-meta-bottom">
                            ${starsHtml}
                            <span class="badge ${badgeClass}">${typeLabel}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Handle search input
    function handleSearch(query) {
        searchQuery = query;

        if (query.trim() === '') {
            hideSearchResults();
            hideLoading();
            clearURL();
            return;
        }

        showSearchResults();
        showLoading();

        // Use setTimeout to allow loading state to render
        setTimeout(() => {
            try {
                const results = searchByIntent(query);
                renderSearchResults(results, query);
                updateURL('q', query);
                updatePageTitle(query);
            } catch (error) {
                console.error('Search error:', error);
                hideLoading();
                resultsGrid.innerHTML = `
                    <div class="no-results">
                        <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4M12 16h.01"/>
                        </svg>
                        <h3 class="no-results-title">Something went wrong</h3>
                        <p class="no-results-message">We couldn't complete your search. Please try again.</p>
                        <button class="browse-link" onclick="location.reload()">
                            Refresh Page
                        </button>
                    </div>
                `;
                resultsCount.textContent = 'Error';
            }
        }, 50);
    }

    // Handle search without updating URL (for popstate)
    function handleSearchWithoutPushState(query) {
        searchQuery = query;

        if (query.trim() === '') {
            hideSearchResults();
            hideLoading();
            return;
        }

        showSearchResults();
        showLoading();

        setTimeout(() => {
            try {
                const results = searchByIntent(query);
                renderSearchResults(results, query);
            } catch (error) {
                console.error('Search error:', error);
                hideLoading();
            }
        }, 50);
    }

    // Perform search (alias for handleSearch, used by delayed search)
    function performSearch(query) {
        handleSearch(query);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search input with autocomplete
        let searchTimeout;
        let autocompleteTimeout;

        actionInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();

            // Don't trigger search if selecting from autocomplete
            if (isSelectingFromAutocomplete) {
                return;
            }

            // Show autocomplete suggestions
            clearTimeout(autocompleteTimeout);
            autocompleteTimeout = setTimeout(() => {
                const suggestions = searchAutocomplete(value, true);
                renderAutocomplete(suggestions, value === '');
            }, 100);

            // Delayed full search (show results after typing pause)
            clearTimeout(searchTimeout);
            if (value === '') {
                hideSearchResults();
            } else {
                searchTimeout = setTimeout(() => {
                    performSearch(value);
                }, 250);
            }
        });

        // Show browse menu on focus when empty
        actionInput.addEventListener('focus', () => {
            const value = actionInput.value.trim();
            if (value === '') {
                const suggestions = searchAutocomplete('', true);
                renderAutocomplete(suggestions, true);
            }
        });

        // Handle Enter key to trigger full search
        actionInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (autocompleteItems.length > 0) {
                    const newIndex = selectedAutocompleteIndex < autocompleteItems.length - 1
                        ? selectedAutocompleteIndex + 1 : 0;
                    updateAutocompleteSelection(newIndex);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (autocompleteItems.length > 0) {
                    const newIndex = selectedAutocompleteIndex > 0
                        ? selectedAutocompleteIndex - 1 : autocompleteItems.length - 1;
                    updateAutocompleteSelection(newIndex);
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedAutocompleteIndex >= 0 && autocompleteItems[selectedAutocompleteIndex]) {
                    selectAutocompleteItem(autocompleteItems[selectedAutocompleteIndex]);
                } else {
                    // Regular search
                    autocompleteDropdown.classList.add('hidden');
                    handleSearch(actionInput.value.trim());
                }
            } else if (e.key === 'Escape') {
                // Clear search and hide everything
                actionInput.value = '';
                searchQuery = '';
                hideSearchResults();
                autocompleteDropdown.classList.add('hidden');
                selectedAutocompleteIndex = -1;
                clearURL();
            }
        });

        // Autocomplete item click
        autocompleteDropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.autocomplete-item');
            if (item) {
                const index = parseInt(item.dataset.index, 10);
                if (autocompleteItems[index]) {
                    selectAutocompleteItem(autocompleteItems[index]);
                }
            }
        });

        // Hide autocomplete on blur (with delay for click handling)
        actionInput.addEventListener('blur', () => {
            setTimeout(() => {
                autocompleteDropdown.classList.add('hidden');
            }, 200);
        });

        // Clear search
        clearSearch.addEventListener('click', () => {
            actionInput.value = '';
            searchQuery = '';
            hideSearchResults();
            autocompleteDropdown.classList.add('hidden');
            clearURL();
            actionInput.focus();
        });

        // Copy Link button
        if (copyLinkButton) {
            copyLinkButton.addEventListener('click', copyLink);
        }

        // Result card click - navigate to internal tool page
        resultsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.result-card');
            if (card) {
                const slug = card.dataset.slug;
                if (slug) {
                    window.location.href = `/tools/${slug}/`;
                }
            }
        });

        // Result card keyboard activation (cards are role=link divs)
        resultsGrid.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const card = e.target.closest('.result-card');
            if (card && card === e.target) {
                e.preventDefault();
                const slug = card.dataset.slug;
                if (slug) {
                    window.location.href = `/tools/${slug}/`;
                }
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Focus search on '/' key
            if (e.key === '/' && document.activeElement !== actionInput) {
                e.preventDefault();
                actionInput.focus();
            }
            // Escape to clear search (when not focused on input)
            if (e.key === 'Escape' && document.activeElement !== actionInput) {
                actionInput.value = '';
                searchQuery = '';
                hideSearchResults();
                autocompleteDropdown.classList.add('hidden');
                clearURL();
            }
        });

        // Quick action chip click handlers
        document.querySelectorAll('.action-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.dataset.query;
                if (query) {
                    actionInput.value = query;
                    autocompleteDropdown.classList.add('hidden');
                    performSearch(query);
                }
            });
        });

        // Browser back/forward navigation
        window.addEventListener('popstate', () => {
            const params = new URLSearchParams(window.location.search);
            const subcategoryId = params.get('subcategory');
            const categoryId = params.get('category');
            const tagParam = params.get('tag');
            const query = params.get('q');

            // Hide autocomplete dropdown
            autocompleteDropdown.classList.add('hidden');

            if (tagParam) {
                const tagSlugs = tagParam.split(',').map(t => t.trim()).filter(Boolean);
                if (tagSlugs.length > 0) {
                    const tools = getToolsByTags(tagSlugs);
                    const displayName = tagSlugs.join(' + ');
                    actionInput.value = displayName;
                    showSearchResults();
                    renderSearchResults(tools);
                    updatePageTitle(displayName);
                    return;
                }
            }

            if (subcategoryId) {
                const subcategory = findSubcategoryById(subcategoryId);
                if (subcategory) {
                    actionInput.value = subcategory.name;
                    const tools = getToolsByCategory(subcategory.categoryId, subcategory.id);
                    showSearchResults();
                    renderSearchResults(tools);
                    updatePageTitle(subcategory.name);
                } else {
                    // Invalid subcategory - show empty results
                    actionInput.value = subcategoryId;
                    showSearchResults();
                    renderSearchResults([]);
                }
            } else if (categoryId) {
                const category = findCategoryById(categoryId);
                if (category) {
                    actionInput.value = category.name;
                    const tools = getToolsByCategory(category.id);
                    showSearchResults();
                    renderSearchResults(tools);
                    updatePageTitle(category.name);
                } else {
                    // Invalid category - show empty results
                    actionInput.value = categoryId;
                    showSearchResults();
                    renderSearchResults([]);
                }
            } else if (query && query.trim()) {
                actionInput.value = query;
                handleSearchWithoutPushState(query);
                updatePageTitle(query);
            } else {
                // No params - reset to default state
                actionInput.value = '';
                searchQuery = '';
                hideSearchResults();
                document.title = 'AI Tool Review - Find the Right AI Tool for the Job';
            }
        });
    }

    // Initialize
    setupEventListeners();
    initFromURL();
});
