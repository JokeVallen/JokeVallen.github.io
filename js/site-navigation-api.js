/**
 * source/js/site-navigation-api.js
 * 站内语义导航接口
 */
(function (global) {
    'use strict';

    var resolvers = [];

    function current() {
        var path = location.pathname || '/';
        var type = 'page';
        if (/^\/questions\//.test(path)) type = 'questions';
        if (/^\/algorithm\//.test(path)) type = 'algorithm';
        if (/^\/knowledge\//.test(path)) type = 'knowledge';
        if (/^\/mock\//.test(path)) type = 'mock';
        if (/^\/stats\//.test(path)) type = 'stats';
        return {
            url: location.href,
            path: path,
            hash: location.hash || '',
            search: location.search || '',
            type: type,
            title: document.title || ''
        };
    }

    function open(path, options) {
        if (!path) return false;
        options = options || {};
        if (path.charAt(0) !== '/' && !/^https?:\/\//i.test(path)) {
            path = '/' + path;
        }
        if (/^https?:\/\//i.test(path) && path.indexOf(location.origin) !== 0) {
            return false;
        }
        if (window.pjax && typeof window.pjax.loadUrl === 'function' && options.pjax !== false) {
            window.pjax.loadUrl(path);
        } else {
            location.href = path;
        }
        try { SiteEvents.emit('navigation:open', { path: path }); } catch (e) { /* ignore */ }
        return true;
    }

    function back() {
        history.back();
    }

    function forward() {
        history.forward();
    }

    function reload() {
        location.reload();
    }

    function openPost(id) {
        if (!global.SiteContentAPI) return Promise.resolve(false);
        return global.SiteContentAPI.get('document', id).then(function (item) {
            if (!item || !item.path) return false;
            return open(item.path);
        });
    }

    function openQuestion(paperId, questionId) {
        if (!global.SiteContentAPI) return Promise.resolve(false);
        return global.SiteContentAPI.get('paper', paperId).then(function (item) {
            var data = item && item.data ? item.data : null;
            var path = data && (data.path || data.url || data.permalink);
            if (!path) {
                for (var i = 0; i < resolvers.length; i++) {
                    try {
                        var resolved = resolvers[i](paperId, questionId, item);
                        if (resolved) { path = resolved; break; }
                    } catch (e) { /* ignore */ }
                }
            }
            if (!path) return false;
            var target = path;
            if (questionId) target += (target.indexOf('#') === -1 ? '#' : '') + 'q-' + encodeURIComponent(questionId);
            return open(target);
        });
    }

    function registerResolver(fn) {
        if (typeof fn === 'function') resolvers.push(fn);
    }

    global.SiteNavigationAPI = {
        current: current,
        open: open,
        back: back,
        forward: forward,
        reload: reload,
        openPost: openPost,
        openQuestion: openQuestion,
        registerResolver: registerResolver
    };
})(window);
