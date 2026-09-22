(function () {
  'use strict';

  const state = {
    categories: [],
    cards: [],
    currentCat: null,
    view: 'categories',
    keyword: '',
    loaded: false
  };

  let renderedCat = null;
  let currentCards = [];
  let currentCardEls = [];

  const els = {};

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

  function enterCategory(name) {
    state.currentCat = name;
    state.keyword = '';
    if (els.search) els.search.value = '';
    els.currentCat.textContent = name;
    renderCards();
    showOnly('cards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const ok = !keyword || card.searchText.includes(keyword);
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