(function () {
    'use strict';

    function formatTime(total) {
        if (total < 0) total = 0;
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
    }

    function initTimer(timer) {
        if (timer.dataset.initialized === 'true') return;
        timer.dataset.initialized = 'true';

        const mode = (timer.dataset.mode || 'up').toLowerCase();
        const initial = Math.max(0, parseInt(timer.dataset.initial, 10) || 0);
        const persist = timer.dataset.persist !== 'false';
        const auto = timer.dataset.auto === 'true';

        const key = 'hexo-timer-state-' + timer.id;

        const display = timer.querySelector('.timer-display');
        const statusEl = timer.querySelector('.timer-status');
        const startBtn = timer.querySelector('.timer-start');
        const pauseBtn = timer.querySelector('.timer-pause');
        const resetBtn = timer.querySelector('.timer-reset');

        let seconds = mode === 'down' ? initial : 0;
        let interval = null;
        let running = false;

        // 恢复历史状态（只恢复数值，不自动运行）
        if (persist) {
            try {
                const saved = JSON.parse(localStorage.getItem(key) || 'null');
                if (saved && typeof saved.seconds === 'number') {
                    seconds = Math.max(0, saved.seconds);
                }
            } catch (e) { /* ignore */ }
        }

        const render = () => { display.textContent = formatTime(seconds); };
        const save = () => {
            if (persist) {
                try { localStorage.setItem(key, JSON.stringify({ seconds })); } catch (e) { }
            }
        };

        function startAlarm() {
            display.classList.add('is-alarming');
            timer.classList.add('is-alarming');
        }
        function stopAlarm() {
            display.classList.remove('is-alarming');
            timer.classList.remove('is-alarming');
        }

        function tick() {
            if (mode === 'up') {
                seconds++;
            } else {
                seconds--;
                if (seconds <= 0) {
                    seconds = 0;
                    render();
                    stop();
                    statusEl.textContent = '时间到！';
                    statusEl.className = 'timer-status finished';
                    startAlarm();
                    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
                    return;
                }
            }
            render();
            save();
        }

        function start() {
            if (running) return;
            if (mode === 'down' && seconds <= 0) return;
            stopAlarm();
            running = true;
            interval = setInterval(tick, 1000);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            statusEl.textContent = '进行中';
            statusEl.className = 'timer-status running';
        }

        function stop() {
            running = false;
            if (interval) { clearInterval(interval); interval = null; }
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }

        function pause() {
            if (!running) return;
            stop();
            statusEl.textContent = '已暂停';
            statusEl.className = 'timer-status paused';
        }

        function reset() {
            stop();
            stopAlarm();
            seconds = mode === 'down' ? initial : 0;
            render();
            save();
            statusEl.textContent = '就绪';
            statusEl.className = 'timer-status';
        }

        startBtn.addEventListener('click', start);
        pauseBtn.addEventListener('click', pause);
        resetBtn.addEventListener('click', reset);

        display.addEventListener('click', () => {
            if (timer.classList.contains('is-alarming')) stopAlarm();
        });

        render();

        if (mode === 'down' && seconds === 0 && initial > 0) {
            statusEl.textContent = '时间到！';
            statusEl.className = 'timer-status finished';
            startAlarm();
        }

        // 自动开始
        if (auto && !(mode === 'down' && seconds <= 0)) {
            requestAnimationFrame(start);
        }
    }

    function init() {
        document.querySelectorAll('.hexo-timer').forEach(initTimer);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('pjax:complete', init);
    document.addEventListener('pjax:end', init);
})();