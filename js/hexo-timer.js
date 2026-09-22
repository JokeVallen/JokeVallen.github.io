(function () {
    'use strict';

    // ---- 模块级：常量与工具 ----
    const PAD = Array.from({ length: 60 }, (_, i) => (i < 10 ? '0' + i : '' + i));
    const PAD_H = Array.from({ length: 100 }, (_, i) => (i < 10 ? '0' + i : '' + i));

    function formatTime(total) {
        if (total < 0) total = 0;
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        const hh = h < 100 ? PAD_H[h] : String(h);
        return hh + ':' + PAD[m] + ':' + PAD[s];
    }

    // ---- 单实例初始化 ----
    function initTimer(timer) {
        if (timer.dataset.initialized === 'true') return;
        timer.dataset.initialized = 'true';

        // 一次性读取 data-* 并缓存
        const mode = (timer.dataset.mode || 'up').toLowerCase();
        const initial = Math.max(0, parseInt(timer.dataset.initial, 10) || 0);
        const persist = timer.dataset.persist !== 'false';
        const auto = timer.dataset.auto === 'true';

        const key = 'hexo-timer-state-' + timer.id;

        // 缓存 DOM 引用（后续不再 querySelector）
        const display = timer.querySelector('.timer-display');
        const statusEl = timer.querySelector('.timer-status');
        const startBtn = timer.querySelector('.timer-start');
        const pauseBtn = timer.querySelector('.timer-pause');
        const resetBtn = timer.querySelector('.timer-reset');

        // ---- 状态 ----
        // displaySeconds 语义：
        //   mode=up    → 已计时秒数（基准值）
        //   mode=down  → 剩余秒数（基准值）
        // isRunning 时，真实值 = displaySeconds ± elapsed，由时间戳计算
        let displaySeconds = mode === 'down' ? initial : 0;
        let startedAt = 0;
        let isRunning = false;
        let tickTimerId = null;
        let lastText = '';
        let lastSaveTime = 0;
        let isAlarming = false;
        const SAVE_THROTTLE = 5000;

        // ---- 从 localStorage 恢复（只恢复数值，不自动运行） ----
        if (persist) {
            try {
                const saved = JSON.parse(localStorage.getItem(key) || 'null');
                if (saved && typeof saved.seconds === 'number') {
                    displaySeconds = Math.max(0, saved.seconds);
                }
            } catch (e) { /* ignore */ }
        }

        // ---- 实时值计算（基于时间戳，抗节流/漂移） ----
        function computeCurrent() {
            if (!isRunning) return displaySeconds;
            const elapsed = Math.floor((Date.now() - startedAt) / 1000);
            if (mode === 'down') {
                const v = displaySeconds - elapsed;
                return v > 0 ? v : 0;
            }
            return displaySeconds + elapsed;
        }

        // ---- 渲染：只在文本变化时写 DOM ----
        function renderTime() {
            const text = formatTime(computeCurrent());
            if (text !== lastText) {
                display.textContent = text;
                lastText = text;
            }
        }

        function renderStatus(kind) {
            // kind: 'ready' | 'running' | 'paused' | 'finished'
            if (kind === 'running') {
                statusEl.textContent = '进行中';
                statusEl.className = 'timer-status running';
                startBtn.disabled = true;
                pauseBtn.disabled = false;
            } else if (kind === 'paused') {
                statusEl.textContent = '已暂停';
                statusEl.className = 'timer-status paused';
                startBtn.disabled = false;
                pauseBtn.disabled = true;
            } else if (kind === 'finished') {
                statusEl.textContent = '时间到！';
                statusEl.className = 'timer-status finished';
                startBtn.disabled = true;
                pauseBtn.disabled = true;
            } else {
                statusEl.textContent = '就绪';
                statusEl.className = 'timer-status';
                startBtn.disabled = false;
                pauseBtn.disabled = true;
            }
        }

        // ---- 闹钟 ----
        function startAlarm() {
            if (isAlarming) return;
            isAlarming = true;
            display.classList.add('is-alarming');
            timer.classList.add('is-alarming');
        }
        function stopAlarm() {
            if (!isAlarming) return;
            isAlarming = false;
            display.classList.remove('is-alarming');
            timer.classList.remove('is-alarming');
        }

        // ---- 节流保存 ----
        function save(force) {
            if (!persist) return;
            const now = Date.now();
            if (!force && now - lastSaveTime < SAVE_THROTTLE) return;
            lastSaveTime = now;
            try {
                localStorage.setItem(key, JSON.stringify({
                    seconds: computeCurrent(),
                    ts: now
                }));
            } catch (e) { /* ignore */ }
        }

        // ---- 定时调度：对齐整秒，用 setTimeout 递归 ----
        function scheduleTick() {
            if (!isRunning) return;
            const elapsedMs = Date.now() - startedAt;
            let delay = 1000 - (elapsedMs % 1000);
            if (delay <= 0) delay = 1000;
            tickTimerId = setTimeout(tick, delay);
        }

        function tick() {
            tickTimerId = null;
            if (!isRunning) return;

            if (mode === 'down' && computeCurrent() <= 0) {
                displaySeconds = 0;
                isRunning = false;
                renderTime();
                renderStatus('finished');
                save(true);
                startAlarm();
                if (navigator.vibrate) {
                    try { navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) { }
                }
                return;
            }

            renderTime();
            save(false);
            scheduleTick();
        }

        // ---- 控制 ----
        function start() {
            if (isRunning) return;
            if (mode === 'down' && computeCurrent() <= 0) return;
            stopAlarm();
            displaySeconds = computeCurrent();
            startedAt = Date.now();
            isRunning = true;
            renderStatus('running');
            renderTime();
            scheduleTick();
        }

        function pause() {
            if (!isRunning) return;
            displaySeconds = computeCurrent();
            isRunning = false;
            if (tickTimerId !== null) {
                clearTimeout(tickTimerId);
                tickTimerId = null;
            }
            renderTime();
            renderStatus('paused');
            save(true);
        }

        function reset() {
            isRunning = false;
            if (tickTimerId !== null) {
                clearTimeout(tickTimerId);
                tickTimerId = null;
            }
            stopAlarm();
            displaySeconds = mode === 'down' ? initial : 0;
            renderTime();
            renderStatus('ready');
            save(true);
        }

        // ---- 事件绑定 ----
        startBtn.addEventListener('click', start);
        pauseBtn.addEventListener('click', pause);
        resetBtn.addEventListener('click', reset);

        display.addEventListener('click', function () {
            if (isAlarming) stopAlarm();
        });

        // 页面隐藏时立即保存；恢复时立即重算显示
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') {
                save(true);
            } else if (document.visibilityState === 'visible' && isRunning) {
                if (tickTimerId !== null) {
                    clearTimeout(tickTimerId);
                    tickTimerId = null;
                }
                tick();
            }
        });
        window.addEventListener('pagehide', function () { save(true); });

        // ---- 初始渲染 ----
        if (mode === 'down' && displaySeconds === 0 && initial > 0) {
            // 恢复时倒计时已到 0
            renderTime();
            renderStatus('finished');
            startAlarm();
        } else {
            renderTime();
            renderStatus('ready');
        }

        // ---- 自动开始 ----
        if (auto && !(mode === 'down' && computeCurrent() <= 0)) {
            requestAnimationFrame(start);
        }
    }

    // ---- 全局初始化 ----
    function init() {
        const nodes = document.querySelectorAll('.hexo-timer');
        for (let i = 0; i < nodes.length; i++) initTimer(nodes[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('pjax:complete', init);
    document.addEventListener('pjax:end', init);
})();