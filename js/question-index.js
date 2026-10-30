/**
 * source/js/question-index.js
 * 题库索引只读查询层
 *
 * 索引由 scripts/question-bank-index.js 构建期生成：
 * /question-bank-index.json
 */
(function (global) {
    'use strict';

    var URL = '/question-bank-index.json';
    var state = { data: null, promise: null };

    function ensure() {
        if (state.data) return Promise.resolve(state.data);
        if (state.promise) return state.promise;
        state.promise = fetch(URL, { cache: 'no-cache' })
            .then(function (res) {
                if (!res.ok) throw new Error('question-bank-index: HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                state.data = data;
                return data;
            })
            .catch(function (err) {
                state.promise = null;
                throw err;
            });
        return state.promise;
    }

    function getPaper(id) {
        return ensure().then(function (data) {
            return data.papers && data.papers[id] ? data.papers[id] : null;
        });
    }

    function getQuestion(id) {
        return ensure().then(function (data) {
            return data.questions && data.questions[id] ? data.questions[id] : null;
        });
    }

    function listQuestions(filters) {
        filters = filters || {};
        return ensure().then(function (data) {
            return Object.keys(data.questions || {}).map(function (id) {
                return data.questions[id];
            }).filter(function (q) {
                if (filters.paperId && q.paperId !== filters.paperId) return false;
                if (filters.type && q.type !== filters.type) return false;
                if (filters.level) {
                    var paper = data.papers[q.paperId];
                    if (!paper || paper.level !== filters.level) return false;
                }
                if (filters.difficulty != null && String(q.difficulty) !== String(filters.difficulty)) return false;
                if (filters.tag) {
                    var tags = Array.isArray(q.tags) ? q.tags : [];
                    if (tags.indexOf(filters.tag) === -1) return false;
                }
                if (filters.search) {
                    var text = (q.stem + ' ' + (q.explanation || '')).toLowerCase();
                    if (text.indexOf(String(filters.search).toLowerCase()) === -1) return false;
                }
                return true;
            });
        });
    }

    function search(text, options) {
        options = options || {};
        var term = String(text || '').toLowerCase().trim();
        if (!term) return Promise.resolve([]);
        return ensure().then(function (data) {
            var out = [];
            Object.keys(data.questions || {}).forEach(function (id) {
                var q = data.questions[id];
                var score = 0;
                if (String(q.stem).toLowerCase().indexOf(term) !== -1) score += 5;
                if (String(q.explanation || '').toLowerCase().indexOf(term) !== -1) score += 1;
                if (Array.isArray(q.tags) && q.tags.join(' ').toLowerCase().indexOf(term) !== -1) score += 2;
                if (score > 0) out.push({ score: score, question: q });
            });
            out.sort(function (a, b) { return b.score - a.score; });
            return out.slice(0, Math.max(1, Number(options.limit) || 20));
        });
    }

    function stats() {
        return ensure().then(function (data) { return data.stats || null; });
    }

    var api = {
        url: URL,
        ensure: ensure,
        getPaper: getPaper,
        getQuestion: getQuestion,
        listQuestions: listQuestions,
        search: search,
        stats: stats
    };

    global.QuestionBankIndex = api;
    global.QuestionIndex = api;
})(window);
