/**
 * source/js/theme-sync.js
 * 统一站点主题状态，并通知站内模块与嵌入页面。
 */
(function (global) {
    'use strict';

    var listeners = [];
    var last = null;

    function storedTheme() {
        try {
            var value = localStorage.getItem('theme');
            if (value === 'dark' || value === 'light') return value;
        } catch (e) { /* ignore */ }
        return null;
    }

    function get() {
        var attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'dark' || attr === 'light') return attr;
        var saved = storedTheme();
        if (saved) return saved;
        return global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function apply(theme) {
        theme = theme === 'dark' ? 'dark' : 'light';
        if (document.documentElement.getAttribute('data-theme') !== theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
        document.documentElement.style.colorScheme = theme;
        try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
        return theme;
    }

    function emit(theme) {
        if (theme === last) return;
        last = theme;
        for (var i = 0; i < listeners.length; i++) {
            try { listeners[i](theme); } catch (e) { /* ignore */ }
        }
        try {
            if (global.SiteEvents) global.SiteEvents.emit('theme:change', { theme: theme });
        } catch (e) { /* ignore */ }
        document.dispatchEvent(new CustomEvent('site:theme:change', { detail: { theme: theme } }));
    }

    function sync() {
        var theme = get();
        apply(theme);
        emit(theme);
        return theme;
    }

    function set(theme) {
        apply(theme);
        sync();
        return theme;
    }

    function toggle() {
        return set(get() === 'dark' ? 'light' : 'dark');
    }

    function onChange(fn) {
        if (typeof fn === 'function') listeners.push(fn);
        return function () {
            var idx = listeners.indexOf(fn);
            if (idx !== -1) listeners.splice(idx, 1);
        };
    }

    global.SiteTheme = {
        get: get,
        set: set,
        toggle: toggle,
        sync: sync,
        onChange: onChange
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sync);
    } else {
        sync();
    }
    document.addEventListener('pjax:complete', sync);
    window.addEventListener('storage', function (e) {
        if (e.key === 'theme') sync();
    });
    if (window.MutationObserver) {
        new MutationObserver(function () { sync(); }).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    if (global.SiteActionAPI) {
        global.SiteActionAPI.register('theme.get', function () {
            return global.SiteTheme.get();
        }, { label: '读取主题', scope: 'read', description: '读取当前站点主题' });

        global.SiteActionAPI.register('theme.set', function (payload) {
            return global.SiteTheme.set(payload.theme);
        }, { label: '设置主题', scope: 'write-local', description: '切换站点明暗主题' });

        global.SiteActionAPI.register('theme.toggle', function () {
            return global.SiteTheme.toggle();
        }, { label: '切换主题', scope: 'write-local', description: '在明暗主题之间切换' });
    }
})(window);
