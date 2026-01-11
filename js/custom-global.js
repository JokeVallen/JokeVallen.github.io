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