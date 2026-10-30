/**
 * source/js/content-db.js
 * 全站内容数据库只读查询层
 *
 * 由 scripts/content-db.js 在构建期生成 /content-db.json。
 * 桌宠、站内搜索、模拟中心等统一通过这里查询，避免直接拼 SQL。
 */
(function (global) {
    'use strict';

    var DB_URL = '/content-db.json';
    var INDEX_URL = '/search-index.json';
    var VERSION_URL = '/content-db-version.json';
    var CACHE_NAME = 'site-content-db-v1';
    var state = {
        data: null,
        promise: null,
        error: null
    };
    var indexState = {
        data: null,
        promise: null
    };

    function fetchJson(url, cacheMode) {
        return fetch(url, { cache: cacheMode || 'default' }).then(function (res) {
            if (!res.ok) throw new Error(url + ': HTTP ' + res.status);
            return res.json();
        });
    }

    function fetchVersion() {
        return fetchJson(VERSION_URL, 'no-cache').catch(function () { return null; });
    }

    function decompressGzip(buffer) {
        if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('DecompressionStream 不可用'));
        var stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
        return new Response(stream).text();
    }

    function cacheMatch(key) {
        if (!global.caches) return Promise.resolve(null);
        return caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(key);
        }).then(function (res) {
            return res ? res.text() : null;
        }).catch(function () { return null; });
    }

    function cachePut(key, text) {
        if (!global.caches) return Promise.resolve();
        return caches.open(CACHE_NAME).then(function (cache) {
            return cache.put(key, new Response(text, { headers: { 'Content-Type': 'application/json' } }));
        }).catch(function () { /* ignore cache errors */ });
    }

    function loadAsset(kind, plainUrl, gzUrl) {
        return fetchVersion().then(function (meta) {
            var info = meta && meta.files && meta.files[kind];
            if (!info || !info.hash || typeof DecompressionStream === 'undefined') {
                throw new Error('gzip asset unavailable');
            }
            var key = gzUrl + '?v=' + info.hash;
            return cacheMatch(key).then(function (cached) {
                if (cached) return JSON.parse(cached);
                return fetch(gzUrl, { cache: 'force-cache' }).then(function (res) {
                    if (!res.ok) throw new Error(gzUrl + ': HTTP ' + res.status);
                    return res.arrayBuffer();
                }).then(decompressGzip).then(function (text) {
                    cachePut(key, text);
                    return JSON.parse(text);
                });
            });
        }).catch(function () {
            return fetchJson(plainUrl, kind === 'content' ? 'no-cache' : 'force-cache');
        });
    }

    function loadSearchIndex() {
        if (indexState.data) return Promise.resolve(indexState.data);
        if (indexState.promise) return indexState.promise;
        indexState.promise = loadAsset('search', INDEX_URL, '/search-index.json.gz')
            .then(function (json) {
                indexState.data = json;
                return json;
            })
            .catch(function () {
                indexState.promise = null;
                return null;
            });
        return indexState.promise;
    }

    function load() {
        if (state.data) return Promise.resolve(state.data);
        if (state.promise) return state.promise;
        state.promise = loadAsset('content', DB_URL, '/content-db.json.gz')
            .then(function (json) {
                state.data = json;
                return json;
            })
            .catch(function (err) {
                state.error = err;
                state.promise = null;
                throw err;
            });
        return state.promise;
    }

    function table(name) {
        return state.data && state.data.tables && state.data.tables[name]
            ? state.data.tables[name]
            : [];
    }

    function splitTerms(q) {
        var raw = String(q || '').toLowerCase()
            .replace(/[，。！？、,.!?：:；;（）()「」"']/g, ' ')
            .split(/\s+/)
            .filter(Boolean);
        var out = [];
        raw.forEach(function (seg) {
            if (/[\u4e00-\u9fa5]/.test(seg) && seg.length > 2) {
                for (var i = 0; i + 1 < seg.length; i++) out.push(seg.substr(i, 2));
                out.push(seg);
            } else if (seg.length >= 2) {
                out.push(seg);
            }
        });
        var seen = Object.create(null);
        return out.filter(function (x) {
            if (!x || seen[x]) return false;
            seen[x] = 1;
            return true;
        }).slice(0, 12);
    }

    function scoreText(text, terms) {
        var s = String(text || '').toLowerCase();
        var score = 0;
        terms.forEach(function (t) {
            if (s.indexOf(t) >= 0) score += 1;
        });
        return score;
    }

    function fullSearchContent(query, opts) {
        opts = opts || {};
        var terms = splitTerms(query);
        if (!terms.length) return Promise.resolve([]);
        var limit = Math.max(1, Math.min(50, Number(opts.limit) || 10));
        var wanted = opts.types || null;

        return load().then(function () {
            var results = [];
            function add(type, id, title, path, text, extra, meta) {
                if (wanted && wanted.indexOf(type) === -1) return;
                var score = scoreText(title, terms) * 8 + scoreText(extra, terms) * 3 + scoreText(text, terms);
                if (score <= 0) return;
                var row = {
                    type: type,
                    id: id,
                    title: title,
                    path: path || '',
                    score: score,
                    snippet: String(text || '').replace(/\s+/g, ' ').slice(0, 160),
                    extra: extra || ''
                };
                if (meta) Object.keys(meta).forEach(function (k) { row[k] = meta[k]; });
                results.push(row);
            }

            table('documents').forEach(function (doc) {
                add(doc.type, doc.id, doc.title, doc.path, doc.content_text,
                    [doc.tags.join(' '), doc.categories.join(' '), doc.summary].join(' '));
            });

            table('questions').forEach(function (q) {
                add('question', q.id, String(q.stem).slice(0, 80), '/questions/',
                    q.stem + ' ' + (q.explanation || ''),
                    [q.type, q.tags.join(' ')].join(' '),
                    { paperId: q.paper_id || '', questionId: q.id || '' });
            });

            table('algorithms').forEach(function (a) {
                add('algorithm', a.id, a.title, '/algorithm/',
                    a.trigger + ' ' + a.insight + ' ' + a.template,
                    a.pattern || '');
            });

            table('mock_quiz').forEach(function (q) {
                add('mock_quiz', q.id, String(q.stem).slice(0, 80), '/mock/',
                    q.stem + ' ' + (q.explanation || ''),
                    q.category || '');
            });

            table('interview_questions').forEach(function (q) {
                add('interview', q.id, String(q.question).slice(0, 80), '/mock/',
                    q.question + ' ' + (q.points || []).join(' '),
                    q.category || '');
            });

            results.sort(function (a, b) { return b.score - a.score; });
            return results.slice(0, limit);
        });
    }

    function searchContent(query, opts) {
        opts = opts || {};
        var terms = splitTerms(query);
        if (!terms.length) return Promise.resolve([]);
        var limit = Math.max(1, Math.min(50, Number(opts.limit) || 10));
        var wanted = opts.types || null;

        return loadSearchIndex().then(function (index) {
            if (!index || !Array.isArray(index.items)) return fullSearchContent(query, opts);
            var results = [];
            index.items.forEach(function (item) {
                if (wanted && wanted.indexOf(item.type) === -1) return;
                var score = scoreText(item.title, terms) * 8 +
                    scoreText(item.extra, terms) * 3 +
                    scoreText(item.text, terms);
                if (score <= 0) return;
                var row = {
                    type: item.type,
                    id: item.id,
                    title: item.title,
                    path: item.path || '',
                    score: score,
                    snippet: String(item.text || '').replace(/\s+/g, ' ').slice(0, 160),
                    extra: item.extra || ''
                };
                if (item.paperId) row.paperId = item.paperId;
                if (item.questionId) row.questionId = item.questionId;
                results.push(row);
            });
            results.sort(function (a, b) { return b.score - a.score; });
            return results.slice(0, limit);
        }).catch(function () {
            return fullSearchContent(query, opts);
        });
    }

    function select(tableName, options) {
        options = options || {};
        return load().then(function () {
            var rows = table(tableName).slice();
            var where = options.where;
            if (where) {
                rows = rows.filter(function (row) {
                    if (typeof where === 'function') return !!where(row);
                    return Object.keys(where).every(function (key) {
                        return row[key] === where[key];
                    });
                });
            }
            if (options.orderBy) {
                var desc = String(options.order || 'asc').toLowerCase() === 'desc';
                rows.sort(function (a, b) {
                    var av = a[options.orderBy];
                    var bv = b[options.orderBy];
                    if (av === bv) return 0;
                    return (av > bv ? 1 : -1) * (desc ? -1 : 1);
                });
            }
            var offset = Math.max(0, Number(options.offset) || 0);
            var limit = options.limit == null ? rows.length : Math.max(0, Number(options.limit) || 0);
            return rows.slice(offset, offset + limit);
        });
    }

    function findOne(tableName, predicate) {
        return load().then(function () {
            return table(tableName).find(predicate) || null;
        });
    }

    function getDocument(id) {
        return load().then(function () {
            return table('documents').find(function (d) { return d.id === id; }) || null;
        });
    }

    function getChunks(documentId) {
        return load().then(function () {
            return table('chunks').filter(function (c) { return c.document_id === documentId; });
        });
    }

    function getRelated(id) {
        return load().then(function () {
            var links = table('links');
            return links.filter(function (l) { return l.from_id === id || l.to_id === id; });
        });
    }

    function listQuestions(filters) {
        filters = filters || {};
        return load().then(function () {
            return table('questions').filter(function (q) {
                if (filters.paper_id && q.paper_id !== filters.paper_id) return false;
                if (filters.type && q.type !== filters.type) return false;
                if (filters.topic && String(q.paper_id).indexOf(filters.topic) === -1) return false;
                if (filters.difficulty != null && Number(q.difficulty) !== Number(filters.difficulty)) return false;
                return true;
            });
        });
    }

    function getQuestion(id) {
        return load().then(function () {
            return table('questions').find(function (q) { return q.id === id; }) || null;
        });
    }

    function randomQuestions(filters, count) {
        return listQuestions(filters).then(function (list) {
            var arr = list.slice();
            for (var i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
            }
            return arr.slice(0, Math.max(1, Number(count) || 10));
        });
    }

    function getPaper(id) {
        return load().then(function () {
            return table('papers').find(function (p) { return p.id === id; }) || null;
        });
    }

    function getPaperQuestions(paperId) {
        return load().then(function () {
            var map = Object.create(null);
            table('questions').forEach(function (q) { map[q.id] = q; });
            return table('paper_questions')
                .filter(function (pq) { return pq.paper_id === paperId; })
                .sort(function (a, b) { return a.position - b.position; })
                .map(function (pq) { return map[pq.question_id]; })
                .filter(Boolean);
        });
    }

    function getKnowledgeCard(id) {
        return load().then(function () {
            var key = id.indexOf('card:') === 0 ? id : 'card:' + id;
            return table('knowledge_cards').find(function (c) { return c.id === key; }) || null;
        });
    }

    function getAlgorithm(id) {
        return load().then(function () {
            return table('algorithms').find(function (a) { return a.id === id; }) || null;
        });
    }

    function getMockQuiz(id) {
        return load().then(function () {
            return table('mock_quiz').find(function (q) { return q.id === id; }) || null;
        });
    }

    var api = {
        url: DB_URL,
        ensure: load,
        get data() { return state.data; },
        get stats() { return state.data ? state.data.stats : null; },
        table: table,
        select: select,
        query: select,
        findOne: findOne,
        searchContent: searchContent,
        getDocument: getDocument,
        getChunks: getChunks,
        getRelated: getRelated,
        listQuestions: listQuestions,
        getQuestion: getQuestion,
        randomQuestions: randomQuestions,
        getPaper: getPaper,
        getPaperQuestions: getPaperQuestions,
        getKnowledgeCard: getKnowledgeCard,
        getAlgorithm: getAlgorithm,
        getMockQuiz: getMockQuiz
    };

    global.ContentDB = api;
    global.contentDB = api;
})(window);
