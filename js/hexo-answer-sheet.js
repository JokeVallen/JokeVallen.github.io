(function () {
    'use strict';

    function initSheet(sheet) {
        if (sheet.dataset.initialized === 'true') return;
        sheet.dataset.initialized = 'true';

        const answers = (sheet.dataset.answers || '').split('|').map(s => s.split('').sort());
        if (answers.length === 0) return;

        const multipleFlags = (sheet.dataset.multiple || '').split('').map(c => c === '1');
        const persist = sheet.dataset.persist !== 'false';
        const key = 'hexo-answer-sheet-' + sheet.id;

        const rows = sheet.querySelectorAll('.as-row');
        const progressEl = sheet.querySelector('.as-progress');
        const gradeBtn = sheet.querySelector('.as-grade');
        const resetBtn = sheet.querySelector('.as-reset');
        const resultEl = sheet.querySelector('.as-result');

        let userAnswers = answers.map(() => []);
        let graded = false;

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

        const save = () => {
            if (!persist) return;
            try {
                localStorage.setItem(key, JSON.stringify({ userAnswers }));
            } catch (e) { /* ignore */ }
        };

        const updateProgress = () => {
            const done = userAnswers.filter(a => a.length > 0).length;
            progressEl.textContent = `已完成 ${done}/${answers.length}`;
        };

        const renderSelection = () => {
            rows.forEach((row, i) => {
                row.querySelectorAll('.as-opt').forEach(opt => {
                    opt.classList.remove('selected', 'correct', 'wrong', 'correct-reveal');
                    opt.disabled = false;
                    if (userAnswers[i].includes(opt.dataset.opt)) {
                        opt.classList.add('selected');
                    }
                });
            });
            updateProgress();
        };

        const renderGraded = () => {
            let correctCount = 0;

            rows.forEach((row, i) => {
                row.querySelectorAll('.as-opt').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.disabled = true;
                });

                const user = userAnswers[i].slice().sort();
                const correct = answers[i].slice().sort();
                const isRight = user.join('') === correct.join('') && user.length > 0;

                if (isRight) {
                    correctCount++;
                    correct.forEach(letter => {
                        const el = row.querySelector(`.as-opt[data-opt="${letter}"]`);
                        if (el) el.classList.add('correct');
                    });
                } else {
                    user.forEach(letter => {
                        const el = row.querySelector(`.as-opt[data-opt="${letter}"]`);
                        if (!el) return;
                        if (correct.includes(letter)) el.classList.add('correct');
                        else el.classList.add('wrong');
                    });
                    correct.forEach(letter => {
                        if (!user.includes(letter)) {
                            const el = row.querySelector(`.as-opt[data-opt="${letter}"]`);
                            if (el) el.classList.add('correct-reveal');
                        }
                    });
                }
            });

            const total = answers.length;
            const rate = Math.round((correctCount / total) * 100);
            resultEl.style.display = 'block';
            resultEl.textContent = `得分：${correctCount}/${total}　正确率：${rate}%`;
            resultEl.className = 'as-result ' + (rate >= 60 ? 'pass' : 'fail');
            updateProgress();
        };

        rows.forEach((row, i) => {
            const isMultiple = multipleFlags[i];
            row.querySelectorAll('.as-opt').forEach(opt => {
                opt.addEventListener('click', () => {
                    if (graded) return;
                    const choice = opt.dataset.opt;
                    if (isMultiple) {
                        const idx = userAnswers[i].indexOf(choice);
                        if (idx === -1) userAnswers[i].push(choice);
                        else userAnswers[i].splice(idx, 1);
                    } else {
                        userAnswers[i] = (userAnswers[i][0] === choice) ? [] : [choice];
                    }
                    save();
                    renderSelection();
                });
            });
        });

        gradeBtn.addEventListener('click', () => {
            graded = true;
            gradeBtn.disabled = true;
            renderGraded();
        });

        resetBtn.addEventListener('click', () => {
            graded = false;
            userAnswers = answers.map(() => []);
            save();
            resultEl.style.display = 'none';
            resultEl.textContent = '';
            gradeBtn.disabled = false;
            renderSelection();
        });

        renderSelection();
    }

    function init() {
        document.querySelectorAll('.hexo-answer-sheet').forEach(initSheet);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('pjax:complete', init);
    document.addEventListener('pjax:end', init);
})();