const mobileNav = document.getElementById('mobileNav');
    document.getElementById('menuBtn').addEventListener('click', () => mobileNav.classList.add('open'));
    document.getElementById('closeNav').addEventListener('click', () => mobileNav.classList.remove('open'));
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
      }
      if (e.key === 'Escape') mobileNav.classList.remove('open');
    });

    (function() {
      const input = document.getElementById('searchInput');
      if (!input || typeof SEARCH_INDEX === 'undefined') return;

      const box = input.closest('.search-box');
      const results = document.createElement('div');
      results.className = 'search-results';
      box.parentElement.style.position = 'relative';
      box.parentElement.appendChild(results);

      function normalize(str) {
        return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }

      function render(query) {
        const q = normalize(query.trim());
        if (!q) { results.classList.remove('open'); results.innerHTML = ''; return; }
        const matches = SEARCH_INDEX.filter(item => normalize(item.name).includes(q)).slice(0, 8);
        if (matches.length === 0) {
          results.innerHTML = '<div class="search-empty">Aucun résultat pour "' + query + '"</div>';
        } else {
          results.innerHTML = matches.map(item =>
            '<a class="search-result" href="' + item.url + '"><span>' + item.name + '</span><small>' + item.type + '</small></a>'
          ).join('');
        }
        results.classList.add('open');
      }

      input.addEventListener('input', () => render(input.value));
      input.addEventListener('focus', () => { if (input.value.trim()) render(input.value); });
      document.addEventListener('click', (e) => {
        if (!box.parentElement.contains(e.target)) { results.classList.remove('open'); }
      });
    })();

    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const code = btn.dataset.code;
        try { await navigator.clipboard.writeText(code); } catch(e) {}
        btn.textContent = '✓ Copié';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copier'; btn.classList.remove('copied'); }, 1800);
      });
    });

    const WIDGET_RECOS = {
      "La tech et le high-tech": {
        name: "Caméra d'action Insta360 X5 8K 30fps",
        price: "378,51 €",
        url: "deals-promos.html"
      },
      "La maison et le quotidien": {
        name: "Machine à expresso W H10A",
        price: "281,39 €",
        url: "deals-promos.html"
      },
      "Le sport et les loisirs": {
        name: "Notre sélection Sport & Fitness",
        price: null,
        url: "sport-fitness.html"
      }
    };

    document.querySelectorAll('[data-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-choice]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const result = document.getElementById('widgetResult');
        if (!result) return;
        const reco = WIDGET_RECOS[btn.dataset.choice];
        if (reco) {
          const priceHtml = reco.price ? ' — <strong>' + reco.price + '</strong>' : '';
          result.innerHTML = '✓ On te recommande : ' + reco.name + priceHtml + ' <a href="' + reco.url + '" class="widget-result-link">Voir l\'offre →</a>';
        }
      });
    });

    document.querySelectorAll('form.subscribe').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.validity.valid) {
          const successMsg = form.parentElement.querySelector('.success-message');
          if (successMsg) successMsg.style.display = 'block';
          input.value = '';
        }
      });
    });

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    if (daysEl && hoursEl && minutesEl && secondsEl) {
      const dealEnd = new Date('2026-08-26T22:59:00');
      function updateCountdown() {
        const diff = Math.max(0, dealEnd - new Date());
        const totalSeconds = Math.floor(diff / 1000);
        const d = Math.floor(totalSeconds / 86400);
        const h = Math.floor((totalSeconds % 86400) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        daysEl.textContent = String(d);
        hoursEl.textContent = String(h).padStart(2, '0');
        minutesEl.textContent = String(m).padStart(2, '0');
        secondsEl.textContent = String(s).padStart(2, '0');
      }
      updateCountdown();
      setInterval(updateCountdown, 1000);
    }

    const toast = document.getElementById('toast');
    const cookieBtn = document.getElementById('cookieBtn');
    if (cookieBtn) {
      cookieBtn.addEventListener('click', () => {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2400);
      });
    }

    (function(){
      var path = window.location.pathname;
      var current = '';
      if (path.indexOf('deals-promos') !== -1) current = 'deals-promos.html';
      else if (path.indexOf('codes-coupons') !== -1) current = 'codes-coupons.html';
      else if (path.indexOf('comparatifs') !== -1) current = 'comparatifs.html';
      else if (path.indexOf('top-ventes') !== -1) current = 'top-ventes.html';
      else if (path.indexOf('guides-dachat') !== -1) current = 'guides-dachat.html';
      document.querySelectorAll('.nav a, .mobile-nav a').forEach(function(a){
        var href = a.getAttribute('href') || '';
        a.classList.toggle('active', current !== '' && href.indexOf(current) !== -1);
      });
    })();
