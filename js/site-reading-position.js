/**
 * source/js/site-reading-position.js
 * 通用阅读位置记录（本地）
 */
(function (global) {
    'use strict';

    var KEY = 'site-reading-position-v1';
    var timer = null;
    var started = false;

    function load() {
        try {
            var map = JSON.parse(localStorage.getItem(KEY) || '{}');
            return map && typeof map === 'object' ? map : {};
        } catch (e) { return {}; }
    }

    function saveMap(map) {
        try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) { /* ignore */ }
    }

    function key(path) {
        return path || location.pathname;
    }

    function get(path) {
        return load()[key(path)] || null;
    }

    function save(path) {
        var doc = document.documentElement;
        var max = Math.max(1, doc.scrollHeight - window.innerHeight);
        var row = {
            path: key(path),
            scrollY: Math.max(0, window.scrollY || doc.scrollTop || 0),
            ratio: Math.min(1, Math.max(0, (window.scrollY || doc.scrollTop || 0) / max)),
            title: document.title || '',
            at: new Date().toISOString()
        };
        var map = load();
        map[row.path] = row;
        saveMap(map);
        return row;
    }

    function restore(path) {
        var row = get(path);
        if (!row) return false;
        var target = row.scrollY || Math.round((document.documentElement.scrollHeight - window.innerHeight) * row.ratio);
        window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
        return true;
    }

    function clear(path) {
        var map = load();
        if (path) delete map[key(path)];
        else map = {};
        saveMap(map);
        return true;
    }

    function start() {
        if (started) return;
        started = true;
        window.addEventListener('scroll', function () {
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () {
                timer = null;
                save();
                try { if (global.SiteEvents) global.SiteEvents.emit('reading:position', get()); } catch (e) { /* ignore */ }
            }, 1200);
        }, { passive: true });
    }

    global.SiteReadingPosition = {
        key: KEY,
        get: get,
        save: save,
        restore: restore,
        clear: clear,
        start: start
    };

    if (global.SiteActionAPI) {
        global.SiteActionAPI.register('reading.save', function (payload) {
            return global.SiteReadingPosition.save(payload.path);
        }, { label: '保存阅读位置', scope: 'write-local', description: '记录当前页面滚动位置', requiresConfirmation: false });

        global.SiteActionAPI.register('reading.restore', function (payload) {
            return global.SiteReadingPosition.restore(payload.path);
        }, { label: '恢复阅读位置', scope: 'read-local', description: '恢复到上次阅读位置', requiresConfirmation: false });

        global.SiteActionAPI.register('reading.clear', function (payload) {
            return global.SiteReadingPosition.clear(payload.path);
        }, { label: '清除阅读位置', scope: 'write-local', description: '清除当前页面阅读位置', requiresConfirmation: false });
    }
})(window);
