/**
 * source/js/site-api.js
 * 网站统一语义 API 门面
 *
 * 外部消费者只依赖 window.SiteAPI。
 * 网站系统不感知具体访问者。
 */
(function (global) {
    'use strict';

    var VERSION = '1.1.0';
    var manifestCache = null;

    function content() { return global.SiteContentAPI || null; }
    function nav() { return global.SiteNavigationAPI || null; }
    function actions() { return global.SiteActionAPI || null; }
    function events() { return global.SiteEvents || null; }
    function stats() { return global.StatsCenter || null; }

    var readyPromise = null;
    var readyContentPromise = null;

    function ready(options) {
        options = options || {};
        if (!readyPromise) {
            readyPromise = Promise.resolve().then(function () {
                if (nav() && actions()) {
                    actions().register('navigation.open', function (payload) {
                        return nav().open(payload.path, payload.options);
                    }, { label: '打开站内页面', scope: 'read', description: '按站内路径导航' });

                    actions().register('navigation.openPost', function (payload) {
                        return nav().openPost(payload.id);
                    }, { label: '打开文章', scope: 'read', description: '按文章 ID 打开文章' });

                    actions().register('navigation.openQuestion', function (payload) {
                        return nav().openQuestion(payload.paperId, payload.questionId);
                    }, { label: '打开题目', scope: 'read', description: '按试卷与题目 ID 打开题目' });
                }
                if (global.SiteReadingPosition && typeof global.SiteReadingPosition.start === 'function') {
                    global.SiteReadingPosition.start();
                }
                return true;
            });
        }
        if (options.content === true) {
            return readyPromise.then(readyContent);
        }
        return readyPromise;
    }

    function readyContent() {
        if (!readyContentPromise) {
            readyContentPromise = content() && typeof content().ready === 'function'
                ? content().ready()
                : Promise.resolve(false);
        }
        return readyContentPromise;
    }

    function manifest() {
        if (manifestCache) return Promise.resolve(manifestCache);
        return fetch('/site-api-manifest.json', { cache: 'no-cache' })
            .then(function (res) {
                if (!res.ok) throw new Error('site-api-manifest: HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                manifestCache = data;
                return data;
            });
    }

    function capabilities() {
        var dynamic = actions() ? actions().list() : [];
        return manifest().then(function (m) {
            var map = Object.create(null);
            (m.capabilities || []).forEach(function (c) { map[c.id] = c; });
            dynamic.forEach(function (c) {
                if (!map[c.id]) map[c.id] = c;
            });
            return {
                apiVersion: m.apiVersion || VERSION,
                contextFields: m.contextFields || [],
                actions: dynamic.map(function (a) { return a.id; }),
                capabilities: Object.keys(map).map(function (k) { return map[k]; })
            };
        }).catch(function () {
            return { apiVersion: VERSION, contextFields: [], actions: dynamic.map(function (a) { return a.id; }), capabilities: dynamic };
        });
    }

    function currentContext() {
        if (global.SiteContext) {
            if (typeof global.SiteContext.resolve === 'function') return global.SiteContext.resolve();
            if (typeof global.SiteContext.get === 'function') return Promise.resolve(global.SiteContext.get());
        }
        var base = nav() ? nav().current() : { path: location.pathname, type: 'page', title: document.title };
        return Promise.resolve(base);
    }

    var api = {
        version: VERSION,
        ready: ready,
        readyContent: readyContent,
        content: content,
        navigation: nav,
        actions: actions,
        userState: function () {
            var prefix = 'site-user-state:';
            return {
                maxBytes: 8192,
                keys: function () {
                    var out = [];
                    for (var i = 0; i < localStorage.length; i++) {
                        var key = localStorage.key(i);
                        if (key && key.indexOf(prefix) === 0) out.push(key.slice(prefix.length));
                    }
                    return out;
                },
                get: function (key) {
                    try { return JSON.parse(localStorage.getItem(prefix + key) || 'null'); } catch (e) { return null; }
                },
                set: function (key, value) {
                    try {
                        var raw = JSON.stringify(value);
                        if (raw.length > 8192) return false;
                        localStorage.setItem(prefix + key, raw);
                        return true;
                    } catch (e) { return false; }
                },
                remove: function (key) {
                    try { localStorage.removeItem(prefix + key); return true; } catch (e) { return false; }
                },
                clear: function () {
                    this.keys().forEach(function (key) {
                        try { localStorage.removeItem(prefix + key); } catch (e) { /* ignore */ }
                    });
                    return true;
                }
            };
        },
        stats: function () { return stats(); },
        events: function () { return events(); },
        bookmarks: function () { return global.SiteBookmarks || null; },
        reading: function () { return global.SiteReadingPosition || null; },
        search: function () { return global.SiteSearchAPI || null; },
        context: function () { return global.SiteContext || null; },
        theme: function () { return global.SiteTheme || null; },
        algorithm: function () { return global.SiteAlgorithm || null; },
        history: function () { return global.SiteHistory || null; },
        notes: function () { return global.SiteNotes || null; },
        quiz: function () { return global.SiteQuiz || null; },
        recommend: function () { return global.SiteRecommend || null; },
        data: function () { return global.SiteData || null; },
        health: function () {
            var db = content() && typeof content().content === 'function' ? content().content() : null;
            var cachedContentStats = db && db.data ? db.data.stats : null;
            return Promise.all([
                Promise.resolve(cachedContentStats),
                global.QuestionBankIndex ? global.QuestionBankIndex.stats().catch(function () { return null; }) : Promise.resolve(null)
            ]).then(function (out) {
                return {
                    apiVersion: VERSION,
                    content: out[0],
                    questionBank: out[1],
                    storage: {
                        bookmarks: global.SiteBookmarks ? global.SiteBookmarks.list().length : 0,
                        history: global.SiteHistory ? global.SiteHistory.list().length : 0,
                        notes: global.SiteNotes ? global.SiteNotes.list().length : 0
                    },
                    modules: {
                        content: !!content(),
                        navigation: !!nav(),
                        actions: !!actions(),
                        events: !!events(),
                        stats: !!stats(),
                        bookmarks: !!global.SiteBookmarks,
                        reading: !!global.SiteReadingPosition,
                        search: !!global.SiteSearchAPI,
                        context: !!global.SiteContext,
                        quiz: !!global.SiteQuiz,
                        recommend: !!global.SiteRecommend,
                        data: !!global.SiteData
                    }
                };
            });
        },
        manifest: manifest,
        capabilities: capabilities,
        currentContext: currentContext
    };

    global.SiteAPI = api;
})(window);
