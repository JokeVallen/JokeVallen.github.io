// --------------------- 鲸鱼娘桌宠加载 ----------------------
(function () {
    function ensurePet() {
        // 宠物是一个 ES 模块入口，内部依赖由 import 自动解析
        if (document.querySelector('script[data-pet-module]')) return;
        const s = document.createElement('script');
        s.type = 'module';
        s.src = '/js/pet/index.js?v=35249d8d';
        s.dataset.petModule = '1';
        document.body.appendChild(s);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensurePet);
    } else {
        ensurePet();
    }
    document.addEventListener('pjax:complete', ensurePet);
})();

// --------------------- 隐私声明 ----------------------
(function () {
    function addPrivacyNotice() {
        return; // privacy notice moved to privacy-notice.js

        const old = document.querySelectorAll('.site-privacy-notice');
        for (let i = 0; i < old.length; i++) old[i].remove();

        const container = document.getElementById('article-container') || document.querySelector('#page');
        if (!container) return;

        const notice = document.createElement('div');
        notice.className = 'site-privacy-notice';
        notice.innerHTML = '<i class="fas fa-shield-alt"></i><div>隐私说明：本页互动输入与模拟记录默认只保存在你的浏览器本地，不会自动上传；面试模拟不录音、不采集麦克风。' +
            '<a href="/privacy/">查看完整数据与权限说明</a></div>';
        container.appendChild(notice);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addPrivacyNotice);
    } else {
        addPrivacyNotice();
    }
    document.addEventListener('pjax:complete', addPrivacyNotice);
})();

// --------------------- 模拟中心按需加载 ----------------------
(function () {
    function ensureMockCenter() {
        if (window.location.pathname.indexOf('/mock/') === -1) return;
        if (document.getElementById('mock-center-script')) return;
        const script = document.createElement('script');
        script.id = 'mock-center-script';
        script.src = '/js/mock-center.js';
        script.defer = true;
        document.body.appendChild(script);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureMockCenter);
    } else {
        ensureMockCenter();
    }
    document.addEventListener('pjax:complete', ensureMockCenter);
})();

// --------------------- 导航栏 ----------------------

// 页面加载时立即设置Logo
(function () {
    const theme = localStorage.getItem('theme') || 'light'; // 默认值
    const html = document.documentElement;

    // 如果localStorage有记录但html标签没有data-theme，则设置上
    if (theme && !html.getAttribute('data-theme')) {
        html.setAttribute('data-theme', theme);
    }

    // 立即更新Logo（针对首次加载）
    const logo = document.querySelector('.site-icon');
    if (logo && theme === 'dark') {
        logo.style.content = "url('/images/logo_dark.png')";
    }
})();

// 监听主题切换（Butterfly通常会在切换后更新localStorage）
document.addEventListener('DOMContentLoaded', function () {
    // 监听storage事件，以便在多个标签页同步
    window.addEventListener('storage', function (e) {
        if (e.key === 'theme') {
            const theme = e.newValue || 'light';
            document.documentElement.setAttribute('data-theme', theme);
        }
    });
});

// ------------------------ end ---------------------------