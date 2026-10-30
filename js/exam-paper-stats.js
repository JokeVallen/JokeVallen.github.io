/**
 * source/js/exam-paper-stats.js
 * 记录每套试卷的批卷结果、用时与错题统计（localStorage）
 */
(function () {
    'use strict';

    var KEY = 'hexo-exam-stats-v1';

    function loadAll() {
        try {
            var all = JSON.parse(localStorage.getItem(KEY) || '{}');
            return all && typeof all === 'object' ? all : {};
        } catch (e) {
            return {};
        }
    }

    function saveAll(all) {
        try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function formatDuration(sec) {
        sec = Math.max(0, Math.round(Number(sec) || 0));
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return (m > 0 ? m + ' 分 ' : '') + s + ' 秒';
    }

    function formatDate(iso) {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        function p(n) { return n < 10 ? '0' + n : '' + n; }
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
            ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }

    function renderPanel(root, paperId) {
        var panel = root.querySelector('.ep-stats');
        if (!panel) return;
        var body = panel.querySelector('.ep-stats-body');
        if (!body) return;
        var record = loadAll()[paperId];
        var attempts = record && Array.isArray(record.attempts) ? record.attempts : [];
        if (!attempts.length) {
            body.innerHTML = '暂无记录，完成一次批卷后会生成。';
            return;
        }

        var rows = attempts.slice(-5).reverse().map(function (a) {
            var rate = a.total ? Math.round((a.correct / a.total) * 100) : 0;
            return '<div class="ep-stats-item"><span>' + esc(formatDate(a.at)) + '</span>' +
                '<strong>' + a.correct + '/' + a.total + ' · ' + rate + '%</strong>' +
                (a.durationSec ? '<em>用时 ' + esc(formatDuration(a.durationSec)) + '</em>' : '') +
                '</div>';
        }).join('');

        var wrongMap = {};
        attempts.forEach(function (a) {
            (a.wrong || []).forEach(function (w) {
                var key = w.questionId || w.stem;
                if (!key) return;
                if (!wrongMap[key]) wrongMap[key] = { stem: w.stem || key, count: 0 };
                wrongMap[key].count++;
            });
        });
        var weak = Object.keys(wrongMap).map(function (k) { return wrongMap[k]; })
            .sort(function (a, b) { return b.count - a.count; })
            .slice(0, 6);

        var weakHtml = weak.length
            ? '<div class="ep-stats-weak"><h4>易错题</h4><ul>' + weak.map(function (w) {
                return '<li><span>' + esc(w.stem) + '</span><b>错 ' + w.count + ' 次</b></li>';
            }).join('') + '</ul></div>'
            : '<p class="ep-stats-good">目前没有重复错题。</p>';

        body.innerHTML = '<div class="ep-stats-latest">' + rows + '</div>' + weakHtml;
    }

    function renderAll() {
        var panels = document.querySelectorAll('.ep-stats[data-paper-id]');
        for (var i = 0; i < panels.length; i++) {
            renderPanel(panels[i].closest('.exam-paper'), panels[i].dataset.paperId);
        }
    }

    function onGraded(e) {
        var detail = e && e.detail;
        if (!detail || !detail.sheetId) return;
        var sheet = document.getElementById(detail.sheetId);
        var root = sheet && sheet.closest ? sheet.closest('.exam-paper') : null;
        if (!sheet || !root) return;

        var paperId = root.id.replace(/^exam-paper-/, '');
        var timerId = 'exam-timer-' + paperId;
        var timerApi = window.HexoTimer && window.HexoTimer.get ? window.HexoTimer.get(timerId) : null;
        var durationSec = timerApi ? timerApi.elapsed() : 0;

        var rows = sheet.querySelectorAll('.as-row');
        var wrong = [];
        for (var i = 0; i < rows.length; i++) {
            var user = (detail.userAnswers[i] || []).slice().sort().join('');
            var correct = (detail.answers[i] || []).slice().sort().join('');
            if (user && user === correct) continue;
            var originalIndex = Number(rows[i].dataset.originalIndex);
            var question = root.querySelector('.ep-question[data-q-index="' + originalIndex + '"]');
            var stemEl = question ? question.querySelector('h3') : null;
            wrong.push({
                questionId: question ? question.id : '',
                stem: stemEl ? stemEl.textContent.replace(/\s+/g, ' ').trim().slice(0, 120) : '',
                userAnswer: user,
                correctAnswer: correct
            });
        }

        var all = loadAll();
        if (!all[paperId]) all[paperId] = { attempts: [] };
        all[paperId].attempts.push({
            at: new Date().toISOString(),
            durationSec: Math.max(0, Math.round(durationSec || 0)),
            correct: detail.correctCount,
            total: detail.total,
            wrong: wrong
        });
        all[paperId].attempts = all[paperId].attempts.slice(-30);
        saveAll(all);
        renderPanel(root, paperId);
    }

    document.addEventListener('hexo-answer-sheet:graded', onGraded);

    document.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.ep-stats-clear') : null;
        if (!btn) return;
        var panel = btn.closest('.ep-stats');
        var root = btn.closest('.exam-paper');
        if (!panel || !root) return;
        var paperId = panel.dataset.paperId;
        if (!window.confirm('确定清空这套卷的本地答题记录吗？')) return;
        var all = loadAll();
        delete all[paperId];
        saveAll(all);
        renderPanel(root, paperId);
    });

    function boot() { renderAll(); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    document.addEventListener('pjax:complete', boot);

    window.ExamStats = {
        getAll: function () { return loadAll(); },
        get: function (paperId) { return loadAll()[paperId] || null; },
        clear: function (paperId) {
            var all = loadAll();
            if (paperId) delete all[paperId];
            else all = {};
            saveAll(all);
            renderAll();
        }
    };
})();
