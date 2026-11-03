/**
 * source/js/stats-center-page.js
 * /stats/ 统计中心页面渲染
 *
 * 修复要点：
 * - 模块列表以「实际有记录的模块」为准，未注册/空模块不再出现在筛选器里
 * - 模块筛选 / 时间范围切换只改 state 并重渲染，保留当前筛选值
 * - 正确率趋势按记录顺序横向滚动，最早的在左、最新在最右，并自动滚到最新
 * - 无数据状态覆盖：整页、单模块、单图表三种层级
 * - 每个模块可单独清空（带确认），清空后同步刷新指标卡与图表
 * - 深色主题与移动端由 stats-center.css 的 [data-theme="dark"] 与断点处理
 */
(function () {
    'use strict';

    var DEFAULT_RANGE = '30';
    var TREND_LIMIT = 24;
    var ACTIVITY_DAYS = 14;
    var PASS_RATE = 60;

    var state = { module: 'all', range: DEFAULT_RANGE };

    var el = null;          // #stats-center-app
    var boundTo = null;     // 事件已绑定的容器节点（PJAX 换 DOM 后需重新绑定）
    var cssLoaded = false;   // 样式表是否已注入

    /* ---------------- 样式自举 ---------------- */

    /**
     * /stats/ 页面的 <link> 由统配注入列表决定，当前 _config.butterfly.yml
     * 还没有 stats-center.css。为避免统计页无样式，这里按需自行注入一次；
     * 若统配后续在 head 里全局注入了，检测到就跳过，不会重复加载。
     * 只影响 /stats/，不改动全局主题。
     */
    function ensureStyles() {
        if (cssLoaded) return;
        cssLoaded = true;
        if (document.querySelector('link[href*="stats-center.css"]')) return;
        var head = document.head || document.getElementsByTagName('head')[0];
        if (!head) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/stats-center.css';
        link.setAttribute('data-stats-center-css', '1');
        head.appendChild(link);
    }


    /* ---------------- 基础工具 ---------------- */

    function esc(s) {
        return window.StatsCenter ? StatsCenter.escapeHtml(s) : String(s == null ? '' : s);
    }

    function startOfDay(date) {
        var d = new Date(date.getTime());
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function addDays(date, n) {
        var d = new Date(date.getTime());
        d.setDate(d.getDate() + n);
        return d;
    }

    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function dayKey(value) {
        var d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return '';
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function rateOf(record) {
        var m = record && record.metrics;
        if (!m || m.rate == null || m.rate === '') return null;
        var n = Number(m.rate);
        return isNaN(n) ? null : Math.max(0, Math.min(100, n));
    }

    function durationOf(record) {
        return Number(record && record.metrics && record.metrics.durationSec) || 0;
    }

    function wrongCountOf(record) {
        var m = record && record.metrics;
        if (!m) return 0;
        var w = m.wrongCount != null ? m.wrongCount : m.wrong;
        if (Array.isArray(w)) return w.length;
        var n = Number(w);
        if (!isNaN(n)) return n;
        var detail = record.detail;
        if (detail && Array.isArray(detail.wrong)) return detail.wrong.length;
        return 0;
    }

    /* ---------------- 数据选择 ---------------- */

    /** 有记录的模块（筛选器只列这些） */
    function activeModules() {
        return StatsCenter.modules().filter(function (m) { return m.count > 0; });
    }

    /** 当前时间范围起点；all 返回 null */
    function rangeStart() {
        if (state.range === 'all') return null;
        var days = Number(state.range) || Number(DEFAULT_RANGE);
        return startOfDay(new Date(Date.now() - (days - 1) * 86400000));
    }

    function inRange(record, start) {
        if (!start) return true;
        var t = new Date(record.at).getTime();
        return !isNaN(t) && t >= start.getTime();
    }

    /** 某模块在范围内、按时间升序的记录 */
    function rowsFor(moduleId) {
        var start = rangeStart();
        return StatsCenter.list(moduleId, { order: 'asc' }).filter(function (r) {
            return inRange(r, start);
        });
    }

    /** 全站范围内升序记录，附带 __module */
    function allRows() {
        var rows = [];
        activeModules().forEach(function (m) {
            rowsFor(m.id).forEach(function (r) {
                r.__module = m.id;
                r.__moduleLabel = m.label;
                rows.push(r);
            });
        });
        rows.sort(function (a, b) { return new Date(a.at) - new Date(b.at); });
        return rows;
    }

    /** 当前筛选实际要展示的记录 */
    function currentRows() {
        return state.module === 'all' ? allRows() : rowsFor(state.module);
    }

    function modulesInScope() {
        var mods = activeModules();
        if (state.module === 'all') return mods;
        var picked = mods.filter(function (m) { return m.id === state.module; });
        // 选中的模块已被清空 / 记录过期时，回退到全部模块，避免出现空白页
        if (!picked.length) {
            state.module = 'all';
            return mods;
        }
        return picked;
    }

    /* ---------------- 指标 ---------------- */

    function computeStreak(rows) {
        if (!rows.length) return 0;
        var days = Object.create(null);
        rows.forEach(function (r) {
            var key = dayKey(r.at);
            if (key) days[key] = true;
        });
        var cursor = startOfDay(new Date());
        // 今天还没练习时，从昨天开始算，避免连续天数瞬间归零
        if (!days[dayKey(cursor)]) cursor = addDays(cursor, -1);
        var streak = 0;
        while (days[dayKey(cursor)]) {
            streak++;
            cursor = addDays(cursor, -1);
        }
        return streak;
    }

    function metricSummary(rows) {
        var rates = [];
        var durationSec = 0;
        var wrong = 0;
        var today = dayKey(new Date());
        var todayCount = 0;
        var passed = 0;

        rows.forEach(function (r) {
            var rate = rateOf(r);
            if (rate != null) {
                rates.push(rate);
                if (rate >= PASS_RATE) passed++;
            }
            durationSec += durationOf(r);
            wrong += wrongCountOf(r);
            if (dayKey(r.at) === today) todayCount++;
        });

        return {
            count: rows.length,
            todayCount: todayCount,
            streak: computeStreak(rows),
            avgRate: rates.length ? Math.round(rates.reduce(function (a, b) { return a + b; }, 0) / rates.length) : null,
            bestRate: rates.length ? Math.max.apply(null, rates) : null,
            passRate: rates.length ? Math.round(passed / rates.length * 100) : null,
            minutes: Math.round(durationSec / 60),
            wrong: wrong
        };
    }

    function card(label, value, hint) {
        return '<div class="stats-summary-card">' +
            '<span>' + esc(label) + '</span>' +
            '<strong>' + esc(value) + '</strong>' +
            (hint ? '<small>' + esc(hint) + '</small>' : '') +
            '</div>';
    }

    function summaryHtml(rows) {
        var s = metricSummary(rows);
        var pct = function (v) { return v == null ? '—' : v + '%'; };
        return '<div class="stats-summary">' +
            card('记录数', String(s.count), s.count ? null : '当前范围无记录') +
            card('今日练习', String(s.todayCount)) +
            card('连续练习', s.streak + ' 天', s.streak ? null : '今天还没开始') +
            card('平均正确率', pct(s.avgRate)) +
            card('最佳正确率', pct(s.bestRate)) +
            card('及格率', pct(s.passRate), '按 ≥ ' + PASS_RATE + '% 计') +
            card('累计用时', s.minutes + ' 分') +
            card('错题数', String(s.wrong)) +
            '</div>';
    }

    /* ---------------- 图表 ---------------- */

    function chartEmpty(text) {
        return '<div class="stats-chart-empty">' + esc(text || '暂无可视化数据。') + '</div>';
    }

    /** 正确率趋势：横向滚动柱状图，最新在最右 */
    function trendHtml(rows) {
        var scored = [];
        rows.forEach(function (r) {
            var rate = rateOf(r);
            if (rate == null) return;
            scored.push({
                rate: rate,
                title: r.title || r.key || r.__moduleLabel || '',
                at: r.at,
                module: r.__moduleLabel || ''
            });
        });
        if (!scored.length) return chartEmpty('当前范围内还没有带正确率的记录。');
        scored = scored.slice(-TREND_LIMIT);

        var cols = scored.map(function (item) {
            var full = StatsCenter.formatDate(item.at);          // 2026-10-28 12:00
            var dayLabel = full.slice(5, 10);                     // 10-28
            var tip = [item.module, item.title, full, item.rate + '%']
                .filter(Boolean).join(' · ');
            return '<div class="stats-chart-col" title="' + esc(tip) + '">' +
                '<span class="stats-chart-value">' + item.rate + '</span>' +
                '<div class="stats-chart-track">' +
                '<div class="stats-chart-bar' + (item.rate >= PASS_RATE ? ' is-pass' : ' is-fail') + '"' +
                ' style="height:' + Math.max(2, item.rate) + '%"></div>' +
                '</div>' +
                '<small>' + esc(dayLabel) + '</small>' +
                '</div>';
        }).join('');

        return '<div class="stats-chart-scroll" tabindex="0" role="group" aria-label="正确率趋势，可横向滚动">' +
            '<div class="stats-chart" data-stats-chart>' + cols + '</div>' +
            '</div>';
    }

    /** 模块练习分布：按当前范围内记录条数 */
    function distributionHtml(rows) {
        var counts = Object.create(null);
        rows.forEach(function (r) {
            var id = r.__module || 'other';
            counts[id] = (counts[id] || 0) + 1;
        });
        var mods = activeModules().filter(function (m) { return counts[m.id]; });
        if (!mods.length) return chartEmpty('当前范围内还没有练习记录。');
        var max = 1;
        mods.forEach(function (m) { if (counts[m.id] > max) max = counts[m.id]; });

        return '<div class="stats-bars">' + mods.map(function (m) {
            var count = counts[m.id] || 0;
            return '<div class="stats-bar-row">' +
                '<span class="stats-bar-label" title="' + esc(m.label) + '">' + esc(m.label) + '</span>' +
                '<span class="stats-bar-track"><span class="stats-bar-fill" style="width:' +
                Math.round(count / max * 100) + '%"></span></span>' +
                '<strong>' + count + '</strong>' +
                '</div>';
        }).join('') + '</div>';
    }

    /** 近 14 天活跃度：固定 14 列，不随范围变化 */
    function activityHtml(rows) {
        var counts = Object.create(null);
        rows.forEach(function (r) {
            var key = dayKey(r.at);
            if (key) counts[key] = (counts[key] || 0) + 1;
        });

        var days = [];
        var today = startOfDay(new Date());
        var max = 1;
        for (var i = ACTIVITY_DAYS - 1; i >= 0; i--) {
            var d = addDays(today, -i);
            var key = dayKey(d);
            var count = counts[key] || 0;
            if (count > max) max = count;
            days.push({ key: key, label: key.slice(5), count: count });
        }

        return '<div class="stats-activity">' + days.map(function (d) {
            var height = d.count ? Math.max(8, Math.round(d.count / max * 100)) : 0;
            return '<div class="stats-activity-col" title="' + esc(d.key + '：' + d.count + ' 条') + '">' +
                '<span class="stats-activity-track">' +
                '<span class="stats-activity-bar' + (d.count ? '' : ' is-empty') + '"' +
                ' style="height:' + height + '%"></span>' +
                '</span>' +
                '<small>' + esc(d.label) + '</small>' +
                '</div>';
        }).join('') + '</div>';
    }

    /* ---------------- 筛选器 ---------------- */

    function moduleSelectHtml() {
        var mods = activeModules();
        var total = mods.reduce(function (n, m) { return n + m.count; }, 0);
        var options = '<option value="all"' + (state.module === 'all' ? ' selected' : '') + '>' +
            '全部模块（' + total + '）</option>';
        options += mods.map(function (m) {
            return '<option value="' + esc(m.id) + '"' + (state.module === m.id ? ' selected' : '') + '>' +
                esc(m.label) + '（' + m.count + '）</option>';
        }).join('');
        return '<select class="stats-filter-module" aria-label="按模块筛选">' + options + '</select>';
    }

    function rangeSelectHtml() {
        var ranges = [['7', '近 7 天'], ['30', '近 30 天'], ['90', '近 90 天'], ['all', '全部']];
        return '<select class="stats-filter-range" aria-label="按时间范围筛选">' + ranges.map(function (r) {
            return '<option value="' + r[0] + '"' + (state.range === r[0] ? ' selected' : '') + '>' +
                esc(r[1]) + '</option>';
        }).join('') + '</select>';
    }

    function toolbarHtml(rows) {
        return '<div class="stats-toolbar">' +
            '<label class="stats-toolbar-field"><span>模块</span>' + moduleSelectHtml() + '</label>' +
            '<label class="stats-toolbar-field"><span>范围</span>' + rangeSelectHtml() + '</label>' +
            '<div class="stats-toolbar-meta">当前范围共 ' + rows.length + ' 条记录</div>' +
            '</div>';
    }

    /* ---------------- 模块记录区 ---------------- */

    function moduleSectionHtml(m, moduleRows) {
        var bodyId = 'stats-module-' + m.id.replace(/[^a-z0-9_-]/gi, '_');
        var clearBtn = moduleRows.length
            ? '<button type="button" class="stats-clear-btn" data-stats-clear="' + esc(m.id) + '">清空记录</button>'
            : '';
        return '<section class="stats-module" data-module="' + esc(m.id) + '">' +
            '<header class="stats-module-head">' +
            '<h3>' + esc(m.label) + ' <small>' + moduleRows.length + ' 条</small></h3>' +
            clearBtn +
            '</header>' +
            (m.description ? '<p class="stats-module-desc">' + esc(m.description) + '</p>' : '') +
            '<div class="stats-module-body" id="' + bodyId + '" data-stats-module="' + esc(m.id) + '"></div>' +
            '</section>';
    }

    /* ---------------- 主渲染 ---------------- */

    function render() {
        // 每次渲染都重新取容器，避免 PJAX 替换 DOM 后写到已脱离文档的旧节点
        var host = document.getElementById('stats-center-app');
        if (host) el = host;
        if (!el || !window.StatsCenter) return;

        // 容器可能被重新创建，事件需要重新绑定到最新节点
        if (host && el !== boundTo) bind();

        var rows = currentRows();
        var mods = activeModules();

        if (!mods.length) {
            el.innerHTML = '<div class="stats-empty stats-empty-page">' +
                '<strong>暂无统计数据</strong>' +
                '<p>完成一次笔试卷批改、模拟中心快速自测或面试模拟后，记录会自动出现在这里。</p>' +
                '<p class="stats-empty-tip">数据只保存在当前浏览器本地，不会上传。</p>' +
                '</div>';
            return;
        }

        var scopeMods = modulesInScope();
        var html = toolbarHtml(rows) +
            summaryHtml(rows) +
            '<div class="stats-chart-grid">' +
            '<section class="stats-chart-card">' +
            '<header class="stats-chart-head"><h3>正确率趋势</h3><small>最近 ' + TREND_LIMIT + ' 次</small></header>' +
            trendHtml(rows) +
            '</section>' +
            '<section class="stats-chart-card">' +
            '<header class="stats-chart-head"><h3>模块练习分布</h3></header>' +
            distributionHtml(rows) +
            '</section>' +
            '<section class="stats-chart-card stats-chart-wide">' +
            '<header class="stats-chart-head"><h3>近 ' + ACTIVITY_DAYS + ' 天练习活跃度</h3></header>' +
            activityHtml(rows) +
            '</section>' +
            '</div>';

        html += '<div class="stats-modules">' + scopeMods.map(function (m) {
            return moduleSectionHtml(m, rowsFor(m.id));
        }).join('') + '</div>';

        el.innerHTML = html;

        scopeMods.forEach(function (m) {
            var body = el.querySelector('[data-stats-module="' + m.id + '"]');
            if (!body) return;
            var moduleRows = rowsFor(m.id);
            if (!moduleRows.length) {
                body.innerHTML = '<div class="stats-empty">当前筛选范围内暂无记录。</div>';
                return;
            }
            try {
                StatsCenter.render(m.id, body, { order: 'desc', limit: 10 });
            } catch (e) {
                body.innerHTML = '<div class="stats-empty">记录渲染失败。</div>';
            }
        });

        scrollTrendToEnd();
    }

    /** 趋势图默认滚到最右（最新） */
    function scrollTrendToEnd() {
        var chart = el && el.querySelector('[data-stats-chart]');
        if (!chart) return;
        var run = function () { chart.scrollLeft = chart.scrollWidth; };
        // 布局完成后再滚动，避免 scrollWidth 还是 0
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
        else run();
    }

    /* ---------------- 事件 ---------------- */

    function onChange(e) {
        var target = e.target;
        if (!target) return;
        if (target.classList.contains('stats-filter-module')) {
            state.module = target.value || 'all';
            render();
        } else if (target.classList.contains('stats-filter-range')) {
            state.range = target.value || DEFAULT_RANGE;
            render();
        }
    }

    function onClear(moduleId) {
        var conf = StatsCenter.modules().filter(function (m) { return m.id === moduleId; })[0];
        var label = conf ? conf.label : moduleId;
        if (!window.confirm('确定清空「' + label + '」的全部统计记录吗？此操作不可撤销。')) return;
        StatsCenter.clear(moduleId);
        if (state.module === moduleId) state.module = 'all';
        render();
        // 通知其他挂载点（笔试卷统计面板等）刷新；
        // __self 标记让本页的 updated 监听忽略自己发出的事件，避免重复渲染
        try {
            document.dispatchEvent(new CustomEvent('stats-center:updated', {
                detail: { moduleId: moduleId, cleared: true, __self: true }
            }));
        } catch (err) { /* ignore */ }
    }

    function onClick(e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-stats-clear]') : null;
        if (!btn) return;
        onClear(btn.getAttribute('data-stats-clear'));
    }

    function bind() {
        if (boundTo === el) return;
        boundTo = el;
        el.addEventListener('change', onChange);
        el.addEventListener('click', onClick);
    }

    /* ---------------- 启动 ---------------- */

    function boot() {
        el = document.getElementById('stats-center-app');
        if (!el || !window.StatsCenter) return;
        ensureStyles();
        bind();
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    document.addEventListener('pjax:complete', boot);
    // 别的模块写入/清空记录后，若本页可见则刷新。
    // 统计页自己的清空已在 onClear 里同步 render 过，这里只响应外部来源。
    document.addEventListener('stats-center:updated', function (e) {
        if (e && e.detail && e.detail.__self) return;
        if (document.getElementById('stats-center-app')) boot();
    });
})();
