// ==========================================================================
// Clicly — Script principal (navigation, recherche, filtres, tri)
// Aucune donnée n'est inventée ici : tout provient de products-data.js.
// ==========================================================================

/* ---------- Navigation mobile ---------- */
(function () {
  const mobileNav = document.getElementById('mobileNav');
  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('closeNav');
  if (menuBtn && mobileNav) menuBtn.addEventListener('click', () => mobileNav.classList.add('open'));
  if (closeBtn && mobileNav) closeBtn.addEventListener('click', () => mobileNav.classList.remove('open'));
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav) mobileNav.classList.remove('open');
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const input = document.getElementById('searchInput');
      if (input) input.focus();
    }
  });
})();

/* ---------- Index de recherche (produits + pages statiques) ---------- */
const STATIC_PAGES_INDEX = [
  { name: "Tous les produits", type: "Page", url: "produits.html" },
  { name: "Guides d'achat", type: "Page", url: "guides.html" },
  { name: "Comparatifs", type: "Page", url: "comparatifs.html" },
  { name: "Catégories", type: "Page", url: "categories.html" },
  { name: "À propos", type: "Page", url: "a-propos.html" },
  { name: "Contact", type: "Page", url: "contact.html" },
];

function normalizeStr(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

(function () {
  const input = document.getElementById('searchInput');
  if (!input) return;
  const prefix = input.dataset.prefix || '';
  const box = input.closest('.search-box');
  const results = document.createElement('div');
  results.className = 'search-results';
  box.parentElement.style.position = 'relative';
  box.parentElement.appendChild(results);

  const products = (window.CLICLY_PRODUCTS || []).map(p => ({
    name: p.name, type: 'Produit', url: `${prefix}produits/${p.slug}.html`,
  }));
  const pages = STATIC_PAGES_INDEX.map(p => ({ name: p.name, type: p.type, url: `${prefix}${p.url}` }));
  const index = products.concat(pages);

  function render(query) {
    const q = normalizeStr(query.trim());
    if (!q) { results.classList.remove('open'); results.innerHTML = ''; return; }
    const matches = index.filter(item => normalizeStr(item.name).includes(q)).slice(0, 8);
    if (matches.length === 0) {
      results.innerHTML = `<div class="search-empty">Aucun résultat pour "${query}"</div>`;
    } else {
      results.innerHTML = matches.map(item =>
        `<a class="search-result" href="${item.url}"><span>${item.name}</span><small>${item.type}</small></a>`
      ).join('');
    }
    results.classList.add('open');
  }

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('focus', () => { if (input.value.trim()) render(input.value); });
  document.addEventListener('click', (e) => {
    if (!box.parentElement.contains(e.target)) results.classList.remove('open');
  });
})();

/* ---------- Grille produits : rendu, filtres, tri ---------- */
function clProductCardHTML(p) {
  const badge = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
  const disc = p.discountPct ? `<span class="product-discount">-${p.discountPct}%</span>` : '';
  const old = p.oldPriceDisplay ? `<span class="product-old-price">${p.oldPriceDisplay}</span>` : '';
  const meta = p.rating ? `<span class="product-meta">★ ${p.rating}/5 · ${p.reviewCount || ''} avis</span>` : '';
  return `
    <article class="product-card" data-id="${p.id}" data-category="${p.category}" data-price="${p.price}" data-rating="${p.rating || 0}">
      <a class="product-media" href="produits/${p.slug}.html" aria-label="Voir l'analyse de ${p.name}">
        <img src="images/${p.image.split('/').pop()}" alt="${p.alt}" loading="lazy"/>
        ${badge}${disc}
      </a>
      <div class="product-body">
        <span class="product-cat">${p.categoryLabel}</span>
        <h3 class="product-name"><a href="produits/${p.slug}.html">${p.name}</a></h3>
        <p class="product-blurb">${p.shortDescription}</p>
        ${meta}
        <div class="product-price-row"><span class="product-price">${p.priceDisplay}</span>${old}</div>
        <div class="product-actions"><a class="btn btn-primary" href="produits/${p.slug}.html">Voir l'analyse</a></div>
      </div>
    </article>`;
}

function renderProductGrid(gridId, opts) {
  opts = opts || {};
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const all = window.CLICLY_PRODUCTS || [];
  const noResults = document.getElementById('noResults');
  const countEl = document.getElementById('filtersCount');

  const searchInput = document.getElementById('filterSearch');
  const categorySelect = document.getElementById('filterCategory');
  const budgetSelect = document.getElementById('filterBudget');
  const sortSelect = document.getElementById('sortBy');

  // Pre-fill from URL params (used by "Bons plans" nav link -> ?promo=1)
  const params = new URLSearchParams(window.location.search);
  const promoOnly = params.get('promo') === '1';

  function apply() {
    let list = all.slice();
    if (opts.category) list = list.filter(p => p.category === opts.category);
    if (promoOnly) list = list.filter(p => p.discountPct);

    if (searchInput && searchInput.value.trim()) {
      const q = normalizeStr(searchInput.value);
      list = list.filter(p => normalizeStr(p.name).includes(q));
    }
    if (categorySelect && categorySelect.value) list = list.filter(p => p.category === categorySelect.value);
    if (budgetSelect && budgetSelect.value) {
      const [min, max] = budgetSelect.value.split('-').map(Number);
      list = list.filter(p => p.price >= min && p.price <= max);
    }
    if (sortSelect) {
      const mode = sortSelect.value;
      if (mode === 'price-asc') list.sort((a, b) => a.price - b.price);
      else if (mode === 'price-desc') list.sort((a, b) => b.price - a.price);
      else if (mode === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (mode === 'new') list.sort((a, b) => b.id - a.id);
    }

    if (list.length === 0) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
    } else {
      if (noResults) noResults.style.display = 'none';
      grid.innerHTML = list.map(clProductCardHTML).join('');
    }
    if (countEl) countEl.textContent = `${list.length} produit${list.length > 1 ? 's' : ''}`;
  }

  [searchInput, categorySelect, budgetSelect, sortSelect].forEach(el => {
    if (el) el.addEventListener('input', apply);
    if (el) el.addEventListener('change', apply);
  });
  if (promoOnly && categorySelect) {
    // visual hint only; filtering already applied
  }

  apply();
}

/* ---------- Toast utilitaire ---------- */
function clToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}
