/**
 * source/js/site-recommend-api.js
 * 本地统计驱动的推荐与关联内容
 */
(function (global) {
    'use strict';

    function related(id) {
        if (!global.ContentDB || typeof global.ContentDB.getRelated !== 'function') return Promise.resolve([]);
        return global.ContentDB.getRelated(id).catch(function () { return []; });
    }

    function weakQuestions(limit) {
        limit = Math.max(1, Math.min(50, Number(limit) || 10));
        if (!global.StatsCenter) return Promise.resolve([]);
        var records = global.StatsCenter.list('exam-paper', { limit: 1000, order: 'asc' });
        var map = Object.create(null);
        records.forEach(function (record) {
            var wrong = record.detail && Array.isArray(record.detail.wrong) ? record.detail.wrong : [];
            wrong.forEach(function (w) {
                var key = w.questionId || w.stem;
                if (!key) return;
                if (!map[key]) map[key] = { questionId: w.questionId, stem: w.stem, count: 0 };
                map[key].count++;
            });
        });
        return Promise.resolve(Object.keys(map).map(function (k) { return map[k]; })
            .sort(function (a, b) { return b.count - a.count; })
            .slice(0, limit));
    }

    function nextQuestions(options) {
        options = options || {};
        var limit = Math.max(1, Math.min(30, Number(options.limit) || 5));
        if (!global.SiteContentAPI) return Promise.resolve([]);
        return global.SiteContentAPI.list('question', {
            paperId: options.paperId,
            type: 'single'
        }).then(function (rows) {
            rows = rows || [];
            return rows.sort(function () { return Math.random() - 0.5; }).slice(0, limit);
        });
    }

    global.SiteRecommend = {
        related: related,
        weakQuestions: weakQuestions,
        nextQuestions: nextQuestions
    };
})(window);
