/**
 * source/js/exam-paper-actions.js
 * 将笔试卷页面的用户意图注册为 SiteActionAPI 语义操作
 */
(function () {
    'use strict';

    if (!window.SiteActionAPI) return;
    var root = document.querySelector('.exam-paper');
    if (!root) return;

    function click(selector) {
        var el = document.querySelector(selector);
        if (!el) return false;
        el.click();
        return true;
    }

    SiteActionAPI.register('quiz.openAnswerSheet', function () {
        return click('.exam-paper .as-toggle');
    }, { label: '展开答题卡', scope: 'write-local', description: '展开当前试卷答题卡' });

    SiteActionAPI.register('quiz.grade', function () {
        return click('.exam-paper .as-grade');
    }, {
        label: '提交并批卷',
        scope: 'write-local',
        description: '提交当前试卷答案并生成得分与错题记录',
        requiresConfirmation: true,
        confirmText: '确定提交当前试卷并批卷吗？'
    });

    SiteActionAPI.register('quiz.reset', function () {
        return click('.exam-paper .as-reset');
    }, {
        label: '重置答题',
        scope: 'write-local',
        description: '清空当前试卷作答状态',
        requiresConfirmation: true,
        confirmText: '确定重置当前试卷作答吗？'
    });

    SiteActionAPI.register('quiz.startTimer', function () {
        return click('.exam-paper .timer-start');
    }, { label: '开始计时', scope: 'write-local', description: '启动当前试卷计时器' });

    function sheet() {
        return document.querySelector('.exam-paper .hexo-answer-sheet');
    }

    function rows() {
        var s = sheet();
        return s ? Array.prototype.slice.call(s.querySelectorAll('.as-row')) : [];
    }

    function rowFor(qIndex) {
        var list = rows();
        for (var i = 0; i < list.length; i++) {
            if (Number(list[i].dataset.originalIndex) === Number(qIndex)) return list[i];
        }
        return null;
    }

    SiteActionAPI.register('quiz.answer', function (payload) {
        var row = rowFor(payload.qIndex);
        if (!row) return false;
        var wanted = Array.isArray(payload.answers) ? payload.answers : [payload.answer];
        wanted = wanted.filter(Boolean).map(function (x) { return String(x).toUpperCase(); });
        if (row.dataset.multiple !== '1') wanted = wanted.slice(0, 1);
        var opts = row.querySelectorAll('.as-opt');
        for (var i = 0; i < opts.length; i++) {
            var key = String(opts[i].dataset.opt || '').toUpperCase();
            var selected = opts[i].classList.contains('selected');
            var should = wanted.indexOf(key) !== -1;
            if (selected !== should) opts[i].click();
        }
        return true;
    }, {
        label: '提交单题答案',
        scope: 'write-local',
        description: '按题目序号与选项字母作答，不直接操作 DOM',
        requiresConfirmation: false
    });

    SiteActionAPI.register('quiz.status', function () {
        return rows().map(function (row) {
            var selected = [];
            row.querySelectorAll('.as-opt.selected').forEach(function (opt) {
                selected.push(String(opt.dataset.opt || ''));
            });
            return {
                qIndex: Number(row.dataset.originalIndex),
                multiple: row.dataset.multiple === '1',
                answers: selected.sort()
            };
        });
    }, { label: '读取作答状态', scope: 'read-local', description: '读取当前试卷每题已选答案' });

    SiteActionAPI.register('quiz.skip', function (payload) {
        var list = root.querySelectorAll('.ep-question[data-q-index]');
        var target = typeof payload.qIndex === 'number' ? payload.qIndex : 0;
        for (var i = 0; i < list.length; i++) {
            if (Number(list[i].dataset.qIndex) === target) {
                list[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                list[i].classList.add('ep-question-focus');
                setTimeout(function () { list[i].classList.remove('ep-question-focus'); }, 1600);
                return true;
            }
        }
        return false;
    }, { label: '定位题目', scope: 'read', description: '滚动到指定题目' });
})();
