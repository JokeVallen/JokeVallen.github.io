/**
 * source/js/exam-paper.js
 * 数据驱动试卷的运行时乱序
 *
 * 顺序：
 * 1. 打乱每道题的选项 DOM（选项字母跟着选项走）
 * 2. 按 section 打乱客观题
 * 3. 同步重排答题卡行、answers 和 multiple 标记
 *
 * 必须在 hexo-answer-sheet.js 初始化之前执行。
 */
(function () {
    'use strict';

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function shuffleOptions(root) {
        var questions = root.querySelectorAll('.ep-question[data-q-index]');
        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            var box = q.querySelector('.ep-options');
            if (!box) continue;
            var options = Array.prototype.slice.call(box.children);
            if (options.length < 2) continue;
            var entries = options.map(function (option) {
                var keyEl = option.querySelector('.ep-option-key');
                return { option: option, originalKey: keyEl ? keyEl.textContent.trim() : '' };
            });
            var mapping = {};
            shuffle(entries).forEach(function (entry, index) {
                var newKey = String.fromCharCode(65 + index);
                var keyEl = entry.option.querySelector('.ep-option-key');
                if (keyEl) keyEl.textContent = newKey;
                if (entry.originalKey) mapping[entry.originalKey] = newKey;
                box.appendChild(entry.option);
            });
            q.dataset.answerMap = JSON.stringify(mapping);
            var original = String(q.dataset.answer || '').split('').filter(Boolean);
            var remapped = original.map(function (key) { return mapping[key] || key; });
            var strong = q.querySelector('.ep-answer-body strong');
            if (strong && remapped.length) strong.textContent = '正确答案：' + remapped.join('、');
        }
    }

    function shuffleQuestions(root) {
        var sections = root.querySelectorAll('.ep-section-title');
        if (sections.length) {
            for (var i = 0; i < sections.length; i++) {
                var title = sections[i];
                var group = [];
                var node = title.nextElementSibling;
                while (node && node.classList.contains('ep-question') && !node.classList.contains('ep-subjective')) {
                    group.push(node);
                    node = node.nextElementSibling;
                }
                if (group.length < 2) continue;
                var anchor = node;
                shuffle(group).forEach(function (question) {
                    root.insertBefore(question, anchor);
                });
            }
            return;
        }

        var all = Array.prototype.slice.call(root.querySelectorAll('.ep-question[data-q-index]'));
        if (all.length < 2) return;
        var subjective = root.querySelector('.ep-subjective');
        shuffle(all).forEach(function (question) {
            root.insertBefore(question, subjective);
        });
    }

    function renumberQuestions(root) {
        var questions = root.querySelectorAll('.ep-question[data-q-index]');
        for (var i = 0; i < questions.length; i++) {
            var number = questions[i].querySelector('.ep-number');
            if (number) number.textContent = (i + 1) + '.';
        }
    }

    function syncAnswerSheet(root) {
        var sheet = root.querySelector('.hexo-answer-sheet');
        if (!sheet) return;

        var ordered = Array.prototype.slice.call(root.querySelectorAll('.ep-question[data-q-index]'))
            .map(function (q) { return Number(q.dataset.qIndex); });
        if (!ordered.length) return;

        var rows = Array.prototype.slice.call(sheet.querySelectorAll('.as-row'));
        var rowByIndex = {};
        rows.forEach(function (row) {
            rowByIndex[Number(row.dataset.originalIndex)] = row;
        });

        var body = sheet.querySelector('.as-body');
        var oldAnswers = String(sheet.dataset.answers || '').split('|');
        var oldFlags = String(sheet.dataset.multiple || '').split('');
        var nextAnswers = [];
        var nextFlags = [];

        if (body) body.innerHTML = '';
        ordered.forEach(function (originalIndex, newIndex) {
            var row = rowByIndex[originalIndex];
            if (!row) return;
            row.dataset.index = String(newIndex);
            row.dataset.originalIndex = String(originalIndex);
            var num = row.querySelector('.as-num');
            if (num) {
                num.innerHTML = (newIndex + 1) + (row.dataset.multiple === '1' ? '<span class="as-multi-tag">多</span>' : '');
            }
            if (body) body.appendChild(row);
            var answer = oldAnswers[originalIndex] || '';
            var question = root.querySelector('.ep-question[data-q-index="' + originalIndex + '"]');
            if (question && question.dataset.answerMap) {
                try {
                    var map = JSON.parse(question.dataset.answerMap);
                    answer = answer.split('').map(function (key) { return map[key] || key; }).join('');
                } catch (e) { /* ignore */ }
            }
            nextAnswers.push(answer);
            nextFlags.push(oldFlags[originalIndex] || '0');
        });

        sheet.dataset.answers = nextAnswers.join('|');
        sheet.dataset.multiple = nextFlags.join('');
        try { localStorage.removeItem('hexo-answer-sheet-' + sheet.id); } catch (e) { /* ignore */ }
        sheet.dataset.initialized = 'false';
    }

    function initPaper(root) {
        if (!root || root.dataset.epReady === '1') return;
        root.dataset.epReady = '1';

        if (root.dataset.shuffleOptions === 'true') shuffleOptions(root);
        if (root.dataset.shuffleQuestions === 'true') shuffleQuestions(root);
        renumberQuestions(root);
        syncAnswerSheet(root);
    }

    function boot() {
        var papers = document.querySelectorAll('.exam-paper');
        for (var i = 0; i < papers.length; i++) initPaper(papers[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    document.addEventListener('pjax:complete', boot);
})();
