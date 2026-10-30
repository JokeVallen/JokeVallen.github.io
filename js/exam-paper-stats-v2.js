/**
 * source/js/exam-paper-stats-v2.js
 * 笔试卷统计适配器：业务数据由笔试卷提供，存储/展示由 StatsCenter 负责。
 */
(function () {
    'use strict';

    if (!window.StatsCenter) return;

    StatsCenter.register({
        id: 'exam-paper',
        label: '笔试卷',
        description: '每次批卷的得分、用时与错题记录',
        maxRecords: 200,
        renderRecord: function (record, h) {
            var m = record.metrics || {};
            var pieces = [];
            if (m.score != null && m.total != null) pieces.push(m.score + '/' + m.total);
            if (m.rate != null) pieces.push(m.rate + '%');
            if (m.durationSec) pieces.push('用时 ' + h.formatDuration(m.durationSec));
            var wrong = record.detail && Array.isArray(record.detail.wrong) ? record.detail.wrong : [];
            var wrongHtml = wrong.length
                ? '<ul class="stats-wrong-list">' + wrong.slice(0, 4).map(function (w) {
                    return '<li><span>' + h.escapeHtml(w.stem || w.questionId || '') + '</span><b>错</b></li>';
                }).join('') + (wrong.length > 4 ? '<li class="stats-more">还有 ' + (wrong.length - 4) + ' 道错题</li>' : '') + '</ul>'
                : '<p class="stats-good">本次全对。</p>';
            return '<div class="stats-record">' +
                '<div class="stats-record-top"><span>' + h.escapeHtml(h.formatDate(record.at)) + '</span>' +
                '<strong>' + h.escapeHtml(record.title || record.key || '') + '</strong></div>' +
                (pieces.length ? '<div class="stats-record-metrics">' + h.escapeHtml(pieces.join(' · ')) + '</div>' : '') +
                wrongHtml + '</div>';
        }
    });

    function paperIdOf(root) {
        return root && root.id ? root.id.replace(/^exam-paper-/, '') : '';
    }

    function renderPanel(root) {
        if (!root) return;
        var paperId = paperIdOf(root);
        var panel = root.querySelector('.ep-stats');
        if (!panel) return;
        var body = panel.querySelector('.ep-stats-body');
        if (!body) return;
        StatsCenter.render('exam-paper', body, {
            filter: function (r) { return r.key === paperId; },
            limit: 5,
            emptyText: '暂无记录，完成一次批卷后会生成。'
        });
    }

    function onGraded(e) {
        var detail = e && e.detail;
        if (!detail || !detail.sheetId) return;
        var sheet = document.getElementById(detail.sheetId);
        var root = sheet && sheet.closest ? sheet.closest('.exam-paper') : null;
        if (!sheet || !root) return;

        var paperId = paperIdOf(root);
        var timerApi = window.HexoTimer && window.HexoTimer.get ? window.HexoTimer.get('exam-timer-' + paperId) : null;
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

        var titleEl = root.querySelector('.ep-head h1');
        var total = detail.total || 0;
        var score = detail.correctCount || 0;
        StatsCenter.add('exam-paper', {
            key: paperId,
            title: titleEl ? titleEl.textContent.trim() : paperId,
            metrics: {
                score: score,
                total: total,
                rate: total ? Math.round((score / total) * 100) : 0,
                durationSec: Math.max(0, Math.round(durationSec || 0))
            },
            detail: { wrong: wrong }
        });
        renderPanel(root);
    }

    document.addEventListener('hexo-answer-sheet:graded', onGraded);

    document.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.ep-stats-clear') : null;
        if (!btn) return;
        var panel = btn.closest('.ep-stats');
        var root = btn.closest('.exam-paper');
        if (!panel || !root) return;
        if (!window.confirm('确定清空这套卷的本地答题记录吗？')) return;
        var paperId = paperIdOf(root);
        StatsCenter.clearWhere('exam-paper', function (r) { return r.key === paperId; });
        renderPanel(root);
    });

    function boot() {
        var papers = document.querySelectorAll('.exam-paper');
        for (var i = 0; i < papers.length; i++) renderPanel(papers[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    document.addEventListener('pjax:complete', boot);

    window.ExamStats = {
        getAll: function () { return StatsCenter.list('exam-paper', { limit: 1000 }); },
        get: function (paperId) {
            return StatsCenter.list('exam-paper', {
                filter: function (r) { return r.key === paperId; },
                limit: 100
            });
        },
        clear: function (paperId) {
            if (paperId) StatsCenter.clearWhere('exam-paper', function (r) { return r.key === paperId; });
            else StatsCenter.clear('exam-paper');
            boot();
        }
    };
})();
