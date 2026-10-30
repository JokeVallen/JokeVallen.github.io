/**
 * source/js/site-bookmarks.js
 * 通用站内收藏（本地）
 */
(function (global) {
    'use strict';

    var KEY = 'site-bookmarks-v1';

    function load() {
        try {
            var rows = JSON.parse(localStorage.getItem(KEY) || '[]');
            return Array.isArray(rows) ? rows : [];
        } catch (e) { return []; }
    }

    function save(rows) {
        try { localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 200))); } catch (e) { /* ignore */ }
    }

    function itemId(item) {
        return String(item.type || 'page') + ':' + String(item.id || item.path || location.pathname);
    }

    function normalize(item) {
        item = item || {};
        return {
            id: item.id || item.path || location.pathname,
            type: item.type || 'page',
            title: item.title || document.title || '',
            path: item.path || location.pathname,
            at: item.at || new Date().toISOString()
        };
    }

    function list() { return load(); }

    function has(id) {
        return load().some(function (item) { return item.key === id || item.id === id; });
    }

    function add(item) {
        var row = normalize(item);
        row.key = itemId(row);
        var rows = load().filter(function (x) { return x.key !== row.key; });
        rows.unshift(row);
        save(rows);
        emit('bookmarks:add', row);
        return row;
    }

    function remove(id) {
        var rows = load();
        var next = rows.filter(function (row) { return row.key !== id && row.id !== id; });
        save(next);
        emit('bookmarks:remove', { id: id });
        return rows.length !== next.length;
    }

    function toggle(item) {
        var row = normalize(item);
        var key = itemId(row);
        if (has(key)) {
            remove(key);
            return { active: false, key: key };
        }
        add(row);
        return { active: true, key: key };
    }

    function emit(type, detail) {
        try { if (global.SiteEvents) global.SiteEvents.emit(type, detail); } catch (e) { /* ignore */ }
    }

    global.SiteBookmarks = {
        key: KEY,
        list: list,
        has: has,
        add: add,
        remove: remove,
        toggle: toggle
    };

    if (global.SiteActionAPI) {
        global.SiteActionAPI.register('bookmark.add', function (payload) {
            return global.SiteBookmarks.add(payload);
        }, { label: '添加收藏', scope: 'write-local', description: '收藏当前页面', requiresConfirmation: false });

        global.SiteActionAPI.register('bookmark.remove', function (payload) {
            return global.SiteBookmarks.remove(payload.key || payload.id || payload.path);
        }, { label: '移除收藏', scope: 'write-local', description: '移除本地收藏', requiresConfirmation: false });

        global.SiteActionAPI.register('bookmark.toggle', function (payload) {
            return global.SiteBookmarks.toggle(payload);
        }, { label: '切换收藏', scope: 'write-local', description: '切换当前页面收藏状态', requiresConfirmation: false });
    }
})(window);
