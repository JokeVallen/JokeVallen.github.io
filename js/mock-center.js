(function () {
    'use strict';

    var STORAGE_KEY = 'mock-center-v1';
    var root = null;
    var countdownId = null;
    var state = {
        tab: 'exam',
        exam: null,
        interview: null
    };
    var store = { history: [] };

    var PAPERS = [
        { title: '初级笔试题卷（一）', level: '初级', meta: '60 客观 + 12 主观', time: '60 分钟', href: '/questions/UnityClient/Junior/junior1_v3.0.0.html' },
        { title: '初级笔试题卷（二）', level: '初级', meta: '60 客观 + 12 主观', time: '60 分钟', href: '/questions/UnityClient/Junior/junior2_v2.0.0.html' },
        { title: '初级笔试题卷（三）', level: '初级', meta: '60 客观 + 12 主观', time: '60 分钟', href: '/questions/UnityClient/Junior/junior3_v2.0.0.html' },
        { title: '中级笔试题卷（一）', level: '中级', meta: '60 客观 + 12 主观', time: '60 分钟', href: '/questions/UnityClient/MidLevel/midlevel1_v2.0.0.html' },
        { title: '高级笔试题卷（一）', level: '高级', meta: '60 客观 + 12 主观', time: '60 分钟', href: '/questions/UnityClient/Senior/senior1_v1.0.0.html' },
        { title: '高级笔试题卷（二）', level: '高级', meta: '60 客观 + 12 主观', time: '60 分钟', href: '/questions/UnityClient/Senior/senior2_v1.0.0.html' },
        { title: 'UGUI 性能专项卷', level: '专项', meta: '30 客观 + 5 主观', time: '30 分钟', href: '/questions/UnityClient/Special/ugui-performance_v1.0.0.html' },
        { title: 'Addressables / AssetBundle 专项卷', level: '专项', meta: '30 客观 + 5 主观', time: '30 分钟', href: '/questions/UnityClient/Special/addressables_v1.0.0.html' },
        { title: 'C# / GC / 异步专项卷', level: '专项', meta: '30 客观 + 5 主观', time: '30 分钟', href: '/questions/UnityClient/Special/csharp-gc-async_v1.0.0.html' },
        { title: '渲染与 URP 专项卷', level: '专项', meta: '30 客观 + 5 主观', time: '30 分钟', href: '/questions/UnityClient/Special/rendering-urp_v1.0.0.html' },
        { title: '网络同步与弱网专项卷', level: '专项', meta: '30 客观 + 5 主观', time: '30 分钟', href: '/questions/UnityClient/Special/network-sync_v1.0.0.html' },
        { title: '资深笔试题卷（一）', level: '资深', meta: '50 客观 + 10 主观', time: '60 分钟', href: '/questions/UnityClient/Principal/principal1_v1.0.0.html' }
    ];

    var QUICK_QUIZ = [
        { category: 'C#', q: '关于 string，正确的说法是？', options: ['可变引用类型', '不可变引用类型', '值类型', '只能存 ASCII'], answer: 1, explain: 'string 是不可变引用类型，每次修改都会产生新对象。' },
        { category: 'C#', q: '接口与抽象类的主要区别是？', options: ['接口可以实例化', '抽象类可以多继承', '一个类可以实现多个接口，但只能继承一个抽象类', '接口不能有方法'], answer: 2, explain: 'C# 单继承类，多实现接口。' },
        { category: 'C#', q: '关于 GC.Collect，正确的是？', options: ['应每帧调用', '只回收非托管内存', '强制回收可能造成卡顿，不应滥用', '会立即释放所有引用对象'], answer: 2, explain: '强制完整回收可能造成卡顿，且不会释放仍有引用的对象。' },
        { category: 'C#', q: 'async void 的主要风险是？', options: ['一定编译失败', '不能使用 await', '只能用于 UI', '异常无法被调用方捕获'], answer: 3, explain: '异常会直接抛到同步上下文，调用方无法 try/catch。' },
        { category: 'Unity', q: 'Awake 与 Start 的执行时机是？', options: ['Awake 在对象激活时，Start 在首次 Update 前', 'Start 先于 Awake', '两者同时', '完全随机'], answer: 0, explain: 'Awake 用于初始化自身引用，Start 在第一帧 Update 前执行。' },
        { category: 'Unity', q: '物理计算应优先放在哪个回调？', options: ['Update', 'FixedUpdate', 'LateUpdate', 'OnGUI'], answer: 1, explain: 'FixedUpdate 按固定时间步长调用，适合物理计算。' },
        { category: 'Unity', q: '对象销毁后，协程通常会怎样？', options: ['继续执行', '无法正常执行', '自动转成线程', '自动保存'], answer: 1, explain: '协程宿主销毁后无法正常执行，清理逻辑应直接执行。' },
        { category: 'UGUI', q: '大量静态 UI 与频繁变化的动态 UI 应？', options: ['放在同一 Canvas', '拆到不同 Canvas', '增加更多 Mask', '每帧重建'], answer: 1, explain: '拆分 Canvas 可缩小批次重建范围。' },
        { category: 'UGUI', q: '装饰性图片和文本通常应该？', options: ['关闭 raycastTarget', '全部开启 raycastTarget', '每帧刷新', '强制使用 Mask'], answer: 0, explain: '只有需要响应点击的元素才开启 raycastTarget。' },
        { category: 'UGUI', q: '滚动列表矩形裁剪应优先使用？', options: ['Mask', 'RectMask2D', 'CanvasGroup', 'GraphicRaycaster'], answer: 1, explain: 'RectMask2D 只做矩形裁剪，通常比 Mask 更轻。' },
        { category: 'UGUI', q: '大列表使用 ScrollRect 时推荐？', options: ['一次性实例化全部 Item', '虚拟滚动 + 对象池', '每帧 ForceRebuildLayout', '所有 Item 用不同 Canvas'], answer: 1, explain: '只创建可视区附近的单元格，滚动时复用。' },
        { category: '资源', q: 'Addressables 释放资源应使用？', options: ['Destroy(handle)', 'GC.Collect()', 'Addressables.Release(handle)', '只调用 UnloadUnusedAssets'], answer: 2, explain: 'Release 减少引用计数，计数归零后才可能卸载。' },
        { category: '资源', q: 'AssetBundle 调用 Unload(true) 的风险是？', options: ['一定安全', '只卸载依赖', '不释放内存', '可能卸载正在使用的资源'], answer: 3, explain: '会销毁已加载 Asset，场景中仍在使用的资源会变成 Missing。' },
        { category: '资源', q: '大量使用 Resources.Load 的主要问题是？', options: ['加载太快', '自动热更', '无法热更且资源常驻包体', '不能加载 Prefab'], answer: 2, explain: 'Resources 资源全部打进安装包，无法热更，且引用不透明。' },
        { category: '性能', q: 'Profiler 中定位 GC 分配应重点看？', options: ['CPU 的 GC Alloc 列', '屏幕分辨率', '网络延迟', '显卡型号'], answer: 0, explain: 'GC Alloc 能定位热点路径上的托管堆分配。' }
    ];

    var INTERVIEW_QUESTIONS = [
        { category: 'C#', difficulty: '基础', q: '值类型和引用类型有什么区别？', points: ['值类型通常存栈上或作为字段内联，赋值复制值', '引用类型对象在托管堆，变量保存引用', '值类型可为 null 需 Nullable<T>', '装箱/拆箱发生在值类型与 object/接口转换时'] },
        { category: 'C#', difficulty: '进阶', q: '什么是闭包？在 Unity 中有什么风险？', points: ['Lambda/匿名方法捕获外部变量形成闭包', '被捕获变量会延长生命周期', '循环中捕获同一变量可能得到相同结果', '事件或异步中的闭包容易造成泄漏'] },
        { category: 'C#', difficulty: '进阶', q: 'GC 的常见分配来源有哪些？如何优化？', points: ['字符串拼接、ToString、LINQ、闭包、装箱', '协程迭代器、params 数组、每次返回新数组', '缓存组件与字符串、NonAlloc API、对象池', '用 Profiler 的 GC Alloc 定位热点'] },
        { category: 'C#', difficulty: '进阶', q: 'async/await 在 Unity 中如何安全使用？', points: ['避免 async void，异常要能捕获', 'CancellationToken 绑定对象生命周期', '异步回来先检查对象是否销毁', 'Unity API 通常只能在主线程访问'] },
        { category: 'C#', difficulty: '基础', q: '委托和事件的区别是什么？', points: ['委托是类型安全的函数指针', '事件是对委托的封装，外部只能 += / -=', '事件发布者控制触发时机', '订阅与退订必须成对'] },
        { category: 'C#', difficulty: '基础', q: '接口和抽象类如何选择？', points: ['接口表达能力/契约，可多实现', '抽象类表达 is-a 与共享实现', '需要公共字段/构造函数时选抽象类', '优先组合与接口，避免过深继承'] },
        { category: 'Unity', difficulty: '基础', q: 'Unity 生命周期函数执行顺序？', points: ['Awake → OnEnable → Start → Update → LateUpdate → OnDisable → OnDestroy', 'Awake 用于自身初始化', 'Start 在首次 Update 前', 'OnDestroy 做退订与释放'] },
        { category: 'Unity', difficulty: '基础', q: 'Update、FixedUpdate、LateUpdate 的区别？', points: ['Update 每帧调用，受帧率影响', 'FixedUpdate 固定时间步长，适合物理', 'LateUpdate 在 Update 后，适合相机跟随', 'Time.timeScale 会影响基于缩放时间的逻辑'] },
        { category: 'Unity', difficulty: '进阶', q: '协程的实现原理是什么？', points: ['基于迭代器与状态机', 'yield return 在每帧/条件满足时恢复', '由 MonoBehaviour 驱动，对象销毁后停止', '复杂异步推荐 UniTask 或 Task'] },
        { category: 'Unity', difficulty: '进阶', q: 'ScriptableObject 的使用场景和注意事项？', points: ['适合配置、数据资产、事件通道', '运行时直接修改可能污染 Editor 资产', '需要运行时副本时 Instantiate', '注意资源引用与版本管理'] },
        { category: 'Unity', difficulty: '进阶', q: '对象池如何设计？', points: ['Get/Release 配对，防重复释放', '复用时重置状态、事件、动画、计时器', '设置容量上限与预热', '场景切换时清理池'] },
        { category: 'Unity', difficulty: '进阶', q: '如何排查 Unity 性能问题？', points: ['先用 Profiler 分 CPU/GPU/GC/内存', 'Frame Debugger 看 DrawCall 与批次', 'Memory Profiler 抓快照看引用链', '最终以真机持续测试为准'] },
        { category: 'UGUI', difficulty: '进阶', q: 'Canvas 重建的两种类型是什么？如何优化？', points: ['Layout Rebuild 与 Graphic Rebuild', '布局变化会触发布局重建', '顶点/颜色/材质变化触发图形重建', '拆分静态与动态 Canvas，减少尺寸变化'] },
        { category: 'UGUI', difficulty: '进阶', q: 'UGUI 合批会被什么打断？', points: ['纹理/材质不同', 'Mask 等状态切换', 'Canvas 层级与渲染顺序穿插', '用 Frame Debugger 定位具体原因'] },
        { category: 'UGUI', difficulty: '基础', q: 'raycastTarget 对性能有什么影响？', points: ['GraphicRaycaster 会收集并排序可命中元素', '装饰性元素应关闭', '只有需要点击的 UI 才开启', '过多会增加点击检测成本'] },
        { category: 'UGUI', difficulty: '进阶', q: 'ScrollRect 大列表如何优化？', points: ['虚拟滚动只创建可视区 Item', '对象池复用单元格', '避免 LayoutGroup 全量重建', 'RectMask2D 裁剪，滚动节流'] },
        { category: 'UGUI', difficulty: '进阶', q: 'TMP 中文字体图集频繁扩容怎么处理？', points: ['预生成常用字符集', '配置 Fallback 字体', '按语言/模块拆分图集', '避免运行时随机生僻字'] },
        { category: '资源', difficulty: '进阶', q: 'Resources、AssetBundle、Addressables 如何选择？', points: ['Resources 简单但无法热更、包体膨胀', 'AssetBundle 灵活但需自管依赖与引用', 'Addressables 封装 Catalog/异步/引用计数', '按项目规模与热更需求选择'] },
        { category: '资源', difficulty: '进阶', q: 'Addressables 的引用计数如何工作？', points: ['Load 增加引用计数', 'Release 减少引用计数', '归零后才可能卸载', 'InstantiateAsync 要用 ReleaseInstance'] },
        { category: '资源', difficulty: '进阶', q: '热更新方案如何选型？', points: ['资源热更：Addressables/AB + CDN', '代码热更：Lua、ILRuntime、HybridCLR', '需考虑版本一致性、灰度、回滚', 'iOS 审核与平台合规'] },
        { category: '资源', difficulty: '进阶', q: '如何排查资源内存泄漏？', points: ['Memory Profiler 抓快照对比', '查看引用链找持有者', '检查 Addressables 句柄、静态事件、对象池', 'Resources.UnloadUnusedAssets 不能清理有引用资源'] },
        { category: '架构', difficulty: '进阶', q: '如何设计 Unity 项目的分层架构？', points: ['表现层、应用层、领域层、基础设施层', '依赖指向稳定抽象', 'UI 不直接访问网络/存档', '用 asmdef 明确模块边界'] },
        { category: '架构', difficulty: '进阶', q: '事件总线有什么优缺点？', points: ['优点：模块解耦、广播方便', '缺点：依赖隐式、调试困难', '订阅必须绑定生命周期并退订', '异常隔离与重复订阅要处理'] },
        { category: '架构', difficulty: '进阶', q: 'MVC 与 MVVM 在 Unity 中如何落地？', points: ['View 负责显示与控件引用', 'Presenter/ViewModel 处理状态与交互', 'Model 负责业务规则', '避免 View 与逻辑耦合，及时取消绑定'] },
        { category: '架构', difficulty: '进阶', q: '状态机适合解决什么问题？', points: ['对象状态互斥且转换明确', 'FSM 适合简单状态', 'HFSM/状态栈适合复杂层级与暂停恢复', '状态退出要清理计时器与事件'] },
        { category: '网络', difficulty: '进阶', q: 'TCP 和 UDP 如何选择？', points: ['TCP 可靠有序，适合登录/配置/存档', 'UDP 低延迟，适合实时战斗', 'KCP 在 UDP 上做可靠传输', '按业务实时性与可靠性取舍'] },
        { category: '网络', difficulty: '进阶', q: '帧同步和状态同步的区别？', points: ['帧同步传输入，客户端确定性演算', '状态同步传服务器权威状态', '帧同步适合回放与低带宽', '状态同步更容易防作弊'] },
        { category: '网络', difficulty: '进阶', q: '断线重连如何设计？', points: ['会话 token 与重连退避', '恢复角色/房间状态', '消息幂等与序列号', '心跳、超时、弱网测试'] },
        { category: '算法', difficulty: '基础', q: '二分查找的边界如何写对？', points: ['先明确区间开闭语义', 'mid 取整方式与收缩方向一致', '循环不变量保持答案在区间内', '返回 left/right 要结合 lower_bound/upper_bound'] },
        { category: '算法', difficulty: '进阶', q: '滑动窗口适合什么题型？', points: ['连续子数组/子串', '窗口扩张与收缩有单调性', '用哈希表/计数维护窗口状态', '注意左指针不能回退'] },
        { category: '算法', difficulty: '进阶', q: '动态规划解题步骤是什么？', points: ['定义状态与含义', '推导转移方程', '确定初始化与遍历顺序', '处理边界并考虑空间压缩'] },
        { category: '项目', difficulty: '行为', q: '讲一个你解决过的最有挑战的技术问题。', points: ['背景与目标', '你的排查过程与关键判断', '方案取舍与落地结果', '复盘与可复用经验'] }
    ];

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function pad2(n) { return n < 10 ? '0' + n : '' + n; }

    function formatTime(sec) {
        sec = Math.max(0, sec);
        return pad2(Math.floor(sec / 60)) + ':' + pad2(sec % 60);
    }

    function todayStr() {
        var d = new Date();
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function loadStore() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            var data = raw ? JSON.parse(raw) : null;
            if (data && Array.isArray(data.history)) store = { history: data.history.slice(0, 80) };
        } catch (e) { store = { history: [] }; }
    }

    function saveStore() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
    }

    function addHistory(record) {
        record.date = todayStr();
        store.history.unshift(record);
        store.history = store.history.slice(0, 80);
        saveStore();
    }

    function getStats() {
        var exam = store.history.filter(function (r) { return r.type === 'exam'; });
        var interview = store.history.filter(function (r) { return r.type === 'interview'; });
        var totalScore = 0, totalQuestions = 0;
        exam.forEach(function (r) { totalScore += r.score || 0; totalQuestions += r.total || 0; });
        return {
            total: store.history.length,
            examCount: exam.length,
            interviewCount: interview.length,
            accuracy: totalQuestions ? Math.round(totalScore / totalQuestions * 100) : 0
        };
    }

    function stopTimer() {
        if (countdownId !== null) {
            clearInterval(countdownId);
            countdownId = null;
        }
    }

    function startTimer(kind) {
        stopTimer();
        countdownId = setInterval(function () {
            if (kind === 'exam' && state.exam && !state.exam.finished) {
                state.exam.secondsLeft -= 1;
                var examEl = document.getElementById('mock-exam-timer');
                if (examEl) examEl.textContent = formatTime(state.exam.secondsLeft);
                if (state.exam.secondsLeft <= 0) finishExam();
            } else if (kind === 'interview' && state.interview && !state.interview.finished) {
                state.interview.secondsLeft -= 1;
                var interviewEl = document.getElementById('mock-interview-timer');
                if (interviewEl) interviewEl.textContent = formatTime(state.interview.secondsLeft);
                if (state.interview.secondsLeft <= 0) {
                    stopTimer();
                    state.interview.revealed = true;
                    render();
                }
            }
        }, 1000);
    }

    function shellHtml() {
        var s = getStats();
        return [
            '<section class="mock-hero">',
            '  <div class="mock-hero-copy">',
            '    <span class="mock-kicker">MOCK CENTER</span>',
            '    <h1>笔试 / 面试模拟</h1>',
            '    <p>用限时自测暴露盲区，用随机面试题训练表达。答案和评级只保存在本地浏览器。</p>',
            '  </div>',
            '  <div class="mock-stats">',
            '    <div class="mock-stat"><strong>' + s.total + '</strong><span>模拟次数</span></div>',
            '    <div class="mock-stat"><strong>' + s.accuracy + '%</strong><span>笔试正确率</span></div>',
            '    <div class="mock-stat"><strong>' + s.interviewCount + '</strong><span>面试练习</span></div>',
            '  </div>',
            '</section>',
            '<nav class="mock-tabs">',
            '  <button type="button" class="mock-tab' + (state.tab === 'exam' ? ' is-active' : '') + '" data-action="tab" data-tab="exam"><i class="fas fa-file-signature"></i> 笔试模拟</button>',
            '  <button type="button" class="mock-tab' + (state.tab === 'interview' ? ' is-active' : '') + '" data-action="tab" data-tab="interview"><i class="fas fa-comments"></i> 面试模拟</button>',
            '  <button type="button" class="mock-tab' + (state.tab === 'history' ? ' is-active' : '') + '" data-action="tab" data-tab="history"><i class="fas fa-history"></i> 模拟记录</button>',
            '</nav>'
        ].join('');
    }

    function render() {
        if (!root) return;
        var html = shellHtml();
        if (state.tab === 'exam') html += examTabHtml();
        else if (state.tab === 'interview') html += interviewTabHtml();
        else html += historyHtml();
        root.innerHTML = html;
    }

    function examTabHtml() {
        if (state.exam) {
            return state.exam.finished ? examResultHtml() : examQuestionHtml();
        }
        var paperHtml = PAPERS.map(function (p) {
            return [
                '<a class="mock-paper" href="' + escapeHtml(p.href) + '">',
                '  <div class="mock-paper-top"><span class="mock-badge">' + escapeHtml(p.level) + '</span><span class="mock-paper-time"><i class="far fa-clock"></i> ' + escapeHtml(p.time) + '</span></div>',
                '  <h3>' + escapeHtml(p.title) + '</h3>',
                '  <p>' + escapeHtml(p.meta) + '</p>',
                '  <span class="mock-paper-link">进入试卷 <i class="fas fa-arrow-right"></i></span>',
                '</a>'
            ].join('');
        }).join('');

        return [
            '<section class="mock-section">',
            '  <div class="mock-section-head"><div><span class="mock-kicker">QUICK TEST</span><h2>快速笔试自测</h2></div><p>随机 10 道单选 · 10 分钟 · 自动判分</p></div>',
            '  <div class="mock-quick-card">',
            '    <div><h3>先来一组短测，看看当前手感</h3><p>覆盖 C#、Unity、UGUI、资源、性能。题目从题库中随机抽取，交卷后看错题解析。</p></div>',
            '    <button type="button" class="mock-btn mock-btn-primary" data-action="exam-start"><i class="fas fa-play"></i> 开始快速自测</button>',
            '  </div>',
            '</section>',
            '<section class="mock-section">',
            '  <div class="mock-section-head"><div><span class="mock-kicker">FULL PAPER</span><h2>完整试卷模拟</h2></div><p>进入原试卷，使用计时器和答题卡完成整卷</p></div>',
            '  <div class="mock-paper-grid">' + paperHtml + '</div>',
            '</section>'
        ].join('');
    }

    function examQuestionHtml() {
        var q = state.exam.questions[state.exam.index];
        var selected = state.exam.answers[state.exam.index];
        var options = q.options.map(function (opt, i) {
            return '<button type="button" class="mock-option' + (selected === i ? ' is-selected' : '') + '" data-action="exam-select" data-opt="' + i + '"><span class="mock-option-key">' + String.fromCharCode(65 + i) + '</span>' + escapeHtml(opt) + '</button>';
        }).join('');
        var isLast = state.exam.index === state.exam.questions.length - 1;
        return [
            '<section class="mock-quiz-shell">',
            '  <div class="mock-quiz-top">',
            '    <span class="mock-badge">' + escapeHtml(q.category) + '</span>',
            '    <span class="mock-progress-text">第 ' + (state.exam.index + 1) + ' / ' + state.exam.questions.length + ' 题</span>',
            '    <span class="mock-timer" id="mock-exam-timer"><i class="far fa-clock"></i> ' + formatTime(state.exam.secondsLeft) + '</span>',
            '  </div>',
            '  <div class="mock-progress-bar"><span style="width:' + Math.round((state.exam.index + 1) / state.exam.questions.length * 100) + '%"></span></div>',
            '  <h2 class="mock-question">' + escapeHtml(q.q) + '</h2>',
            '  <div class="mock-options">' + options + '</div>',
            '  <div class="mock-quiz-actions">',
            '    <button type="button" class="mock-btn" data-action="exam-prev"' + (state.exam.index === 0 ? ' disabled' : '') + '>上一题</button>',
            isLast
                ? '<button type="button" class="mock-btn mock-btn-primary" data-action="exam-finish">交卷</button>'
                : '<button type="button" class="mock-btn mock-btn-primary" data-action="exam-next">下一题</button>',
            '  </div>',
            '</section>'
        ].join('');
    }

    function examResultHtml() {
        var e = state.exam;
        var wrong = [];
        e.questions.forEach(function (q, i) {
            if (e.answers[i] !== q.answer) wrong.push({ q: q, your: e.answers[i] });
        });
        var wrongHtml = wrong.map(function (item) {
            var yourText = item.your == null ? '未作答' : String.fromCharCode(65 + item.your) + '. ' + item.q.options[item.your];
            return [
                '<div class="mock-wrong-item">',
                '  <h4>' + escapeHtml(item.q.q) + '</h4>',
                '  <p class="mock-wrong-your">你的答案：' + escapeHtml(yourText) + '</p>',
                '  <p class="mock-wrong-answer">正确答案：' + String.fromCharCode(65 + item.q.answer) + '. ' + escapeHtml(item.q.options[item.q.answer]) + '</p>',
                '  <p class="mock-explain">' + escapeHtml(item.q.explain) + '</p>',
                '</div>'
            ].join('');
        }).join('') || '<p class="mock-empty-line">全对，没有错题。</p>';

        return [
            '<section class="mock-result">',
            '  <div class="mock-result-score"><strong>' + e.score + '</strong><span>/ ' + e.questions.length + ' 题</span></div>',
            '  <h2>' + (e.score === e.questions.length ? '满分，状态不错。' : '交卷完成，先看错题。') + '</h2>',
            '  <p class="mock-result-sub">用时 ' + formatTime(e.usedSeconds || 0) + '，错题会自动展示解析。</p>',
            '  <div class="mock-result-actions">',
            '    <button type="button" class="mock-btn mock-btn-primary" data-action="exam-start">再测一次</button>',
            '    <button type="button" class="mock-btn" data-action="exam-home">返回笔试模拟</button>',
            '  </div>',
            '  <div class="mock-wrong-list">' + wrongHtml + '</div>',
            '</section>'
        ].join('');
    }

    function interviewTabHtml() {
        if (state.interview) {
            return state.interview.finished ? interviewResultHtml() : interviewQuestionHtml();
        }
        var categories = ['全部'].concat(Array.from(new Set(INTERVIEW_QUESTIONS.map(function (q) { return q.category; }))));
        var categoryHtml = categories.map(function (c) {
            return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>';
        }).join('');
        return [
            '<section class="mock-section">',
            '  <div class="mock-section-head"><div><span class="mock-kicker">INTERVIEW DRILL</span><h2>面试随机抽题</h2></div><p>每题 60 秒思考，再展开参考要点自评</p></div>',
            '  <div class="mock-interview-setup">',
            '    <label>方向<select id="mock-interview-category">' + categoryHtml + '</select></label>',
            '    <label>题数<select id="mock-interview-count"><option value="5">5 题</option><option value="10" selected>10 题</option><option value="15">15 题</option></select></label>',
            '    <button type="button" class="mock-btn mock-btn-primary" data-action="interview-start"><i class="fas fa-microphone"></i> 开始模拟</button>',
            '  </div>',
            '  <div class="mock-tips">',
            '    <h3>面试表达小提示</h3>',
            '    <p>先给结论，再讲原因和取舍，最后补一个项目例子。不会的题不要硬编，明确说思路和边界。</p>',
            '  </div>',
            '</section>'
        ].join('');
    }

    function interviewQuestionHtml() {
        var item = state.interview.questions[state.interview.index];
        var points = item.points.map(function (p) { return '<li>' + escapeHtml(p) + '</li>'; }).join('');
        var reveal = state.interview.revealed
            ? '<div class="mock-points"><h3>参考要点</h3><ul>' + points + '</ul></div>' +
              '<div class="mock-rate-row">' +
              '  <button type="button" class="mock-btn mock-rate-forgot" data-action="interview-rate" data-rate="forgot">不会</button>' +
              '  <button type="button" class="mock-btn mock-rate-fuzzy" data-action="interview-rate" data-rate="fuzzy">模糊</button>' +
              '  <button type="button" class="mock-btn mock-rate-known" data-action="interview-rate" data-rate="known">掌握</button>' +
              '</div>'
            : '<button type="button" class="mock-btn mock-btn-primary" data-action="interview-reveal"><i class="fas fa-eye"></i> 查看参考要点</button>';

        return [
            '<section class="mock-interview-card">',
            '  <div class="mock-quiz-top">',
            '    <span class="mock-badge">' + escapeHtml(item.category) + '</span>',
            '    <span class="mock-badge mock-badge-soft">' + escapeHtml(item.difficulty) + '</span>',
            '    <span class="mock-progress-text">第 ' + (state.interview.index + 1) + ' / ' + state.interview.questions.length + ' 题</span>',
            '    <span class="mock-timer" id="mock-interview-timer"><i class="far fa-clock"></i> ' + formatTime(state.interview.secondsLeft) + '</span>',
            '  </div>',
            '  <div class="mock-progress-bar"><span style="width:' + Math.round((state.interview.index + 1) / state.interview.questions.length * 100) + '%"></span></div>',
            '  <h2 class="mock-question">' + escapeHtml(item.q) + '</h2>',
            '  <p class="mock-question-tip">先口述 1~2 分钟，再展开参考要点。自评结果只影响本地统计。</p>',
            reveal,
            '</section>'
        ].join('');
    }

    function interviewResultHtml() {
        var data = state.interview;
        var known = data.ratings.filter(function (r) { return r === 'known'; }).length;
        var fuzzy = data.ratings.filter(function (r) { return r === 'fuzzy'; }).length;
        var forgot = data.ratings.filter(function (r) { return r === 'forgot'; }).length;
        return [
            '<section class="mock-result">',
            '  <div class="mock-result-score"><strong>' + known + '</strong><span>/ ' + data.questions.length + ' 题掌握</span></div>',
            '  <h2>面试模拟完成</h2>',
            '  <p class="mock-result-sub">掌握 ' + known + ' 题，模糊 ' + fuzzy + ' 题，不会 ' + forgot + ' 题。</p>',
            '  <div class="mock-result-actions">',
            '    <button type="button" class="mock-btn mock-btn-primary" data-action="interview-start-again">再练一组</button>',
            '    <button type="button" class="mock-btn" data-action="interview-home">返回面试模拟</button>',
            '  </div>',
            '</section>'
        ].join('');
    }

    function historyHtml() {
        if (!store.history.length) {
            return '<section class="mock-result"><h2>还没有模拟记录</h2><p class="mock-result-sub">完成一次快速笔试或面试模拟后，记录会出现在这里。</p></section>';
        }
        var rows = store.history.map(function (r) {
            var result = r.type === 'exam' ? (r.score + '/' + r.total + ' 题') : (r.known + ' 题掌握');
            return '<div class="mock-history-row"><div><strong>' + escapeHtml(r.title) + '</strong><span>' + escapeHtml(r.date) + '</span></div><b>' + escapeHtml(result) + '</b></div>';
        }).join('');
        return [
            '<section class="mock-section">',
            '  <div class="mock-section-head"><div><span class="mock-kicker">HISTORY</span><h2>模拟记录</h2></div><button type="button" class="mock-btn mock-btn-small" data-action="history-clear">清空记录</button></div>',
            '  <div class="mock-history">' + rows + '</div>',
            '</section>'
        ].join('');
    }

    function startExam() {
        var questions = shuffle(QUICK_QUIZ).slice(0, Math.min(10, QUICK_QUIZ.length));
        state.exam = {
            questions: questions,
            index: 0,
            answers: questions.map(function () { return null; }),
            secondsLeft: 600,
            usedSeconds: 0,
            finished: false,
            score: 0
        };
        state.tab = 'exam';
        render();
        startTimer('exam');
    }

    function finishExam() {
        if (!state.exam || state.exam.finished) return;
        stopTimer();
        var e = state.exam;
        var score = 0;
        e.questions.forEach(function (q, i) { if (e.answers[i] === q.answer) score++; });
        e.score = score;
        e.usedSeconds = 600 - Math.max(0, e.secondsLeft);
        e.finished = true;
        addHistory({ type: 'exam', title: '快速笔试自测', score: score, total: e.questions.length });
        render();
    }

    function startInterview() {
        var categoryEl = document.getElementById('mock-interview-category');
        var countEl = document.getElementById('mock-interview-count');
        var category = categoryEl ? categoryEl.value : '全部';
        var count = countEl ? parseInt(countEl.value, 10) || 10 : 10;
        var pool = INTERVIEW_QUESTIONS.filter(function (q) { return category === '全部' || q.category === category; });
        if (!pool.length) pool = INTERVIEW_QUESTIONS.slice();
        var questions = shuffle(pool).slice(0, Math.min(count, pool.length));
        state.interview = {
            questions: questions,
            index: 0,
            revealed: false,
            secondsLeft: 60,
            ratings: [],
            finished: false
        };
        state.tab = 'interview';
        render();
        startTimer('interview');
    }

    function rateInterview(rating) {
        if (!state.interview || state.interview.finished) return;
        state.interview.ratings.push(rating);
        if (state.interview.index >= state.interview.questions.length - 1) {
            finishInterview();
            return;
        }
        state.interview.index += 1;
        state.interview.revealed = false;
        state.interview.secondsLeft = 60;
        render();
    }

    function finishInterview() {
        if (!state.interview || state.interview.finished) return;
        stopTimer();
        var data = state.interview;
        data.finished = true;
        var known = data.ratings.filter(function (r) { return r === 'known'; }).length;
        addHistory({
            type: 'interview',
            title: '面试模拟 · ' + (data.questions[0] ? data.questions[0].category : '综合'),
            known: known,
            total: data.questions.length
        });
        render();
    }

    function bind() {
        root.addEventListener('click', function (e) {
            var el = e.target.closest ? e.target.closest('[data-action]') : null;
            if (!el || !root.contains(el)) return;
            var action = el.getAttribute('data-action');

            if (action === 'tab') {
                stopTimer();
                state.tab = el.getAttribute('data-tab') || 'exam';
                state.exam = null;
                state.interview = null;
                render();
                return;
            }
            if (action === 'exam-start') {
                startExam();
                return;
            }
            if (action === 'exam-select') {
                if (!state.exam || state.exam.finished) return;
                state.exam.answers[state.exam.index] = parseInt(el.getAttribute('data-opt'), 10);
                render();
                return;
            }
            if (action === 'exam-prev') {
                if (state.exam && state.exam.index > 0) { state.exam.index -= 1; render(); }
                return;
            }
            if (action === 'exam-next') {
                if (state.exam && state.exam.index < state.exam.questions.length - 1) { state.exam.index += 1; render(); }
                return;
            }
            if (action === 'exam-finish') {
                finishExam();
                return;
            }
            if (action === 'exam-home') {
                state.exam = null;
                render();
                return;
            }
            if (action === 'interview-start') {
                startInterview();
                return;
            }
            if (action === 'interview-start-again') {
                state.interview = null;
                render();
                return;
            }
            if (action === 'interview-reveal') {
                if (state.interview) { state.interview.revealed = true; render(); }
                return;
            }
            if (action === 'interview-rate') {
                rateInterview(el.getAttribute('data-rate') || 'fuzzy');
                return;
            }
            if (action === 'interview-home') {
                state.interview = null;
                render();
                return;
            }
            if (action === 'history-clear') {
                if (window.confirm('确定清空所有模拟记录吗？')) {
                    store.history = [];
                    saveStore();
                    render();
                }
            }
        });
    }

    function init() {
        root = document.getElementById('mock-center-app');
        if (!root) return;
        loadStore();
        if (!root.dataset.bound) {
            root.dataset.bound = 'true';
            bind();
        }
        stopTimer();
        state.exam = null;
        state.interview = null;
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    document.addEventListener('pjax:complete', init);
    document.addEventListener('pjax:end', init);
    document.addEventListener('pjax:send', stopTimer);
})();
