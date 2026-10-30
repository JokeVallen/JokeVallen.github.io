/**
 * source/js/site-events.js
 * 通用站内事件总线
 */
(function (global) {
    'use strict';

    var listeners = Object.create(null);

    function on(type, fn) {
        if (!type || typeof fn !== 'function') return function () {};
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(fn);
        return function () { off(type, fn); };
    }

    function once(type, fn) {
        var off = on(type, function (detail) {
            off();
            fn(detail);
        });
        return off;
    }

    function off(type, fn) {
        if (!listeners[type]) return;
        listeners[type] = listeners[type].filter(function (item) { return item !== fn; });
    }

    function emit(type, detail) {
        var rows = (listeners[type] || []).slice();
        rows.forEach(function (fn) {
            try { fn(detail); } catch (e) { /* ignore listener errors */ }
        });
        try {
            document.dispatchEvent(new CustomEvent('site:' + type, { detail: detail }));
        } catch (e) { /* ignore */ }
        return rows.length;
    }

    function clear(type) {
        if (type) delete listeners[type];
        else listeners = Object.create(null);
    }

    global.SiteEvents = {
        on: on,
        once: once,
        off: off,
        emit: emit,
        clear: clear
    };
})(window);
