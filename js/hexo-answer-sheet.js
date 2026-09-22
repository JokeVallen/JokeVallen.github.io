(function () {
    'use strict';

    function initSheet(sheet) {
        if (sheet.dataset.initialized === 'true') return;
        sheet.dataset.initialized = 'true';

        // ---- 解析答案 ----
        const rawAnswers = sheet.dataset.answers || '';
        const answers = rawAnswers.split('|').map(s => s.split('').sort());
        if (answers.length === 0) return;

        const multipleFlags = (sheet.dataset.multiple || '').split('')
            .map(c => c === '1');
        const persist = sheet.dataset.persist !== 'false';
        const key = 'hexo-answer-sheet-' + sheet.id;

        // ---- 缓存 DOM 引用 ----
        const rows = sheet.querySelectorAll('.as-row');
        const progressEl = sheet.querySelector('.as-progress');
        const gradeBtn = sheet.querySelector('.as-grade');
        const resetBtn = sheet.querySelector('.as-reset');
        const resultEl = sheet.querySelector('.as-result');

        // 二维缓存：optCache[i][letter] = element
        const optCache = [];
        for (let i = 0; i < rows.length; i++) {
            const map = {};
            const opts = rows[i].querySelectorAll('.as-opt');
            for (let j = 0; j < opts.length; j++) {
                map[opts[j].dataset.opt] = opts[j];
            }
            optCache.push(map);
        }

        // ---- 状态 ----
        let userAnswers = answers.map(() => []);
        let graded = false;
        let lastSaveTime = 0;
        const SAVE_THROTTLE = 2000;

        // ---- 恢复 ----
        if (persist) {
            try {
                const saved = JSON.parse(localStorage.getItem(key) || 'null');
                if (saved &&
                    Array.isArray(saved.userAnswers) &&
                    saved.userAnswers.length === answers.length) {
                    userAnswers = saved.userAnswers.map(a => Array.isArray(a) ? a : []);
                }
            } catch (e) { /* ignore */ }
        }

        // ---- 节流保存 ----
        function save(force) {
            if (!persist) return;
            const now = Date.now();
            if (!force && now - lastSaveTime < SAVE_THROTTLE) return;
            lastSaveTime = now;
            try {
                localStorage.setItem(key, JSON.stringify({ userAnswers }));
            } catch (e) { /* ignore */ }
        }

        // ---- 进度条 ----
        function updateProgress() {
            let done = 0;
            for (let i = 0; i < userAnswers.length; i++) {
                if (userAnswers[i].length > 0) done++;
            }
            progressEl.textContent = '已完成 ' + done + '/' + answers.length;
        }

        // ---- 单行增量渲染 ----
        function updateRowSelection(i) {
            const cache = optCache[i];
            const user = userAnswers[i];
            for (const letter in cache) {
                const opt = cache[letter];
                const shouldSelect = user.indexOf(letter) !== -1;
                if (opt.classList.contains('selected') !== shouldSelect) {
                    opt.classList.toggle('selected', shouldSelect);
                }
            }
        }

        // ---- 全量重渲染（仅初始化和重置时使用） ----
        function renderSelection() {
            for (let i = 0; i < optCache.length; i++) {
                const cache = optCache[i];
                for (const letter in cache) {
                    const opt = cache[letter];
                    opt.classList.remove('selected', 'correct', 'wrong', 'correct-reveal');
                    opt.disabled = false;
                }
                updateRowSelection(i);
            }
            updateProgress();
        }

        // ---- 批卷 ----
        function renderGraded() {
            let correctCount = 0;

            for (let i = 0; i < answers.length; i++) {
                const cache = optCache[i];
                // 清空状态并禁用
                for (const letter in cache) {
                    const opt = cache[letter];
                    opt.classList.remove('selected', 'correct', 'wrong', 'correct-reveal');
                    opt.disabled = true;
                }

                const user = userAnswers[i].slice().sort();
                const correct = answers[i].slice().sort();
                const isRight = user.length > 0 && user.join('') === correct.join('');

                if (isRight) {
                    correctCount++;
                    for (let j = 0; j < correct.length; j++) {
                        const opt = cache[correct[j]];
                        if (opt) opt.classList.add('correct');
                    }
                } else {
                    // 用户选中的部分：对的绿、错的红
                    for (let j = 0; j < user.length; j++) {
                        const letter = user[j];
                        const opt = cache[letter];
                        if (!opt) continue;
                        if (correct.indexOf(letter) !== -1) {
                            opt.classList.add('correct');
                        } else {
                            opt.classList.add('wrong');
                        }
                    }
                    // 漏选的正确答案：浅绿提示
                    for (let j = 0; j < correct.length; j++) {
                        const letter = correct[j];
                        if (user.indexOf(letter) === -1) {
                            const opt = cache[letter];
                            if (opt) opt.classList.add('correct-reveal');
                        }
                    }
                }
            }

            const total = answers.length;
            const rate = Math.round((correctCount / total) * 100);
            resultEl.style.display = 'block';
            resultEl.textContent = '得分：' + correctCount + '/' + total +
                '　正确率：' + rate + '%';
            resultEl.className = 'as-result ' + (rate >= 60 ? 'pass' : 'fail');
            updateProgress();
        }

        // ---- 批改 / 重置 ----
        function handleGrade() {
            if (graded) return;
            graded = true;
            gradeBtn.disabled = true;
            renderGraded();
        }

        function handleReset() {
            graded = false;
            for (let i = 0; i < answers.length; i++) userAnswers[i] = [];
            save(true);
            resultEl.style.display = 'none';
            resultEl.textContent = '';
            gradeBtn.disabled = false;
            renderSelection();
        }

        // ---- 事件委托：单一监听器处理所有点击 ----
        sheet.addEventListener('click', function (e) {
            const target = e.target;

            if (target.classList && target.classList.contains('as-grade')) {
                handleGrade();
                return;
            }
            if (target.classList && target.classList.contains('as-reset')) {
                handleReset();
                return;
            }
            if (graded) return;

            const opt = target.closest ? target.closest('.as-opt') : null;
            if (!opt || opt.disabled) return;
            if (!sheet.contains(opt)) return;

            const row = opt.closest('.as-row');
            if (!row) return;
            const i = parseInt(row.dataset.index, 10);
            if (isNaN(i)) return;

            const choice = opt.dataset.opt;
            const isMultiple = multipleFlags[i];

            if (isMultiple) {
                const arr = userAnswers[i];
                const idx = arr.indexOf(choice);
                if (idx === -1) arr.push(choice);
                else arr.splice(idx, 1);
            } else {
                userAnswers[i] = (userAnswers[i][0] === choice) ? [] : [choice];
            }

            save(false);
            updateRowSelection(i);
            updateProgress();
        });

        // ---- 页面隐藏时立即保存 ----
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') save(true);
        });
        window.addEventListener('pagehide', function () { save(true); });

        // ---- 初始渲染 ----
        renderSelection();
    }

    function init() {
        const nodes = document.querySelectorAll('.hexo-answer-sheet');
        for (let i = 0; i < nodes.length; i++) initSheet(nodes[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('pjax:complete', init);
    document.addEventListener('pjax:end', init);
})();