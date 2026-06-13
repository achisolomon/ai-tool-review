// AI Landscape Page - Dedicated landscape view
document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentTrack = 'all';
    let currentType = 'all';
    let currentView = 'subcategories'; // 'categories', 'subcategories', 'all'

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
        if (typeof count !== 'number' || !isFinite(count) || count < 0) return null;
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (count >= 1000) {
            return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return count.toString();
    }

    // DOM Elements
    const landscape = document.getElementById('landscape');
    const viewButtons = document.querySelectorAll('.view-btn');
    const trackButtons = document.querySelectorAll('.track-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const visibleCountEl = document.getElementById('visible-count');
    const categoryCountEl = document.getElementById('category-count');
    const tooltip = document.getElementById('tooltip');

    // Initialize
    setupEventListeners();
    renderLandscape();
    updateStats();
    applyViewState();

    // Default to expanded view with compact layout for maximum tool density
    landscape.classList.add('all-expanded');
    landscape.classList.add('compact-filter');

    // Apply view state to all categories and subcategories
    function applyViewState() {
        const categories = document.querySelectorAll('.category');
        const subcategories = document.querySelectorAll('.subcategory');

        // Apply layout class based on view
        landscape.classList.remove('view-categories', 'view-subcategories', 'view-all');
        landscape.classList.add(`view-${currentView}`);

        if (currentView === 'categories') {
            // Only show category headers
            categories.forEach(cat => cat.classList.add('collapsed'));
            subcategories.forEach(sub => sub.classList.add('collapsed'));
        } else if (currentView === 'subcategories') {
            // Show categories expanded, subcategories collapsed
            categories.forEach(cat => cat.classList.remove('collapsed'));
            subcategories.forEach(sub => sub.classList.add('collapsed'));
        } else if (currentView === 'all') {
            // Show everything expanded
            categories.forEach(cat => cat.classList.remove('collapsed'));
            subcategories.forEach(sub => sub.classList.remove('collapsed'));
        }
    }

    // Render the landscape grid
    function renderLandscape() {
        landscape.innerHTML = '';

        const tracks = currentTrack === 'all'
            ? ['users', 'developers']
            : [currentTrack];

        tracks.forEach(track => {
            landscapeData[track].forEach(category => {
                const categoryEl = createCategoryElement(category, track);
                if (categoryEl) {
                    landscape.appendChild(categoryEl);
                }
            });
        });

        updateStats();
    }

    // Create a category element
    function createCategoryElement(category, track) {
        const filteredSubcategories = category.subcategories.map(sub => ({
            ...sub,
            tools: filterTools(sub.tools)
        })).filter(sub => sub.tools.length > 0);

        if (filteredSubcategories.length === 0) return null;

        const categoryEl = document.createElement('div');
        // Auto-expand when search is active
        // Always expanded by default (no collapsed class)
        categoryEl.className = 'category';
        categoryEl.dataset.track = track;

        const toolCount = filteredSubcategories.reduce((sum, sub) => sum + sub.tools.length, 0);

        categoryEl.innerHTML = `
            <div class="category-header ${track}">
                <h2 class="category-title">
                    ${category.name}
                    <span class="category-count">${toolCount}</span>
                </h2>
                <svg class="category-toggle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
            <div class="category-content">
                ${filteredSubcategories.map(sub => createSubcategoryHTML(sub)).join('')}
            </div>
        `;

        // Add collapse toggle
        const header = categoryEl.querySelector('.category-header');
        header.addEventListener('click', () => {
            categoryEl.classList.toggle('collapsed');
        });

        return categoryEl;
    }

    // Create subcategory HTML (collapsed by default)
    function createSubcategoryHTML(subcategory) {
        const toolCount = subcategory.tools.length;
        return `
            <div class="subcategory collapsed">
                <div class="subcategory-header">
                    <h3 class="subcategory-title">${subcategory.name}</h3>
                    <span class="subcategory-count">${toolCount}</span>
                    <svg class="subcategory-toggle" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="subcategory-content">
                    <div class="tools-grid">
                        ${subcategory.tools.map(tool => createToolCardHTML(tool)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Create tool card HTML
    function createToolCardHTML(tool) {
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
        const stars = formatStars(tool.github_stars);
        const starsHtml = stars ? `<span class="stars-badge stars-badge-sm" title="${stars} GitHub stars"><svg class="star-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/></svg>${stars}</span>` : '';

        return `
            <div class="tool-card"
                 data-name="${tool.name}"
                 data-slug="${slug}"
                 data-url="${tool.url}"
                 data-desc="${tool.desc}"
                 data-type="${tool.type}"
                 data-stars="${typeof tool.github_stars === 'number' ? tool.github_stars : ''}">
                <div class="tool-icon" data-initial="${initial}">
                    ${logoUrl ? `<img src="${logoUrl}" alt="${tool.name}" loading="lazy" onerror="this.parentElement.textContent=this.parentElement.dataset.initial">` : initial}
                </div>
                <div class="tool-name">${tool.name}</div>
                <div class="tool-badges">
                    ${starsHtml}
                    <span class="badge ${badgeClass}">${typeLabel}</span>
                </div>
            </div>
        `;
    }

    // Filter tools based on current state
    function filterTools(tools) {
        return tools.filter(tool => {
            // Filter by type
            if (currentType !== 'all' && tool.type !== currentType) {
                return false;
            }
            return true;
        });
    }

    // Update stats display
    function updateStats() {
        let visibleCount = 0;
        let categoryCount = 0;

        const tracks = currentTrack === 'all'
            ? ['users', 'developers']
            : [currentTrack];

        tracks.forEach(track => {
            landscapeData[track].forEach(category => {
                let categoryHasTools = false;
                category.subcategories.forEach(sub => {
                    const filtered = filterTools(sub.tools);
                    visibleCount += filtered.length;
                    if (filtered.length > 0) categoryHasTools = true;
                });
                if (categoryHasTools) categoryCount++;
            });
        });

        visibleCountEl.textContent = visibleCount;
        categoryCountEl.textContent = categoryCount;
    }

    // Setup event listeners
    function setupEventListeners() {
        // View toggle (3 states: categories, subcategories, all)
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentView = btn.dataset.view;
                applyViewState();
            });
        });

        // Track toggle
        trackButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                trackButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTrack = btn.dataset.track;
                renderLandscape();
                applyViewState();
            });
        });

        // Type filter
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentType = btn.dataset.type;
                renderLandscape();
                applyViewState();
            });
        });

        // Tool card click - open internal tool page
        landscape.addEventListener('click', (e) => {
            const card = e.target.closest('.tool-card');
            if (card) {
                const slug = card.dataset.slug;
                window.location.href = `/tools/${slug}/`;
            }
        });

        // Tool card hover - show tooltip
        landscape.addEventListener('mouseover', (e) => {
            const card = e.target.closest('.tool-card');
            if (card) {
                showTooltip(card);
            }
        });

        landscape.addEventListener('mouseout', (e) => {
            const card = e.target.closest('.tool-card');
            if (card) {
                hideTooltip();
            }
        });

        // Subcategory collapse toggle (delegated)
        landscape.addEventListener('click', (e) => {
            const subcategoryHeader = e.target.closest('.subcategory-header');
            if (subcategoryHeader) {
                const subcategory = subcategoryHeader.closest('.subcategory');
                if (subcategory) {
                    subcategory.classList.toggle('collapsed');
                }
            }
        });

    }

    // Show tooltip
    function showTooltip(card) {
        const name = card.dataset.name;
        const desc = card.dataset.desc;
        const starsNum = parseInt(card.dataset.stars, 10);
        const starsLabel = formatStars(starsNum);
        const starsHtml = starsLabel ? `<div class="tooltip-stars"><svg viewBox="0 0 16 16" fill="#e3b341" style="width:12px;height:12px;"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/></svg>${starsLabel} stars</div>` : '';

        tooltip.innerHTML = `
            <div class="tooltip-title">${name}</div>
            <div class="tooltip-desc">${desc}</div>
            ${starsHtml}
            <div class="tooltip-link">Click to visit</div>
        `;

        const rect = card.getBoundingClientRect();

        let left = rect.left + (rect.width / 2);
        let top = rect.bottom + 10;

        if (left + 150 > window.innerWidth) {
            left = window.innerWidth - 160;
        }
        if (left < 10) {
            left = 10;
        }
        if (top + 100 > window.innerHeight) {
            top = rect.top - 80;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.classList.add('visible');
    }

    // Hide tooltip
    function hideTooltip() {
        tooltip.classList.remove('visible');
    }
});
