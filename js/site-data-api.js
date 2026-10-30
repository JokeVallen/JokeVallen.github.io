/**
 * source/js/site-data-api.js
 * 本地用户数据导出/导入/清理
 *
 * 只允许操作明确白名单内的站点 key。
 */
(function (global) {
    'use strict';

    var VERSION = 1;
    var ALLOW_KEYS = [
        'site-bookmarks-v1',
        'site-reading-position-v1',
        'site-history-v1',
        'site-notes-v1',
        'hexo-stats-center-v1',
        'algo-review-v1',
        'mock-center-v1',
        'hexo-exam-stats-v1'
    ];

    function allowed(key) {
        return ALLOW_KEYS.indexOf(key) !== -1;
    }

    function exportJSON() {
        var data = {};
        ALLOW_KEYS.forEach(function (key) {
            var raw = localStorage.getItem(key);
            if (raw != null) data[key] = raw;
        });
        return {
            version: VERSION,
            exportedAt: new Date().toISOString(),
            data: data
        };
    }

    function importJSON(input) {
        var payload = typeof input === 'string' ? JSON.parse(input) : input;
        if (!payload || payload.version !== VERSION || !payload.data || typeof payload.data !== 'object') {
            throw new Error('不支持的数据格式');
        }
        var count = 0;
        Object.keys(payload.data).forEach(function (key) {
            if (!allowed(key)) return;
            localStorage.setItem(key, String(payload.data[key]));
            count++;
        });
        try { if (global.SiteEvents) global.SiteEvents.emit('data:import', { count: count }); } catch (e) { /* ignore */ }
        return count;
    }

    function clearAll() {
        ALLOW_KEYS.forEach(function (key) { localStorage.removeItem(key); });
        try { if (global.SiteEvents) global.SiteEvents.emit('data:clear', {}); } catch (e) { /* ignore */ }
        return true;
    }

    function download(filename) {
        var blob = new Blob([JSON.stringify(exportJSON(), null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename || ('site-data-' + new Date().toISOString().slice(0, 10) + '.json');
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        return true;
    }

    global.SiteData = {
        version: VERSION,
        keys: ALLOW_KEYS.slice(),
        exportJSON: exportJSON,
        importJSON: importJSON,
        clearAll: clearAll,
        download: download
    };

    if (global.SiteActionAPI) {
        global.SiteActionAPI.register('data.export', function () {
            return global.SiteData.exportJSON();
        }, { label: '导出本地数据', scope: 'read-local', description: '导出收藏、笔记、历史与统计', requiresConfirmation: false });

        global.SiteActionAPI.register('data.import', function (payload) {
            return global.SiteData.importJSON(payload.data || payload);
        }, { label: '导入本地数据', scope: 'write-local', description: '导入备份数据', requiresConfirmation: true });

        global.SiteActionAPI.register('data.clear', function () {
            return global.SiteData.clearAll();
        }, { label: '清空本地数据', scope: 'write-local', description: '清空站点白名单内的本地数据', requiresConfirmation: true });
    }
})(window);
