document.addEventListener("DOMContentLoaded", function () {
  const logoImg = document.querySelector("#nav .site-icon");

  if (!logoImg) {
    console.warn("Logo image element not found.");
    return;
  }

  // 根据博客主题加载不同颜色的logo
  const updateLogo = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    logoImg.src = isDark ? "/images/logo_dark.png" : "/images/logo_light.png";
  };

  // 初始设置
  updateLogo();

  // 如果用户切换模式时触发事件，可以监听它（Butterfly 使用的是 localStorage 记录主题）
  const observer = new MutationObserver(updateLogo);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
});