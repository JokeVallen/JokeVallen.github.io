/**
 * source/js/site-history.js
 * 本地浏览历史（只记录站内页面）
 */
(function (global) {
    'use strict';

    var KEY = 'site-history-v1';

    function load() {
        try {
            var rows = JSON.parse(localStorage.getItem(KEY) || '[]');
            return Array.isArray(rows) ? rows : [];
        } catch (e) { return []; }
    }

    function save(rows) {
        try { localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 100))); } catch (e) { /* ignore */ }
    }

    function current() {
        var ctx = global.SiteContext ? global.SiteContext.get() : null;
        return {
            path: location.pathname,
            title: document.title || '',
            type: ctx ? ctx.type : 'page',
            id: ctx ? ctx.id : location.pathname,
            at: new Date().toISOString()
        };
    }

    function list(limit) {
        var rows = load();
        return limit ? rows.slice(0, Math.max(0, Number(limit) || 0)) : rows;
    }

    function add(item) {
        var row = item || current();
        var rows = load().filter(function (x) { return x.path !== row.path; });
        rows.unshift(row);
        save(rows);
        try { if (global.SiteEvents) global.SiteEvents.emit('history:add', row); } catch (e) { /* ignore */ }
        return row;
    }

    function clear() {
        save([]);
        try { if (global.SiteEvents) global.SiteEvents.emit('history:clear', {}); } catch (e) { /* ignore */ }
        return true;
    }

    function remove(path) {
        var rows = load();
        var next = rows.filter(function (x) { return x.path !== path; });
        save(next);
        return rows.length !== next.length;
    }

    global.SiteHistory = {
        key: KEY,
        list: list,
        add: add,
        clear: clear,
        remove: remove,
        current: current
    };

    if (global.SiteActionAPI) {
        global.SiteActionAPI.register('history.clear', function () {
            return global.SiteHistory.clear();
        }, { label: '清空浏览历史', scope: 'write-local', description: '清空本地浏览历史', requiresConfirmation: true });
    }

    function track() {
        if (document.readyState === 'loading') return;
        add(current());
    }

    document.addEventListener('DOMContentLoaded', track);
    document.addEventListener('pjax:complete', track);
    track();
})(window);
