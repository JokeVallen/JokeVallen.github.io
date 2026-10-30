/**
 * source/js/site-notes.js
 * 本地内容笔记
 */
(function (global) {
    'use strict';

    var KEY = 'site-notes-v1';

    function load() {
        try {
            var map = JSON.parse(localStorage.getItem(KEY) || '{}');
            return map && typeof map === 'object' ? map : {};
        } catch (e) { return {}; }
    }

    function save(map) {
        try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) { /* ignore */ }
    }

    function keyOf(key) {
        if (!key) {
            var ctx = global.SiteContext ? global.SiteContext.get() : null;
            key = ctx ? (ctx.type + ':' + ctx.id) : location.pathname;
        }
        return String(key);
    }

    function get(key) {
        return load()[keyOf(key)] || null;
    }

    function set(key, content) {
        var map = load();
        map[keyOf(key)] = {
            key: keyOf(key),
            content: String(content || ''),
            at: new Date().toISOString()
        };
        save(map);
        try { if (global.SiteEvents) global.SiteEvents.emit('notes:save', map[keyOf(key)]); } catch (e) { /* ignore */ }
        return map[keyOf(key)];
    }

    function remove(key) {
        var map = load();
        var k = keyOf(key);
        delete map[k];
        save(map);
        return true;
    }

    function list() {
        var map = load();
        return Object.keys(map).map(function (k) { return map[k]; });
    }

    global.SiteNotes = {
        key: KEY,
        get: get,
        set: set,
        remove: remove,
        list: list
    };

    if (global.SiteActionAPI) {
        global.SiteActionAPI.register('note.save', function (payload) {
            return global.SiteNotes.set(payload.key, payload.content);
        }, { label: '保存笔记', scope: 'write-local', description: '保存当前内容笔记', requiresConfirmation: false });

        global.SiteActionAPI.register('note.remove', function (payload) {
            return global.SiteNotes.remove(payload.key);
        }, { label: '删除笔记', scope: 'write-local', description: '删除当前内容笔记', requiresConfirmation: true });
    }
})(window);
