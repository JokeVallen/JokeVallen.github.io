(function () {
    'use strict';

    var state = { module: 'all', range: '30' };

    function esc(s) {
        return window.StatsCenter ? StatsCenter.escapeHtml(s) : String(s == null ? '' : s);
    }

    function daysAgo(n) {
        var d = new Date();
        d.setDate(d.getDate() - n);
        return d.getTime();
    }

    function inRange(record) {
        if (state.range === 'all') return true;
        var t = new Date(record.at).getTime();
        return !isNaN(t) && t >= daysAgo(Number(state.range));
    }

    function rowsFor(moduleId) {
        return StatsCenter.list(moduleId, { order: 'asc' }).filter(inRange);
    }

    function allRows() {
        var ids = StatsCenter.modules().map(function (m) { return m.id; });
        var rows = [];
        ids.forEach(function (id) {
            rowsFor(id).forEach(function (r) {
                r.__module = id;
                rows.push(r);
            });
        });
        return rows.sort(function (a, b) { return new Date(a.at) - new Date(b.at); });
    }

    function dayKey(value) {
        var d = new Date(value);
        if (isNaN(d.getTime())) return '';
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function computeStreak(rows) {
        var days = {};
        rows.forEach(function (r) { if (dayKey(r.at)) days[dayKey(r.at)] = true; });
        var cursor = new Date();
        if (!days[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
        var streak = 0;
        while (days[dayKey(cursor)]) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        }
        return streak;
    }

    function metricSummary(rows) {
        var scored = rows.filter(function (r) { return r.metrics && r.metrics.rate != null; });
        var rates = scored.map(function (r) { return Number(r.metrics.rate) || 0; });
        var duration = rows.reduce(function (n, r) { return n + (Number(r.metrics && r.metrics.durationSec) || 0); }, 0);
        var today = dayKey(new Date());
        var wrong = rows.reduce(function (n, r) {
            var w = r.metrics && (r.metrics.wrong || r.metrics.wrongList || r.metrics.wrongCount);
            return n + (Array.isArray(w) ? w.length : (Number(w) || 0));
        }, 0);
        return {
            count: rows.length,
            avgRate: rates.length ? Math.round(rates.reduce(function (a, b) { return a + b; }, 0) / rates.length) : null,
            bestRate: rates.length ? Math.max.apply(null, rates) : null,
            passRate: scored.length ? Math.round(scored.filter(function (r) { return Number(r.metrics.rate) >= 60; }).length / scored.length * 100) : null,
            minutes: Math.round(duration / 60),
            todayCount: rows.filter(function (r) { return dayKey(r.at) === today; }).length,
            streak: computeStreak(rows),
            wrong: wrong
        };
    }

    function summaryHtml(rows) {
        var s = metricSummary(rows);
        return '<div class="stats-summary">' +
            '<div class="stats-summary-card"><span>记录数</span><strong>' + s.count + '</strong></div>' +
            '<div class="stats-summary-card"><span>今日练习</span><strong>' + s.todayCount + '</strong></div>' +
            '<div class="stats-summary-card"><span>连续练习</span><strong>' + s.streak + ' 天</strong></div>' +
            '<div class="stats-summary-card"><span>平均正确率</span><strong>' + (s.avgRate == null ? '—' : s.avgRate + '%') + '</strong></div>' +
            '<div class="stats-summary-card"><span>最佳正确率</span><strong>' + (s.bestRate == null ? '—' : s.bestRate + '%') + '</strong></div>' +
            '<div class="stats-summary-card"><span>及格率</span><strong>' + (s.passRate == null ? '—' : s.passRate + '%') + '</strong></div>' +
            '<div class="stats-summary-card"><span>累计用时</span><strong>' + s.minutes + ' 分</strong></div>' +
            '<div class="stats-summary-card"><span>错题数</span><strong>' + s.wrong + '</strong></div>' +
            '</div>';
    }

    function chartHtml(rows) {
        var scored = rows.filter(function (r) { return r.metrics && r.metrics.rate != null; }).slice(-20);
        if (!scored.length) return '<div class="stats-chart-empty">暂无可视化数据。</div>';
        return '<div class="stats-chart">' + scored.map(function (r) {
            var rate = Math.max(0, Math.min(100, Number(r.metrics.rate) || 0));
            var label = StatsCenter.formatDate(r.at).slice(5);
            return '<div class="stats-chart-col" title="' + esc(r.title || r.__module || '') + ' ' + rate + '%">' +
                '<div class="stats-chart-bar" style="height:' + Math.max(4, rate) + '%"><span>' + rate + '</span></div>' +
                '<small>' + esc(label) + '</small></div>';
        }).join('') + '</div>';
    }

    function moduleBarsHtml(rows) {
        var counts = {};
        rows.forEach(function (r) {
            var id = r.__module || 'other';
            counts[id] = (counts[id] || 0) + 1;
        });
        var mods = StatsCenter.modules();
        var max = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; }).concat([1]));
        var items = mods.map(function (m) {
            var count = counts[m.id] || 0;
            if (!count) return '';
            return '<div class="stats-bar-row">' +
                '<span class="stats-bar-label">' + esc(m.label) + '</span>' +
                '<span class="stats-bar-track"><span class="stats-bar-fill" style="width:' + Math.round(count / max * 100) + '%"></span></span>' +
                '<strong>' + count + '</strong></div>';
        }).join('');
        return items || '<div class="stats-chart-empty">暂无可视化数据。</div>';
    }

    function activityHtml(rows) {
        var days = [];
        var counts = {};
        rows.forEach(function (r) {
            var key = dayKey(r.at);
            if (key) counts[key] = (counts[key] || 0) + 1;
        });
        for (var i = 13; i >= 0; i--) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            var key = dayKey(d);
            days.push({ key: key, label: key.slice(5), count: counts[key] || 0 });
        }
        var max = Math.max.apply(null, days.map(function (d) { return d.count; }).concat([1]));
        return '<div class="stats-activity">' + days.map(function (d) {
            return '<div class="stats-activity-col" title="' + d.key + '：' + d.count + ' 条">' +
                '<span class="stats-activity-bar" style="height:' + Math.max(6, Math.round(d.count / max * 100)) + '%"></span>' +
                '<small>' + d.label + '</small></div>';
        }).join('') + '</div>';
    }

    function moduleSelectHtml() {
        var mods = StatsCenter.modules();
        return '<select class="stats-filter-module"><option value="all">全部模块</option>' +
            mods.map(function (m) {
                return '<option value="' + esc(m.id) + '"' + (state.module === m.id ? ' selected' : '') + '>' +
                    esc(m.label) + ' (' + m.count + ')</option>';
            }).join('') + '</select>';
    }

    function render(el) {
        var rows = state.module === 'all' ? allRows() : rowsFor(state.module);
        var mods = StatsCenter.modules();
        if (!mods.length) {
            el.innerHTML = '<div class="stats-empty">暂无统计数据。完成一次试卷或模拟面试后会显示在这里。</div>';
            return;
        }

        var html = '<div class="stats-toolbar">' +
            '<label>模块 ' + moduleSelectHtml() + '</label>' +
            '<label>范围 <select class="stats-filter-range">' +
            '<option value="7"' + (state.range === '7' ? ' selected' : '') + '>近 7 天</option>' +
            '<option value="30"' + (state.range === '30' ? ' selected' : '') + '>近 30 天</option>' +
            '<option value="90"' + (state.range === '90' ? ' selected' : '') + '>近 90 天</option>' +
            '<option value="all"' + (state.range === 'all' ? ' selected' : '') + '>全部</option>' +
            '</select></label>' +
            '</div>' +
            summaryHtml(rows) +
            '<div class="stats-chart-grid">' +
            '<section class="stats-chart-card"><h3>正确率趋势</h3>' + chartHtml(rows) + '</section>' +
            '<section class="stats-chart-card"><h3>模块练习分布</h3>' + moduleBarsHtml(allRows()) + '</section>' +
            '<section class="stats-chart-card stats-chart-wide"><h3>近 14 天练习活跃度</h3>' + activityHtml(rows) + '</section>' +
            '</div>';

        var show = state.module === 'all' ? mods : mods.filter(function (m) { return m.id === state.module; });
        html += '<div class="stats-modules">' + show.map(function (m) {
            var moduleRows = rowsFor(m.id);
            var bodyId = 'stats-module-' + m.id.replace(/[^a-z0-9_-]/gi, '_');
            return '<section class="stats-module" data-module="' + esc(m.id) + '">' +
                '<h3>' + esc(m.label) + ' <small>' + moduleRows.length + ' 条</small></h3>' +
                '<div id="' + bodyId + '" data-stats-module="' + esc(m.id) + '"></div>' +
                '</section>';
        }).join('') + '</div>';

        el.innerHTML = html;
        show.forEach(function (m) {
            var bodyId = 'stats-module-' + m.id.replace(/[^a-z0-9_-]/gi, '_');
            var body = el.querySelector('#' + bodyId);
            if (body) {
                var rows = rowsFor(m.id);
                if (rows.length) {
                    StatsCenter.render(m.id, body, { order: 'desc', limit: 10 });
                } else {
                    body.innerHTML = '<div class="stats-empty">当前筛选范围内暂无记录。</div>';
                }
            }
        });
    }

    function boot() {
        var el = document.getElementById('stats-center-app');
        if (!el || !window.StatsCenter) return;
        render(el);
        if (el.dataset.statsBound === '1') return;
        el.dataset.statsBound = '1';
        el.addEventListener('change', function (e) {
            if (e.target.classList.contains('stats-filter-module')) {
                state.module = e.target.value;
                render(el);
            } else if (e.target.classList.contains('stats-filter-range')) {
                state.range = e.target.value;
                render(el);
            }
        });
        el.addEventListener('click', function (e) {
            if (e.target.closest && e.target.closest('[data-stats-clear]')) {
                var id = e.target.closest('[data-stats-clear]').getAttribute('data-stats-clear');
                if (window.confirm('确定清空该模块统计吗？')) {
                    StatsCenter.clear(id);
                    render(el);
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    document.addEventListener('pjax:complete', boot);
    document.addEventListener('stats-center:updated', function () { boot(); });
})();
