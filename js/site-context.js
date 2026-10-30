/**
 * source/js/site-context.js
 * 页面语义上下文自动识别
 */
(function (global) {
    'use strict';

    var providers = [];
    var pageMetaCache = null;
    var pageMetaPromise = null;

    function registerProvider(fn) {
        if (typeof fn === 'function') providers.push(fn);
    }

    function currentPath() {
        return (location.pathname || '/').replace(/index\.html$/, '');
    }

    function detectPageType() {
        var p = currentPath();
        if (p === '/' || p === '') return 'home';
        if (/^\/tags\//.test(p)) return 'tag';
        if (/^\/categories\//.test(p)) return 'category';
        if (/^\/404(\.html)?\/?$/.test(p)) return '404';
        if (/^\/questions\//.test(p)) return 'questions';
        if (/^\/algorithm\//.test(p)) return 'algorithm';
        if (/^\/knowledge\//.test(p)) return 'knowledge';
        if (/^\/mock\//.test(p)) return 'mock';
        if (/^\/stats\//.test(p)) return 'stats';
        return 'page';
    }

    function detect() {
        var paper = document.querySelector('.exam-paper');
        if (paper) {
            var pid = (paper.id || '').replace(/^exam-paper-/, '');
            return {
                type: 'paper',
                id: pid,
                paperId: pid,
                title: text(paper, '.ep-head h1') || document.title,
                path: currentPath(),
                objectiveCount: paper.querySelectorAll('.ep-question[data-q-index]').length,
                subjectiveCount: paper.querySelectorAll('.ep-subjective').length
            };
        }

        var algo = document.querySelector('#algo-review-app');
        if (algo) {
            return { type: 'algorithm', id: 'algorithm-review', title: document.title, path: currentPath() };
        }

        var mock = document.querySelector('#mock-center-app');
        if (mock) {
            return { type: 'mock', id: 'mock-center', title: document.title, path: currentPath() };
        }

        var type = detectPageType();
        if (type === 'home' || type === 'tag' || type === 'category' || type === '404' || type === 'questions' || type === 'knowledge' || type === 'stats') {
            return { type: type, id: currentPath(), title: document.title, path: currentPath() };
        }

        var article = document.querySelector('article');
        if (article) {
            return {
                type: 'post',
                id: article.id || currentPath(),
                contentId: null,
                title: document.title,
                path: currentPath(),
                tags: [],
                wordCount: 0,
                comments: 0,
                commentsAvailable: false
            };
        }

        return { type: 'page', id: currentPath(), title: document.title, path: currentPath(), theme: getTheme() };
    }

    function text(root, selector) {
        var el = root.querySelector(selector);
        return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function getTheme() {
        var root = document.documentElement;
        var body = document.body;
        var t = (root && (root.getAttribute('data-theme') || root.dataset.theme)) ||
            (body && (body.getAttribute('data-theme') || body.dataset.theme)) || '';
        return t === 'dark' ? 'dark' : 'light';
    }

    function get() {
        var base = detect();
        base.theme = getTheme();
        for (var i = 0; i < providers.length; i++) {
            try {
                var extra = providers[i](base);
                if (extra && typeof extra === 'object') {
                    Object.keys(extra).forEach(function (k) { base[k] = extra[k]; });
                }
            } catch (e) { /* ignore */ }
        }
        return base;
    }

    function loadPageMeta() {
        if (pageMetaCache) return Promise.resolve(pageMetaCache);
        if (pageMetaPromise) return pageMetaPromise;
        pageMetaPromise = fetch('/page-context.json', { cache: 'force-cache' })
            .then(function (res) {
                if (!res.ok) throw new Error('page-context: HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                pageMetaCache = data && data.pages ? data.pages : {};
                return pageMetaCache;
            })
            .catch(function () {
                pageMetaCache = {};
                return pageMetaCache;
            });
        return pageMetaPromise;
    }

    function resolve() {
        var base = get();
        if (base.type !== 'post' && base.type !== 'page') return Promise.resolve(base);
        return loadPageMeta().then(function (pages) {
            var meta = pages[base.path] || pages[base.path.replace(/\/$/, '')] || null;
            if (meta) {
                base.contentId = meta.contentId;
                base.title = meta.title || base.title;
                base.tags = Array.isArray(meta.tags) ? meta.tags : [];
                base.categories = Array.isArray(meta.categories) ? meta.categories : [];
                base.wordCount = Number(meta.wordCount) || 0;
                base.comments = Number(meta.comments) || 0;
                base.commentsAvailable = meta.commentsAvailable === true;
            }
            return base;
        });
    }

    function refresh() {
        return resolve().then(function (ctx) {
            try { if (global.SiteEvents) global.SiteEvents.emit('context:change', ctx); } catch (e) { /* ignore */ }
            return ctx;
        });
    }

    var lastTheme = null;
    function watchTheme() {
        var root = document.documentElement;
        if (!root || !window.MutationObserver) return;
        lastTheme = getTheme();
        new MutationObserver(function () {
            var now = getTheme();
            if (now !== lastTheme) {
                lastTheme = now;
                refresh();
            }
        }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
    }

    global.SiteContext = {
        get: get,
        resolve: resolve,
        refresh: refresh,
        registerProvider: registerProvider
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { watchTheme(); refresh(); });
    } else {
        watchTheme();
        refresh();
    }
    document.addEventListener('pjax:complete', refresh);
})(window);
