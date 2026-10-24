/*!
 * 博客宠物 · 大肥鱼（鲸鱼娘）
 *
 * 播放器与调度逻辑移植自 PC2005-cloud/dsh-pet：
 *   - 选择逻辑  ← src/shared/pickers.ts   (pick / pickWeightedCategory / rollKind / pickCategoryAction)
 *   - 播放器    ← src/client/pet.ts       (switchTo / onReady / setOnce / handleEnded)
 *   - 动画池    ← assets/config.jsonc     (animations.idle / categories / events，按本站素材裁剪)
 *
 * 与仓库实现保持一致的三条约定：
 *   1. 双缓冲：两个 <video> 轮流当前台，换源在后台元素上做，解码完成后才交换；
 *   2. 换源必须拆掉旧元素上的 onended，否则旧片尾会触发新一轮切换（仓库注释里叫"拆雷"）；
 *   3. 待机是循环片，所以需要一个定时器定期重掷，而不是等 ended。
 *
 * 纯前端，不调用任何外部接口、不需要 API Key。
 * 素材署名见 PET_CREDITS.md。
 */
(function () {
    'use strict';

    /* ==================== 条目配置（对应 config.jsonc 条目级字段） ==================== */
    var CONFIG = {
        name: '大肥鱼',
        storageKey: 'deepseek-pet-v4',
        animDir: '/images/pet/anim/',
        image: '/images/pet/anim/poster.webp',   // 首帧占位 / 不支持 WebM 时的静帧
        idleRollMs: [9000, 21000],               // 待机多久后重新掷一次
        idleSleepMs: 150000,                     // 无操作多久后睡着
        fullnessDecayPerDay: 12,
        draggable: true
    };

    /* ==================== 动画池（对应 animations.*） ==================== */
    var ANIMATIONS = {
        idle: ['idle'],
        clicks: ['click-happy', 'click-shy', 'click-wave'],
        drag: 'drag',
        events: { sleep: 'sleep', eat: 'eat' },
        categories: [
            { id: '小动作', weight: 60, actions: ['look', 'yawn', 'stretch', 'hum', 'doze'] },
            { id: '玩耍', weight: 40, actions: ['tail', 'bubbles'] }
        ],
        // 夜间：安静一点，打盹和哈欠为主，不闹腾
        nightCategories: [
            { id: '打盹', weight: 70, actions: ['doze', 'yawn', 'look'] },
            { id: '安静', weight: 30, actions: ['hum', 'tail'] }
        ]
    };

    /* 顶层权重（对应 animationWeights）。博客里的宠物是"固定"的：
       不走路、不转向，所以 turn / move 设为 0，份额自然并入 action。 */
    var WEIGHTS = { idle: 10, turn: 0, move: 0 };

    /* ==================== 选择逻辑（移植自 src/shared/pickers.ts） ==================== */
    function pick(pool, exclude) {
        var entries = exclude ? pool.filter(function (n) { return n !== exclude; }) : pool;
        var src = entries.length ? entries : pool;
        return src[Math.floor(Math.random() * src.length)];
    }

    function pickWeightedCategory(categories, facing) {
        var cats = categories.filter(function (c) { return c.actions.length > 0; });
        if (!cats.length) return null;
        var filtered = cats.filter(function (c) { return !(c.noMirror && facing === 'right'); });
        var eligible = filtered.length ? filtered : cats;
        var total = 0;
        eligible.forEach(function (c) { total += c.weight; });
        total = total || 1;
        var t = Math.random() * total;
        for (var i = 0; i < eligible.length; i++) {
            t -= eligible[i].weight;
            if (t <= 0) return eligible[i];
        }
        return eligible[eligible.length - 1];
    }

    function rollKind(roll, w, opts) {
        var turn = (opts && opts.fixed) ? 0 : w.turn;
        var move = (opts && opts.fixed) ? 0 : w.move;
        var topEnd = (w.idle + turn + move) / 100;
        if (roll < w.idle / 100) return 'idle';
        if (roll < (w.idle + turn) / 100) return 'turn';
        if (roll < topEnd) return 'move';
        return 'action';
    }

    function pickCategoryAction(categories, idlePool, facing, current) {
        var cat = pickWeightedCategory(categories, facing);
        if (!cat) return { id: 'FALLBACK', name: pick(idlePool, current) };
        return { id: cat.id, name: pick(cat.actions, current) };
    }

    /* ==================== 小工具 ==================== */
    function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
    function randInt(min, max) { return Math.floor(min + Math.random() * (max - min)); }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function todayStr() {
        var d = new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }
    function daysBetween(a, b) {
        var m1 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(a || '');
        var m2 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(b || '');
        if (!m1 || !m2) return 0;
        return Math.max(0, Math.round((Date.UTC(+m2[1], +m2[2] - 1, +m2[3]) - Date.UTC(+m1[1], +m1[2] - 1, +m1[3])) / 86400000));
    }

    /* ==================== 素材缓存 ====================
     * 每次互动都要 fetch → blob → 解码 才换源，会有 100~300ms 延迟。
     * 这里把每段动画解码成常驻 blob URL：第一次互动之前就预热好，之后切换是 0 网络。
     * 缓存里的 URL 共享给两个 <video>，所以终生不 revoke（14 段 ~2MB，留着更划算）。
     */
    var clipCache = Object.create(null);

    function preloadClips() {
        var order = [
            'click-happy', 'click-shy', 'click-wave', 'drag', 'eat', 'tail',
            'look', 'doze', 'yawn', 'stretch', 'hum', 'bubbles', 'sleep'
        ];
        var i = 0;
        function next() {
            if (i >= order.length) return;
            var name = order[i++];
            if (clipCache[name]) { setTimeout(next, 40); return; }
            fetch(CONFIG.animDir + name + '.webm', { cache: 'force-cache' })
                .then(function (r) { return r.ok ? r.blob() : null; })
                .then(function (b) {
                    if (b) {
                        clipCache[name] = URL.createObjectURL(b);
                        // 缓存一到位就把它装到后台屏，别等固定延时（之前 2.6s 时常还没下完）
                        if (player && (name === 'drag' || name.indexOf('click') === 0)) {
                            try { player.warm(name); } catch (e) { /* ignore */ }
                        }
                    }
                })
                .catch(function () { /* 单段失败不影响其它 */ })
                .then(function () { setTimeout(next, 180); });
        }
        setTimeout(next, 1200);   // 让待机先占带宽
    }

    /* ==================== 播放器（移植自 src/client/pet.ts） ==================== */
    function createPlayer(stage) {
        var els = [];
        var front = 0;      // 当前前台元素下标
        var token = 0;      // 换代号：过期回调直接丢弃
        var current = '';   // 当前动画名
        var mirror = false;
        var onEnded = null;

        function makeEl() {
            var v = document.createElement('video');
            v.className = 'dp-video';
            v.muted = true;
            v.defaultMuted = true;
            v.playsInline = true;
            v.setAttribute('muted', '');
            v.setAttribute('playsinline', '');
            v.setAttribute('webkit-playsinline', '');
            v.setAttribute('aria-hidden', 'true');
            v.preload = 'auto';
            return v;
        }

        for (var i = 0; i < 2; i++) {
            els.push(makeEl());
            stage.appendChild(els[i]);
        }

        function handleEnded() {
            if (onEnded) onEnded(current);
        }

        /**
         * 换到某个动画。
         * @param {string} name   动画名
         * @param {boolean} once  true = 播一遍；false = 循环
         * @param {Function} [done] 播完后的回调（仅 once 有效）
         */
        /** 换层级：两块屏都解码好了，这里只挪 is-front，不重新 load */
        function promote(el, once) {
            var old = els[front];
            if (old && old !== el) {
                old.onended = null;
                old.onerror = null;
                old.classList.remove('is-front');
                old.pause();
            }
            el.classList.add('is-front');
            stage.classList.add('is-ready');
            front = els.indexOf(el);
            el.loop = !once;
            el.onended = once ? handleEnded : null;
            el.playbackRate = once ? 1.22 : 1;
            el.style.transform = mirror ? 'scaleX(-1)' : '';
            try { el.currentTime = 0; } catch (e) { /* ignore */ }
            var pp = el.play();
            if (pp && pp.catch) pp.catch(function () {});
            // 换层后把空闲屏重新预热成"被抓起"，下一次拖拽仍零等待
            setTimeout(function () {
                var free = els[front ^ 1];
                if (!free || !clipCache["drag"]) return;
                if (free.getAttribute("data-clip") === "drag") return;
                free.setAttribute("data-clip", "drag");
                free.src = clipCache["drag"];
                free.loop = true;
                free.load();
                var wp2 = free.play();
                if (wp2 && wp2.catch) wp2.catch(function () {});
                setTimeout(function () { try { free.pause(); } catch (e) { /* ignore */ } }, 220);
            }, 400);
        }

        function play(name, once, done) {
            if (!name) return;

            // 快速通道：另一块屏上已经备好这一段 → 直接换层，省掉 load + 等首帧
            for (var qi = 0; qi < els.length; qi++) {
                if (els[qi].getAttribute('data-clip') === name && els[qi].readyState >= 2) {
                    current = name;
                    onEnded = once ? function () { if (done) done(); } : null;
                    promote(els[qi], once);
                    return;
                }
            }

            var gen = ++token;
            var el = els[front ^ 1];          // 后台元素
            var url = CONFIG.animDir + name + '.webm';
            current = name;
            el.setAttribute('data-clip', name);
            onEnded = once ? function () { if (done) done(); } : null;

            // 命中缓存：同步换源，交互没有网络等待
            if (clipCache[name]) {
                el.src = clipCache[name];
                el.load();
                arm(el, gen, once);
                return;
            }

            fetch(url, { cache: 'force-cache' })
                .then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.blob();
                })
                .then(function (blob) {
                    if (gen !== token) return;
                    if (!clipCache[name]) clipCache[name] = URL.createObjectURL(blob);
                    el.src = clipCache[name];
                    el.load();
                    arm(el, gen, once);
                })
                .catch(function (err) {
                    if (gen !== token) return;
                    console.warn('[pet] 动画加载失败：' + name, err);
                    if (done) done();          // 兜底：别把链断在这儿
                });
        }

        function arm(el, gen, once) {
            function onReady() {
                el.removeEventListener('loadeddata', onReady);
                if (gen !== token) return;

                var old = els[front];
                if (old && old !== el) {
                    // 拆雷：旧元素上残留的 ended 会在被换下后继续触发切换，形成连环跳切
                    old.onended = null;
                    old.onerror = null;
                    old.classList.remove('is-front');
                    old.pause();
                }
                el.classList.add('is-front');
                stage.classList.add('is-ready');
                front = front ^ 1;

                el.loop = !once;
                // 一次性动作稍微提一点速，抵消素材本身的慢节奏；待机保持 1.0 不动
                el.playbackRate = once ? 1.22 : 1;
                el.onended = once ? handleEnded : null;
                el.style.transform = mirror ? 'scaleX(-1)' : '';

                var p = el.play();
                if (p && p.catch) p.catch(function () { /* 自动播放被拦：保留首帧 */ });
            }
            el.addEventListener('loadeddata', onReady);
        }

        return {
            play: play,
            name: function () { return current; },
            setMirror: function (v) { mirror = !!v; },
            /** 预热：把一段动画装到后台屏并停在第一帧，等着被快速通道直接换上来 */
            warm: function (name) {
                if (!clipCache[name]) return false;
                var el = els[front ^ 1];
                if (!el || el.getAttribute('data-clip') === name) return false;
                if (el.classList.contains('is-front')) return false;
                el.setAttribute('data-clip', name);
                el.src = clipCache[name];
                el.loop = true;
                el.load();
                // 播一下再停：确保解码器真的产出一帧，否则换上来是空白
                var wp = el.play();
                if (wp && wp.catch) wp.catch(function () {});
                setTimeout(function () { try { el.pause(); } catch (e) { /* ignore */ } }, 220);
                return true;
            },
            pause: function () { els.forEach(function (e) { e.pause(); }); },
            resume: function () {
                var e = els[front];
                if (e) {
                    var p = e.play();
                    if (p && p.catch) p.catch(function () {});
                }
            }
        };
    }

    /* ==================== 导演（移植自 pickNext / handleEnded） ==================== */
    function createDirector(player, hooks) {
        var facing = 'left';
        var currentAct = '';
        var rollTimer = null;
        var sleeping = false;

        function playIdle() {
            currentAct = '';
            player.play(ANIMATIONS.idle[0], false);
        }

        function playAct(name, after) {
            currentAct = name;
            player.play(name, true, after);
        }

        function scheduleRoll(delay) {
            clearTimeout(rollTimer);
            // 大部分是 9~21s，偶尔 4~7s 接一个小动作：有起伏才不像节拍器
            var wait;
            if (delay != null) wait = delay;
            else if (Math.random() < 0.18) wait = randInt(4000, 7000);
            else wait = randInt(CONFIG.idleRollMs[0], CONFIG.idleRollMs[1]);
            rollTimer = setTimeout(function () {
                if (sleeping || hooks.isPaused()) { scheduleRoll(); return; }
                pickNext();
            }, wait);
        }

        function pickNext() {
            if (sleeping) return;
            var kind = rollKind(Math.random(), WEIGHTS, { fixed: true });
            if (kind === 'idle') {
                playIdle();
                scheduleRoll();
                return;
            }
            var pool = hooks.categories ? hooks.categories() : ANIMATIONS.categories;
            var act = pickCategoryAction(pool, ANIMATIONS.idle, facing, currentAct);
            playAct(act.name, function () {
                playIdle();
                scheduleRoll();
            });
        }

        function cue(name, after) {
            if (sleeping) return;
            clearTimeout(rollTimer);
            playAct(name, function () {
                if (after) after();
                playIdle();
                scheduleRoll();
            });
        }

        function sleep() {
            if (sleeping) return;
            sleeping = true;
            clearTimeout(rollTimer);
            currentAct = ANIMATIONS.events.sleep;
            player.play(ANIMATIONS.events.sleep, false);
        }

        function wake() {
            if (!sleeping) return;
            sleeping = false;
            playIdle();
            scheduleRoll();
        }

        return {
            start: function () { playIdle(); scheduleRoll(); },
            pickNext: pickNext,
            cue: cue,
            sleep: sleep,
            wake: wake,
            isSleeping: function () { return sleeping; },
            current: function () { return currentAct; }
        };
    }

    /* ==================== 存档 ==================== */
    var STORE = CONFIG.storageKey;
    var root = null;
    var chatOpen = false;
    var sayTimer = null;
    var sleepTimer = null;
    var player = null;
    var director = null;
    var greeted = false;

    var state = {
        affinity: 0, fullness: 72, hidden: false,
        lastVisit: '', chatLog: [], pos: null, petCount: 0
    };

    function load() {
        try {
            var d = JSON.parse(localStorage.getItem(STORE) || 'null');
            if (d) {
                state.affinity = clamp(Number(d.affinity) || 0, 0, 100);
                var f = Number(d.fullness);
                state.fullness = isNaN(f) ? 72 : clamp(f, 0, 100);
                state.hidden = !!d.hidden;
                state.petCount = Number(d.petCount) || 0;
                state.lastVisit = typeof d.lastVisit === 'string' ? d.lastVisit : '';
                state.chatLog = Array.isArray(d.chatLog) ? d.chatLog.slice(-10) : [];
                state.pos = d.pos && typeof d.pos.x === 'number' ? { x: d.pos.x, y: d.pos.y } : null;
            }
        } catch (e) { /* 隐私模式忽略 */ }

        var today = todayStr();
        var gap = daysBetween(state.lastVisit, today);
        state.streak = gap === 1 ? (state.streak || 1) + 1 : (gap === 0 ? (state.streak || 1) : 1);
        if (!state.lastVisit) state.lastVisit = today;
        else {
            var days = daysBetween(state.lastVisit, today);
            if (days > 0) {
                state.fullness = clamp(state.fullness - days * CONFIG.fullnessDecayPerDay, 0, 100);
                state.lastVisit = today;
            }
        }
        save();
    }

    function save() {
        try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ }
    }

    /* ==================== 表现 ==================== */
    function mood() {
        if (director && director.isSleeping()) return '打盹中';
        if (state.fullness < 20) return '饿扁了';
        if (state.affinity >= 80) return '超喜欢你';
        if (state.affinity >= 45) return '很开心';
        if (state.fullness < 45) return '有点饿';
        return '好奇';
    }

    function updateStats() {
        if (!root) return;
        var a = root.querySelector('[data-dp-meter="affinity"]');
        var f = root.querySelector('[data-dp-meter="fullness"]');
        if (a) a.style.width = clamp(state.affinity, 0, 100) + '%';
        if (f) f.style.width = clamp(state.fullness, 0, 100) + '%';
        var s = root.querySelector('.dp-status');
        if (s) s.textContent = mood();
        root.classList.toggle('is-hungry', state.fullness < 20);
        root.classList.toggle('is-sleep', !!(director && director.isSleeping()));
    }

    function say(text, duration) {
        if (!root || chatOpen) return;
        var bubble = root.querySelector('.dp-bubble');
        if (!bubble) return;
        bubble.textContent = text;
        bubble.classList.add('is-show');
        clearTimeout(sayTimer);
        sayTimer = setTimeout(function () { bubble.classList.remove('is-show'); }, duration || 4200);
    }

    function burst(emoji, count) {
        if (!root) return;
        for (var i = 0; i < (count || 3); i++) {
            (function (i) {
                var el = document.createElement('span');
                el.className = 'dp-particle';
                el.textContent = emoji;
                el.style.left = (52 + Math.random() * 60) + 'px';
                el.style.animationDelay = (i * 0.07) + 's';
                root.appendChild(el);
                setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1400);
            })(i);
        }
    }

    function resetIdle() {
        if (!CONFIG.idleSleepMs || !director) return;
        clearTimeout(sleepTimer);
        if (director.isSleeping()) {
            director.wake();
            updateStats();
        }
        sleepTimer = setTimeout(function () {
            if (!chatOpen && !document.hidden && director) {
                director.sleep();
                updateStats();
                say('……（大肥鱼靠着鲸鱼尾巴睡着了）', 4200);
            }
        }, CONFIG.idleSleepMs);
    }

    function hidePet(hidden) {
        state.hidden = hidden;
        save();
        if (root) root.classList.toggle('is-hidden', hidden);
    }

    /* ==================== 聊天 ==================== */
    var REPLIES = [
        { re: /你好|您好|hi|hello|在吗|嗨/i, list: ['在的！今天也一起写点东西吧。', '嗨～我一直在这儿。'] },
        { re: /知识|卡片|笔记/, list: ['知识库把零散的问题沉淀成卡片了，去 /knowledge/ 翻翻看？', '想记点什么的话，知识库很适合做长期复习。'] },
        { re: /算法|刷题|leetcode|题解/i, list: ['算法库里有间隔复习，先写模板再刷题会快很多：/algorithm/'] },
        { re: /面试|笔试|模拟|求职/, list: ['求职模拟可以随机抽题练表达：/mock/，别只背答案哦。'] },
        { re: /工具|效率/, list: ['实用工具里有些小玩意，写博客的时候挺顺手的：/tools/'] },
        { re: /游戏|摸鱼|玩/, list: ['个人游戏区有几只小游戏，写累了可以去摸鱼：/games/'] },
        { re: /题库|unity|c#|csharp/i, list: ['Unity 题库按知识点整理过，可以按标签挑着看：/questions/'] },
        { re: /博客|文章|首页|归档/, list: ['首页就是归档，慢慢翻吧，都是些记录和思考。'] },
        { re: /饿|吃|鱼|投喂|喂/, list: ['想吃白米饭……点一下 🍚 就能喂我。', '肚子在叫了，有米饭吗？'] },
        { re: /累|难过|焦虑|压力|烦/, list: ['先休息五分钟吧。写不完的代码不会跑掉，但你会的。', '要不要先站起来走两步？我在这儿等你。'] },
        { re: /谢谢|喜欢|可爱|爱你|棒/, list: ['嘿嘿，被夸到了。好感度 +1！', '被你这么说，尾巴都翘起来了。'] },
        { re: /你是谁|你叫什么|什么鲸鱼|deepseek/i, list: ['我是博客里的鲸鱼娘大肥鱼，不是官方产品哦，只是一只住在网页角落里的小鲸鱼。'] },
        { re: /晚安|睡觉|困/, list: ['晚安，早点休息。我会在角落里打盹。'] },
        { re: /米饭|饭|饿|吃/, list: ['白米饭才是正经饭，点 🍚 喂我。', '一碗就够了……好吧，两碗。'] },
        { re: /拖|抓|拎/, list: ['别拎我尾巴！', '被抓起来的时候我会缩一下，正常的。'] },
        { re: /摸头|脑袋|头/, list: ['摸头可以，戳就不行。', '头顶的发饰是限量款。'] },
        { re: /暗色|夜间|晚上|开灯|主题/, list: ['开暗色我就当是晚上了。', '白天模式我会精神一点。'] },
        { re: /无聊|没事|陪你/, list: ['那就陪我看会儿代码吧。', '无聊的话，去算法库随便点一道？'] },
        { re: /bug|报错|崩|错误/i, list: ['报错总能解决的，先看第一行日志。', '把复现步骤写下来，问题就小一半。'] },
        { re: /加油|努力|坚持/, list: ['一起加油，慢慢来。', '每天一点就够，别把自己逼太紧。'] },
        { re: /早|早安/, list: ['早安！今天想先解决哪一件事？'] },
        { re: /厉害|难|不会|学不动/, list: ['不会才正常，会了就不用学了。挑最小的一步先做。'] }
    ];

    function petReply(text) {
        var t = (text || '').trim();
        if (!t) return '你想说什么呀？';
        for (var i = 0; i < REPLIES.length; i++) {
            if (REPLIES[i].re.test(t)) return pick(REPLIES[i].list);
        }
        return pick([
            '这个问题值得写一张知识卡片。',
            '要不要去求职模拟抽一组题？',
            '今天也别忘了给算法库安排一次复习。',
            '慢慢来，先把一个问题讲清楚。',
            '我在这里，你写你的，我不吵你。',
            '唔……这个我还没学会，等我长大一点再回答你。'
        ]);
    }

    function appendMessage(role, text) {
        if (!root) return;
        var log = root.querySelector('.dp-chat-log');
        if (!log) return;
        var msg = document.createElement('div');
        msg.className = 'dp-msg ' + (role === 'user' ? 'is-user' : 'is-pet');
        msg.textContent = text;
        log.appendChild(msg);
        while (log.children.length > 10) log.removeChild(log.firstChild);
        log.scrollTop = log.scrollHeight;
        state.chatLog.push({ role: role, text: text });
        state.chatLog = state.chatLog.slice(-10);
        save();
    }

    function renderChatLog() {
        if (!root) return;
        var log = root.querySelector('.dp-chat-log');
        if (!log) return;
        log.innerHTML = '';
        var list = state.chatLog.length ? state.chatLog : [{
            role: 'pet',
            text: '我是大肥鱼，一只住在博客里的鲸鱼娘。点我、拖我、喂我白米饭，或者随便和我聊聊～'
        }];
        list.forEach(function (m) {
            var msg = document.createElement('div');
            msg.className = 'dp-msg ' + (m.role === 'user' ? 'is-user' : 'is-pet');
            msg.textContent = m.text;
            log.appendChild(msg);
        });
        log.scrollTop = log.scrollHeight;
    }

    function sendChat() {
        if (!root) return;
        var input = root.querySelector('.dp-chat-input');
        if (!input) return;
        var text = input.value.trim();
        if (!text) return;
        input.value = '';
        appendMessage('user', text);
        resetIdle();
        if (director) director.cue('hum');       // "在想"的动作
        setTimeout(function () {
            appendMessage('pet', petReply(text));
            updateStats();
            if (director && Math.random() < 0.6) director.cue(pick(ANIMATIONS.clicks));
        }, 620);
    }

    function setChatOpen(open) {
        if (!root) return;
        chatOpen = open;
        root.classList.toggle('is-chatting', open);
        var chat = root.querySelector('.dp-chat');
        if (chat) chat.classList.toggle('is-open', open);
        if (open) {
            var bubble = root.querySelector('.dp-bubble');
            if (bubble) bubble.classList.remove('is-show');
            renderChatLog();
            var input = root.querySelector('.dp-chat-input');
            if (input) setTimeout(function () { input.focus(); }, 80);
        }
    }

    /* ==================== 互动 ==================== */
    /* 特殊日子：只读本地日期，零成本 */
    function specialDay() {
        var d = new Date();
        var md = (d.getMonth() + 1) + '-' + d.getDate();
        var table = {
            '1-1': ['新年快乐！今年也一起写下去吧。', 'stretch'],
            '2-14': ['今天……要不要多陪我一会儿？', 'click-shy'],
            '3-8': ['节日快乐！今天可以少写点代码。', 'click-happy'],
            '5-1': ['劳动节，但你还是打开博客了。', 'yawn'],
            '6-1': ['儿童节！我可以多要一碗米饭吗？', 'bubbles'],
            '10-1': ['假期快乐，出去走走也不错。', 'stretch'],
            '12-24': ['平安夜，角落里也有点热闹。', 'click-wave'],
            '12-25': ['圣诞快乐！有我的礼物吗？', 'click-happy'],
            '12-31': ['今年最后一天了，辛苦啦。', 'hum']
        };
        return table[md] || null;
    }

    function greet() {
        if (greeted) return;
        greeted = true;
        var hour = new Date().getHours();
        var line;
        if (hour < 6) line = pick(['这么晚还在写代码？要注意休息呀。', '夜深了，我陪你把这最后一点写完。']);
        else if (hour < 12) line = pick(['早上好，今天先解决最重要的一件事。', '早安，要不要去算法库复习一道？']);
        else if (hour < 18) line = pick(['下午好，写累了吗？摸摸鱼吧。', '今天也一起把问题拆小一点。']);
        else line = pick(['晚上好，今天辛苦了。', '晚上适合复盘，把今天的卡点记下来吧。']);
        var special = specialDay();
        var dayAct = { '1-1': 'fireworks', '2-14': 'bow', '3-8': 'cheerful', '5-1': 'stretch',
                       '6-1': 'dance', '10-1': 'fireworks', '12-24': 'santa', '12-25': 'santa', '12-31': 'dance' };
        if (special) {
            line = special[0];
            if (director) setTimeout(function () { director.cue(dayAct[(new Date().getMonth() + 1) + '-' + new Date().getDate()] || special[1]); }, 1600);
        } else if ((state.streak || 1) === 1) {
            line = '第一次见？我是大肥鱼，住在这个角落里。';
        } else if ((state.streak || 1) >= 7) {
            line = '你来第 ' + state.streak + ' 天啦，我已经认得你了。';
        } else if ((state.streak || 1) >= 3) {
            line = '又见面了，第 ' + state.streak + ' 天。';
        }
        setTimeout(function () { say(line, 5200); }, 1200);
    }

    /* 按点击位置分区：脑袋 / 身体 / 尾巴，反应不同 */
    function zoneAt(el, clientY) {
        if (!el) return 'body';
        var r = el.getBoundingClientRect();
        if (!r.height) return 'body';
        var y = (clientY - r.top) / r.height;
        if (y < 0.42) return 'head';
        if (y > 0.86) return 'tail';
        return 'body';
    }

    function doPet(zone) {
        zone = zone || 'body';
        state.petCount += 1;
        save();
        resetIdle();
        if (!director) { say('嘿嘿。', 2600); return; }

        var reactDelay = 0;   // 点击要求即时，去掉拟人延迟

        if (state.petCount % 6 === 0) {
            if (director) director.cue('sad');
            say('呜……一直戳会痛的。', 3000);
            return;
        }

        if (zone === 'head') {
            setTimeout(function () { burst('💫', 2); }, reactDelay);
            setTimeout(function () { if (director) director.cue('click-shy'); }, reactDelay);
            say(pick([
                '别戳脑袋啦……头发会乱的。',
                '唔！头、头顶不可以乱摸。',
                '戳一下会变笨的，真的。',
                '呜……发饰歪了。'
            ]), 3200);
            return;
        }
        if (zone === 'tail') {
            setTimeout(function () { burst('🫧', 3); }, reactDelay);
            setTimeout(function () { if (director) director.cue('tail'); }, reactDelay);
            say(pick([
                '尾巴不是玩具！……不过可以再摸一下。',
                '鲸鱼的尾巴很有力的，小心哦。',
                '拍、拍水！'
            ]), 3200);
            return;
        }

        burst('💙', 2);
        director.cue(pick(ANIMATIONS.clicks));
        if (Math.random() < 0.7) say(pick(['嘿嘿，再摸一下。', '尾巴会自己摇起来。', '今天也要加油呀。', '喜欢你认真写代码的样子。']), 3200);
    }

    function doFeed() {
        resetIdle();
        burst('🍚', 3);
        if (director) director.cue(ANIMATIONS.events.eat);
        say(pick(['谢谢！白米饭最香了。', '呜哇，是热腾腾的米饭！好感度上升。', '吃饱了才有力量陪你写代码。']), 3600);
    }

    /* ==================== 状态机 ====================
     * 状态只描述三件事：能用哪些动作、待多久、什么条件下出去。
     * 这样动作池之间不会互相串味（sleepy 里永远不会播 click-wave）。
     */
    var MACHINE = {
        state: 'idle',
        since: 0,

        pools: {
            // 平时：有点闲，东张西望、哼歌、甩尾、吐泡泡
            idle: ['look', 'hum', 'tail', 'bubbles', 'stretch', 'cheerful', 'magic', 'puzzle'],
            // 你在读文章：陪着，不打扰，偶尔抬头
            reading: ['hum', 'look', 'doze', 'think', 'code'],
            // 深夜：安静、困
            sleepy: ['yawn', 'doze', 'look', 'sad']
        },

        /** 根据一次上下文快照决定"应该是哪个状态" */
        want: function (ctx) {
            if (!ctx) return 'idle';
            if (ctx.dark && ctx.hour >= 22) return 'sleepy';
            if (ctx.hour < 6) return 'sleepy';
            if (ctx.page === 'post' && ctx.scroll > 0.12 && ctx.scroll < 0.92) return 'reading';
            return 'idle';
        },

        set: function (name) {
            if (!this.pools[name] || name === this.state) return this.state;
            this.state = name;
            this.since = Date.now();
            return name;
        },

        /** 当前状态可用的动作 */
        actions: function () {
            return this.pools[this.state] || this.pools.idle;
        }
    };

    /* ==================== 昼夜 ==================== */
    function isDark() {
        var el = document.documentElement;
        var theme = el.getAttribute('data-theme') || el.getAttribute('data-color');
        if (theme) return theme === 'dark';
        return el.classList.contains('dark') || document.body.classList.contains('dark');
    }

    function categoriesForNow() {
        // 每次掷动作前先按当前页面/时段校正状态，再返回该状态的动作池
        var ctx = null;
        try { ctx = siteContext(); } catch (e) { /* ignore */ }
        MACHINE.set(MACHINE.want(ctx));
        return [{ id: MACHINE.state, weight: 1, actions: MACHINE.actions() }];
    }

    function watchTheme() {
        var last = isDark();
        function onChange() {
            var now = isDark();
            if (now === last) return;
            last = now;
            updateStats();
            if (director && !chatOpen) {
                director.cue(now ? 'yawn' : 'stretch');
                say(now ? pick(['天黑了呢，我把音量调小一点。', '夜里安静，适合慢慢写。', '开暗色了……那我也有点困了。'])
                        : pick(['开灯啦，精神一点！', '白天模式，冲！', '亮起来就清醒了。']), 3600);
            }
        }
        try {
            new MutationObserver(onChange).observe(document.documentElement, {
                attributes: true, attributeFilter: ['data-theme', 'class', 'data-color']
            });
            new MutationObserver(onChange).observe(document.body, {
                attributes: true, attributeFilter: ['class']
            });
        } catch (e) { /* 老浏览器忽略 */ }
    }

    /* ==================== 站点上下文 ====================
     * 只读当前页面已有的信息，不新增网络请求、不新增滚动监听。
     * 每个信号都必须在 30s tick 或 pjax 时"按需读一次"，不常驻。
     */
    var ctxDwellFrom = 0;
    var lastSaid = '';

    /* 同句不连说；调试期不做概率过滤，先保证"一定能看见" */
    function sayMaybe(text, ms) {
        if (!text || !root || chatOpen) return false;
        if (text === lastSaid) return false;
        lastSaid = text;
        say(text, ms);
        return true;
    }

    function actMaybe(name) {
        if (!director || !name) return false;
        director.cue(name);
        return true;
    }

    var lastCtxAt = 0;

    function siteContext() {
        var path = location.pathname;
        var href = location.href;
        var page = 'other';
        if (/^\/\d{4}\/\d{2}\/\d{2}\//.test(path) || /\/archives\/\d+/.test(href)) page = 'post';
        else if (path === '/' || path === '/index.html') page = 'home';

        var tags = [];
        try {
            var nodes = document.querySelectorAll('.post-categories a, .post-tags a, .category a, .tag-cloud a, #article-container .tag a');
            for (var i = 0; i < nodes.length && tags.length < 12; i++) {
                var txt = (nodes[i].textContent || '').trim();
                if (txt) tags.push(txt);
            }
        } catch (e) { /* ignore */ }

        var scroll = 0;
        try {
            var h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            scroll = clamp((window.scrollY || 0) / h, 0, 1);
        } catch (e) { /* ignore */ }

        var words = 0;
        try {
            var body = document.querySelector('#article-container') || document.querySelector('.post-content');
            if (body) words = (body.textContent || '').replace(/\s/g, '').length;
        } catch (e) { /* ignore */ }

        var comments = 0;
        try {
            comments = document.querySelectorAll('#post-comment .comment, #post-comment .vcomment, .comment-list > li').length;
        } catch (e) { /* ignore */ }

        return {
            page: page, tags: tags, scroll: scroll, words: words, comments: comments,
            dark: isDark(), hour: new Date().getHours()
        };
    }

    function matchTag(tags, list) {
        for (var i = 0; i < tags.length; i++) {
            for (var j = 0; j < list.length; j++) {
                if (tags[i].toLowerCase().indexOf(list[j]) >= 0) return true;
            }
        }
        return false;
    }

    /* 命中的第一条规则当场说话 + 做个动作；每分钟最多一次，避免变吵 */
    function runContext() {
        if (!director || chatOpen || document.hidden || root.classList.contains('is-hidden')) return;
        var now = Date.now();
        if (now - lastCtxAt < 25000) return;

        var c;
        try { c = siteContext(); } catch (e) { return; }
        var sayLine = null, actName = null;

        if (c.page === 'post' && matchTag(c.tags, ['unity', 'c#', 'csharp'])) {
            sayLine = '这篇和 Unity 有关……题库里有对应的知识点。';
        } else if (c.page === 'post' && matchTag(c.tags, ['算法', 'leetcode', '数据结构'])) {
            sayLine = '算法文！要不要顺便去复习一道？';
        } else if (c.page === 'post' && c.scroll > 0.85) {
            sayLine = pick(['读完了呀，辛苦了。', '看到底了，有收获吗？']);
            actName = 'look';
        } else if (c.page === 'post' && c.words > 4000) {
            sayLine = pick(['这篇够看一阵的，慢慢读。', '长文，我先趴着陪你。']);
            actName = pick(['think', 'doze']);
        } else if (c.page === 'post' && c.words > 0 && c.words < 600) {
            sayLine = pick(['很短的一篇，一下就看完了吧。', '这种长度刚好，一口气读完。']);
            actName = 'look';
        } else if (c.page === 'post' && c.comments === 0 && c.scroll > 0.5) {
            sayLine = '还没人说话……我可以先当第一个。';
        } else if (c.page === 'post' && c.comments >= 3) {
            sayLine = '这么热闹，看来这篇戳到大家了。';
            actName = 'hum';
        } else if (c.page === 'home' && c.dark && c.hour >= 23) {
            sayLine = '这么晚还在首页翻……早点睡吧。';
            actName = 'doze';
        } else if (c.page === 'home' && (state.streak || 1) >= 3) {
            sayLine = '又见面了，第 ' + state.streak + ' 天。';
        }

        // 从底部滚回顶部：一次"重新开始读"的动作
        if (!sayLine && c.page === 'post' && lastScrollSeen > 0.8 && c.scroll < 0.25) {
            sayLine = pick(['回到开头了，要再读一遍吗？', '又回到上面了。']);
            actName = 'stretch';
        }
        lastScrollSeen = c.scroll;

        // 标签 / 分类页：读标题接一句
        if (!sayLine && /^\/(tags|categories)\//.test(window.location.pathname)) {
            var h1 = document.querySelector('#page h1, .page-title, #article-container h1');
            var name = h1 ? (h1.textContent || '').trim().slice(0, 20) : ''; if (!name) { var mm = decodeURIComponent(location.pathname).match(/\/(?:tags|categories)\/([^/]+)\/?$/); if (mm) name = mm[1].replace(/\.html$/, ''); }
            if (name) {
                sayLine = pick(['「' + name + '」这个标签下的东西不少。', '在翻「' + name + '」相关的内容呀。']);
                actName = 'hum';
            }
        }

        // 404：站内唯一能确定"她找不到东西"的页面
        if (!sayLine && (c.page === 'other') && /404/.test(window.location.pathname)) {
            sayLine = pick(['这里什么都没有……你是不是点错链接了？', '迷路了？首页在这边。']);
            actName = pick(['puzzle', 'angry']);
        }

        if (!sayLine) return;
        lastCtxAt = now;
        say(sayLine, 4200);
        if (actName) director.cue(actName);
    }

    /* 滚动只在停下来 700ms 后算一次，passive，不阻塞滚动 */
    function watchScroll() {
        if (watchScroll.done) return;
        watchScroll.done = true;

        var timer = null;
        var wasBottom = false;

        function ratio() {
            var h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            return clamp((window.scrollY || 0) / h, 0, 1);
        }

        window.addEventListener('scroll', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                try {
                    if (!director || chatOpen || document.hidden) return;
                    var r = ratio();

                    if (r > 0.92) {
                        if (!wasBottom) {
                            wasBottom = true;
                            say('读到底了，辛苦了。', 3600);
                            director.cue('look');
                        }
                        return;
                    }

                    if (wasBottom && r < 0.12) {
                        wasBottom = false;
                        say(pick(['回到开头了，要再读一遍吗？', '又回到上面了。']), 3200);
                        director.cue('stretch');
                    }
                } catch (e) {
                    console.warn('[pet] scroll handler', e);
                }
            }, 450);
        }, { passive: true });
    }

    /* 标签 / 分类页：换页后直接说一句，不经过上下文链 */
    function tagPageLine() {
        try {
            if (!director || chatOpen || document.hidden) return;
            var path = decodeURIComponent(location.pathname);
            var m = path.match(/\/(?:tags|categories)\/([^/]+?)\/?(?:\.html)?$/);
            if (!m) return;
            var name = m[1].replace(/\.html$/, '');
            if (!name) return;
            say('在翻「' + name + '」相关的内容呀。', 3600);
            director.cue('hum');
        } catch (e) { /* ignore */ }
    }

    /* ==================== 拖动 ==================== */
    function applyPos() {
        if (!root || !state.pos) return;
        var w = root.offsetWidth || 200;
        var h = root.offsetHeight || 180;
        var x = clamp(state.pos.x, 4, Math.max(4, window.innerWidth - w - 4));
        var y = clamp(state.pos.y, 4, Math.max(4, window.innerHeight - h - 4));
        root.style.left = x + 'px';
        root.style.top = y + 'px';
        root.style.right = 'auto';
        root.style.bottom = 'auto';
    }

    function initDrag() {
        if (!CONFIG.draggable || !root) return;
        var ch = root.querySelector('.dp-character');
        if (!ch) return;
        var dragging = false, moved = false;
        var start = { x: 0, y: 0, left: 0, top: 0 };

        ch.addEventListener('pointerdown', function (e) {
            if (e.button != null && e.button !== 0) return;
            // 一按下就换成"被抓起"的姿态；素材已缓存，切源基本无等待
            if (director) director.cue(ANIMATIONS.drag);
            var rect = root.getBoundingClientRect();
            dragging = true;
            moved = false;
            start = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top };
            root.classList.add('is-dragging');
            if (ch.setPointerCapture) { try { ch.setPointerCapture(e.pointerId); } catch (err) {} }
        });

        ch.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            var dx = e.clientX - start.x, dy = e.clientY - start.y;
            if (!moved && Math.abs(dx) + Math.abs(dy) < 6) return;
            moved = true;
            root.style.left = (start.left + dx) + 'px';
            root.style.top = (start.top + dy) + 'px';
            root.style.right = 'auto';
            root.style.bottom = 'auto';
        });

        function end(e) {
            if (!dragging) return;
            dragging = false;
            root.classList.remove('is-dragging');
            if (moved) {
                state.pos = { x: parseFloat(root.style.left) || 0, y: parseFloat(root.style.top) || 0 };
                save();
                applyPos();
            }
        }
        ch.addEventListener('pointerup', function (e) {
            if (dragging && !moved) { end(e); doPet(zoneAt(ch, e.clientY)); return; }
            end(e);
        });
        ch.addEventListener('pointercancel', end);
        ch.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doPet('body'); }
        });
        window.addEventListener('resize', applyPos);
        window.addEventListener('orientationchange', applyPos);
    }

    /* ==================== 构建 ==================== */
    function build() {
        if (document.getElementById('deepseek-pet')) return;
        root = document.createElement('div');
        root.id = 'deepseek-pet';
        root.innerHTML = [
            '<div class="dp-bubble" role="status" aria-live="polite"></div>',
            '<div class="dp-chat" role="dialog" aria-label="和大肥鱼聊天">',
            '  <div class="dp-chat-head"><span>大肥鱼</span><button type="button" class="dp-chat-close" data-dp-action="chat" aria-label="关闭对话">×</button></div>',
            '  <div class="dp-chat-log"></div>',
            '  <form class="dp-chat-form">',
            '    <input type="text" class="dp-chat-input" maxlength="60" placeholder="和大肥鱼说点什么…" aria-label="输入消息">',
            '    <button type="submit" class="dp-chat-send">发送</button>',
            '  </form>',
            '  <p class="dp-credit">动画素材 <a href="https://github.com/PC2005-cloud/dsh-pet" target="_blank" rel="noopener nofollow">dsh-pet</a> · 角色 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank" rel="noopener nofollow">CC BY-NC-SA 4.0</a></p>',
            '</div>',
            '<div class="dp-actions">',
            '  <button type="button" class="dp-action" data-dp-action="feed" title="喂白米饭" aria-label="喂白米饭">🍚</button>',
            '  <button type="button" class="dp-action" data-dp-action="chat" title="聊天" aria-label="聊天">💬</button>',
            '  <button type="button" class="dp-action" data-dp-action="hide" title="隐藏" aria-label="隐藏大肥鱼">×</button>',
            '</div>',
            '<div class="dp-character" data-dp-action="pet" role="button" tabindex="0" aria-label="摸摸大肥鱼">',
            '  <div class="dp-shadow"></div>',
            '  <div class="dp-body">',
            '    <div class="dp-stage"><img class="dp-art" src="' + CONFIG.image + '" alt="鲸鱼娘大肥鱼" draggable="false"></div>',
            '  </div>',
            '</div>',
            '<div class="dp-restore" data-dp-action="restore" title="召回大肥鱼" role="button" tabindex="0">🐳</div>'
        ].join('');
        document.body.appendChild(root);

        root.classList.toggle('is-hidden', state.hidden);
        applyPos();
        updateStats();
        renderChatLog();

        root.addEventListener('click', function (e) {
            var el = e.target.closest ? e.target.closest('[data-dp-action]') : null;
            if (!el || !root.contains(el)) return;
            var action = el.getAttribute('data-dp-action');
            if (action === 'restore') { hidePet(false); say('我回来啦。', 2600); return; }
            if (action === 'hide') { hidePet(true); return; }
            if (action === 'chat') { setChatOpen(!chatOpen); return; }
            if (action === 'feed') { doFeed(); return; }
            if (action === 'pet') {
                var chEl = root.querySelector('.dp-character');
                doPet(el.classList.contains('dp-character') ? zoneAt(chEl, e.clientY) : 'body');
            }
        });

        root.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setChatOpen(false);
        });

        var form = root.querySelector('.dp-chat-form');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                sendChat();
            });
        }

        initDrag();
        initPlayer();
        var tick = 0;
        setInterval(function () {
            if (state.hidden || document.hidden) return;
            tick += 1;
            runContext();   // 每 2 分钟评估一次，复用同一个定时器
        }, 30000);

        document.addEventListener('visibilitychange', function () {
            if (!player) return;
            if (document.hidden) {
                setChatOpen(false);
                player.pause();
            } else {
                player.resume();
                resetIdle();
            }
        });

        watchTheme();
        watchScroll();

        // 首次挂载也评估一次：主题若是整页跳转（不走 pjax），换页后走不到 pjax 分支
        setTimeout(function () {
            try { tagPageLine(); } catch (e) { /* ignore */ }
            try { runContext(); } catch (e) { /* ignore */ }
        }, 700);

        // 鼠标靠近：偶尔抬头看一眼（有冷却，别烦人）
        var lastGlance = 0;
        document.addEventListener('mousemove', function (e) {
            if (!director || chatOpen || document.hidden) return;
            var now = Date.now();
            if (now - lastGlance < 9000) return;
            var r = root.getBoundingClientRect();
            var dx = e.clientX - (r.left + r.width / 2);
            var dy = e.clientY - (r.top + r.height / 2);
            if (dx * dx + dy * dy > 150 * 150) return;
            lastGlance = now;
            if (Math.random() < 0.55) director.cue('look');
        }, { passive: true });

        resetIdle();
        greet();
    }

    function initPlayer() {
        if (!root) return;
        var stage = root.querySelector('.dp-stage');
        if (!stage) return;

        var canWebm = false;
        try {
            canWebm = !!(document.createElement('video').canPlayType &&
                document.createElement('video').canPlayType('video/webm; codecs="vp9"'));
        } catch (e) { canWebm = false; }

        // 只有浏览器真的放不了透明 WebM 才退回静帧。
        // 注意：这里**不**看 prefers-reduced-motion —— 宠物本体就是这段动画，
        // 按"减少动效"关掉它等于整只宠物死了。系统级的动效偏好只作用于
        // 页面装饰（浮动、粒子），见 CSS 里的同名媒体查询。
        if (!canWebm) {
            stage.classList.add('is-static');
            return;
        }

        player = createPlayer(stage);
        director = createDirector(player, {
            isPaused: function () { return chatOpen || document.hidden || root.classList.contains('is-dragging'); },
            categories: categoriesForNow
        });
        director.start();
        preloadClips();
        setTimeout(function () {
            if (!player) return;
            try { player.warm('drag'); } catch (e) { /* ignore */ }
        }, 2600);
    }

    function init() {
        if (root && document.getElementById('deepseek-pet')) {
            applyPos();
            lastCtxAt = 0;                       // 换页了，重置冷却
            setTimeout(function () {
                tagPageLine();
                runContext();
            }, 700);
            return;
        }
        load();
        build();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    document.addEventListener('pjax:complete', init);
})();
