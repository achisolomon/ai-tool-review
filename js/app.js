// AI Tool Review - Homepage Search Application
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
    const clearSearch = document.getElementById('clear-search');
    const quickActionChips = document.querySelectorAll('.action-chip');

    // Initialize
    setupEventListeners();

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

    // Render search results in flat grid
    function renderSearchResults(tools) {
        if (tools.length === 0) {
            resultsGrid.innerHTML = `
                <div class="no-results">
                    <p>No tools found. Try different keywords or</p>
                    <a href="landscape.html" class="browse-link">browse all tools</a>
                </div>
            `;
            resultsCount.textContent = '0 tools found';
            return;
        }

        resultsCount.textContent = `${tools.length} tool${tools.length === 1 ? '' : 's'} found`;

        resultsGrid.innerHTML = tools.map(tool => createResultCardHTML(tool)).join('');
    }

    // Create result card HTML - compact, info-dense design
    function createResultCardHTML(tool) {
        const initial = tool.name.charAt(0).toUpperCase();
        const slug = generateSlug(tool.name);
        const badgeClass = `badge-${tool.type}`;
        const typeLabel = tool.type === 'oss' ? 'OSS' : tool.type === 'saas' ? 'SaaS' : 'Commercial';

        let domain = '';
        try {
            domain = new URL(tool.url).hostname.replace('www.', '');
        } catch (e) {
            domain = '';
        }

        const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';

        // GitHub stars (show for OSS tools)
        const stars = formatStars(tool.github_stars);
        const starsHtml = (stars && tool.type === 'oss')
            ? `<span class="stars-badge" title="${tool.github_stars.toLocaleString()} GitHub stars"><svg class="star-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/></svg>${stars}</span>`
            : '';

        // Build full category path
        const categoryPath = [tool.subcategoryName, tool.categoryName].filter(Boolean).join(' • ');

        return `
            <div class="result-card"
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
                        <span class="result-category">${categoryPath}</span>
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
            searchResults.classList.add('hidden');
            return;
        }

        searchResults.classList.remove('hidden');
        const results = searchByIntent(query);
        renderSearchResults(results);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search input
        let searchTimeout;
        actionInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(e.target.value.trim());
            }, 150);
        });

        // Quick action chips
        quickActionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.dataset.query;
                actionInput.value = query;
                handleSearch(query);
            });
        });

        // Clear search
        clearSearch.addEventListener('click', () => {
            actionInput.value = '';
            searchQuery = '';
            searchResults.classList.add('hidden');
            actionInput.focus();
        });

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

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Focus search on '/' key
            if (e.key === '/' && document.activeElement !== actionInput) {
                e.preventDefault();
                actionInput.focus();
            }
            // Escape to clear search
            if (e.key === 'Escape') {
                actionInput.value = '';
                searchQuery = '';
                searchResults.classList.add('hidden');
                actionInput.blur();
            }
        });
    }
});
