(function () {
  'use strict';

  const state = {
    categories: [],
    cards: [],
    currentCat: null,
    currentTag: null,
    view: 'categories',
    keyword: '',
    searchScope: 'category',
    loaded: false
  };

  let renderedBaseKey = '';
  let currentCards = [];
  let currentCardEls = [];
  const els = {};

  function normalizeQuery(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function matchesKeyword(card, keyword) {
    if (!keyword) return true;
    const haystack = card.searchText || '';
    return keyword.split(' ').every((term) => haystack.includes(term));
  }

  function getBaseCards() {
    if (state.searchScope === 'all') return state.cards;
    return state.cards.filter((c) => c.category === state.currentCat);
  }

  function updateUrl(cat, cardId, tag) {
    const params = new URLSearchParams();
    if (cat) params.set('cat', cat);
    if (tag) params.set('tag', tag);
    if (state.keyword) params.set('q', state.keyword);
    if (state.searchScope === 'all') params.set('scope', 'all');
    const search = params.toString();
    const hash = cardId ? '#' + encodeURIComponent(cardId) : '';
    history.replaceState(null, '', location.pathname + (search ? '?' + search : '') + hash);
  }

  /* ---------- 折叠状态存储 ---------- */
  function getStorageKey() {
    return (els.config && els.config.storageKey) || 'knowledge-collapsed';
  }

  function getCollapsedMap() {
    try {
      return JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
    } catch (err) {
      return {};
    }
  }

  function isCollapsed(id) {
    const map = getCollapsedMap();
    if (!(id in map)) {
      return els.config ? els.config.defaultCollapsed !== false : true;
    }
    return map[id] === true;
  }

  function saveCollapsedState(id, collapsed) {
    const map = getCollapsedMap();
    map[id] = collapsed;
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(map));
    } catch (err) { }
  }

  function setHeaderExpanded(article, expanded) {
    const header = article.querySelector('.knowledge-card__header');
    if (header) header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function setCardCollapsed(article, card, collapsed, persist) {
    article.classList.toggle('is-collapsed', collapsed);
    setHeaderExpanded(article, !collapsed);
    if (persist !== false) saveCollapsedState(card.id, collapsed);
  }

  function buildFeedbackLinks(card, cfg) {
    const links = [];
    const fb = (cfg && cfg.feedback) || {};
    const cardUrl = card.url
      ? location.origin + card.url
      : location.origin + (cfg.pageUrl || '/knowledge/');

    if (fb.github && fb.github.enable && fb.github.repo) {
      const tpl = (fb.github.issueTemplate || '**卡片**：{{title}}')
        .replace(/\{\{title\}\}/g, card.title)
        .replace(/\{\{category\}\}/g, card.category)
        .replace(/\{\{url\}\}/g, cardUrl);
      const issueTitle = '[知识卡片] ' + card.title;
      const href = 'https://github.com/' + fb.github.repo + '/issues/new'
        + '?title=' + encodeURIComponent(issueTitle)
        + '&body=' + encodeURIComponent(tpl);
      links.push({
        href: href,
        icon: 'fas fa-comment-dots',
        label: fb.github.label || '反馈',
        target: '_blank'
      });
    }

    if (fb.email && fb.email.enable && fb.email.address) {
      const subject = '[知识卡片] ' + card.title;
      const body = '卡片：' + card.title + '\n分类：' + card.category
        + '\n链接：' + cardUrl + '\n\n问题描述：\n';
      const href = 'mailto:' + fb.email.address
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
      links.push({
        href: href,
        icon: 'fas fa-envelope',
        label: fb.email.label || '邮件'
      });
    }

    if (fb.custom && fb.custom.enable && fb.custom.url) {
      links.push({
        href: fb.custom.url,
        icon: 'fas fa-external-link-alt',
        label: fb.custom.label || '反馈',
        target: '_blank'
      });
    }

    return links;
  }

  function setupSearchScope() {
    if (!els.search) return;
    if (els.search.dataset.scopeReady === '1') {
      els.scopeBtn = els.search.parentNode.querySelector('.knowledge-scope-btn');
      syncScopeButton();
      return;
    }

    els.search.dataset.scopeReady = '1';
    els.search.setAttribute('aria-label', '搜索知识卡片');
    const wrap = document.createElement('div');
    wrap.className = 'knowledge-search-wrap';
    els.search.parentNode.insertBefore(wrap, els.search);
    wrap.appendChild(els.search);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'knowledge-scope-btn';
    btn.addEventListener('click', toggleSearchScope);
    wrap.appendChild(btn);
    els.scopeBtn = btn;
    syncScopeButton();
  }

  function syncScopeButton() {
    if (!els.scopeBtn) return;
    const all = state.searchScope === 'all';
    els.scopeBtn.classList.toggle('is-all', all);
    els.scopeBtn.setAttribute('aria-pressed', all ? 'true' : 'false');
    els.scopeBtn.setAttribute('title', all ? '当前搜索全部分类，点击切回本分类' : '当前只搜索本分类，点击搜索全部分类');
    els.scopeBtn.innerHTML = '<i class="fas ' + (all ? 'fa-globe' : 'fa-folder') + '"></i><span>'
      + (all ? '全部分类' : '本分类') + '</span>';
  }

  function toggleSearchScope() {
    state.searchScope = state.searchScope === 'all' ? 'category' : 'all';
    state.currentTag = null;
    syncScopeButton();
    updateViewTitle();
    renderTagBar();
    renderCards();
    updateUrl(state.currentCat, null, null);
    if (els.search) els.search.focus();
  }

  function cacheEls() {
    const root = document.getElementById('knowledge-page');
    if (!root) return false;
    els.root = root;
    els.url = root.dataset.url || '/knowledge/data/cards.json';

    let cfg = {};
    try {
      cfg = JSON.parse(root.dataset.config || '{}');
    } catch (err) {
      console.warn('[knowledge] 配置解析失败', err);
    }
    els.config = cfg;

    els.loading = document.getElementById('knowledge-loading');
    els.error = document.getElementById('knowledge-error');
    els.viewCat = document.getElementById('knowledge-view-categories');
    els.viewCards = document.getElementById('knowledge-view-cards');
    els.catGrid = document.getElementById('knowledge-category-grid');
    els.currentCat = document.getElementById('knowledge-current-cat');
    els.grid = document.getElementById('knowledge-grid');
    els.empty = document.getElementById('knowledge-empty');
    els.search = document.getElementById('knowledge-search');
    els.tagBar = document.getElementById('knowledge-tag-bar');

    const loadingText = document.querySelector('.knowledge-loading-text');
    if (loadingText && cfg.loadingText) loadingText.textContent = cfg.loadingText;
    if (els.empty && cfg.emptyText) els.empty.textContent = cfg.emptyText;
    if (els.empty) els.empty.setAttribute('aria-live', 'polite');
    if (els.tagBar) els.tagBar.setAttribute('role', 'group');
    setupSearchScope();
    return true;
  }

  async function init() {
    if (!cacheEls()) return;
    state.loaded = false;
    state.categories = [];
    state.cards = [];
    state.currentCat = null;
    state.currentTag = null;
    state.keyword = '';
    state.searchScope = 'category';
    renderedBaseKey = '';
    currentCards = [];
    currentCardEls = [];
    if (els.search) els.search.value = '';
    syncScopeButton();
    showOnly('loading');

    try {
      const res = await fetch(els.url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      state.categories = data.categories || [];
      state.cards = data.cards || [];
      state.loaded = true;
      renderCategories();
      showOnly('categories');
      handleUrlState();
    } catch (err) {
      console.error('[knowledge] 加载失败', err);
      if (els.error) {
        els.error.textContent = (els.config && els.config.errorText)
          || '知识库数据加载失败，请刷新重试';
      }
      showOnly('error');
    }
  }

  function showOnly(view) {
    const map = {
      loading: els.loading,
      error: els.error,
      categories: els.viewCat,
      cards: els.viewCards
    };
    Object.keys(map).forEach((k) => {
      const el = map[k];
      if (!el) return;
      el.style.display = k === view ? '' : 'none';
    });
    state.view = view === 'cards' ? 'cards' : 'categories';
  }

  function renderCategories() {
    if (!els.catGrid) return;
    els.catGrid.innerHTML = '';
    state.categories.forEach((cat) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'knowledge-category-card';
      el.dataset.category = cat.name;
      el.setAttribute('aria-label', '查看分类 ' + cat.name + '，共 ' + cat.count + ' 张卡片');

      const name = document.createElement('div');
      name.className = 'knowledge-category-name';
      name.textContent = cat.name;

      const count = document.createElement('div');
      count.className = 'knowledge-category-count';
      count.textContent = cat.count + ' 张';

      el.appendChild(name);
      el.appendChild(count);
      els.catGrid.appendChild(el);
    });
  }

  function updateViewTitle() {
    if (!els.currentCat) return;
    els.currentCat.textContent = state.searchScope === 'all'
      ? '全部分类'
      : (state.currentCat || '');
  }

  function appendCount(btn, count) {
    const span = document.createElement('span');
    span.className = 'knowledge-tag-count';
    span.textContent = count;
    btn.appendChild(span);
  }

  function renderTagBar() {
    const bar = els.tagBar;
    if (!bar) return;
    bar.innerHTML = '';
    bar.classList.remove('is-expanded');

    const base = getBaseCards();
    const counter = new Map();
    base.forEach((card) => {
      (card.tags || []).forEach((t) => {
        counter.set(t, (counter.get(t) || 0) + 1);
      });
    });

    if (counter.size === 0) {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = '';

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'knowledge-tag-btn is-active';
    allBtn.dataset.tag = '';
    allBtn.appendChild(document.createTextNode('全部'));
    appendCount(allBtn, base.length);
    allBtn.setAttribute('aria-pressed', 'true');
    bar.appendChild(allBtn);

    const sorted = Array.from(counter.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
    const COLLAPSE_AFTER = 6;

    sorted.forEach(([tag, count], idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'knowledge-tag-btn';
      btn.dataset.tag = tag;
      btn.appendChild(document.createTextNode('#' + tag));
      appendCount(btn, count);
      btn.setAttribute('aria-pressed', 'false');
      if (idx >= COLLAPSE_AFTER) btn.dataset.collapsed = 'true';
      bar.appendChild(btn);
    });

    if (sorted.length > COLLAPSE_AFTER) {
      const hiddenCount = sorted.length - COLLAPSE_AFTER;
      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'knowledge-tag-more';
      moreBtn.dataset.expanded = 'false';
      moreBtn.dataset.hidden = hiddenCount;
      moreBtn.textContent = '更多 (' + hiddenCount + ')';
      bar.appendChild(moreBtn);
    }
  }

  function applyTag(tag) {
    if (tag) {
      const exists = getBaseCards().some((c) => (c.tags || []).includes(tag));
      if (!exists) return;
      state.currentTag = tag;
    } else {
      state.currentTag = null;
    }

    if (els.tagBar) {
      els.tagBar.querySelectorAll('.knowledge-tag-btn').forEach((b) => {
        const active = (b.dataset.tag || null) === state.currentTag;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    renderCards();
    updateUrl(state.currentCat, null, state.currentTag);
  }

  function enterCategory(name, opts) {
    opts = opts || {};
    state.currentCat = name;
    state.currentTag = null;
    if (!opts.keepKeyword) {
      state.keyword = '';
      if (els.search) els.search.value = '';
    }
    if (!opts.keepScope) {
      state.searchScope = 'category';
      syncScopeButton();
    } else {
      syncScopeButton();
    }
    updateViewTitle();
    renderTagBar();
    renderCards();
    showOnly('cards');
    if (!opts.skipScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (!opts.skipUrl) {
      updateUrl(name, null, null);
    }
  }

  function backToCategories() {
    state.currentCat = null;
    state.currentTag = null;
    state.keyword = '';
    state.searchScope = 'category';
    renderedBaseKey = '';
    currentCards = [];
    currentCardEls = [];
    if (els.search) els.search.value = '';
    syncScopeButton();
    showOnly('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateUrl(null, null, null);
  }

  function renderCards() {
    if (!els.grid) return;
    const base = getBaseCards();
    const baseKey = state.searchScope + '|' + (state.currentCat || '');
    const keyword = state.keyword;

    if (!state.loaded) return;

    if (renderedBaseKey !== baseKey) {
      renderedBaseKey = baseKey;
      currentCards = base.slice();
      const frag = document.createDocumentFragment();
      currentCardEls = currentCards.map((card) => {
        const el = buildCardEl(card);
        frag.appendChild(el);
        return el;
      });
      els.grid.innerHTML = '';
      els.grid.appendChild(frag);
    }

    let visible = 0;
    currentCards.forEach((card, i) => {
      const el = currentCardEls[i];
      if (!el) return;
      const tagOk = !state.currentTag || (card.tags || []).includes(state.currentTag);
      const kwOk = matchesKeyword(card, keyword);
      const ok = tagOk && kwOk;
      el.style.display = ok ? '' : 'none';

      if (ok) {
        visible++;
        if (keyword) {
          el.classList.remove('is-collapsed');
          setHeaderExpanded(el, true);
        } else {
          setCardCollapsed(el, card, isCollapsed(card.id), false);
        }
      }
    });

    if (els.empty) {
      if (keyword) {
        els.empty.textContent = '没有匹配“' + keyword + '”的卡片';
      } else if (els.config && els.config.emptyText) {
        els.empty.textContent = els.config.emptyText;
      }
      els.empty.style.display = visible === 0 ? '' : 'none';
    }
  }

  function getRelatedCards(card, limit) {
    const ownTags = card.tags || [];
    if (!ownTags.length) return [];
    const own = new Set(ownTags);
    return state.cards
      .filter((c) => c.id !== card.id)
      .map((c) => {
        const shared = (c.tags || []).filter((t) => own.has(t)).length;
        return { card: c, shared: shared, sameCategory: c.category === card.category };
      })
      .filter((item) => item.shared > 0)
      .sort((a, b) =>
        (b.sameCategory ? 1 : 0) - (a.sameCategory ? 1 : 0)
        || b.shared - a.shared
        || String(b.card.dateStr || '').localeCompare(String(a.card.dateStr || ''))
      )
      .slice(0, limit || 3)
      .map((item) => item.card);
  }

  function navigateToCard(card) {
    state.keyword = '';
    if (els.search) els.search.value = '';
    const sameView = state.currentCat === card.category && state.searchScope === 'category';
    if (sameView) {
      state.currentTag = null;
      renderTagBar();
      renderCards();
    } else {
      enterCategory(card.category, { skipScroll: true, skipUrl: true });
    }
    focusCard(card.id);
    updateUrl(card.category, card.id, state.currentTag);
  }

  function focusCard(id) {
    let attempts = 0;
    const maxAttempts = 20;

    function tryScroll() {
      const el = document.querySelector('[data-card-id="' + id + '"]');
      if (!el) {
        if (++attempts < maxAttempts) {
          setTimeout(tryScroll, 50);
        } else {
          console.warn('[knowledge] 未找到卡片', id);
        }
        return;
      }

      const card = state.cards.find((c) => c.id === id);
      if (card) setCardCollapsed(el, card, false, true);

      const rect = el.getBoundingClientRect();
      const targetY = window.pageYOffset + rect.top
        - window.innerHeight / 2 + rect.height / 2;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

      el.classList.add('is-highlighted');
      setTimeout(() => el.classList.remove('is-highlighted'), 3500);
    }

    tryScroll();
  }

  function buildCardEl(card) {
    const article = document.createElement('article');
    article.className = 'knowledge-card';
    article.dataset.cardId = card.id;
    const collapsed = isCollapsed(card.id);
    if (collapsed) article.classList.add('is-collapsed');

    const header = document.createElement('header');
    header.className = 'knowledge-card__header';
    header.setAttribute('role', 'button');
    header.tabIndex = 0;
    header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');

    if (card.icon) {
      const icon = document.createElement('i');
      icon.className = 'knowledge-card__icon ' + card.icon;
      header.appendChild(icon);
    }

    const title = document.createElement('h3');
    title.className = 'knowledge-card__title';
    const link = document.createElement('a');
    link.href = card.url || ('/knowledge/cards/' + card.id + '/');
    link.textContent = card.title;
    link.addEventListener('click', (e) => e.stopPropagation());
    title.appendChild(link);
    header.appendChild(title);

    if (card.dateStr) {
      const time = document.createElement('time');
      time.className = 'knowledge-card__date';
      time.dateTime = card.dateStr;
      time.textContent = card.dateStr;
      header.appendChild(time);
    }

    const toggle = document.createElement('i');
    toggle.className = 'knowledge-card__toggle fas fa-chevron-down';
    toggle.setAttribute('aria-hidden', 'true');
    header.appendChild(toggle);

    function toggleCard() {
      setCardCollapsed(article, card, !article.classList.contains('is-collapsed'), true);
    }

    header.addEventListener('click', toggleCard);
    header.addEventListener('keydown', (e) => {
      if (e.target && e.target.closest('a')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard();
      }
    });

    article.appendChild(header);

    const wrapper = document.createElement('div');
    wrapper.className = 'knowledge-card__body-wrapper';
    const inner = document.createElement('div');
    inner.className = 'knowledge-card__body-inner';
    const body = document.createElement('div');
    body.className = 'knowledge-card__body';
    body.innerHTML = card.content;
    inner.appendChild(body);
    wrapper.appendChild(inner);
    article.appendChild(wrapper);

    const footer = document.createElement('footer');
    footer.className = 'knowledge-card__footer';

    const cat = document.createElement('span');
    cat.className = 'knowledge-card__cat';
    cat.textContent = card.category;
    footer.appendChild(cat);

    const feedbackLinks = buildFeedbackLinks(card, els.config);
    if (feedbackLinks.length) {
      const fbBox = document.createElement('div');
      fbBox.className = 'knowledge-card__feedback';
      feedbackLinks.forEach((linkInfo, idx) => {
        if (idx > 0) {
          const sep = document.createElement('span');
          sep.className = 'knowledge-feedback-sep';
          sep.textContent = '·';
          fbBox.appendChild(sep);
        }
        const a = document.createElement('a');
        a.className = 'knowledge-feedback-link';
        a.href = linkInfo.href;
        a.innerHTML = '<i class="' + linkInfo.icon + '"></i> ' + linkInfo.label;
        if (linkInfo.target) {
          a.target = linkInfo.target;
          a.rel = 'noopener';
        }
        fbBox.appendChild(a);
      });
      footer.appendChild(fbBox);
    }

    if (card.tags && card.tags.length) {
      const tags = document.createElement('div');
      tags.className = 'knowledge-card__tags';
      card.tags.forEach((t) => {
        const tag = document.createElement('button');
        tag.type = 'button';
        tag.className = 'knowledge-tag';
        tag.textContent = '#' + t;
        tag.setAttribute('aria-label', '筛选标签 ' + t);
        tag.addEventListener('click', (e) => {
          e.stopPropagation();
          applyTag(state.currentTag === t ? null : t);
        });
        tags.appendChild(tag);
      });
      footer.appendChild(tags);
    }

    const related = getRelatedCards(card, 3);
    if (related.length) {
      const relatedBox = document.createElement('div');
      relatedBox.className = 'knowledge-card__related';
      const label = document.createElement('span');
      label.className = 'knowledge-related-label';
      label.textContent = '相关：';
      relatedBox.appendChild(label);
      related.forEach((relatedCard) => {
        const a = document.createElement('a');
        a.className = 'knowledge-related-link';
        a.href = '#' + encodeURIComponent(relatedCard.id);
        a.textContent = relatedCard.title;
        a.title = relatedCard.title;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          navigateToCard(relatedCard);
        });
        relatedBox.appendChild(a);
      });
      footer.appendChild(relatedBox);
    }

    article.appendChild(footer);
    return article;
  }

  function handleUrlState() {
    const params = new URLSearchParams(location.search);
    const catFromQuery = params.get('cat');
    const tagFromQuery = params.get('tag');
    const qFromQuery = params.get('q') || '';
    const scopeFromQuery = params.get('scope') === 'all';
    const rawHash = decodeURIComponent(location.hash.slice(1));

    state.searchScope = scopeFromQuery ? 'all' : 'category';
    state.keyword = normalizeQuery(qFromQuery);
    if (els.search) els.search.value = qFromQuery;
    syncScopeButton();

    if (rawHash) {
      const cardId = rawHash.replace(/^card-/, '');
      const card = state.cards.find((c) => c.id === cardId);
      if (card) {
        enterCategory(card.category, {
          skipScroll: true,
          skipUrl: true,
          keepScope: true,
          keepKeyword: true
        });
        if (tagFromQuery) applyTag(tagFromQuery);
        else renderCards();
        focusCard(card.id);
        return;
      }
    }

    if (catFromQuery) {
      const exists = state.categories.some((c) => c.name === catFromQuery);
      if (exists) {
        enterCategory(catFromQuery, {
          skipUrl: true,
          keepScope: true,
          keepKeyword: true
        });
        if (tagFromQuery) applyTag(tagFromQuery);
        else renderCards();
        return;
      }
    }

    if (state.keyword && state.categories.length) {
      enterCategory(state.categories[0].name, {
        skipUrl: true,
        keepScope: true,
        keepKeyword: true
      });
    }
  }

  function handleCopy(btn) {
    const fig = btn.closest('figure.highlight');
    if (!fig) return;
    const code = fig.querySelector('code');
    if (!code) return;

    const text = code.innerText;
    const done = () => {
      if (window.btf && typeof btf.snackbar === 'function') {
        btf.snackbar('复制成功', { timeout: 2000 });
      } else if (typeof window.Snackbar === 'function') {
        new Snackbar('复制成功');
      } else {
        const old = btn.className;
        btn.classList.remove('fa-paste', 'fa-copy');
        btn.classList.add('fa-check');
        setTimeout(() => {
          btn.classList.remove('fa-check');
          btn.className = old;
        }, 1500);
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => { });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { }
      document.body.removeChild(ta);
    }
  }

  document.addEventListener('click', function (e) {
    const catCard = e.target.closest('.knowledge-category-card');
    if (catCard && catCard.dataset.category) {
      enterCategory(catCard.dataset.category);
      return;
    }

    const moreBtn = e.target.closest('.knowledge-tag-more');
    if (moreBtn) {
      const bar = els.tagBar;
      const expanded = moreBtn.dataset.expanded === 'true';
      if (expanded) {
        bar.classList.remove('is-expanded');
        moreBtn.dataset.expanded = 'false';
        moreBtn.textContent = '更多 (' + moreBtn.dataset.hidden + ')';
      } else {
        bar.classList.add('is-expanded');
        moreBtn.dataset.expanded = 'true';
        moreBtn.textContent = '收起';
      }
      return;
    }

    const tagBtn = e.target.closest('.knowledge-tag-btn');
    if (tagBtn) {
      applyTag(tagBtn.dataset.tag || null);
      return;
    }

    if (e.target.closest('#knowledge-back')) {
      backToCategories();
      return;
    }

    const copyBtn = e.target.closest('.knowledge-card figure.highlight .copy-button');
    if (copyBtn) handleCopy(copyBtn);
  });

  let debounceTimer = null;
  document.addEventListener('input', function (e) {
    if (!e.target || e.target.id !== 'knowledge-search') return;
    clearTimeout(debounceTimer);
    const val = e.target.value;
    const delay = (els.config && els.config.searchDebounce) || 200;
    debounceTimer = setTimeout(() => {
      state.keyword = normalizeQuery(val);
      renderCards();
      updateUrl(state.currentCat, null, state.currentTag);
    }, delay);
  });

  window.addEventListener('hashchange', function () {
    if (document.getElementById('knowledge-page')) handleUrlState();
  });

  document.addEventListener('pjax:complete', function () {
    if (document.getElementById('knowledge-page')) init();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/*
 * 历史版本代码块已清理（2026-11）。
 * 旧代码曾以 `if (false) { ... }` 形式留在文件末尾：它不会被解析执行，
 * 但会让文件体积翻倍，并让 `node --check` / 静态审查误读函数定义。
 * 当前唯一有效的实现是文件上方第 1 行的 IIFE（即本文件真正的入口）。
 */

/*
 * 以下内容是被注释掉的旧实现，禁止作为参考执行。
 * 保留仅为避免破坏历史 diff；实际运行代码在文件顶部。
 */

(function () {
  'use strict';

  const state = {
    categories: [],
    cards: [],
    currentCat: null,
    currentTag: null,
    view: 'categories',
    keyword: '',
      searchScope: 'category',
    loaded: false
  };

  let renderedBaseKey = '';
  let currentCards = [];
  let currentCardEls = [];

  const els = {};

  function updateUrl(cat, cardId, tag) {
    const parts = [];
    if (cat) parts.push('cat=' + encodeURIComponent(cat));
    if (tag) parts.push('tag=' + encodeURIComponent(tag));
    const search = parts.length ? '?' + parts.join('&') : '';
    const hash = cardId ? '#' + encodeURIComponent(cardId) : '';
    history.replaceState(null, '', location.pathname + search + hash);
  }

  function handleHash() {
    const params = new URLSearchParams(location.search);
    const catFromQuery = params.get('cat');
    const tagFromQuery = params.get('tag');
    const rawHash = decodeURIComponent(location.hash.slice(1));

    if (rawHash) {
      const cardId = rawHash.replace(/^card-/, '');
      const card = state.cards.find((c) => c.id === cardId);
      if (card) {
        enterCategory(card.category, { skipScroll: true, skipUrl: true });
        if (tagFromQuery) applyTag(tagFromQuery);
        focusCard(card.id);
        return;
      }
    }

    if (catFromQuery) {
      const exists = state.categories.some((c) => c.name === catFromQuery);
      if (exists) {
        enterCategory(catFromQuery, { skipUrl: true });
        if (tagFromQuery) applyTag(tagFromQuery);
      }
    }
  }

  function focusCard(id) {
    let attempts = 0;
    const maxAttempts = 20;

    function tryScroll() {
      const el = document.querySelector('[data-card-id="' + id + '"]');
      if (!el) {
        if (++attempts < maxAttempts) {
          setTimeout(tryScroll, 50);
        } else {
          console.warn('[knowledge] 未找到卡片', id);
        }
        return;
      }

      el.classList.remove('is-collapsed');
      saveCollapsedState(id, false);

      const rect = el.getBoundingClientRect();
      const targetY = window.pageYOffset + rect.top
        - window.innerHeight / 2 + rect.height / 2;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

      el.classList.add('is-highlighted');
      setTimeout(() => el.classList.remove('is-highlighted'), 3500);
    }

    tryScroll();
  }

  /* ---------- 折叠状态存储 ---------- */
  const COLLAPSE_KEY = 'knowledge-collapsed-v2';

  function getStorageKey() {
    return (els.config && els.config.storageKey) || 'knowledge-collapsed';
  }

  function getCollapsedMap() {
    try {
      return JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
    } catch {
      return {};
    }
  }

  function isCollapsed(id) {
    const map = getCollapsedMap();
    if (!(id in map)) {
      return els.config ? els.config.defaultCollapsed !== false : true;
    }
    return map[id] === true;
  }

  function saveCollapsedState(id, collapsed) {
    const map = getCollapsedMap();
    map[id] = collapsed;
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(map));
    } catch { }
  }

  function buildFeedbackLinks(card, cfg) {
    const links = [];
    const fb = (cfg && cfg.feedback) || {};
    const cardUrl = card.url
      ? location.origin + card.url
      : location.origin + (cfg.pageUrl || '/knowledge/');

    if (fb.github && fb.github.enable && fb.github.repo) {
      const tpl = (fb.github.issueTemplate || '**卡片**：{{title}}')
        .replace(/\{\{title\}\}/g, card.title)
        .replace(/\{\{category\}\}/g, card.category)
        .replace(/\{\{url\}\}/g, cardUrl);
      const issueTitle = '[知识卡片] ' + card.title;
      const href = 'https://github.com/' + fb.github.repo + '/issues/new'
        + '?title=' + encodeURIComponent(issueTitle)
        + '&body=' + encodeURIComponent(tpl);
      links.push({
        href,
        icon: 'fas fa-comment-dots',
        label: fb.github.label || '反馈',
        target: '_blank'
      });
    }

    if (fb.email && fb.email.enable && fb.email.address) {
      const subject = '[知识卡片] ' + card.title;
      const body = '卡片：' + card.title + '\n分类：' + card.category
        + '\n链接：' + cardUrl + '\n\n问题描述：\n';
      const href = 'mailto:' + fb.email.address
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
      links.push({
        href,
        icon: 'fas fa-envelope',
        label: fb.email.label || '邮件'
      });
    }

    if (fb.custom && fb.custom.enable && fb.custom.url) {
      links.push({
        href: fb.custom.url,
        icon: 'fas fa-external-link-alt',
        label: fb.custom.label || '反馈',
        target: '_blank'
      });
    }

    return links;
  }

  function cacheEls() {
    const root = document.getElementById('knowledge-page');
    if (!root) return false;
    els.root = root;
    els.url = root.dataset.url || '/knowledge/data/cards.json';

    // 读配置
    let cfg = {};
    try {
      cfg = JSON.parse(root.dataset.config || '{}');
    } catch (e) {
      console.warn('[knowledge] 配置解析失败', e);
    }
    els.config = cfg;

    els.loading = document.getElementById('knowledge-loading');
    els.error = document.getElementById('knowledge-error');
    els.viewCat = document.getElementById('knowledge-view-categories');
    els.viewCards = document.getElementById('knowledge-view-cards');
    els.catGrid = document.getElementById('knowledge-category-grid');
    els.currentCat = document.getElementById('knowledge-current-cat');
    els.grid = document.getElementById('knowledge-grid');
    els.empty = document.getElementById('knowledge-empty');
    els.search = document.getElementById('knowledge-search');
    els.tagBar = document.getElementById('knowledge-tag-bar');

    // 用配置里的文案覆盖
    const loadingText = document.querySelector('.knowledge-loading-text');
    if (loadingText && cfg.loadingText) loadingText.textContent = cfg.loadingText;
    if (els.empty && cfg.emptyText) els.empty.textContent = cfg.emptyText;
    return true;
  }

  async function init() {
    if (!cacheEls()) return;
    state.loaded = false;
    state.categories = [];
    state.cards = [];
    state.currentCat = null;
    state.keyword = '';

    if (els.search) els.search.value = '';
    showOnly('loading');

    try {
      const res = await fetch(els.url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      state.categories = data.categories || [];
      state.cards = data.cards || [];
      state.loaded = true;
      renderCategories();
      showOnly('categories');
      handleHash();
    } catch (err) {
      console.error('[knowledge] 加载失败', err);
      els.error.textContent = '知识库数据加载失败，请刷新重试';
      showOnly('error');
    }
  }

  function showOnly(view) {
    const map = {
      loading: els.loading,
      error: els.error,
      categories: els.viewCat,
      cards: els.viewCards
    };
    Object.entries(map).forEach(([k, el]) => {
      if (!el) return;
      el.style.display = k === view ? '' : 'none';
    });
    state.view = view === 'cards' ? 'cards' : 'categories';
  }

  function renderCategories() {
    els.catGrid.innerHTML = '';
    state.categories.forEach((cat) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'knowledge-category-card';
      el.dataset.category = cat.name;

      const name = document.createElement('div');
      name.className = 'knowledge-category-name';
      name.textContent = cat.name;

      const count = document.createElement('div');
      count.className = 'knowledge-category-count';
      count.textContent = cat.count + ' 张';

      el.appendChild(name);
      el.appendChild(count);
      els.catGrid.appendChild(el);
    });
  }

  function renderTagBar() {
    const bar = els.tagBar;
    if (!bar) return;
    bar.innerHTML = '';
    bar.classList.remove('is-expanded');

    const cardsInCat = state.cards.filter((c) => c.category === state.currentCat);

    const counter = new Map();
    cardsInCat.forEach((card) => {
      (card.tags || []).forEach((t) => {
        counter.set(t, (counter.get(t) || 0) + 1);
      });
    });

    if (counter.size === 0) {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = '';

    // "全部"按钮
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'knowledge-tag-btn is-active';
    allBtn.dataset.tag = '';
    allBtn.innerHTML = '全部<span class="knowledge-tag-count">' + cardsInCat.length + '</span>';
    bar.appendChild(allBtn);

    // 标签按数量倒序
    const sorted = [...counter.entries()].sort((a, b) => b[1] - a[1]);

    // 超过这个数量时，默认只显示前 N 个
    const COLLAPSE_AFTER = 6;

    sorted.forEach(([tag, count], idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'knowledge-tag-btn';
      btn.dataset.tag = tag;
      btn.innerHTML = '#' + tag + '<span class="knowledge-tag-count">' + count + '</span>';
      // 超出前 N 个的标签标记为"待展开"
      if (idx >= COLLAPSE_AFTER) {
        btn.dataset.collapsed = 'true';
      }
      bar.appendChild(btn);
    });

    // 只要标签数超过阈值，就追加"更多"按钮
    if (sorted.length > COLLAPSE_AFTER) {
      const hiddenCount = sorted.length - COLLAPSE_AFTER;
      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'knowledge-tag-more';
      moreBtn.dataset.expanded = 'false';
      moreBtn.dataset.hidden = hiddenCount;
      moreBtn.textContent = '更多 (' + hiddenCount + ')';
      bar.appendChild(moreBtn);
    }
  }

  function applyTag(tag) {
    if (!tag) {
      state.currentTag = null;
    } else {
      // 确认该 tag 在当前分类下存在
      const cardsInCat = state.cards.filter((c) => c.category === state.currentCat);
      const exists = cardsInCat.some((c) => (c.tags || []).includes(tag));
      if (!exists) return;
      state.currentTag = tag;
    }

    // 同步按钮状态
    const bar = els.tagBar;
    if (bar) {
      bar.querySelectorAll('.knowledge-tag-btn').forEach((b) => {
        const bTag = b.dataset.tag || null;
        b.classList.toggle('is-active', bTag === state.currentTag);
      });
    }

    renderCards();
    updateUrl(state.currentCat, null, state.currentTag);
  }

  function enterCategory(name, opts) {
    opts = opts || {};
    state.currentCat = name;
    state.currentTag = null;
    state.keyword = '';
    if (els.search) els.search.value = '';
    els.currentCat.textContent = name;
    renderTagBar();
    renderCards();
    showOnly('cards');
    if (!opts.skipScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (!opts.skipUrl) {
      updateUrl(name, null, null);
    }
  }

  function backToCategories() {
    state.currentCat = null;
    state.keyword = '';
    renderedCat = null;
    currentCards = [];
    currentCardEls = [];
    if (els.search) els.search.value = '';
    showOnly('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateUrl(null, null, null);
  }

  function renderCards() {
    if (!els.grid) return;
    const keyword = state.keyword;

    // 切换分类时重建 DOM
    if (renderedCat !== state.currentCat) {
      renderedCat = state.currentCat;
      currentCards = state.cards.filter((c) => c.category === state.currentCat);

      const frag = document.createDocumentFragment();
      currentCardEls = currentCards.map((card) => {
        const el = buildCardEl(card);
        frag.appendChild(el);
        return el;
      });

      els.grid.innerHTML = '';
      els.grid.appendChild(frag);
    }

    // 搜索只切 display
    let visible = 0;
    currentCards.forEach((card, i) => {
      const tagOk = !state.currentTag || (card.tags || []).includes(state.currentTag);
      const kwOk = !keyword || card.searchText.includes(keyword);
      const ok = tagOk && kwOk;
      const el = currentCardEls[i];
      el.style.display = ok ? '' : 'none';
      if (ok) visible++;

      // 搜索时自动展开匹配项，清空搜索时恢复用户手动状态
      if (keyword && ok) {
        el.classList.remove('is-collapsed');
      } else if (!keyword) {
        if (isCollapsed(card.id)) el.classList.add('is-collapsed');
        else el.classList.remove('is-collapsed');
      }
    });

    els.empty.style.display = visible === 0 ? '' : 'none';
  }

  function buildCardEl(card) {
    const article = document.createElement('article');
    article.className = 'knowledge-card';
    article.dataset.cardId = card.id;
    if (isCollapsed(card.id)) article.classList.add('is-collapsed');

    // ---- 头部（可点击，切换折叠）----
    const header = document.createElement('header');
    header.className = 'knowledge-card__header';

    if (card.icon) {
      const i = document.createElement('i');
      i.className = 'knowledge-card__icon ' + card.icon;
      header.appendChild(i);
    }

    const title = document.createElement('h3');
    title.className = 'knowledge-card__title';
    const link = document.createElement('a');
    link.href = card.url || ('/knowledge/cards/' + card.id + '/');
    link.textContent = card.title;
    // 链接点击不要触发折叠
    link.addEventListener('click', (e) => e.stopPropagation());
    title.appendChild(link);
    header.appendChild(title);

    if (card.dateStr) {
      const t = document.createElement('time');
      t.className = 'knowledge-card__date';
      t.dateTime = card.dateStr;
      t.textContent = card.dateStr;
      header.appendChild(t);
    }

    // 折叠指示器
    const toggle = document.createElement('i');
    toggle.className = 'knowledge-card__toggle fas fa-chevron-down';
    header.appendChild(toggle);

    // 点头部切换
    header.addEventListener('click', () => {
      article.classList.toggle('is-collapsed');
      saveCollapsedState(card.id, article.classList.contains('is-collapsed'));
    });

    article.appendChild(header);

    // ---- 可折叠的正文区 ----
    const wrapper = document.createElement('div');
    wrapper.className = 'knowledge-card__body-wrapper';

    const inner = document.createElement('div');
    inner.className = 'knowledge-card__body-inner';

    const body = document.createElement('div');
    body.className = 'knowledge-card__body';
    body.innerHTML = card.content;
    inner.appendChild(body);

    const footer = document.createElement('footer');
    footer.className = 'knowledge-card__footer';

    const cat = document.createElement('span');
    cat.className = 'knowledge-card__cat';
    cat.textContent = card.category;
    footer.appendChild(cat);

    // 反馈入口
    const feedbackLinks = buildFeedbackLinks(card, els.config);
    if (feedbackLinks.length) {
      const fbBox = document.createElement('div');
      fbBox.className = 'knowledge-card__feedback';
      feedbackLinks.forEach((link, idx) => {
        if (idx > 0) {
          const sep = document.createElement('span');
          sep.className = 'knowledge-feedback-sep';
          sep.textContent = '·';
          fbBox.appendChild(sep);
        }
        const a = document.createElement('a');
        a.className = 'knowledge-feedback-link';
        a.href = link.href;
        a.innerHTML = '<i class="' + link.icon + '"></i> ' + link.label;
        if (link.target) {
          a.target = link.target;
          a.rel = 'noopener';
        }
        fbBox.appendChild(a);
      });
      footer.appendChild(fbBox);
    }

    if (card.tags && card.tags.length) {
      const tags = document.createElement('div');
      tags.className = 'knowledge-card__tags';
      card.tags.forEach((t) => {
        const tag = document.createElement('span');
        tag.className = 'knowledge-tag';
        tag.textContent = '#' + t;
        tags.appendChild(tag);
      });
      footer.appendChild(tags);
    }

    wrapper.appendChild(inner);
    article.appendChild(wrapper);
    article.appendChild(footer);

    return article;
  }

  /* ---------- 事件委托 ---------- */
  document.addEventListener('click', function (e) {
    // 分类卡片
    const catCard = e.target.closest('.knowledge-category-card');
    if (catCard && catCard.dataset.category) {
      enterCategory(catCard.dataset.category);
      return;
    }

    // 标签"更多"展开/收起
    const moreBtn = e.target.closest('.knowledge-tag-more');
    if (moreBtn) {
      const bar = els.tagBar;
      const expanded = moreBtn.dataset.expanded === 'true';
      if (expanded) {
        bar.classList.remove('is-expanded');
        moreBtn.dataset.expanded = 'false';
        moreBtn.textContent = '更多 (' + moreBtn.dataset.hidden + ')';
      } else {
        bar.classList.add('is-expanded');
        moreBtn.dataset.expanded = 'true';
        moreBtn.textContent = '收起';
      }
      return;
    }

    // 标签筛选
    const tagBtn = e.target.closest('.knowledge-tag-btn');
    if (tagBtn) {
      const tag = tagBtn.dataset.tag || null;
      applyTag(tag);
      return;
    }

    // 返回
    if (e.target.closest('#knowledge-back')) {
      backToCategories();
      return;
    }
    // 复制代码
    const copyBtn = e.target.closest('.knowledge-card figure.highlight .copy-button');
    if (copyBtn) {
      handleCopy(copyBtn);
    }
  });

  /* ---------- 搜索防抖 ---------- */
  let debounceTimer = null;

  document.addEventListener('input', function (e) {
    if (!e.target || e.target.id !== 'knowledge-search') return;
    clearTimeout(debounceTimer);
    const val = e.target.value;
    const delay = (els.config && els.config.searchDebounce) || 200;
    debounceTimer = setTimeout(() => {
      state.keyword = val.trim().toLowerCase();
      renderCards();
    }, delay);
  });

  /* ---------- 复制 ---------- */
  function handleCopy(btn) {
    const fig = btn.closest('figure.highlight');
    if (!fig) return;
    const code = fig.querySelector('code');
    if (!code) return;

    const text = code.innerText;
    const done = () => {
      // 先尝试主题的 Snackbar
      if (window.btf && typeof btf.snackbar === 'function') {
        btf.snackbar('复制成功', { timeout: 2000 });
      } else if (typeof window.Snackbar === 'function') {
        new Snackbar('复制成功');
      } else {
        // 兜底：按钮短暂变勾
        const old = btn.className;
        btn.classList.remove('fa-paste', 'fa-copy');
        btn.classList.add('fa-check');
        setTimeout(() => {
          btn.classList.remove('fa-check');
          btn.className = old;
        }, 1500);
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => { });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { }
      document.body.removeChild(ta);
    }
  }

  window.addEventListener('hashchange', function () {
    if (document.getElementById('knowledge-page')) handleHash();
  });

  /* ---------- PJAX 支持 ---------- */
  document.addEventListener('pjax:complete', function () {
    if (document.getElementById('knowledge-page')) init();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();