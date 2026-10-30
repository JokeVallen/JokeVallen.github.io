/**
 * source/js/stats-center.js
 * 通用统计中心
 *
 * 职责：
 * - 统一存储命名空间
 * - 记录/查询/清空/展示
 * - 提供稳定 API
 *
 * 各业务模块负责提供：
 * - 自己的记录数据
 * - 可选的 renderRecord 渲染函数
 */
(function (global) {
    'use strict';

    var KEY = 'hexo-stats-center-v1';
    var VERSION = 1;
    var registry = Object.create(null);
    var listeners = [];

    function emptyStore() {
        return { version: VERSION, modules: {} };
    }

    function load() {
        try {
            var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (!raw || raw.version !== VERSION || typeof raw.modules !== 'object') return emptyStore();
            return raw;
        } catch (e) {
            return emptyStore();
        }
    }

    function save(store) {
        try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
    }

    function ensureModule(store, moduleId) {
        if (!store.modules[moduleId]) {
            store.modules[moduleId] = {
                label: (registry[moduleId] && registry[moduleId].label) || moduleId,
                records: []
            };
        }
        return store.modules[moduleId];
    }

    function register(config) {
        if (!config || !config.id) throw new Error('StatsCenter.register 需要 id');
        registry[config.id] = {
            id: config.id,
            label: config.label || config.id,
            description: config.description || '',
            renderRecord: typeof config.renderRecord === 'function' ? config.renderRecord : null,
            maxRecords: Math.max(1, Number(config.maxRecords) || 100)
        };
        var store = load();
        ensureModule(store, config.id);
        if (store.modules[config.id]) store.modules[config.id].label = registry[config.id].label;
        save(store);
        return registry[config.id];
    }

    function add(moduleId, record, options) {
        options = options || {};
        if (!record || typeof record !== 'object') throw new Error('StatsCenter.add 需要记录对象');
        var store = load();
        var mod = ensureModule(store, moduleId);
        var entry = {};
        Object.keys(record).forEach(function (k) { entry[k] = record[k]; });
        entry.at = entry.at || new Date().toISOString();
        entry.id = entry.id || ('r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7));
        mod.records.push(entry);
        var cap = options.maxRecords || (registry[moduleId] && registry[moduleId].maxRecords) || 100;
        if (mod.records.length > cap) mod.records = mod.records.slice(-cap);
        save(store);
        emit(moduleId, entry);
        return entry;
    }

    function list(moduleId, options) {
        options = options || {};
        var mod = load().modules[moduleId];
        if (!mod) return [];
        var rows = mod.records.slice();
        if (typeof options.filter === 'function') rows = rows.filter(options.filter);
        if (options.order === 'asc') {
            // records are already chronological
        } else {
            rows.reverse();
        }
        if (options.limit) rows = rows.slice(0, Math.max(0, Number(options.limit) || 0));
        return rows;
    }

    function summary(moduleId, options) {
        options = options || {};
        var rows = list(moduleId, { filter: options.filter, order: 'asc' });
        var metrics = rows.map(function (r) { return r.metrics || {}; }).filter(function (m) { return m && typeof m === 'object'; });
        var result = { count: rows.length };
        if (!metrics.length) return result;
        result.averageRate = Math.round(metrics.reduce(function (n, m) { return n + (Number(m.rate) || 0); }, 0) / metrics.length);
        result.totalDurationSec = metrics.reduce(function (n, m) { return n + (Number(m.durationSec) || 0); }, 0);
        result.bestRate = Math.max.apply(null, metrics.map(function (m) { return Number(m.rate) || 0; }));
        return result;
    }

    function modules() {
        var store = load();
        return Object.keys(store.modules).map(function (id) {
            return {
                id: id,
                label: store.modules[id].label || id,
                count: store.modules[id].records.length
            };
        });
    }

    function getModule(moduleId) {
        var mod = load().modules[moduleId];
        return mod ? { label: mod.label, records: mod.records.slice() } : { label: moduleId, records: [] };
    }

    function clear(moduleId) {
        var store = load();
        if (moduleId) delete store.modules[moduleId];
        else store = emptyStore();
        save(store);
    }

    function clearWhere(moduleId, predicate) {
        var store = load();
        var mod = store.modules[moduleId];
        if (!mod) return;
        mod.records = mod.records.filter(function (r) { return !predicate(r); });
        save(store);
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function formatDate(iso) {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        function p(n) { return n < 10 ? '0' + n : '' + n; }
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
            ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }

    function formatDuration(sec) {
        sec = Math.max(0, Math.round(Number(sec) || 0));
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return (m > 0 ? m + ' 分 ' : '') + s + ' 秒';
    }

    function defaultRecordHtml(record) {
        var metrics = record.metrics || {};
        var pieces = [];
        if (metrics.score != null && metrics.total != null) pieces.push(metrics.score + '/' + metrics.total);
        if (metrics.rate != null) pieces.push(metrics.rate + '%');
        if (metrics.durationSec) pieces.push('用时 ' + formatDuration(metrics.durationSec));
        return '<div class="stats-record">' +
            '<div class="stats-record-top"><span>' + escapeHtml(formatDate(record.at)) + '</span>' +
            (record.title ? '<strong>' + escapeHtml(record.title) + '</strong>' : '') + '</div>' +
            (pieces.length ? '<div class="stats-record-metrics">' + escapeHtml(pieces.join(' · ')) + '</div>' : '') +
            '</div>';
    }

    function recordHtml(moduleId, record) {
        var conf = registry[moduleId];
        if (conf && conf.renderRecord) {
            try { return conf.renderRecord(record, { escapeHtml: escapeHtml, formatDate: formatDate, formatDuration: formatDuration }); }
            catch (e) { /* fall through */ }
        }
        return defaultRecordHtml(record);
    }

    function render(moduleId, container, options) {
        if (!container) return;
        options = options || {};
        var rows = list(moduleId, options);
        if (!rows.length) {
            container.innerHTML = options.emptyText || '暂无记录。';
            return;
        }
        container.innerHTML = rows.map(function (r) { return recordHtml(moduleId, r); }).join('');
    }

    function renderAll(container) {
        if (!container) return;
        var store = load();
        var ids = Object.keys(store.modules);
        if (!ids.length) {
            container.innerHTML = '暂无统计数据。';
            return;
        }
        container.innerHTML = ids.map(function (id) {
            var conf = registry[id] || { label: store.modules[id].label || id };
            return '<section class="stats-module" data-module="' + escapeHtml(id) + '">' +
                '<h3>' + escapeHtml(conf.label) + '</h3>' +
                '<div class="stats-module-body" data-stats-module="' + escapeHtml(id) + '"></div>' +
                '</section>';
        }).join('');
        ids.forEach(function (id) {
            var body = container.querySelector('[data-stats-module="' + id + '"]');
            render(id, body, { limit: 10 });
        });
    }

    function emit(moduleId, record) {
        listeners.forEach(function (fn) {
            try { fn(moduleId, record); } catch (e) { /* ignore */ }
        });
        try {
            document.dispatchEvent(new CustomEvent('stats-center:updated', { detail: { moduleId: moduleId, record: record } }));
        } catch (e) { /* ignore */ }
    }

    function onChange(fn) {
        if (typeof fn === 'function') listeners.push(fn);
    }

    global.StatsCenter = {
        register: register,
        add: add,
        list: list,
        summary: summary,
        modules: modules,
        getModule: getModule,
        clear: clear,
        clearWhere: clearWhere,
        render: render,
        renderAll: renderAll,
        onChange: onChange,
        formatDate: formatDate,
        formatDuration: formatDuration,
        escapeHtml: escapeHtml,
        key: KEY
    };
})(window);
