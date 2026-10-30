/**
 * source/js/privacy-notice.js
 * 隐私声明按页面配置显示。
 *
 * 以后新增互动页面，只需要在 includePrefixes 里加一条路径前缀。
 */
(function (global) {
    'use strict';

    var CONFIG = {
        enabled: true,
        // 只有这些页面前缀需要显示隐私声明
        includePrefixes: [
            '/questions/',
            '/mock/',
            '/algorithm/',
            '/stats/'
        ],
        // 优先级高于 includePrefixes
        excludePrefixes: [
            '/privacy/'
        ],
        // 页面内不存在目标容器时不再尝试
        containerSelectors: [
            '#article-container',
            '#page',
            '.post-content',
            '.page-content'
        ],
        title: '隐私说明',
        text: '本页互动输入与模拟记录默认只保存在你的浏览器本地，不会自动上传；面试模拟不录音、不采集麦克风。',
        linkText: '查看完整数据与权限说明',
        linkHref: '/privacy/'
    };

    function matches(path, prefixes) {
        for (var i = 0; i < prefixes.length; i++) {
            if (path.indexOf(prefixes[i]) === 0) return true;
        }
        return false;
    }

    function shouldShow(path) {
        if (!CONFIG.enabled) return false;
        path = path || global.location.pathname;
        if (matches(path, CONFIG.excludePrefixes)) return false;
        return matches(path, CONFIG.includePrefixes);
    }

    function remove() {
        var rows = document.querySelectorAll('.site-privacy-notice');
        for (var i = 0; i < rows.length; i++) rows[i].remove();
    }

    function findContainer() {
        for (var i = 0; i < CONFIG.containerSelectors.length; i++) {
            var el = document.querySelector(CONFIG.containerSelectors[i]);
            if (el) return el;
        }
        return null;
    }

    function render() {
        remove();
        if (!shouldShow()) return false;

        var container = findContainer();
        if (!container) return false;

        var notice = document.createElement('div');
        notice.className = 'site-privacy-notice';
        notice.innerHTML = '<i class="fas fa-shield-alt"></i><div><strong>' +
            CONFIG.title + '</strong>：' + CONFIG.text +
            ' <a href="' + CONFIG.linkHref + '">' + CONFIG.linkText + '</a></div>';
        container.appendChild(notice);
        return true;
    }

    global.SitePrivacyNotice = {
        config: CONFIG,
        shouldShow: shouldShow,
        render: render,
        remove: remove
    };

    function boot() {
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    document.addEventListener('pjax:complete', boot);
})(window);
