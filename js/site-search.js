(function () {
  'use strict';

  var INDEX_URL = '/assets/data/site-search-index.json?v=20260609-1';
  var MAX_RESULTS = 8;
  var SEARCH_STYLE_ID = 'site-search-styles';

  var RELATED_TERMS = {
    transfer: ['ride', 'chauffeur', 'airport', 'pickup', 'dropoff', 'kuljetus', 'kyyti', 'lentokentta', 'lentokentta', 'transport', 'resa', 'aeroport', 'flughafen', 'trasferimento'],
    tourism: ['travel', 'trip', 'helsinki', 'city', 'hotel', 'tour', 'tourism', 'matkailu', 'resor', 'reise', 'voyage', 'turismo', 'majoitus'],
    digital: ['web', 'website', 'seo', 'qa', 'audit', 'automation', 'ai', 'agent', 'verkkosivut', 'digitale', 'numerique', 'digitala'],
    booking: ['book', 'reserve', 'consultation', 'contact', 'inquiry', 'varaus', 'boka', 'buchung', 'reservation', 'prenotazione'],
    portfolio: ['case', 'project', 'work', 'showcase', 'samples', 'referenssi', 'projekt', 'projet', 'progetto'],
    compliance: ['esg', 'security', 'audit', 'risk', 'governance', 'saannostely', 'compliance', 'conformite', 'conformita']
  };

  var TERM_LOOKUP = buildTermLookup(RELATED_TERMS);
  var SEARCH_I18N = {
    en: {
      placeholder: 'Search services, pages, or keywords',
      empty: 'No related pages found yet.',
      ariaLabel: 'Website search results',
      sectionLabel: 'Related page'
    },
    fi: {
      placeholder: 'Hae palveluita, sivuja tai avainsanoja',
      empty: 'Aiheeseen liittyvia sivuja ei loytynyt.',
      ariaLabel: 'Verkkosivun hakutulokset',
      sectionLabel: 'Aiheeseen liittyva sivu'
    },
    sv: {
      placeholder: 'Sok efter tjanster, sidor eller nyckelord',
      empty: 'Inga relaterade sidor hittades.',
      ariaLabel: 'Sokresultat for webbplatsen',
      sectionLabel: 'Relaterad sida'
    },
    de: {
      placeholder: 'Suche nach Services, Seiten oder Stichwortern',
      empty: 'Keine passenden Seiten gefunden.',
      ariaLabel: 'Website-Suchergebnisse',
      sectionLabel: 'Passende Seite'
    },
    fr: {
      placeholder: 'Recherchez des services, pages ou mots-cles',
      empty: 'Aucune page associee trouvee.',
      ariaLabel: 'Resultats de recherche du site',
      sectionLabel: 'Page associee'
    },
    it: {
      placeholder: 'Cerca servizi, pagine o parole chiave',
      empty: 'Nessuna pagina correlata trovata.',
      ariaLabel: 'Risultati ricerca sito',
      sectionLabel: 'Pagina correlata'
    }
  };

  function normalize(value) {
    if (!value) return '';
    return value
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s\/-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(value) {
    var normalized = normalize(value);
    if (!normalized) return [];
    return normalized.split(' ').filter(Boolean);
  }

  function buildTermLookup(relatedTerms) {
    var lookup = {};
    Object.keys(relatedTerms).forEach(function (group) {
      lookup[group] = [group].concat(relatedTerms[group]);
      lookup[group].forEach(function (term) {
        lookup[normalize(term)] = lookup[group];
      });
    });
    return lookup;
  }

  function expandTokens(tokens) {
    var expanded = [];
    tokens.forEach(function (token) {
      expanded.push(token);
      var related = TERM_LOOKUP[token];
      if (related) {
        related.forEach(function (term) {
          var normalized = normalize(term);
          if (normalized) expanded.push(normalized);
        });
      }
    });
    return Array.from(new Set(expanded));
  }

  function getCurrentLang() {
    if (window.luxivalI18n && typeof window.luxivalI18n.getLang === 'function') {
      return window.luxivalI18n.getLang();
    }
    var lang = (document.documentElement.lang || 'en').toLowerCase();
    return SEARCH_I18N[lang] ? lang : 'en';
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function prepareDocument(doc) {
    var path = doc.path || '/';
    var slug = path.replace(/^\//, '').replace(/\//g, ' ');
    var prepared = {
      title: doc.title || 'Untitled',
      path: path,
      section: doc.section || 'Page',
      description: doc.description || '',
      keywords: Array.isArray(doc.keywords) ? doc.keywords : [],
      headings: Array.isArray(doc.headings) ? doc.headings : []
    };
    prepared.searchText = normalize([
      prepared.title,
      prepared.path,
      slug,
      prepared.section,
      prepared.description,
      prepared.keywords.join(' '),
      prepared.headings.join(' ')
    ].join(' '));
    return prepared;
  }

  function scoreDocument(doc, tokens, expandedTokens, query) {
    var score = 0;
    var title = normalize(doc.title);
    var path = normalize(doc.path);

    if (title === query) score += 80;
    if (path === query) score += 75;
    if (title.indexOf(query) !== -1) score += 35;
    if (path.indexOf(query) !== -1) score += 30;

    tokens.forEach(function (token) {
      if (title.indexOf(token) !== -1) score += 22;
      if (path.indexOf(token) !== -1) score += 20;
      if (doc.searchText.indexOf(token) !== -1) score += 8;
    });

    expandedTokens.forEach(function (token) {
      if (doc.searchText.indexOf(token) !== -1) score += 3;
    });

    return score;
  }

  function createResultMarkup(doc) {
    return (
      '<a class="site-search-result" href="' + escapeHtml(doc.path) + '" role="option">' +
        '<span class="site-search-result-title">' + escapeHtml(doc.title) + '</span>' +
        '<span class="site-search-result-meta">' + escapeHtml(doc.section) + ' - ' + escapeHtml(doc.path) + '</span>' +
      '</a>'
    );
  }

  function ensureSearchStyles() {
    if (document.getElementById(SEARCH_STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = SEARCH_STYLE_ID;
    style.textContent =
      '.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}' +
      '.nav-search-item{position:relative;display:flex;align-items:center}' +
      '.site-search{position:relative;min-width:240px}' +
      '.site-search-controls{display:flex;gap:.45rem;align-items:center}' +
      '.site-search-input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(201,169,106,.25);color:#E8EBF2;padding:.56rem .8rem;border-radius:2px;font-size:.74rem;letter-spacing:.8px;text-transform:none}' +
      '.site-search-input::placeholder{opacity:.7;color:rgba(232,235,242,.7)}' +
      '.site-search-input:focus{outline:none;border-color:#C9A96A;box-shadow:0 0 0 2px rgba(201,169,106,.15)}' +
      '.site-search-button{background:#C9A96A;border:1px solid #C9A96A;color:#0A0B0F;padding:.56rem .72rem;border-radius:2px;font-size:.7rem;letter-spacing:1px;text-transform:uppercase;cursor:pointer;line-height:1}' +
      '.site-search-button:hover{filter:brightness(1.06)}' +
      '.site-search-dropdown{position:absolute;top:calc(100% + .45rem);left:0;right:0;z-index:320;background:rgba(10,11,15,.96);border:1px solid rgba(201,169,106,.2);border-radius:2px;box-shadow:0 18px 35px rgba(0,0,0,.45);padding:.4rem;max-height:340px;overflow-y:auto}' +
      '.site-search-result{display:block;padding:.65rem .6rem;border-radius:2px;border:1px solid transparent;transition:border-color .2s,background .2s}' +
      '.site-search-result:hover,.site-search-result.active{background:rgba(201,169,106,.08);border-color:rgba(201,169,106,.2)}' +
      '.site-search-result-title{display:block;color:#E8EBF2;font-size:.76rem;letter-spacing:.7px;text-transform:uppercase;opacity:.95}' +
      '.site-search-result-meta{display:block;color:#C9A96A;font-size:.67rem;letter-spacing:1.1px;opacity:.9;margin-top:.2rem}' +
      '.site-search-empty{padding:.6rem;color:rgba(232,235,242,.72);font-size:.73rem;letter-spacing:.6px}' +
      '@media (max-width:1200px){.site-search{min-width:200px}}' +
      '@media (max-width:768px){.nav-search-item{width:100%}.site-search{width:100%;min-width:0}.site-search-controls{display:grid;grid-template-columns:1fr auto;gap:.45rem}.site-search-input{font-size:.78rem;padding:.66rem .75rem}.site-search-dropdown{position:static;max-height:260px;margin-top:.45rem}}';
    document.head.appendChild(style);
  }

  function mountSearchInNav() {
    var navLinks = document.getElementById('site-nav');
    if (!navLinks || document.getElementById('siteSearch')) return;

    var item = document.createElement('li');
    item.className = 'nav-search-item';
    item.innerHTML =
      '<div class="site-search" id="siteSearch" role="search">' +
      '  <label for="siteSearchInput" class="sr-only">Search</label>' +
      '  <div class="site-search-controls">' +
      '    <input id="siteSearchInput" class="site-search-input" type="search" autocomplete="off" placeholder="Search services, pages, or keywords" data-i18n-placeholder="search.placeholder" aria-autocomplete="list" aria-controls="siteSearchResults" aria-expanded="false" aria-label="Website search">' +
      '    <button type="button" class="site-search-button" id="siteSearchButton" aria-label="Search site">Search</button>' +
      '  </div>' +
      '  <div id="siteSearchResults" class="site-search-dropdown" role="listbox" hidden></div>' +
      '</div>';

    var getStarted = navLinks.querySelector('a.btn');
    var getStartedItem = getStarted ? getStarted.closest('li') : null;
    if (getStartedItem && getStartedItem.parentNode === navLinks) {
      navLinks.insertBefore(item, getStartedItem);
    } else {
      navLinks.appendChild(item);
    }
  }

  function createSearchController(index) {
    var searchInput = document.getElementById('siteSearchInput');
    var searchButton = document.getElementById('siteSearchButton');
    var resultsEl = document.getElementById('siteSearchResults');
    var searchContainer = document.getElementById('siteSearch');
    if (!searchInput || !resultsEl || !searchContainer) return;

    var preparedIndex = index.map(prepareDocument);
    var activeIndex = -1;

    function updateLanguageCopy() {
      var lang = getCurrentLang();
      var copy = SEARCH_I18N[lang] || SEARCH_I18N.en;
      searchInput.placeholder = copy.placeholder;
      resultsEl.setAttribute('aria-label', copy.ariaLabel);
    }

    function openResults() {
      resultsEl.hidden = false;
      searchInput.setAttribute('aria-expanded', 'true');
    }

    function closeResults() {
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
      searchInput.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
    }

    function setActiveResult(nextIndex) {
      var options = Array.prototype.slice.call(resultsEl.querySelectorAll('.site-search-result'));
      options.forEach(function (option, idx) {
        option.classList.toggle('active', idx === nextIndex);
      });
      activeIndex = nextIndex;
    }

    function renderResults(results) {
      var lang = getCurrentLang();
      var copy = SEARCH_I18N[lang] || SEARCH_I18N.en;

      if (!results.length) {
        resultsEl.innerHTML = '<div class="site-search-empty">' + escapeHtml(copy.empty) + '</div>';
        openResults();
        return;
      }

      resultsEl.innerHTML = results.map(createResultMarkup).join('');
      openResults();
      setActiveResult(-1);
    }

    function search(queryValue) {
      var query = normalize(queryValue);
      if (!query || query.length < 2) {
        closeResults();
        return [];
      }

      var tokens = tokenize(query);
      var expandedTokens = expandTokens(tokens);

      var matches = preparedIndex
        .map(function (doc) {
          return {
            doc: doc,
            score: scoreDocument(doc, tokens, expandedTokens, query)
          };
        })
        .filter(function (item) {
          return item.score > 0;
        })
        .sort(function (a, b) {
          return b.score - a.score;
        })
        .slice(0, MAX_RESULTS)
        .map(function (item) {
          return item.doc;
        });

      renderResults(matches);
      return matches;
    }

    searchInput.addEventListener('input', function () {
      search(searchInput.value);
    });

    if (searchButton) {
      searchButton.addEventListener('click', function () {
        var matches = search(searchInput.value);
        if (matches.length) {
          window.location.href = matches[0].path;
        }
      });
    }

    searchInput.addEventListener('focus', function () {
      if (searchInput.value.trim()) search(searchInput.value);
    });

    searchInput.addEventListener('keydown', function (event) {
      var options = Array.prototype.slice.call(resultsEl.querySelectorAll('.site-search-result'));
      if (!options.length) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        var next = activeIndex + 1;
        if (next >= options.length) next = 0;
        setActiveResult(next);
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        var prev = activeIndex - 1;
        if (prev < 0) prev = options.length - 1;
        setActiveResult(prev);
      }

      if (event.key === 'Enter') {
        var targetIndex = activeIndex >= 0 ? activeIndex : 0;
        var activeLink = options[targetIndex];
        if (activeLink) {
          event.preventDefault();
          window.location.href = activeLink.getAttribute('href');
        }
      }

      if (event.key === 'Escape') {
        closeResults();
      }
    });

    document.addEventListener('click', function (event) {
      if (!searchContainer.contains(event.target)) {
        closeResults();
      }
    });

    window.addEventListener('languagechange', updateLanguageCopy);
    document.addEventListener('change', function (event) {
      if (event.target && event.target.id === 'lang-select') {
        updateLanguageCopy();
      }
    });

    updateLanguageCopy();
  }

  function loadIndex() {
    return fetch(INDEX_URL)
      .then(function (response) {
        if (!response.ok) throw new Error('Search index request failed');
        return response.json();
      })
      .then(function (payload) {
        return Array.isArray(payload.documents) ? payload.documents : [];
      })
      .catch(function () {
        return [];
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureSearchStyles();
    mountSearchInNav();
    loadIndex().then(function (index) {
      if (!index.length) return;
      createSearchController(index);
    });
  });
})();
