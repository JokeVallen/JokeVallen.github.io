/**
 * source/js/site-search-api.js
 * 通用站内搜索建议
 */
(function (global) {
    'use strict';

    function suggest(query, options) {
        options = options || {};
        var limit = Math.max(1, Math.min(20, Number(options.limit) || 8));
        if (!global.SiteContentAPI) return Promise.resolve([]);
        return global.SiteContentAPI.search(query, {
            limit: limit,
            types: options.types
        }).then(function (rows) {
            return (rows || []).map(function (row) {
                return {
                    label: row.title || row.id,
                    type: row.type,
                    id: row.id,
                    path: row.path || '',
                    snippet: row.snippet || ''
                };
            });
        });
    }

    function open(query, options) {
        return suggest(query, options).then(function (rows) {
            if (!rows.length) return false;
            if (!global.SiteNavigationAPI) return false;
            return global.SiteNavigationAPI.open(rows[0].path);
        });
    }

    global.SiteSearchAPI = {
        suggest: suggest,
        open: open
    };

    if (global.SiteActionAPI) {
        global.SiteActionAPI.register('search.suggest', function (payload) {
            return global.SiteSearchAPI.suggest(payload.query, payload);
        }, { label: '搜索建议', scope: 'read', description: '返回轻量搜索建议', requiresConfirmation: false });
    }
})(window);
