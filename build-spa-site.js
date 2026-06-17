const fs = require('fs');
const path = require('path');

// Read the nav include
const nav = fs.readFileSync('_includes/nav.html', 'utf-8');
const navScripts = fs.readFileSync('_includes/nav-scripts.html', 'utf-8');

// Parse _learn collection and render article cards (mirrors Jekyll's site.learn loop)
function renderLearnArticles() {
  const learnDir = 'data/_learn';
  if (!fs.existsSync(learnDir)) return '';
  const files = fs.readdirSync(learnDir).filter(f => f.endsWith('.md'));
  const articles = files.map(f => {
    const raw = fs.readFileSync(path.join(learnDir, f), 'utf-8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return null;
    const fm = {};
    fmMatch[1].split('\n').forEach(line => {
      const m = line.match(/^(\w+):\s*"?([^"]+)"?$/);
      if (m) fm[m[1]] = m[2].trim();
    });
    // Parse tags (YAML list)
    const tagsMatch = fmMatch[1].match(/tags:\n((?:\s+-[^\n]+\n?)+)/);
    fm.tags = tagsMatch ? tagsMatch[1].match(/- (.+)/g).map(t => t.replace('- ', '').trim()) : [];
    fm.slug = fm.slug || f.replace('.md', '');
    return fm;
  }).filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));

  return articles.map(a => {
    const dateStr = a.date ? new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }) : '';
    const readingTime = a.reading_time ? ` &middot; <span>${a.reading_time} min read</span>` : '';
    const tags = a.tags.slice(0, 3).map(t => `<span class="article-tag">${t}</span>`).join('');
    return `<a href="/guides/${a.slug}/" data-spa-link class="article-card">
      <h2>${a.title}</h2>
      ${a.description ? `<p>${a.description}</p>` : ''}
      <div class="article-meta">
        ${dateStr ? `<span>${dateStr}</span>` : ''}${readingTime}
        ${tags}
      </div>
    </a>`;
  }).join('\n');
}

// Function to replace includes
function processTemplate(content, active = '') {
  // Strip Jekyll front matter (--- ... ---)
  content = content.replace(/^---[\s\S]*?---\n/, '');

  // Process nav includes
  content = content.replace(/\{%\s*include\s+nav\.html(?:\s+active\s*=\s*"([^"]+)")?\s*%\}/g, (match, activeParam) => {
    const activeValue = activeParam || active;
    let processed = nav.replace(/\{%\s*if\s+include\.active\s*==\s*'([^']+)'\s*%\}\s*nav-active\s*\{%\s*endif\s*%\}/g, (m, val) => {
      return val === activeValue ? ' nav-active' : '';
    });
    return processed;
  });

  // Remove Jekyll template tags — order matters: loops first (greedy multi-line), then remaining tags
  // Strip nested for...endfor blocks by repeating until none remain
  let prev;
  do {
    prev = content;
    content = content.replace(/\{%\s*for\b[^%]*%\}[\s\S]*?\{%\s*endfor[^%]*%\}/g, '');
  } while (content !== prev);
  // Strip any orphaned endfor tags left by nesting
  content = content.replace(/\{%\s*endfor[^%]*%\}/g, '');
  content = content.replace(/\{%\s*assign[^%]*%\}/g, '');
  // Strip if...endif blocks (may be multi-line after for-loop removal)
  do {
    prev = content;
    content = content.replace(/\{%\s*if[\s\S]*?\{%\s*endif[^%]*%\}/g, '');
  } while (content !== prev);
  content = content.replace(/\{%\s*endif[^%]*%\}/g, '');
  content = content.replace(/\{\{[^}]*\|[^}]*\}\}/g, ''); // filters like | relative_url
  content = content.replace(/\{\{[^}]*\}\}/g, '');         // remaining variables

  // Expand nav-scripts.html include (wires sign-in, admin badge, suggest)
  content = content.replace(/\{%\s*include\s+nav-scripts\.html[^%]*%\}/g, navScripts);

  return content;
}

// Process index.html
let indexContent = fs.readFileSync('index.html', 'utf-8');
indexContent = processTemplate(indexContent, 'search');
fs.writeFileSync('_site/index.html', indexContent);
console.log('Built _site/index.html');

// Process landscape.html
let landscapeContent = fs.readFileSync('landscape.html', 'utf-8');
landscapeContent = processTemplate(landscapeContent, 'landscape');
fs.writeFileSync('_site/landscape.html', landscapeContent);
console.log('Built _site/landscape.html');

// Process guides.html
let guidesContent = fs.readFileSync('guides.html', 'utf-8');
// Inject rendered articles before stripping Jekyll tags
guidesContent = guidesContent.replace(
  /\{%\s*assign articles[\s\S]*\{%\s*endfor\s*%\}/,
  renderLearnArticles()
);
guidesContent = processTemplate(guidesContent, 'guides');
fs.writeFileSync('_site/guides.html', guidesContent);
// Also write to guides/index.html so /guides/ URL is served correctly
fs.mkdirSync('_site/guides', { recursive: true });
fs.writeFileSync('_site/guides/index.html', guidesContent);
console.log('Built _site/guides.html and _site/guides/index.html');
