/**
 * source/js/site-content-api.js
 * 站内统一内容访问门面
 *
 * 桌宠、站内搜索、未来其他模块只依赖 SiteContentAPI。
 * 内部可以继续使用 ContentDB / QuestionBankIndex / ContentDBSQL。
 */
(function (global) {
    'use strict';

    function content() { return global.ContentDB || null; }
    function questionIndex() { return global.QuestionBankIndex || null; }

    function normalize(type, item, source) {
        if (!item) return null;
        if (type === 'question') {
            return {
                type: 'question',
                id: item.id,
                title: String(item.stem || '').slice(0, 80),
                summary: item.explanation || '',
                path: '/questions/',
                paperId: item.paperId || item.paper_id || '',
                data: item,
                source: source || 'question-index'
            };
        }
        if (type === 'paper') {
            return {
                type: 'paper',
                id: item.id,
                title: item.title || item.id,
                summary: item.description || '',
                path: '/questions/',
                data: item,
                source: source || 'content-db'
            };
        }
        if (type === 'document' || type === 'post' || type === 'page' || type === 'knowledge') {
            return {
                type: item.type || type,
                id: item.id,
                title: item.title || '',
                summary: item.summary || '',
                path: item.path || '',
                data: item,
                source: source || 'content-db'
            };
        }
        return {
            type: type,
            id: item.id || '',
            title: item.title || item.stem || item.question || '',
            summary: item.explanation || item.insight || '',
            path: '',
            data: item,
            source: source || 'content-db'
        };
    }

    function ready() {
        return Promise.all([
            content() ? content().ensure() : Promise.resolve(null),
            questionIndex() ? questionIndex().ensure() : Promise.resolve(null)
        ]).then(function () { return true; });
    }

    function searchAll(query, options) {
        options = options || {};
        var limit = Math.max(1, Math.min(50, Number(options.limit) || 10));
        var tasks = [];
        if (content() && typeof content().searchContent === 'function') {
            tasks.push(content().searchContent(query, { limit: limit, types: options.types }).catch(function () { return []; }));
        }
        if (questionIndex() && typeof questionIndex().search === 'function') {
            tasks.push(questionIndex().search(query, { limit: limit }).then(function (rows) {
                return rows.map(function (r) {
                    return {
                        type: 'question',
                        id: r.question.id,
                        title: String(r.question.stem || '').slice(0, 80),
                        path: '/questions/',
                        paperId: r.question.paperId || r.question.paper_id || '',
                        questionId: r.question.localId || r.question.id || '',
                        snippet: String(r.question.explanation || '').slice(0, 160),
                        score: r.score,
                        raw: r.question
                    };
                });
            }).catch(function () { return []; }));
        }
        return Promise.all(tasks).then(function (groups) {
            var map = Object.create(null);
            groups.forEach(function (rows) {
                (rows || []).forEach(function (row) {
                    var key = row.type + ':' + row.id;
                    if (!map[key] || (row.score || 0) > (map[key].score || 0)) map[key] = row;
                });
            });
            return Object.keys(map).map(function (k) { return map[k]; })
                .sort(function (a, b) { return (b.score || 0) - (a.score || 0); })
                .slice(0, limit);
        });
    }

    function get(type, id) {
        type = String(type || '').toLowerCase();
        if (!id) return Promise.resolve(null);

        if (type === 'question') {
            if (questionIndex()) {
                return questionIndex().getQuestion(id).then(function (q) {
                    if (q) return normalize('question', q, 'question-index');
                    if (content()) return content().getQuestion(id).then(function (fallback) { return normalize('question', fallback); });
                    return null;
                });
            }
            if (content()) return content().getQuestion(id).then(function (q) { return normalize('question', q); });
            return Promise.resolve(null);
        }
        if (type === 'paper') {
            return content().getPaper(id).then(function (p) { return normalize('paper', p); });
        }
        if (type === 'knowledge-card' || type === 'knowledge_card' || type === 'knowledge') {
            return content().getKnowledgeCard(id).then(function (c) { return normalize('knowledge', c); });
        }
        if (type === 'document' || type === 'post' || type === 'page') {
            return content().getDocument(id).then(function (d) { return normalize(type, d); });
        }
        if (type === 'algorithm') {
            return content().getAlgorithm(id).then(function (a) { return normalize('algorithm', a); });
        }
        if (type === 'mock-quiz' || type === 'mock_quiz') {
            return content().getMockQuiz(id).then(function (q) { return normalize('mock_quiz', q); });
        }
        return Promise.resolve(null);
    }

    function list(type, filters) {
        type = String(type || '').toLowerCase();
        filters = filters || {};
        if (type === 'question') {
            if (questionIndex()) return questionIndex().listQuestions(filters);
            return content().listQuestions(filters);
        }
        if (type === 'paper') return content().select('papers', { where: filters.where, limit: filters.limit || 100 });
        if (type === 'document') return content().select('documents', { where: filters.where, limit: filters.limit || 100 });
        if (type === 'knowledge') return content().select('knowledge_cards', { where: filters.where, limit: filters.limit || 100 });
        if (type === 'algorithm') return content().select('algorithms', { where: filters.where, limit: filters.limit || 100 });
        if (type === 'mock-quiz' || type === 'mock_quiz') return content().select('mock_quiz', { where: filters.where, limit: filters.limit || 100 });
        return Promise.resolve([]);
    }

    function getPaperBundle(paperId) {
        return Promise.all([
            get('paper', paperId),
            list('question', { paperId: paperId })
        ]).then(function (out) {
            return {
                paper: out[0] ? out[0].data : null,
                questions: out[1] || []
            };
        });
    }

    function stats() {
        return Promise.all([
            content() ? content().ensure().then(function (d) { return d.stats || null; }) : Promise.resolve(null),
            questionIndex() ? questionIndex().stats() : Promise.resolve(null)
        ]).then(function (out) {
            return {
                content: out[0],
                questionBank: out[1],
                statsCenter: global.StatsCenter ? { available: true } : null
            };
        });
    }

    var api = {
        ready: ready,
        search: searchAll,
        searchAll: searchAll,
        get: get,
        list: list,
        getPaperBundle: getPaperBundle,
        stats: stats,
        content: content,
        questionIndex: questionIndex,
        statsCenter: function () { return global.StatsCenter || null; }
    };

    global.SiteContentAPI = api;
    global.SiteContent = api;
})(window);
