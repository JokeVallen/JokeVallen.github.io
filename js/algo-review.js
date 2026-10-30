(function () {
    'use strict';

    /* ============================================================
     * 算法库：复盘、自测与间隔复习
     * - 数据保存在浏览器 localStorage
     * - 支持 JSON / Markdown 导出、JSON 导入
     * - 间隔复习：24 小时 → 7 天 → 30 天 → 已掌握
     * ============================================================ */

    var STORAGE_KEY = 'algo-review-v1';
    var INTERVALS = [1, 7, 30];
    var STAGE_LABELS = ['24 小时后', '7 天后', '30 天后', '已掌握'];
    var DIFFICULTY_LABELS = { 1: '入门', 2: '进阶', 3: '困难' };

    var PATTERNS = [
        {
            name: '排序',
            icon: 'fas fa-sort',
            trigger: '需要有序、TopK、区间合并、双指针前置处理、稳定性要求',
            insight: '先明确稳定性、原地、时间复杂度与数据规模；快排 partition 和归并 merge 是核心模板。',
            pitfall: '边界收缩、重复元素、递归深度、稳定性、原地交换顺序。',
            examples: 'LC 912 · 215 · 56 · 88'
        },
        {
            name: '二分查找',
            icon: 'fas fa-search',
            trigger: '有序数组、答案单调、找第一个/最后一个满足条件的位置',
            insight: '把「找目标」变成「判定 mid 是否满足条件，再决定收缩哪边」；先写清楚区间语义。',
            pitfall: 'left/right 开闭、mid 下取整、返回 left 还是 right、死循环。',
            examples: 'LC 34 · 35 · 69 · 875'
        },
        {
            name: '双指针',
            icon: 'fas fa-arrows-alt-h',
            trigger: '有序数组、两数/三数之和、去重、回文、链表找中点/环',
            insight: '利用有序性或链表结构，让两个指针各自单向移动，避免 O(n²) 枚举。',
            pitfall: '指针移动条件写反、重复元素跳过、快慢指针相遇后的处理。',
            examples: 'LC 15 · 125 · 141 · 167'
        },
        {
            name: '滑动窗口',
            icon: 'fas fa-columns',
            trigger: '连续子数组/子串、最长/最短、窗口内条件可增删',
            insight: '右指针扩张、左指针收缩；窗口状态要能在加入和移除元素时 O(1) 维护。',
            pitfall: '收缩条件、窗口长度计算、字符频次更新、重复字符处理。',
            examples: 'LC 3 · 76 · 209 · 438'
        },
        {
            name: '前缀和 / 差分',
            icon: 'fas fa-plus-square',
            trigger: '区间和、子数组和、频繁区间查询、区间批量加减',
            insight: '把区间操作转成端点操作：前缀和做减法，差分做增量。',
            pitfall: '下标偏移、前缀和数组长度、负数与哈希表初始值。',
            examples: 'LC 303 · 560 · 1109 · 1094'
        },
        {
            name: '哈希表',
            icon: 'fas fa-hashtag',
            trigger: '查找/计数/去重、两数之和、字符频次、缓存映射',
            insight: '用空间换时间，把 O(n) 查找降为 O(1)；先想清楚 key 和 value 各存什么。',
            pitfall: 'key 设计错误、更新时机、重复元素计数、哈希冲突不需要你处理。',
            examples: 'LC 1 · 49 · 128 · 242'
        },
        {
            name: '栈 / 单调栈',
            icon: 'fas fa-layer-group',
            trigger: '括号匹配、嵌套结构、下一个更大/更小元素、柱状图面积',
            insight: '栈保存「还没被解决」的元素；单调栈在弹出时结算答案。',
            pitfall: '弹栈条件、相等元素、哨兵元素、结果下标还是值。',
            examples: 'LC 20 · 739 · 84 · 155'
        },
        {
            name: '链表',
            icon: 'fas fa-link',
            trigger: '反转、合并、删除节点、环、倒数第 k 个',
            insight: '哑节点简化头节点操作；画图确认 pre/cur/next 的指向变化。',
            pitfall: '断链顺序、空指针、头节点被删除、环的入口计算。',
            examples: 'LC 206 · 21 · 19 · 142'
        },
        {
            name: '二叉树 / 递归',
            icon: 'fas fa-sitemap',
            trigger: '遍历、子树、路径、深度、BST 性质',
            insight: '先定义递归函数「返回什么」，再决定前序/中序/后序处理位置。',
            pitfall: '空节点返回值、全局变量回溯、BST 上下界、路径是否必须到叶子。',
            examples: 'LC 104 · 226 · 98 · 124'
        },
        {
            name: '回溯',
            icon: 'fas fa-project-diagram',
            trigger: '全排列、组合、子集、棋盘、所有方案',
            insight: '做选择 → 递归 → 撤销选择；用 start 或 used 控制同一层不重复。',
            pitfall: '去重排序、剪枝条件、路径拷贝、递归终止条件。',
            examples: 'LC 46 · 78 · 39 · 51'
        },
        {
            name: '动态规划',
            icon: 'fas fa-table',
            trigger: '最优子结构、计数、决策、序列/区间/背包',
            insight: '先定义 dp[i] 的含义，再写状态转移和初始化；从暴力递归出发找重复子问题。',
            pitfall: 'dp 定义含糊、初始化、遍历顺序、空间压缩后方向错误。',
            examples: 'LC 70 · 322 · 300 · 1143'
        },
        {
            name: '贪心',
            icon: 'fas fa-bolt',
            trigger: '区间调度、覆盖、跳跃、局部最优可证明推出全局最优',
            insight: '先排序再按固定规则做选择；必须能说清「为什么局部最优不会破坏全局」。',
            pitfall: '排序 key、贪心选择证明、边界区间闭合、反例。',
            examples: 'LC 435 · 55 · 45 · 452'
        },
        {
            name: '图 BFS / DFS',
            icon: 'fas fa-globe',
            trigger: '连通块、最短步数、网格扩散、依赖关系、拓扑',
            insight: 'BFS 按层扩散求最短步数；DFS 适合遍历/回溯；访问标记要在入队/进入时做。',
            pitfall: '重复访问、队列初始节点、网格边界、拓扑入度更新。',
            examples: 'LC 200 · 994 · 207 · 127'
        },
        {
            name: '并查集',
            icon: 'fas fa-object-group',
            trigger: '连通性、合并集合、环检测、等价关系',
            insight: 'find 找代表元，union 合并集合；路径压缩 + 按秩合并接近 O(1)。',
            pitfall: '初始化、路径压缩写法、合并方向、统计连通分量。',
            examples: 'LC 547 · 684 · 721 · 990'
        },
        {
            name: '堆 / TopK',
            icon: 'fas fa-sort-amount-down',
            trigger: '第 k 大/小、前 k 个高频、动态中位数、合并有序序列',
            insight: '求前 k 大用小顶堆，求前 k 小用大顶堆；堆里只保留 k 个元素。',
            pitfall: '堆大小、比较器方向、默认堆类型、结果顺序。',
            examples: 'LC 215 · 347 · 23 · 295'
        }
    ];

    var DEFAULT_PROBLEM_SEEDS = [
        {
            id: 'default-sort-insertion',
            title: '手写插入排序',
            pattern: '排序',
            difficulty: 1,
            offset: 0,
            trigger: '数据量小、近乎有序、要求稳定 → 插入排序',
            insight: '把当前元素插入到前面已排序区间的正确位置，元素后移。',
            stuck: '边界从 i=1 开始，内层 j 要 >=0，后移顺序容易写反。',
            template: 'for i=1..n-1: key=a[i]; j=i-1; while j>=0 && a[j]>key: a[j+1]=a[j]; j--; a[j+1]=key。',
            link: 'https://leetcode.cn/problems/sort-an-array/'
        },
        {
            id: 'default-sort-bubble',
            title: '手写冒泡排序',
            pattern: '排序',
            difficulty: 1,
            offset: 0,
            trigger: '相邻交换、每轮把最大值冒到末尾 → 冒泡',
            insight: '每轮比较相邻元素并交换，提前有序时可加 swapped 优化。',
            stuck: '内层边界应为 n-1-i，否则越界或重复比较。',
            template: 'for i=0..n-1: for j=0..n-2-i: if a[j]>a[j+1] swap; 若无交换则 break。',
            link: 'https://leetcode.cn/problems/sort-an-array/'
        },
        {
            id: 'default-sort-selection',
            title: '手写选择排序',
            pattern: '排序',
            difficulty: 1,
            offset: 0,
            trigger: '每轮选最小/最大值放到已排序区末尾 → 选择排序',
            insight: '每轮找到最小元素下标，再与当前位置交换。',
            stuck: '记录的是下标而不是值；交换时机容易放到内层循环里。',
            template: 'for i=0..n-1: min=i; for j=i+1..n-1: if a[j]<a[min] min=j; swap(a[i],a[min])。',
            link: 'https://leetcode.cn/problems/sort-an-array/'
        },
        {
            id: 'default-sort-merge',
            title: '手写归并排序',
            pattern: '排序',
            difficulty: 2,
            offset: 1,
            trigger: '稳定排序、分治、链表排序 → 归并',
            insight: '递归排序左右两半，再合并两个有序数组；稳定且最坏 O(n log n)。',
            stuck: '合并时剩余元素要补入临时数组；边界 mid 与 right 的取值。',
            template: 'mergeSort(l,r): mid=(l+r)/2; 递归左右; merge(l,mid,r) 用临时数组。',
            link: 'https://leetcode.cn/problems/sort-an-array/'
        },
        {
            id: 'default-sort-quick',
            title: '手写快速排序',
            pattern: '排序',
            difficulty: 2,
            offset: 1,
            trigger: '平均 O(n log n)、原地、TopK → 快排 partition',
            insight: '选 pivot，把小于和大于它的元素分到两侧，再递归处理。',
            stuck: 'partition 边界、pivot 位置、重复元素导致退化。',
            template: 'partition(l,r): pivot=a[r]; i=l-1; for j=l..r-1 if a[j]<pivot swap(++i,j); swap(i+1,r); return i+1。',
            link: 'https://leetcode.cn/problems/sort-an-array/'
        },
        {
            id: 'default-sort-heap',
            title: '堆排序与 TopK 小顶堆',
            pattern: '堆 / TopK',
            difficulty: 2,
            offset: 1,
            trigger: '第 k 大/小、动态最值、只保留 k 个 → 堆',
            insight: '求前 k 大用小顶堆，堆大小保持 k；堆排序先建堆再反复取堆顶。',
            stuck: '比较器方向、下沉边界、堆大小控制。',
            template: 'foreach x: push; if size>k pop; 结果取堆顶。',
            link: 'https://leetcode.cn/problems/kth-largest-element-in-an-array/'
        },
        {
            id: 'default-binary-search',
            title: '二分查找目标值',
            pattern: '二分查找',
            difficulty: 1,
            offset: 3,
            trigger: '有序数组 + 查找目标/边界 → 二分',
            insight: '循环中维护答案所在区间，根据 mid 与 target 的关系收缩。',
            stuck: '区间开闭、mid 取整、返回 left 还是 right。',
            template: 'left=0, right=n-1; while left<=right: mid=(left+right)>>>1; ...',
            link: 'https://leetcode.cn/problems/binary-search/'
        },
        {
            id: 'default-two-sum',
            title: '两数之和（哈希表）',
            pattern: '哈希表',
            difficulty: 1,
            offset: 3,
            trigger: '无序数组 + 找两个数/补数 → 哈希表',
            insight: '遍历时先查 target - x 是否出现过，再把 x 存入 map。',
            stuck: '先查后存，避免同一个元素使用两次；返回下标还是值。',
            template: 'for i,x: if map.ContainsKey(target-x) return; map[x]=i。',
            link: 'https://leetcode.cn/problems/two-sum/'
        },
        {
            id: 'default-longest-no-repeat',
            title: '无重复字符的最长子串',
            pattern: '滑动窗口',
            difficulty: 2,
            offset: 7,
            trigger: '连续子串 + 最长 + 窗口内不能重复 → 滑窗',
            insight: '右指针扩张，出现重复时左指针跳到上次位置 + 1。',
            stuck: '左指针不能回退，要取 max(left, lastIndex + 1)。',
            template: 'map 记录字符最后位置；ans = max(ans, right - left + 1)。',
            link: 'https://leetcode.cn/problems/longest-substring-without-repeating-characters/'
        },
        {
            id: 'default-binary-tree-level-order',
            title: '二叉树层序遍历',
            pattern: '二叉树 / 递归',
            difficulty: 1,
            offset: 7,
            trigger: '按层遍历、最短层数 → BFS 队列',
            insight: '队列保存当前层节点，记录当前层大小后一次性处理。',
            stuck: '每层 size 要提前固定，循环中队列长度会变化。',
            template: 'queue.Enqueue(root); while queue.Count>0: n=queue.Count; for i=0..n-1: ...',
            link: 'https://leetcode.cn/problems/binary-tree-level-order-traversal/'
        },
        {
            id: 'default-climb-stairs',
            title: '爬楼梯（斐波那契 DP）',
            pattern: '动态规划',
            difficulty: 1,
            offset: 14,
            trigger: '方案数 + 每次走 1/2 步 + 最优子结构 → DP',
            insight: 'dp[i] = dp[i-1] + dp[i-2]，只依赖前两项可滚动压缩。',
            stuck: '初始化 dp[0]=1、dp[1]=1；n 较小时边界。',
            template: 'a=1,b=1; for i=2..n: c=a+b; a=b; b=c; return b。',
            link: 'https://leetcode.cn/problems/climbing-stairs/'
        },
        {
            id: 'default-coin-change',
            title: '零钱兑换（完全背包）',
            pattern: '动态规划',
            difficulty: 2,
            offset: 14,
            trigger: '最少数量 + 可重复选择 + 最优子结构 → 完全背包 DP',
            insight: 'dp[amount] 表示凑出该金额的最少硬币数，遍历金额再遍历硬币。',
            stuck: '初始化成 Infinity，dp[0]=0；最后判断是否仍为 Infinity。',
            template: 'for coin: for amount=coin..target: dp[amount]=min(dp[amount], dp[amount-coin]+1)。',
            link: 'https://leetcode.cn/problems/coin-change/'
        },
        {
            id: 'default-merge-two-lists',
            title: '合并两个有序链表',
            pattern: '链表',
            difficulty: 1,
            offset: 30,
            trigger: '有序链表 + 合并 → 哑节点 + 双指针',
            insight: '用 dummy 节点串起结果，比较两个链表当前节点后接上较小者。',
            stuck: '循环结束后要把剩余链表直接接上；dummy.next 返回。',
            template: 'dummy=new; cur=dummy; while a!=null && b!=null: ...; cur.next = a ?? b; return dummy.next。',
            link: 'https://leetcode.cn/problems/merge-two-sorted-lists/'
        }
    ];

    var PROBLEM_DETAILS = {
        'default-sort-insertion': {
            description: '给定一个整数数组 nums，使用插入排序将其按升序排列。要求原地排序，不额外申请与 n 同规模的数组。',
            examples: [
                { input: 'nums = [5,2,4,6,1,3]', output: '[1,2,3,4,5,6]', explain: '把每个元素插入前面已经有序的区间。' },
                { input: 'nums = [2,1]', output: '[1,2]', explain: '只有一个逆序对，交换一次即可。' }
            ],
            constraints: ['1 <= nums.length <= 5000', '-10000 <= nums[i] <= 10000', '要求稳定排序']
        },
        'default-sort-bubble': {
            description: '给定一个整数数组 nums，使用冒泡排序将其按升序排列。每轮比较相邻元素，把当前最大值冒到未排序区末尾。',
            examples: [
                { input: 'nums = [5,2,4,6,1,3]', output: '[1,2,3,4,5,6]', explain: '相邻逆序就交换，直到整轮没有交换。' },
                { input: 'nums = [1,2,3]', output: '[1,2,3]', explain: '已经有序时可通过 swapped 优化提前结束。' }
            ],
            constraints: ['1 <= nums.length <= 5000', '-10000 <= nums[i] <= 10000', '最好情况 O(n)，最坏 O(n²)']
        },
        'default-sort-selection': {
            description: '给定一个整数数组 nums，使用选择排序将其按升序排列。每轮从未排序区选择最小值，放到已排序区末尾。',
            examples: [
                { input: 'nums = [64,25,12,22,11]', output: '[11,12,22,25,64]', explain: '每轮记录最小元素下标，再与当前位置交换。' },
                { input: 'nums = [3,3,1]', output: '[1,3,3]', explain: '选择排序不稳定，但结果仍然升序。' }
            ],
            constraints: ['1 <= nums.length <= 5000', '-10000 <= nums[i] <= 10000', '交换次数最多 n-1 次']
        },
        'default-sort-merge': {
            description: '给定一个整数数组 nums，使用归并排序将其按升序排列。要求稳定排序，并分析递归深度与额外空间。',
            examples: [
                { input: 'nums = [5,2,4,6,1,3]', output: '[1,2,3,4,5,6]', explain: '递归排序左右两半，再合并两个有序区间。' },
                { input: 'nums = [4,1,3,2]', output: '[1,2,3,4]', explain: '合并时相等元素优先取左边，保证稳定性。' }
            ],
            constraints: ['1 <= nums.length <= 100000', '-10^9 <= nums[i] <= 10^9', '时间复杂度 O(n log n)，空间 O(n)']
        },
        'default-sort-quick': {
            description: '给定一个整数数组 nums，使用快速排序将其按升序排列。要求原地 partition，并说明重复元素很多时如何避免退化。',
            examples: [
                { input: 'nums = [3,2,1,5,6,4]', output: '[1,2,3,4,5,6]', explain: '以末尾元素为 pivot，分成小于区和大于区。' },
                { input: 'nums = [2,2,2,1]', output: '[1,2,2,2]', explain: '重复元素多时可用三路 partition 或随机 pivot。' }
            ],
            constraints: ['1 <= nums.length <= 100000', '-10^9 <= nums[i] <= 10^9', '平均 O(n log n)，最坏 O(n²)']
        },
        'default-sort-heap': {
            description: '给定整数数组 nums 和整数 k，返回数组中第 k 大的元素。要求使用堆，并说明为什么求第 k 大要维护小顶堆。',
            examples: [
                { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5', explain: '维护大小为 2 的小顶堆，堆顶就是第 2 大。' },
                { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4', explain: '重复元素按出现次数参与排序。' }
            ],
            constraints: ['1 <= k <= nums.length <= 100000', '-10000 <= nums[i] <= 10000', '优先使用 O(n log k) 解法']
        },
        'default-binary-search': {
            description: '给定一个升序整数数组 nums 和目标值 target，返回 target 的下标；不存在时返回 -1。要求写出明确的区间语义。',
            examples: [
                { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explain: '9 出现在下标 4。' },
                { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explain: '数组中不存在 2。' }
            ],
            constraints: ['1 <= nums.length <= 10000', 'nums 严格递增', '-10000 <= nums[i], target <= 10000']
        },
        'default-two-sum': {
            description: '给定整数数组 nums 和整数 target，在数组中找出和为目标值的两个整数，返回它们的下标。假设每个输入只对应一个答案，且不能重复使用同一元素。',
            examples: [
                { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explain: 'nums[0] + nums[1] = 2 + 7 = 9。' },
                { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explain: '不能使用同一个 3 两次。' }
            ],
            constraints: ['2 <= nums.length <= 100000', '-10^9 <= nums[i], target <= 10^9', '只存在一个有效答案']
        },
        'default-longest-no-repeat': {
            description: '给定一个字符串 s，找出其中不含重复字符的最长子串长度。注意是子串，不是子序列。',
            examples: [
                { input: 's = "abcabcbb"', output: '3', explain: '最长无重复子串是 "abc"。' },
                { input: 's = "bbbbb"', output: '1', explain: '最长无重复子串是 "b"。' },
                { input: 's = "pwwkew"', output: '3', explain: '最长子串是 "wke"，"pwke" 是子序列不是子串。' }
            ],
            constraints: ['0 <= s.length <= 100000', 's 由英文字母、数字、符号和空格组成', '要求 O(n) 滑动窗口']
        },
        'default-binary-tree-level-order': {
            description: '给定二叉树的根节点 root，返回其节点值的层序遍历结果，即逐层从左到右访问所有节点。',
            examples: [
                { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explain: '第一层 3，第二层 9/20，第三层 15/7。' },
                { input: 'root = []', output: '[]', explain: '空树返回空数组。' }
            ],
            constraints: ['树中节点数在 [0, 2000] 范围内', '-1000 <= Node.val <= 1000', '使用队列，每层固定 size']
        },
        'default-climb-stairs': {
            description: '假设你正在爬楼梯，需要 n 阶才能到达楼顶。每次可以爬 1 或 2 个台阶，问有多少种不同的方法可以爬到楼顶。',
            examples: [
                { input: 'n = 2', output: '2', explain: '1+1 或 2。' },
                { input: 'n = 3', output: '3', explain: '1+1+1、1+2、2+1。' }
            ],
            constraints: ['1 <= n <= 45', '结果在 int 范围内', '可压缩为 O(1) 空间']
        },
        'default-coin-change': {
            description: '给定不同面额的硬币 coins 和总金额 amount，计算凑成总金额所需的最少硬币个数。如果无法凑成，返回 -1。每种硬币数量无限。',
            examples: [
                { input: 'coins = [1,2,5], amount = 11', output: '3', explain: '11 = 5 + 5 + 1。' },
                { input: 'coins = [2], amount = 3', output: '-1', explain: '面额 2 无法凑出 3。' },
                { input: 'coins = [1], amount = 0', output: '0', explain: '金额为 0 时不需要硬币。' }
            ],
            constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10000']
        },
        'default-merge-two-lists': {
            description: '给定两个升序链表 list1 和 list2，将它们合并为一个新的升序链表并返回头节点。新链表由拼接给定两个链表的所有节点组成。',
            examples: [
                { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explain: '按大小依次接上较小节点。' },
                { input: 'list1 = [], list2 = [0]', output: '[0]', explain: '空链表直接返回另一个链表。' }
            ],
            constraints: ['两个链表的节点数在 [0, 50] 范围内', '-100 <= Node.val <= 100', '两个链表均按升序排列']
        }
    };

    var METHOD_STEPS = [
        { icon: 'fas fa-hourglass-half', title: '先想 15 分钟', text: '卡住也不要立刻看题解。把能想到的暴力解、数据结构、边界写下来，记录卡点。' },
        { icon: 'fas fa-pen', title: '合上题解重写', text: '看懂不等于会写。看完题解后必须关掉页面，从空白重写一遍；写不出来说明还没掌握。' },
        { icon: 'fas fa-list-ul', title: '只写三行笔记', text: '题型 / 关键洞察 / 我卡在哪。不要抄代码，代码会过时，模式不会。' },
        { icon: 'fas fa-redo', title: '按间隔重做', text: '24 小时后、7 天后、30 天后各独立重做一次；只看题名先想，不先翻笔记。' },
        { icon: 'fas fa-random', title: '交错练习', text: '一个专题刷完后，随机混入不同题型，训练「看到题能识别模型」的能力。' },
        { icon: 'fas fa-comment-dots', title: '费曼讲题', text: '用 2 分钟讲清思路、复杂度、边界；讲不顺的地方就是下一次复习重点。' }
    ];

    var REVIEW_RULES = [
        { stage: '第 1 次', time: '24 小时后', goal: '独立重写，能说出题型与关键洞察' },
        { stage: '第 2 次', time: '7 天后', goal: '只看题名，复述模板与边界' },
        { stage: '第 3 次', time: '30 天后', goal: '能迁移到变形题，讲清为什么' },
        { stage: '维护', time: '已掌握后', goal: '偶尔混入随机题单，防止遗忘' }
    ];

    var ANTI_PATTERNS = [
        '只刷新题，从不复盘',
        '看懂题解就认为自己会了',
        '抄代码当笔记',
        '同一专题连续刷，从不交错',
        '错题只看不改，不记录卡点',
        '追求 AC，不总结触发词和模型'
    ];

    /* ===================== 状态 ===================== */

    var root = null;
    var ui = {
        playgroundProblemId: null,
        playgroundSearch: '',
        playgroundPattern: '',
        problemPanelCollapsed: false,
        tab: 'today',
        search: '',
        pattern: '',
        status: 'all',
        queue: [],
        queueIndex: 0,
        currentReviewId: null,
        timerInterval: null,
        recentRandomIds: [],
        quizRecentIds: [],
        quiz: {
            mode: 'recall',
            problemId: null,
            revealed: false,
            options: [],
            answer: null,
            selected: null
        }
    };
    var store = defaultStore();

    /* ===================== 基础工具 ===================== */

    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function todayStr(d) {
        var date = d || new Date();
        return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
    }

    function parseDate(str) {
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || ''));
        if (!m) return null;
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    }

    function addDays(str, n) {
        var d = parseDate(str) || new Date();
        d.setDate(d.getDate() + n);
        return todayStr(d);
    }

    function daysBetween(a, b) {
        var da = parseDate(a);
        var db = parseDate(b);
        if (!da || !db) return 0;
        return Math.round((db.getTime() - da.getTime()) / 86400000);
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function uid() {
        return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i];
            a[i] = a[j];
            a[j] = t;
        }
        return a;
    }

    function toast(message) {
        if (!root) return;
        var el = root.querySelector('#algo-toast');
        if (!el) return;
        el.textContent = message;
        el.classList.add('is-show');
        clearTimeout(el._timer);
        el._timer = setTimeout(function () {
            el.classList.remove('is-show');
        }, 2600);
    }

    /* ===================== 数据 ===================== */

    function createDefaultProblems() {
        var today = todayStr();
        return DEFAULT_PROBLEM_SEEDS.map(function (seed) {
            var item = {};
            Object.keys(seed).forEach(function (key) { item[key] = seed[key]; });
            var detail = PROBLEM_DETAILS[seed.id] || {};
            Object.keys(detail).forEach(function (key) { item[key] = detail[key]; });
            item.createdAt = today;
            item.nextReview = addDays(today, seed.offset || 0);
            item.stage = 0;
            item.lapses = 0;
            item.reviewLog = [];
            return normalizeProblem(item);
        }).filter(Boolean);
    }

    function defaultStore() {
        return { version: 1, seeded: true, problems: createDefaultProblems() };
    }

    function parseExampleInput(text) {
        var raw = String(text || '').trim();
        if (!raw) return [];
        try {
            var parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === 'object') return [parsed];
        } catch (e) {
            return raw.split('\n').map(function (line) {
                try { return JSON.parse(line); } catch (err) { return null; }
            }).filter(Boolean);
        }
        return [];
    }

    function normalizeProblem(p) {
        if (!p || !p.title) return null;
        var today = todayStr();
        var stage = parseInt(p.stage, 10);
        if (!isFinite(stage)) stage = 0;
        stage = Math.max(0, Math.min(stage, 3));
        var nextReview = String(p.nextReview || '');
        if (stage < 3 && !parseDate(nextReview)) {
            nextReview = addDays(today, INTERVALS[Math.min(stage, 2)]);
        }
        return {
            id: p.id || uid(),
            title: String(p.title).trim(),
            link: String(p.link || '').trim(),
            pattern: String(p.pattern || '未分类').trim() || '未分类',
            difficulty: Math.max(1, Math.min(parseInt(p.difficulty, 10) || 2, 3)),
            description: String(p.description || '').trim(),
            examples: Array.isArray(p.examples) ? p.examples.slice(0, 6).map(function (ex) {
                return {
                    input: String(ex.input || '').trim(),
                    output: String(ex.output || '').trim(),
                    explain: String(ex.explain || '').trim()
                };
            }).filter(function (ex) { return ex.input || ex.output; }) : [],
            constraints: Array.isArray(p.constraints) ? p.constraints.slice(0, 12).map(function (c) {
                return String(c).trim();
            }).filter(Boolean) : [],
            trigger: String(p.trigger || '').trim(),
            insight: String(p.insight || '').trim(),
            stuck: String(p.stuck || '').trim(),
            template: String(p.template || '').trim(),
            createdAt: parseDate(p.createdAt) ? p.createdAt : today,
            nextReview: stage >= 3 ? '' : nextReview,
            stage: stage,
            lapses: parseInt(p.lapses, 10) || 0,
            lastReview: String(p.lastReview || ''),
            reviewLog: Array.isArray(p.reviewLog) ? p.reviewLog.slice(-100) : []
        };
    }

    function loadStore() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return defaultStore();
            var data = JSON.parse(raw);
            if (!data || !Array.isArray(data.problems)) return defaultStore();
            // 兼容旧版本：之前没有 seeded 标记且题库为空时，载入默认常用题
            if (!data.seeded && data.problems.length === 0) {
                data.seeded = true;
                data.problems = createDefaultProblems();
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                } catch (e) { /* ignore */ }
            }
            data.problems.forEach(function (p) {
                if (p && !p.description && PROBLEM_DETAILS[p.id]) {
                    Object.keys(PROBLEM_DETAILS[p.id]).forEach(function (key) {
                        p[key] = PROBLEM_DETAILS[p.id][key];
                    });
                }
            });
            return {
                version: 1,
                seeded: true,
                problems: data.problems.map(normalizeProblem).filter(Boolean)
            };
        } catch (e) {
            return defaultStore();
        }
    }

    function saveStore() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        } catch (e) {
            toast('保存失败：浏览器 localStorage 不可用');
        }
    }

    function findProblem(id) {
        for (var i = 0; i < store.problems.length; i++) {
            if (store.problems[i].id === id) return store.problems[i];
        }
        return null;
    }

    function isDue(p) {
        return p.stage < 3 && !!p.nextReview && p.nextReview <= todayStr();
    }

    function dueProblems() {
        return store.problems
            .filter(isDue)
            .sort(function (a, b) {
                if (a.nextReview !== b.nextReview) return a.nextReview < b.nextReview ? -1 : 1;
                return a.title.localeCompare(b.title, 'zh-CN');
            });
    }

    function getPatternNames() {
        var map = {};
        PATTERNS.forEach(function (p) { map[p.name] = true; });
        store.problems.forEach(function (p) {
            if (p.pattern) map[p.pattern] = true;
        });
        return Object.keys(map).sort(function (a, b) {
            return a.localeCompare(b, 'zh-CN');
        });
    }

    /* ===================== 渲染：骨架 ===================== */
    function hydrateDefaultProblems() {
        if (!window.ContentDB || typeof window.ContentDB.ensure !== 'function') {
            return Promise.resolve(false);
        }
        return window.ContentDB.ensure().then(function (db) {
            var list = db && db.tables ? db.tables.algorithms : null;
            if (Array.isArray(list) && list.length) {
                DEFAULT_PROBLEM_SEEDS = list.map(function (a) {
                    return {
                        id: a.id,
                        title: a.title,
                        pattern: a.pattern,
                        difficulty: a.difficulty,
                        offset: 0,
                        trigger: a.trigger,
                        insight: a.insight,
                        stuck: a.stuck,
                        template: a.template,
                        link: a.link
                    };
                });
                return true;
            }
            return false;
        }).catch(function () { return false; });
    }


    function init() {
        var el = document.getElementById('algo-review-app');
        if (!el) return;
        if (el.dataset.ready === '1') return;
        if (el.dataset.booted === '1') el.dataset.ready = '1';
        root = el;
        if (el.dataset.booted !== '1') {
            el.dataset.booted = '1';
            el.innerHTML = '<div class="algo-loading">正在加载算法数据...</div>';
            hydrateDefaultProblems().then(function () { init(); });
            return;
        }
        store = loadStore();
        buildShell();
        bindEvents();
        registerSiteActions();
        render();
    }

    function openWorkbench(problemId) {
        if (problemId && findProblem(problemId)) ui.playgroundProblemId = problemId;
        ui.tab = 'playground';
        render();
        return true;
    }

    function selectPlaygroundProblem(problemId) {
        if (!findProblem(problemId)) return false;
        ui.playgroundProblemId = problemId;
        var left = root && root.querySelector('.algo-workbench-left');
        if (left) {
            left.innerHTML = workbenchLeftHtml();
        } else {
            renderTab();
        }
        return true;
    }

    function copyPlaygroundTemplate(problemId) {
        var p = findProblem(problemId || ui.playgroundProblemId);
        if (!p || !p.template || !navigator.clipboard) return Promise.resolve(false);
        return navigator.clipboard.writeText(p.template).then(function () { return true; }).catch(function () { return false; });
    }

    function currentPlaygroundProblem() {
        var p = findProblem(ui.playgroundProblemId) || store.problems[0] || null;
        if (!p) return null;
        return {
            id: p.id,
            title: p.title,
            pattern: p.pattern,
            difficulty: p.difficulty,
            description: p.description,
            examples: p.examples,
            constraints: p.constraints,
            trigger: p.trigger,
            insight: p.insight,
            stuck: p.stuck,
            template: p.template,
            link: p.link
        };
    }

    function registerSiteActions() {
        if (!window.SiteActionAPI || window.__algoSiteActionsRegistered) return;
        window.__algoSiteActionsRegistered = true;
        window.SiteAlgorithm = {
            openWorkbench: openWorkbench,
            selectProblem: selectPlaygroundProblem,
            copyTemplate: copyPlaygroundTemplate,
            currentProblem: currentPlaygroundProblem
        };
        window.SiteActionAPI.register('algorithm.openWorkbench', function (payload) {
            return openWorkbench(payload && payload.problemId);
        }, { label: '打开算法工作台', scope: 'read', description: '打开算法库 C# 刷题工作台' });
        window.SiteActionAPI.register('algorithm.selectProblem', function (payload) {
            return selectPlaygroundProblem(payload && payload.problemId);
        }, { label: '选择算法题', scope: 'read', description: '在工作台选择指定题目' });
        window.SiteActionAPI.register('algorithm.copyTemplate', function (payload) {
            return copyPlaygroundTemplate(payload && payload.problemId);
        }, { label: '复制算法模板', scope: 'read-local', description: '复制当前算法题模板到剪贴板' });
    }

    function buildShell() {
        root.innerHTML = [
            '<section class="algo-hero">',
            '  <div class="algo-hero-main">',
            '    <p class="algo-kicker">ALGORITHM REVIEW LOOP</p>',
            '    <h2>刷题不靠蛮力，靠闭环</h2>',
            '    <p class="algo-hero-desc">每题只记三行：<strong>题型 / 关键洞察 / 我卡在哪</strong>。系统按 <strong>24h → 7d → 30d</strong> 提醒你独立重做。</p>',
            '    <div class="algo-hero-actions">',
            '      <button type="button" class="algo-btn algo-btn-light" data-action="add"><i class="fas fa-plus"></i> 录入题目</button>',
            '      <button type="button" class="algo-btn algo-btn-ghost-light" data-action="review-due"><i class="fas fa-play"></i> 开始今日复习</button>',
            '      <button type="button" class="algo-btn algo-btn-ghost-light" data-action="random"><i class="fas fa-random"></i> 随机交错 5 题</button>',
            '    </div>',
            '  </div>',
            '  <div class="algo-stats" aria-label="学习统计">',
            '    <div class="algo-stat"><strong id="algo-stat-due">0</strong><span>今日待复习</span></div>',
            '    <div class="algo-stat"><strong id="algo-stat-learning">0</strong><span>复习中</span></div>',
            '    <div class="algo-stat"><strong id="algo-stat-mastered">0</strong><span>已掌握</span></div>',
            '    <div class="algo-stat"><strong id="algo-stat-today">0</strong><span>今日已复习</span></div>',
            '  </div>',
            '</section>',
            '<nav class="algo-tabs" role="tablist" aria-label="算法库视图">',
            '  <button type="button" class="algo-tab" role="tab" data-action="tab" data-tab="today">今日复习</button>',
            '  <button type="button" class="algo-tab" role="tab" data-action="tab" data-tab="quiz">自测</button>',
            '  <button type="button" class="algo-tab" role="tab" data-action="tab" data-tab="problems">题目本</button>',
            '  <button type="button" class="algo-tab" role="tab" data-action="tab" data-tab="patterns">模式识别</button>',
            '  <button type="button" class="algo-tab" role="tab" data-action="tab" data-tab="playground">C# 实验</button>',
              '  <button type="button" class="algo-tab" role="tab" data-action="tab" data-tab="method">方法论</button>',
            '</nav>',
            '<div id="algo-tab-content" class="algo-tab-content"></div>',
            '<div id="algo-modal-root"></div>',
            '<div id="algo-toast" class="algo-toast" role="status" aria-live="polite"></div>'
        ].join('');
    }

    function render() {
        renderStats();
        renderTabs();
        renderTab();
    }

    function renderStats() {
        var today = todayStr();
        var due = dueProblems().length;
        var learning = store.problems.filter(function (p) { return p.stage < 3; }).length;
        var mastered = store.problems.filter(function (p) { return p.stage >= 3; }).length;
        var reviewedToday = 0;
        store.problems.forEach(function (p) {
            p.reviewLog.forEach(function (log) {
                if (log && log.date === today) reviewedToday++;
            });
        });
        setText('algo-stat-due', due);
        setText('algo-stat-learning', learning);
        setText('algo-stat-mastered', mastered);
        setText('algo-stat-today', reviewedToday);
    }

    function setText(id, value) {
        var el = root.querySelector('#' + id);
        if (el) el.textContent = String(value);
    }

    function renderTabs() {
        root.querySelectorAll('.algo-tab').forEach(function (btn) {
            var active = btn.dataset.tab === ui.tab;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    function renderTab() {
        var content = root.querySelector('#algo-tab-content');
        if (!content) return;
        root.classList.toggle('is-playground', ui.tab === 'playground');

        if (ui.tab === 'today') {
            content.innerHTML = todayHtml();
        } else if (ui.tab === 'quiz') {
            ensureQuiz();
            content.innerHTML = quizHtml();
        } else if (ui.tab === 'problems') {
            content.innerHTML = problemsShellHtml();
            renderProblemList();
        } else if (ui.tab === 'patterns') {
            content.innerHTML = patternsHtml();
        } else if (ui.tab === 'playground') {
            content.innerHTML = playgroundHtml();
        } else {
            content.innerHTML = methodHtml();
        }
    }

    /* ===================== 渲染：今日复习 ===================== */

    function todayHtml() {
        var due = dueProblems();
        var today = todayStr();
        var upcoming = store.problems
            .filter(function (p) { return p.stage < 3 && p.nextReview > today; })
            .sort(function (a, b) { return a.nextReview < b.nextReview ? -1 : 1; })
            .slice(0, 8);

        var head = [
            '<div class="algo-section-head">',
            '  <div>',
            '    <h2>今日复习</h2>',
            '    <p>' + (due.length
                ? '有 <strong>' + due.length + '</strong> 道题到期。先独立重做，再决定通过还是明天再来。'
                : '今天没有到期题目。可以做一次随机交错练习，或录入新的错题/典型题。') + '</p>',
            '  </div>',
            '  <div class="algo-inline-actions">',
            '    <button type="button" class="algo-btn algo-btn-primary" data-action="review-due"' + (due.length ? '' : ' disabled') + '><i class="fas fa-play"></i> 开始复习队列</button>',
            '    <button type="button" class="algo-btn" data-action="random"><i class="fas fa-random"></i> 随机 5 题</button>',
            '  </div>',
            '</div>'
        ].join('');

        if (store.problems.length === 0) {
            return head + emptyFirstHtml();
        }

        var body = due.length
            ? '<div class="algo-problem-list">' + due.map(function (p) { return problemCardHtml(p); }).join('') + '</div>'
            : emptyDueHtml();

        var upcomingHtml = '';
        if (upcoming.length) {
            upcomingHtml = [
                '<section class="algo-upcoming">',
                '  <div class="algo-upcoming-head"><h3>接下来 7 天</h3><span>自动排期</span></div>',
                '  <div class="algo-upcoming-list">',
                upcoming.map(function (p) {
                    var d = daysBetween(today, p.nextReview);
                    var label = d <= 0 ? '今天' : (d === 1 ? '明天' : d + ' 天后');
                    return '<button type="button" class="algo-upcoming-item" data-action="review" data-id="' + escapeHtml(p.id) + '">' +
                        '<span class="algo-upcoming-date">' + escapeHtml(label) + '</span>' +
                        '<span class="algo-upcoming-title">' + escapeHtml(p.title) + '</span>' +
                        '<span class="algo-pill">' + escapeHtml(p.pattern) + '</span>' +
                        '</button>';
                }).join(''),
                '  </div>',
                '</section>'
            ].join('');
        }

        return head + body + upcomingHtml;
    }

    function emptyFirstHtml() {
        return [
            '<div class="algo-empty">',
            '  <i class="fas fa-brain"></i>',
            '  <h3>还没有题目</h3>',
            '  <p>从一道错题或典型题开始。只写三行：题型、关键洞察、我卡在哪。系统会自动安排 24h / 7d / 30d 复习。</p>',
            '  <div class="algo-empty-actions">',
            '    <button type="button" class="algo-btn algo-btn-primary" data-action="add"><i class="fas fa-plus"></i> 录入第一题</button>',
            '    <button type="button" class="algo-btn" data-action="demo"><i class="fas fa-magic"></i> 载入示例看效果</button>',
            '  </div>',
            '</div>'
        ].join('');
    }

    function emptyDueHtml() {
        return [
            '<div class="algo-empty algo-empty-ok">',
            '  <i class="fas fa-check-circle"></i>',
            '  <h3>今天已清空</h3>',
            '  <p>不要急着刷新题。随机抽几道旧题做交错练习，或者把今天的新错题录入进来。</p>',
            '  <div class="algo-empty-actions">',
            '    <button type="button" class="algo-btn algo-btn-primary" data-action="random"><i class="fas fa-random"></i> 随机交错 5 题</button>',
            '    <button type="button" class="algo-btn" data-action="add"><i class="fas fa-plus"></i> 录入新题</button>',
            '  </div>',
            '</div>'
        ].join('');
    }

    /* ===================== 渲染：题目卡片 ===================== */

    function problemCardHtml(p) {
        var due = isDue(p);
        var overdue = due ? Math.max(0, daysBetween(p.nextReview, todayStr())) : 0;
        var dueText = p.stage >= 3
            ? '已掌握'
            : (due ? (overdue > 0 ? '逾期 ' + overdue + ' 天' : '今天复习') : p.nextReview + ' 复习');
        var cls = 'algo-problem-card';
        if (due) cls += ' is-due';
        if (p.stage >= 3) cls += ' is-mastered';

        var title = p.link
            ? '<a href="' + escapeHtml(p.link) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(p.title) + '</a>'
            : escapeHtml(p.title);

        var note = '';
        if (p.insight) note += '<p class="algo-note"><span>洞察</span>' + escapeHtml(p.insight) + '</p>';
        if (p.stuck) note += '<p class="algo-note algo-note-stuck"><span>卡点</span>' + escapeHtml(p.stuck) + '</p>';
        if (!note) note = '<p class="algo-note algo-note-empty">还没写关键洞察和卡点。复习时补上，比抄代码有用。</p>';

        return [
            '<article class="' + cls + '" data-id="' + escapeHtml(p.id) + '">',
            '  <div class="algo-card-top">',
            '    <span class="algo-pill algo-pill-pattern">' + escapeHtml(p.pattern) + '</span>',
            '    <span class="algo-pill algo-pill-diff">' + escapeHtml(DIFFICULTY_LABELS[p.difficulty] || '进阶') + '</span>',
            '    <span class="algo-pill ' + (due ? 'algo-pill-due' : (p.stage >= 3 ? 'algo-pill-ok' : 'algo-pill-muted')) + '">' + escapeHtml(dueText) + '</span>',
            '    <span class="algo-stage">' + (p.stage >= 3 ? '已完成 3 轮' : '第 ' + (p.stage + 1) + ' / 3 轮') + '</span>',
            '  </div>',
            '  <h3 class="algo-card-title">' + title + '</h3>',
            p.trigger ? '<p class="algo-trigger"><i class="fas fa-bolt"></i>' + escapeHtml(p.trigger) + '</p>' : '',
            note,
            '  <div class="algo-card-foot">',
            '    <span class="algo-card-meta">' + (p.lastReview ? '上次复习：' + escapeHtml(p.lastReview) : '尚未复习') + (p.lapses ? ' · 卡壳 ' + p.lapses + ' 次' : '') + '</span>',
            '    <div class="algo-card-actions">',
            '      <button type="button" class="algo-btn algo-btn-small" data-action="review" data-id="' + escapeHtml(p.id) + '"><i class="fas fa-redo"></i> ' + (p.stage >= 3 ? '再复习' : '复习') + '</button>',
              '      <button type="button" class="algo-btn algo-btn-small algo-btn-ghost" data-action="open-playground" data-id="' + escapeHtml(p.id) + '"><i class="fas fa-code"></i> C# 实验</button>',
            '      <button type="button" class="algo-btn algo-btn-small algo-btn-ghost" data-action="edit" data-id="' + escapeHtml(p.id) + '"><i class="fas fa-pen"></i> 编辑</button>',
            '      <button type="button" class="algo-icon-btn" data-action="delete" data-id="' + escapeHtml(p.id) + '" title="删除"><i class="fas fa-trash"></i></button>',
            '    </div>',
            '  </div>',
            '</article>'
        ].join('');
    }

    /* ===================== 渲染：题目本 ===================== */

    function problemsShellHtml() {
        var patterns = getPatternNames();
        var opts = ['<option value="">全部题型</option>'].concat(patterns.map(function (name) {
            return '<option value="' + escapeHtml(name) + '"' + (ui.pattern === name ? ' selected' : '') + '>' + escapeHtml(name) + '</option>';
        })).join('');

        return [
            '<div class="algo-section-head">',
            '  <div>',
            '    <h2>题目本</h2>',
            '    <p>搜索题型、触发词、洞察或卡点。数据只保存在当前浏览器，记得定期导出备份。</p>',
            '  </div>',
            '  <div class="algo-inline-actions">',
            '    <button type="button" class="algo-btn algo-btn-primary" data-action="add"><i class="fas fa-plus"></i> 新增题目</button>',
            '    <button type="button" class="algo-btn" data-action="export-json"><i class="fas fa-download"></i> 导出 JSON</button>',
            '    <button type="button" class="algo-btn" data-action="export-md"><i class="fas fa-file-alt"></i> 导出 MD</button>',
            '    <button type="button" class="algo-btn" data-action="import-json"><i class="fas fa-upload"></i> 导入</button>',
            '  </div>',
            '</div>',
            '<div class="algo-toolbar">',
            '  <input id="algo-search" class="algo-input" type="search" placeholder="搜索题目 / 题型 / 触发词 / 洞察 / 卡点" value="' + escapeHtml(ui.search) + '">',
            '  <select id="algo-filter-pattern" class="algo-select">' + opts + '</select>',
            '  <select id="algo-filter-status" class="algo-select">',
            '    <option value="all"' + (ui.status === 'all' ? ' selected' : '') + '>全部状态</option>',
            '    <option value="due"' + (ui.status === 'due' ? ' selected' : '') + '>今日待复习</option>',
            '    <option value="learning"' + (ui.status === 'learning' ? ' selected' : '') + '>复习中</option>',
            '    <option value="mastered"' + (ui.status === 'mastered' ? ' selected' : '') + '>已掌握</option>',
            '  </select>',
            '</div>',
            '<div class="algo-list-meta"><span id="algo-problem-count">共 0 题</span><span>建议：先只看题名回想，再展开笔记。</span></div>',
            '<div id="algo-problem-list" class="algo-problem-list"></div>',
            '<input id="algo-import-file" type="file" accept=".json,application/json" hidden>'
        ].join('');
    }

    function filterProblems() {
        var keyword = ui.search.trim().toLowerCase();
        return store.problems.filter(function (p) {
            if (ui.pattern && p.pattern !== ui.pattern) return false;
            if (ui.status === 'due' && !isDue(p)) return false;
            if (ui.status === 'learning' && p.stage >= 3) return false;
            if (ui.status === 'mastered' && p.stage < 3) return false;
            if (!keyword) return true;
            var haystack = [p.title, p.pattern, p.trigger, p.insight, p.stuck, p.template]
                .join(' ').toLowerCase();
            return haystack.indexOf(keyword) !== -1;
        }).sort(function (a, b) {
            var ad = isDue(a) ? 0 : 1;
            var bd = isDue(b) ? 0 : 1;
            if (ad !== bd) return ad - bd;
            if (a.nextReview && b.nextReview && a.nextReview !== b.nextReview) {
                return a.nextReview < b.nextReview ? -1 : 1;
            }
            return b.createdAt < a.createdAt ? -1 : 1;
        });
    }

    function renderProblemList() {
        var list = root.querySelector('#algo-problem-list');
        if (!list) return;
        var filtered = filterProblems();
        var count = root.querySelector('#algo-problem-count');
        if (count) count.textContent = '共 ' + filtered.length + ' 题';

        if (!filtered.length) {
            list.innerHTML = [
                '<div class="algo-empty algo-empty-small">',
                '  <i class="fas fa-search"></i>',
                '  <h3>没有匹配的题目</h3>',
                '  <p>' + (store.problems.length ? '换个关键词或筛选条件试试。' : '先录入一道错题或典型题。') + '</p>',
                '</div>'
            ].join('');
            return;
        }
        list.innerHTML = filtered.map(problemCardHtml).join('');
    }

    /* ===================== 渲染：自测 ===================== */

    function getPattern(name) {
        for (var i = 0; i < PATTERNS.length; i++) {
            if (PATTERNS[i].name === name) return PATTERNS[i];
        }
        return null;
    }

    function ensureQuiz() {
        if (!ui.quiz) {
            ui.quiz = { mode: 'recall', problemId: null, revealed: false, options: [], answer: null, selected: null };
        }
        if (ui.quiz.mode === 'pattern') {
            if (!ui.quiz.answer || !ui.quiz.options || ui.quiz.options.length === 0) {
                newPatternQuiz();
            }
            return;
        }
        var current = ui.quiz.problemId ? findProblem(ui.quiz.problemId) : null;
        if (!current) {
            var pool = dueProblems();
            if (!pool.length) pool = store.problems;
            if (pool.length) {
                var recent = ui.quizRecentIds || [];
                var fresh = pool.filter(function (p) { return recent.indexOf(p.id) === -1; });
                if (!fresh.length) fresh = pool.slice();
                var pick = fresh[Math.floor(Math.random() * fresh.length)];
                ui.quiz.problemId = pick.id;
                ui.quiz.revealed = false;
                var keep = Math.max(0, store.problems.length - 1);
                ui.quizRecentIds = recent.concat([pick.id]).slice(-keep);
            }
        }
    }

    function newRecallQuiz() {
        var pool = store.problems;
        if (pool.length > 1 && ui.quiz.problemId) {
            pool = pool.filter(function (p) { return p.id !== ui.quiz.problemId; });
        }
        if (!pool.length) pool = store.problems;
        if (pool.length) {
            var recent = ui.quizRecentIds || [];
            var fresh = pool.filter(function (p) { return recent.indexOf(p.id) === -1; });
            if (!fresh.length) fresh = pool.slice();
            var pick = fresh[Math.floor(Math.random() * fresh.length)];
            ui.quiz.problemId = pick.id;
            var keep = Math.max(0, store.problems.length - 1);
            ui.quizRecentIds = recent.concat([pick.id]).slice(-keep);
        } else {
            ui.quiz.problemId = null;
        }
        ui.quiz.revealed = false;
    }

    function newPatternQuiz() {
        if (!PATTERNS.length) return;
        var answer = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
        var others = PATTERNS.filter(function (p) { return p.name !== answer.name; });
        others = shuffle(others).slice(0, 3).map(function (p) { return p.name; });
        var options = shuffle([answer.name].concat(others));
        ui.quiz.mode = 'pattern';
        ui.quiz.answer = answer.name;
        ui.quiz.options = options;
        ui.quiz.selected = null;
        ui.quiz.revealed = false;
        ui.quiz.problemId = null;
    }

    function quizHtml() {
        var mode = ui.quiz.mode || 'recall';
        var modeHtml = [
            '<div class="algo-quiz-modes">',
            '  <button type="button" class="algo-quiz-mode' + (mode === 'recall' ? ' is-active' : '') + '" data-action="quiz-mode" data-mode="recall"><i class="fas fa-brain"></i> 三行笔记回忆</button>',
            '  <button type="button" class="algo-quiz-mode' + (mode === 'pattern' ? ' is-active' : '') + '" data-action="quiz-mode" data-mode="pattern"><i class="fas fa-bolt"></i> 触发词 → 题型</button>',
            '</div>'
        ].join('');

        if (mode === 'pattern') {
            return modeHtml + patternQuizHtml();
        }
        return modeHtml + recallQuizHtml();
    }

    function recallQuizHtml() {
        var p = ui.quiz.problemId ? findProblem(ui.quiz.problemId) : null;
        if (!p) {
            return [
                '<div class="algo-empty algo-empty-small">',
                '  <i class="fas fa-brain"></i>',
                '  <h3>还没有可自测的题目</h3>',
                '  <p>先录入一道题，或者到题目本里添加错题和典型题。</p>',
                '  <button type="button" class="algo-btn algo-btn-primary" data-action="add"><i class="fas fa-plus"></i> 录入题目</button>',
                '</div>'
            ].join('');
        }

        var title = p.link
            ? '<a href="' + escapeHtml(p.link) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(p.title) + '</a>'
            : escapeHtml(p.title);

        var reveal = '';
        if (ui.quiz.revealed) {
            reveal = [
                '<div class="algo-quiz-answer">',
                '  <div class="algo-quiz-answer-row"><span>题型</span><strong>' + escapeHtml(p.pattern) + '</strong></div>',
                p.trigger ? '  <div class="algo-quiz-answer-row"><span>触发词</span><strong>' + escapeHtml(p.trigger) + '</strong></div>' : '',
                '  <div class="algo-quiz-answer-row"><span>关键洞察</span><p>' + escapeHtml(p.insight || '还没写') + '</p></div>',
                '  <div class="algo-quiz-answer-row"><span>我卡在哪</span><p>' + escapeHtml(p.stuck || '还没写') + '</p></div>',
                p.template ? '  <div class="algo-quiz-answer-row"><span>模板 / 步骤</span><p class="algo-quiz-template">' + escapeHtml(p.template) + '</p></div>' : '',
                '</div>',
                '<div class="algo-quiz-rating">',
                '  <button type="button" class="algo-btn algo-btn-small algo-quiz-rate rate-forgot" data-action="quiz-rate" data-rating="forgot">忘了 · 明天再来</button>',
                '  <button type="button" class="algo-btn algo-btn-small algo-quiz-rate rate-fuzzy" data-action="quiz-rate" data-rating="fuzzy">模糊 · 明天巩固</button>',
                '  <button type="button" class="algo-btn algo-btn-small algo-quiz-rate rate-remember" data-action="quiz-rate" data-rating="remember">记得 · 进入下一间隔</button>',
                '</div>'
            ].join('');
        } else {
            reveal = [
                '<div class="algo-quiz-hidden">',
                '  <i class="fas fa-eye-slash"></i>',
                '  <p>先合上笔记，用 1~2 分钟口述：题型 / 关键洞察 / 我卡在哪 / 边界条件。讲完再展开自评。</p>',
                '</div>',
                '<button type="button" class="algo-btn algo-btn-primary" data-action="quiz-reveal"><i class="fas fa-eye"></i> 展开我的笔记</button>'
            ].join('');
        }

        return [
            '<div class="algo-quiz-card">',
            '  <div class="algo-quiz-top">',
            '    <span class="algo-pill algo-pill-pattern">回忆模式</span>',
            '    <span class="algo-pill">第 ' + (p.stage + 1) + ' / 3 轮</span>',
            '    <button type="button" class="algo-btn algo-btn-small algo-btn-ghost" data-action="quiz-next"><i class="fas fa-random"></i> 换一题</button>',
            '  </div>',
            '  <h3 class="algo-quiz-title">' + title + '</h3>',
            p.trigger && !ui.quiz.revealed ? '  <div class="algo-quiz-trigger"><i class="fas fa-bolt"></i>' + escapeHtml(p.trigger) + '</div>' : '',
            '  <p class="algo-quiz-prompt">只看题目和触发词，先独立回想；想不起来也先别翻笔记。</p>',
            reveal,
            '</div>'
        ].join('');
    }

    function patternQuizHtml() {
        var q = ui.quiz;
        var answerPattern = getPattern(q.answer);
        if (!answerPattern) return '';

        var optionHtml = q.options.map(function (name) {
            var cls = 'algo-quiz-option';
            if (q.selected) {
                if (name === q.answer) cls += ' is-correct';
                else if (name === q.selected) cls += ' is-wrong';
            }
            return '<button type="button" class="' + cls + '" data-action="quiz-option" data-pattern="' + escapeHtml(name) + '">' + escapeHtml(name) + '</button>';
        }).join('');

        var feedback = '';
        if (q.selected) {
            var ok = q.selected === q.answer;
            feedback = [
                '<div class="algo-quiz-feedback ' + (ok ? 'is-ok' : 'is-bad') + '">',
                '  <strong>' + (ok ? '答对了' : '答错了，正确答案：' + escapeHtml(q.answer)) + '</strong>',
                '  <p>' + escapeHtml(answerPattern.insight) + '</p>',
                '  <p class="algo-quiz-feedback-pitfall">易错边界：' + escapeHtml(answerPattern.pitfall) + '</p>',
                '</div>',
                '<button type="button" class="algo-btn algo-btn-primary" data-action="quiz-next"><i class="fas fa-arrow-right"></i> 下一题</button>'
            ].join('');
        }

        return [
            '<div class="algo-quiz-card">',
            '  <div class="algo-quiz-top">',
            '    <span class="algo-pill algo-pill-pattern">模式识别</span>',
            '    <button type="button" class="algo-btn algo-btn-small algo-btn-ghost" data-action="quiz-next"><i class="fas fa-random"></i> 换一题</button>',
            '  </div>',
            '  <p class="algo-quiz-prompt">看到这些触发词，应该想到哪类模型？</p>',
            '  <div class="algo-quiz-trigger"><i class="fas fa-bolt"></i>' + escapeHtml(answerPattern.trigger) + '</div>',
            '  <div class="algo-quiz-options">' + optionHtml + '</div>',
            feedback,
            '</div>'
        ].join('');
    }

    function workbenchLeftHtml() {
        var selected = findProblem(ui.playgroundProblemId) || store.problems[0] || null;
        var keyword = ui.playgroundSearch.trim().toLowerCase();
        var list = store.problems.filter(function (p) {
            if (ui.playgroundPattern && p.pattern !== ui.playgroundPattern) return false;
            if (!keyword) return true;
            return [p.title, p.pattern, p.trigger, p.insight, p.stuck, p.template, p.description]
                .join(' ').toLowerCase().indexOf(keyword) !== -1;
        }).sort(function (a, b) {
            return String(a.pattern || '').localeCompare(String(b.pattern || '')) || String(a.title || '').localeCompare(String(b.title || ''));
        });
        var listHtml = list.map(function (p) {
            var active = selected && p.id === selected.id;
            return '<button type="button" class="algo-workbench-item' + (active ? ' is-active' : '') + '" data-action="select-playground" data-id="' + escapeHtml(p.id) + '">' +
                '<span class="algo-workbench-pattern">' + escapeHtml(p.pattern || '未分类') + '</span>' +
                '<strong>' + escapeHtml(p.title || '未命名题目') + '</strong>' +
                '</button>';
        }).join('');

        var examplesHtml = selected && selected.examples && selected.examples.length
            ? selected.examples.map(function (ex, index) {
                return '<div class="algo-problem-example">' +
                    '<div class="algo-problem-example-title">示例 ' + (index + 1) + '</div>' +
                    '<pre><span>输入：</span>' + escapeHtml(ex.input || '') + '\n<span>输出：</span>' + escapeHtml(ex.output || '') +
                    (ex.explain ? '\n<span>解释：</span>' + escapeHtml(ex.explain) : '') + '</pre>' +
                    '</div>';
            }).join('')
            : '<p class="algo-problem-muted">这道题还没有录入示例，可以在题目本中补充。</p>';

        var constraintsHtml = selected && selected.constraints && selected.constraints.length
            ? '<ul class="algo-problem-constraints">' + selected.constraints.map(function (c) {
                return '<li>' + escapeHtml(c) + '</li>';
            }).join('') + '</ul>'
            : '<p class="algo-problem-muted">暂无约束说明。</p>';

        var detail = selected ? [
            '<div class="algo-workbench-detail">',
            '  <div class="algo-workbench-detail-top"><span class="algo-pill algo-pill-pattern">' + escapeHtml(selected.pattern || '未分类') + '</span>',
            selected.link ? '  <a class="algo-btn algo-btn-small" href="' + escapeHtml(selected.link) + '" target="_blank" rel="noopener noreferrer">原题链接</a>' : '',
            '</div>',
            '  <h3>' + escapeHtml(selected.title || '未命名题目') + '</h3>',
            '  <details class="algo-problem-fold" open>',
            '    <summary>题目描述</summary>',
            '    <p>' + escapeHtml(selected.description || selected.insight || selected.trigger || '暂无题目描述。') + '</p>',
            '  </details>',
            '  <details class="algo-problem-fold" open>',
            '    <summary>示例</summary>',
            examplesHtml,
            '  </details>',
            '  <details class="algo-problem-fold">',
            '    <summary>约束</summary>',
            constraintsHtml,
            '  </details>',
            '  <details class="algo-problem-fold">',
            '    <summary>复盘笔记</summary>',
            '    <dl class="algo-workbench-meta">',
            '      <dt>触发词</dt><dd>' + escapeHtml(selected.trigger || '待补充') + '</dd>',
            '      <dt>关键洞察</dt><dd>' + escapeHtml(selected.insight || '待补充') + '</dd>',
            '      <dt>我卡在哪</dt><dd>' + escapeHtml(selected.stuck || '待补充') + '</dd>',
            '      <dt>模板 / 步骤</dt><dd><div class="algo-template-text">' + escapeHtml(selected.template || '暂无模板') + '</div></dd>',
            '    </dl>',
            '  </details>',
            '  <button type="button" class="algo-btn algo-btn-primary" data-action="copy-playground-template" data-id="' + escapeHtml(selected.id) + '"><i class="fas fa-copy"></i> 复制模板（粘贴到下方编辑器）</button>',
            '</div>'
        ].join('') : '<div class="algo-workbench-empty">题目本为空，请先在“题目本”录入一道题。</div>';

        var patternOptions = ['<option value="">全部专题</option>'].concat(getPatternNames().map(function (name) {
            return '<option value="' + escapeHtml(name) + '"' + (ui.playgroundPattern === name ? ' selected' : '') + '>' + escapeHtml(name) + '</option>';
        })).join('');

        return [
            '<div class="algo-problem-filters">',
            '  <input id="algo-workbench-search" class="algo-input" type="search" placeholder="搜索题目 / 专题 / 触发词" value="' + escapeHtml(ui.playgroundSearch) + '">',
            '  <select id="algo-workbench-pattern" class="algo-select">' + patternOptions + '</select>',
            '  <span class="algo-problem-filter-count">' + list.length + ' / ' + store.problems.length + ' 题</span>',
            '</div>',
            '<div class="algo-workbench-list">' + (listHtml || '<div class="algo-workbench-empty">没有匹配题目</div>') + '</div>',
            detail
        ].join('');
    }

    function playgroundHtml() {
        return [
            '<section class="algo-playground">',
            '  <div class="algo-section-head">',
            '    <div>',
            '      <h2>刷题工作台</h2>',
            '      <p>上方阅读题目与示例，下方直接编译运行 C#。代码只在浏览器本地 Web Worker 中运行。</p>',
            '    </div>',
            '    <div class="algo-workbench-actions">',
            '      <button type="button" class="algo-btn algo-btn-small" data-action="toggle-problem-panel"><i class="fas fa-chevron-up"></i> ' + (ui.problemPanelCollapsed ? '展开题目区' : '收起题目区') + '</button>',
            '      <a class="algo-btn algo-btn-small" href="https://csharp-roslyn-wasm-playground.pages.dev/" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> 独立页面</a>',
            '    </div>',
            '  </div>',
            '  <div class="algo-playground-tip"><i class="fas fa-info-circle"></i> 首次加载需要下载 .NET 运行时，可能需要 10~30 秒。复制模板后粘贴到下方编辑器即可运行。</div>',
            '  <div class="algo-workbench">',
            '    <aside class="algo-workbench-left' + (ui.problemPanelCollapsed ? ' is-collapsed' : '') + '">' + workbenchLeftHtml() + '</aside>',
            '    <div class="algo-workbench-right">',
            '      <iframe',
            '        id="algo-csharp-playground"',
            '        src="https://csharp-roslyn-wasm-playground.pages.dev/?theme=auto&accent=indigo&layout=stacked&chrome=minimal&completion=manual"',
            '        width="100%"',
            '        height="820"',
            '        style="border:0;border-radius:12px;overflow:hidden;"',
            '        loading="lazy"',
            '        allow="clipboard-write"',
            '        title="C# Playground"',
            '      ></iframe>',
            '    </div>',
            '  </div>',
            '</section>'
        ].join('');
    }

    function applyQuizRating(rating) {
        var p = findProblem(ui.quiz.problemId);
        if (!p) return;
        var today = todayStr();
        p.lastReview = today;
        if (rating === 'remember') {
            if (p.stage >= 2) {
                p.stage = 3;
                p.nextReview = '';
            } else {
                p.stage += 1;
                p.nextReview = addDays(today, INTERVALS[p.stage]);
            }
        } else if (rating === 'fuzzy') {
            p.nextReview = addDays(today, 1);
        } else {
            p.lapses += 1;
            p.stage = 0;
            p.nextReview = addDays(today, 1);
        }
        p.reviewLog.push({ date: today, result: rating });
        recordAlgoStats(p, rating, 'quiz');
        saveStore();
        ui.quiz.problemId = null;
        ui.quiz.revealed = false;
        renderStats();
        renderTab();
        toast(rating === 'remember' ? '记得：已进入下一间隔' : (rating === 'fuzzy' ? '模糊：明天再巩固' : '忘了：已重置并安排明天'));
    }

    /* ===================== 渲染：模式识别 ===================== */

    function patternsHtml() {
        return [
            '<div class="algo-section-head">',
            '  <div>',
            '    <h2>模式识别</h2>',
            '    <p>面试和真实问题考的是「看到题能联想到哪类模型」。先记触发词，再记模板边界。</p>',
            '  </div>',
            '</div>',
            '<div class="algo-pattern-grid">',
            PATTERNS.map(function (p) {
                return [
                    '<article class="algo-pattern-card">',
                    '  <div class="algo-pattern-head">',
                    '    <span class="algo-pattern-icon"><i class="' + escapeHtml(p.icon) + '"></i></span>',
                    '    <h3>' + escapeHtml(p.name) + '</h3>',
                    '  </div>',
                    '  <p class="algo-pattern-line"><strong>触发词</strong>' + escapeHtml(p.trigger) + '</p>',
                    '  <p class="algo-pattern-line"><strong>关键洞察</strong>' + escapeHtml(p.insight) + '</p>',
                    '  <p class="algo-pattern-line"><strong>易错边界</strong>' + escapeHtml(p.pitfall) + '</p>',
                    '  <p class="algo-pattern-examples">' + escapeHtml(p.examples) + '</p>',
                    '  <div class="algo-pattern-actions">',
                    '    <button type="button" class="algo-btn algo-btn-small algo-btn-ghost" data-action="filter-pattern" data-pattern="' + escapeHtml(p.name) + '">看这类题</button>',
                    '    <button type="button" class="algo-btn algo-btn-small" data-action="add-pattern" data-pattern="' + escapeHtml(p.name) + '">录一题</button>',
                    '  </div>',
                    '</article>'
                ].join('');
            }).join(''),
            '</div>'
        ].join('');
    }

    /* ===================== 渲染：方法论 ===================== */

    function methodHtml() {
        return [
            '<div class="algo-section-head">',
            '  <div>',
            '    <h2>方法论：把「刷过」变成「掌握」</h2>',
            '    <p>遗忘很正常。保留下来的应该是「题型—洞察—模板—边界」，不是某道题的代码。</p>',
            '  </div>',
            '</div>',
            '<div class="algo-method-grid">',
            METHOD_STEPS.map(function (step, i) {
                return [
                    '<article class="algo-method-card">',
                    '  <div class="algo-method-num">0' + (i + 1) + '</div>',
                    '  <div class="algo-method-icon"><i class="' + escapeHtml(step.icon) + '"></i></div>',
                    '  <h3>' + escapeHtml(step.title) + '</h3>',
                    '  <p>' + escapeHtml(step.text) + '</p>',
                    '</article>'
                ].join('');
            }).join(''),
            '</div>',
            '<div class="algo-method-split">',
            '  <section class="algo-info-card">',
            '    <h3><i class="fas fa-calendar-check"></i> 间隔复习节奏</h3>',
            '    <div class="algo-rule-list">',
            REVIEW_RULES.map(function (r) {
                return '<div class="algo-rule"><span class="algo-rule-stage">' + escapeHtml(r.stage) + '</span><span class="algo-rule-time">' + escapeHtml(r.time) + '</span><p>' + escapeHtml(r.goal) + '</p></div>';
            }).join(''),
            '    </div>',
            '  </section>',
            '  <section class="algo-info-card">',
            '    <h3><i class="fas fa-ban"></i> 不要这样做</h3>',
            '    <ul class="algo-bad-list">',
            ANTI_PATTERNS.map(function (item) {
                return '<li>' + escapeHtml(item) + '</li>';
            }).join(''),
            '    </ul>',
            '  </section>',
            '</div>',
            '<section class="algo-info-card algo-feynman">',
            '  <h3><i class="fas fa-comment-dots"></i> 费曼自测：2 分钟讲清三件事</h3>',
            '  <div class="algo-feynman-grid">',
            '    <div><strong>思路</strong><p>这题属于什么题型？关键洞察是什么？为什么用这个数据结构？</p></div>',
            '    <div><strong>复杂度</strong><p>时间、空间复杂度各是多少？哪一步是瓶颈？</p></div>',
            '    <div><strong>边界</strong><p>空输入、单元素、重复值、越界、初始化分别怎么处理？</p></div>',
            '  </div>',
            '  <p class="algo-feynman-tip">讲不顺的地方，就是下一次复习的重点。回到题目本，把它写进「我卡在哪」。</p>',
            '</section>'
        ].join('');
    }

    /* ===================== 表单弹窗 ===================== */

    function openProblemModal(id, presetPattern) {
        var p = id ? findProblem(id) : null;
        var isEdit = !!p;
        var data = p || {
            title: '', link: '', pattern: presetPattern || '', difficulty: 2,
            description: '', examples: [], constraints: [],
            trigger: '', insight: '', stuck: '', template: ''
        };
        var patternOptions = getPatternNames().map(function (name) {
            return '<option value="' + escapeHtml(name) + '"></option>';
        }).join('');

        var html = [
            '<div class="algo-modal-backdrop" data-action="close-modal">',
            '  <div class="algo-modal" role="dialog" aria-modal="true" aria-labelledby="algo-modal-title">',
            '    <header class="algo-modal-head">',
            '      <div><p class="algo-kicker">' + (isEdit ? 'EDIT PROBLEM' : 'NEW PROBLEM') + '</p><h2 id="algo-modal-title">' + (isEdit ? '编辑题目' : '录入题目') + '</h2></div>',
            '      <button type="button" class="algo-icon-btn" data-action="close-modal" aria-label="关闭"><i class="fas fa-times"></i></button>',
            '    </header>',
            '    <form id="algo-problem-form" class="algo-form">',
            '      <input type="hidden" name="id" value="' + escapeHtml(data.id || '') + '">',
            '      <div class="algo-form-grid">',
            '        <label class="algo-field algo-field-full"><span>题目 <em>*</em></span><input name="title" required maxlength="120" value="' + escapeHtml(data.title) + '" placeholder="例如：LC 34. 在排序数组中查找元素的第一个和最后一个位置"></label>',
            '        <label class="algo-field algo-field-full"><span>题目链接</span><input name="link" type="url" value="' + escapeHtml(data.link) + '" placeholder="https://leetcode.cn/problems/..."></label>',
            '        <label class="algo-field algo-field-full"><span>题目描述</span><textarea name="description" rows="3" maxlength="1600" placeholder="完整题面，例如：给定升序数组和目标值，返回下标...">' + escapeHtml(data.description || '') + '</textarea></label>',
            '        <label class="algo-field algo-field-full"><span>示例数据（每行一个 JSON）</span><textarea name="examples" rows="4" placeholder=\'{"input":"nums = [1,2,3], target = 2","output":"1","explain":"2 在下标 1"}\'>' + escapeHtml(JSON.stringify(data.examples || [], null, 2)) + '</textarea></label>',
            '        <label class="algo-field algo-field-full"><span>约束（每行一条）</span><textarea name="constraints" rows="3" placeholder="1 <= nums.length <= 10000">' + escapeHtml((data.constraints || []).join('\n')) + '</textarea></label>',
            '        <label class="algo-field"><span>题型</span><input name="pattern" list="algo-pattern-options" value="' + escapeHtml(data.pattern) + '" placeholder="二分查找"></label>',
            '        <label class="algo-field"><span>难度</span><select name="difficulty">',
            '          <option value="1"' + (data.difficulty === 1 ? ' selected' : '') + '>入门</option>',
            '          <option value="2"' + (data.difficulty === 2 ? ' selected' : '') + '>进阶</option>',
            '          <option value="3"' + (data.difficulty === 3 ? ' selected' : '') + '>困难</option>',
            '        </select></label>',
            '        <label class="algo-field algo-field-full"><span>触发词 / 识别信号</span><input name="trigger" maxlength="160" value="' + escapeHtml(data.trigger) + '" placeholder="有序数组 + 找边界 → 二分"></label>',
            '        <label class="algo-field algo-field-full"><span>关键洞察</span><textarea name="insight" rows="3" maxlength="800" placeholder="为什么是这个模型？核心一步是什么？">' + escapeHtml(data.insight) + '</textarea></label>',
            '        <label class="algo-field algo-field-full"><span>我卡在哪</span><textarea name="stuck" rows="3" maxlength="800" placeholder="边界？初始化？状态转移？贪心证明？">' + escapeHtml(data.stuck) + '</textarea></label>',
            '        <label class="algo-field algo-field-full"><span>我的模板 / 步骤</span><textarea name="template" rows="4" maxlength="1200" placeholder="记适用条件和边界，不要抄完整代码">' + escapeHtml(data.template) + '</textarea></label>',
            '      </div>',
            '      <datalist id="algo-pattern-options">' + patternOptions + '</datalist>',
            '      <p class="algo-form-tip"><i class="fas fa-info-circle"></i> 新题默认 24 小时后进入第一次复习；之后通过会依次进入 7 天、30 天。</p>',
            '      <footer class="algo-modal-foot">',
            '        <button type="button" class="algo-btn algo-btn-ghost" data-action="close-modal">取消</button>',
            '        <button type="submit" class="algo-btn algo-btn-primary"><i class="fas fa-save"></i> ' + (isEdit ? '保存修改' : '录入并安排复习') + '</button>',
            '      </footer>',
            '    </form>',
            '  </div>',
            '</div>'
        ].join('');

        openModal(html);
        var input = root.querySelector('#algo-problem-form input[name="title"]');
        if (input) setTimeout(function () { input.focus(); }, 50);
    }

    function saveProblemForm(form) {
        var fd = new FormData(form);
        var id = String(fd.get('id') || '');
        var data = {
            title: String(fd.get('title') || '').trim(),
            link: String(fd.get('link') || '').trim(),
            pattern: String(fd.get('pattern') || '').trim() || '未分类',
            difficulty: parseInt(fd.get('difficulty'), 10) || 2,
            description: String(fd.get('description') || '').trim(),
            examples: parseExampleInput(String(fd.get('examples') || '')),
            constraints: String(fd.get('constraints') || '').split('\n').map(function (line) {
                return line.trim();
            }).filter(Boolean),
            trigger: String(fd.get('trigger') || '').trim(),
            insight: String(fd.get('insight') || '').trim(),
            stuck: String(fd.get('stuck') || '').trim(),
            template: String(fd.get('template') || '').trim()
        };
        if (!data.title) {
            toast('题目名称不能为空');
            return;
        }

        if (id) {
            var p = findProblem(id);
            if (p) {
                p.title = data.title;
                p.link = data.link;
                p.pattern = data.pattern;
                p.difficulty = data.difficulty;
                p.description = data.description;
                p.examples = data.examples;
                p.constraints = data.constraints;
                p.trigger = data.trigger;
                p.insight = data.insight;
                p.stuck = data.stuck;
                p.template = data.template;
                toast('已保存修改');
            }
        } else {
            var today = todayStr();
            var created = normalizeProblem({
                title: data.title,
                link: data.link,
                pattern: data.pattern,
                difficulty: data.difficulty,
                description: data.description,
                examples: data.examples,
                constraints: data.constraints,
                trigger: data.trigger,
                insight: data.insight,
                stuck: data.stuck,
                template: data.template,
                createdAt: today,
                nextReview: addDays(today, 1),
                stage: 0
            });
            if (created) store.problems.push(created);
            toast('已录入，明天提醒你复习');
        }

        saveStore();
        closeModal();
        render();
    }

    /* ===================== 复习弹窗 ===================== */

    function openReviewModal(id) {
        var p = findProblem(id);
        if (!p) return;
        ui.currentReviewId = id;

        var queueInfo = ui.queue.length > 1
            ? '第 ' + (ui.queueIndex + 1) + ' / ' + ui.queue.length + ' 题'
            : (isDue(p) ? '今日到期' : '主动加练');
        var nextLabel = p.stage >= 3 ? '已掌握' : (p.stage === 0 ? '24 小时后' : (p.stage === 1 ? '7 天后' : '30 天后'));

        var html = [
            '<div class="algo-modal-backdrop" data-action="close-modal">',
            '  <div class="algo-modal algo-modal-review" role="dialog" aria-modal="true" aria-labelledby="algo-review-title">',
            '    <header class="algo-modal-head">',
            '      <div>',
            '        <p class="algo-kicker">REVIEW SESSION</p>',
            '        <h2 id="algo-review-title">' + escapeHtml(p.title) + '</h2>',
            '        <p class="algo-review-sub">' + escapeHtml(p.pattern) + ' · ' + escapeHtml(queueInfo) + ' · 下次：' + escapeHtml(nextLabel) + '</p>',
            '      </div>',
            '      <button type="button" class="algo-icon-btn" data-action="close-modal" aria-label="关闭"><i class="fas fa-times"></i></button>',
            '    </header>',
            '    <div class="algo-review-body">',
            '      <div class="algo-review-alert"><i class="fas fa-eye-slash"></i><div><strong>先别翻题解。</strong> 独立重做 15 分钟，再用 2 分钟讲清思路、复杂度、边界；卡住也先把卡点写下来。</div></div>',
            '      <div class="algo-timer-box">',
            '        <div class="algo-timer-actions">',
            '          <button type="button" class="algo-btn algo-btn-small" data-action="timer" data-seconds="900"><i class="fas fa-hourglass-half"></i> 15 分钟独立思考</button>',
            '          <button type="button" class="algo-btn algo-btn-small" data-action="timer" data-seconds="120"><i class="fas fa-comment-dots"></i> 2 分钟讲题</button>',
            '        </div>',
            '        <span id="algo-timer-display" class="algo-timer-display">15:00</span>',
            '      </div>',
            '      <div class="algo-review-meta">',
            p.trigger ? '<span><i class="fas fa-bolt"></i>' + escapeHtml(p.trigger) + '</span>' : '',
            p.link ? '<a href="' + escapeHtml(p.link) + '" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> 打开原题（重写后再看）</a>' : '',
            p.template ? '<details><summary>展开我的模板 / 步骤</summary><p>' + escapeHtml(p.template) + '</p></details>' : '',
            '      </div>',
            '      <div class="algo-review-notes">',
            '        <label class="algo-field"><span>这次的关键洞察</span><textarea id="algo-review-insight" rows="3">' + escapeHtml(p.insight) + '</textarea></label>',
            '        <label class="algo-field"><span>这次卡在哪</span><textarea id="algo-review-stuck" rows="3">' + escapeHtml(p.stuck) + '</textarea></label>',
            '      </div>',
            '    </div>',
            '    <footer class="algo-modal-foot algo-review-foot">',
            '      <button type="button" class="algo-btn algo-btn-danger" data-action="review-fail"><i class="fas fa-rotate-left"></i> 没通过 · 明天再来</button>',
            '      <button type="button" class="algo-btn algo-btn-primary" data-action="review-pass"><i class="fas fa-check"></i> 通过 · 进入下一间隔</button>',
            '    </footer>',
            '  </div>',
            '</div>'
        ].join('');

        openModal(html);
    }

    function openModal(html) {
        var modalRoot = root.querySelector('#algo-modal-root');
        if (!modalRoot) return;
        if (ui.timerInterval) {
            clearInterval(ui.timerInterval);
            ui.timerInterval = null;
        }
        modalRoot.innerHTML = html;
        document.body.classList.add('algo-modal-open');
    }

    function closeModal(keepQueue) {
        if (ui.timerInterval) {
            clearInterval(ui.timerInterval);
            ui.timerInterval = null;
        }
        if (!keepQueue) {
            ui.queue = [];
            ui.queueIndex = 0;
        }
        ui.currentReviewId = null;
        if (root) {
            var modalRoot = root.querySelector('#algo-modal-root');
            if (modalRoot) modalRoot.innerHTML = '';
        }
        document.body.classList.remove('algo-modal-open');
    }

    function recordAlgoStats(problem, result, source) {
        try {
            if (!window.StatsCenter) return;
            window.StatsCenter.register({ id: 'algorithm-review', label: '算法库', maxRecords: 300 });
            var passed = result === 'pass' || result === 'remember';
            window.StatsCenter.add('algorithm-review', {
                key: problem.id,
                title: problem.title,
                metrics: {
                    score: passed ? 1 : 0,
                    total: 1,
                    rate: passed ? 100 : 0,
                    durationSec: 0
                },
                detail: {
                    result: result,
                    source: source,
                    pattern: problem.pattern,
                    stage: problem.stage,
                    lapses: problem.lapses
                }
            });
        } catch (e) { /* ignore stats errors */ }
    }

    function completeReview(pass) {
        var p = findProblem(ui.currentReviewId);
        if (!p) return;

        var insightEl = root.querySelector('#algo-review-insight');
        var stuckEl = root.querySelector('#algo-review-stuck');
        if (insightEl) p.insight = insightEl.value.trim();
        if (stuckEl) p.stuck = stuckEl.value.trim();

        var today = todayStr();
        p.lastReview = today;
        p.reviewLog.push({ date: today, result: pass ? 'pass' : 'fail' });
        recordAlgoStats(p, pass ? 'pass' : 'fail', 'review');

        if (pass) {
            if (p.stage >= 2) {
                p.stage = 3;
                p.nextReview = '';
                toast('已掌握：30 天复习通过，进入维护阶段');
            } else {
                p.stage += 1;
                p.nextReview = addDays(today, INTERVALS[p.stage]);
                toast('通过：下次复习 ' + p.nextReview);
            }
        } else {
            p.lapses += 1;
            p.stage = Math.max(0, p.stage - 1);
            p.nextReview = addDays(today, 1);
            toast('已记录卡点：明天再重做一次');
        }

        saveStore();
        closeModal(true);
        render();
        advanceQueue();
    }

    function advanceQueue() {
        if (!ui.queue.length) return;
        if (ui.queueIndex < ui.queue.length - 1) {
            ui.queueIndex += 1;
            var nextId = ui.queue[ui.queueIndex];
            setTimeout(function () {
                if (root && document.body.contains(root)) openReviewModal(nextId);
            }, 220);
        } else {
            ui.queue = [];
            ui.queueIndex = 0;
            toast('本轮复习完成，休息一下');
        }
    }

    function startReviewTimer(seconds) {
        if (ui.timerInterval) clearInterval(ui.timerInterval);
        var remain = seconds;
        updateTimerDisplay(remain);
        ui.timerInterval = setInterval(function () {
            remain -= 1;
            if (remain <= 0) {
                remain = 0;
                updateTimerDisplay(remain);
                clearInterval(ui.timerInterval);
                ui.timerInterval = null;
                toast(seconds >= 600 ? '15 分钟到：合上题解，开始重写' : '2 分钟到：继续把思路讲完');
            } else {
                updateTimerDisplay(remain);
            }
        }, 1000);
    }

    function updateTimerDisplay(seconds) {
        var el = root && root.querySelector('#algo-timer-display');
        if (!el) return;
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        el.textContent = pad2(m) + ':' + pad2(s);
    }

    /* ===================== 导入 / 导出 ===================== */

    function download(filename, content, type) {
        var blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }

    function exportJson() {
        if (!store.problems.length) {
            toast('还没有题目可导出');
            return;
        }
        download('algo-review-' + todayStr() + '.json', JSON.stringify(store, null, 2), 'application/json;charset=utf-8');
        toast('已导出 JSON 备份');
    }

    function exportMarkdown() {
        if (!store.problems.length) {
            toast('还没有题目可导出');
            return;
        }
        var lines = ['# 算法复盘笔记', '', '> 导出时间：' + todayStr(), ''];
        store.problems.forEach(function (p) {
            lines.push('## ' + p.title);
            if (p.link) lines.push('- 链接：' + p.link);
            lines.push('- 题型：' + p.pattern + ' · 难度：' + (DIFFICULTY_LABELS[p.difficulty] || '进阶'));
            lines.push('- 状态：' + (p.stage >= 3 ? '已掌握' : '第 ' + (p.stage + 1) + ' / 3 轮，下次 ' + p.nextReview));
            lines.push('- 触发词：' + (p.trigger || '待补充'));
            lines.push('- 关键洞察：' + (p.insight || '待补充'));
            lines.push('- 我卡在哪：' + (p.stuck || '待补充'));
            if (p.template) lines.push('- 模板 / 步骤：' + p.template.replace(/\n/g, ' '));
            lines.push('');
        });
        download('algo-review-' + todayStr() + '.md', lines.join('\n'), 'text/markdown;charset=utf-8');
        toast('已导出 Markdown 笔记');
    }

    function importJsonFile(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var data = JSON.parse(String(reader.result || ''));
                var list = Array.isArray(data) ? data : (data && data.problems);
                if (!Array.isArray(list)) throw new Error('bad format');
                if (!window.confirm('导入会覆盖当前浏览器中的 ' + store.problems.length + ' 条记录，继续吗？')) return;
                store = {
                    version: 1,
                    problems: list.map(normalizeProblem).filter(Boolean)
                };
                saveStore();
                render();
                toast('导入成功，共 ' + store.problems.length + ' 题');
            } catch (e) {
                toast('导入失败：JSON 格式不正确');
            }
        };
        reader.readAsText(file);
    }

    /* ===================== 示例数据 ===================== */

    function loadDemo() {
        var today = todayStr();
        var demo = [
            {
                title: 'LC 34. 在排序数组中查找元素的第一个和最后一个位置',
                link: 'https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/',
                pattern: '二分查找',
                difficulty: 2,
                trigger: '有序数组 + 找左右边界 → 两次二分',
                insight: '分别找第一个 >= target 和第一个 > target 的位置，右边界减一。',
                stuck: '区间收缩后返回 left 还是 right 容易混。',
                template: 'lower_bound(target) 与 lower_bound(target + 1)；循环用 left < right，mid 下取整。',
                createdAt: today,
                nextReview: today,
                stage: 0
            },
            {
                title: 'LC 3. 无重复字符的最长子串',
                link: 'https://leetcode.cn/problems/longest-substring-without-repeating-characters/',
                pattern: '滑动窗口',
                difficulty: 2,
                trigger: '连续子串 + 最长 + 窗口内不能重复 → 滑窗',
                insight: '右指针扩张，出现重复字符时左指针跳到上次位置 + 1。',
                stuck: '左指针不能回退，要取 max(left, lastIndex + 1)。',
                template: 'map 记录字符最后位置；ans = max(ans, right - left + 1)。',
                createdAt: today,
                nextReview: addDays(today, 1),
                stage: 1
            },
            {
                title: 'LC 322. 零钱兑换',
                link: 'https://leetcode.cn/problems/coin-change/',
                pattern: '动态规划',
                difficulty: 2,
                trigger: '最少数量 + 可重复选择 + 最优子结构 → 完全背包 DP',
                insight: 'dp[amount] 表示凑出该金额的最少硬币数，遍历金额再遍历硬币。',
                stuck: '初始化成 Infinity，dp[0] = 0；最后判断是否仍为 Infinity。',
                template: 'for coin: for amount from coin to target: dp[amount] = min(dp[amount], dp[amount - coin] + 1)。',
                createdAt: today,
                nextReview: addDays(today, 7),
                stage: 2
            }
        ];
        demo.forEach(function (item) {
            var p = normalizeProblem(item);
            if (p) store.problems.push(p);
        });
        saveStore();
        render();
        toast('已载入 3 道示例，可直接编辑或删除');
    }

    /* ===================== 事件绑定 ===================== */

    function bindEvents() {
        root.addEventListener('click', function (e) {
            var actionEl = e.target.closest('[data-action]');
            if (!actionEl || !root.contains(actionEl)) return;
            var action = actionEl.getAttribute('data-action');

            if (action === 'close-modal') {
                if (actionEl.classList.contains('algo-modal-backdrop') && e.target !== actionEl) return;
                closeModal();
                return;
            }

            if (action === 'tab') {
                ui.tab = actionEl.dataset.tab || 'today';
                render();
                return;
            }
            if (action === 'quiz-mode') {
                ui.quiz.mode = actionEl.dataset.mode === 'pattern' ? 'pattern' : 'recall';
                if (ui.quiz.mode === 'pattern') {
                    newPatternQuiz();
                } else {
                    ui.quiz.problemId = null;
                    ui.quiz.revealed = false;
                    ensureQuiz();
                }
                renderTab();
                return;
            }
            if (action === 'quiz-next') {
                if (ui.quiz.mode === 'pattern') {
                    newPatternQuiz();
                } else {
                    newRecallQuiz();
                }
                renderTab();
                return;
            }
            if (action === 'quiz-reveal') {
                ui.quiz.revealed = true;
                renderTab();
                return;
            }
            if (action === 'quiz-rate') {
                applyQuizRating(actionEl.dataset.rating || 'fuzzy');
                return;
            }
            if (action === 'quiz-option') {
                if (!ui.quiz.selected) {
                    ui.quiz.selected = actionEl.dataset.pattern || '';
                    renderTab();
                }
                return;
            }
            if (action === 'add') {
                openProblemModal();
                return;
            }
            if (action === 'add-pattern') {
                openProblemModal(null, actionEl.dataset.pattern || '');
                return;
            }
            if (action === 'open-playground') {
                var pgProblem = findProblem(actionEl.dataset.id);
                ui.playgroundProblemId = pgProblem ? pgProblem.id : null;
                if (pgProblem && pgProblem.template && navigator.clipboard) {
                    navigator.clipboard.writeText(pgProblem.template).then(function () {
                        toast('模板已复制，粘贴到 C# 编辑器即可运行');
                    }).catch(function () { /* clipboard may be unavailable */ });
                }
                ui.tab = 'playground';
                render();
                setTimeout(function () {
                    var pg = root.querySelector('#algo-csharp-playground');
                    if (pg) pg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 80);
                return;
            }
            if (action === 'toggle-problem-panel') {
                ui.problemPanelCollapsed = !ui.problemPanelCollapsed;
                var panel = root.querySelector('.algo-workbench-left');
                if (panel) panel.classList.toggle('is-collapsed', ui.problemPanelCollapsed);
                actionEl.innerHTML = '<i class="fas fa-chevron-up"></i> ' + (ui.problemPanelCollapsed ? '展开题目区' : '收起题目区');
                return;
            }
            if (action === 'select-playground') {
                ui.playgroundProblemId = actionEl.dataset.id || null;
                var left = root.querySelector('.algo-workbench-left');
                if (left) {
                    left.innerHTML = workbenchLeftHtml();
                } else {
                    renderTab();
                }
                return;
            }
            if (action === 'copy-playground-template') {
                var copyProblem = findProblem(actionEl.dataset.id);
                if (copyProblem && copyProblem.template && navigator.clipboard) {
                    navigator.clipboard.writeText(copyProblem.template).then(function () {
                        toast('模板已复制，粘贴到下方 C# 编辑器');
                    }).catch(function () { toast('复制失败，请手动选择模板'); });
                }
                return;
            }
            if (action === 'edit') {
                openProblemModal(actionEl.dataset.id);
                return;
            }
            if (action === 'delete') {
                deleteProblem(actionEl.dataset.id);
                return;
            }
            if (action === 'review') {
                ui.queue = [actionEl.dataset.id];
                ui.queueIndex = 0;
                openReviewModal(actionEl.dataset.id);
                return;
            }
            if (action === 'review-due') {
                startDueQueue();
                return;
            }
            if (action === 'random') {
                startRandomQueue();
                return;
            }
            if (action === 'review-pass') {
                completeReview(true);
                return;
            }
            if (action === 'review-fail') {
                completeReview(false);
                return;
            }
            if (action === 'timer') {
                startReviewTimer(parseInt(actionEl.dataset.seconds, 10) || 900);
                return;
            }
            if (action === 'filter-pattern') {
                ui.pattern = actionEl.dataset.pattern || '';
                ui.status = 'all';
                ui.tab = 'problems';
                render();
                return;
            }
            if (action === 'demo') {
                loadDemo();
                return;
            }
            if (action === 'export-json') {
                exportJson();
                return;
            }
            if (action === 'export-md') {
                exportMarkdown();
                return;
            }
            if (action === 'import-json') {
                var fileInput = root.querySelector('#algo-import-file');
                if (fileInput) fileInput.click();
                return;
            }
        });

        root.addEventListener('input', function (e) {
            if (e.target && e.target.id === 'algo-search') {
                ui.search = e.target.value;
                renderProblemList();
            } else if (e.target && e.target.id === 'algo-workbench-search') {
                ui.playgroundSearch = e.target.value;
                var panel = root.querySelector('.algo-workbench-left');
                if (panel) {
                    panel.innerHTML = workbenchLeftHtml();
                    var search = panel.querySelector('#algo-workbench-search');
                    if (search) {
                        search.focus();
                        search.setSelectionRange(search.value.length, search.value.length);
                    }
                }
            }
        });

        root.addEventListener('change', function (e) {
            if (!e.target) return;
            if (e.target.id === 'algo-filter-pattern') {
                ui.pattern = e.target.value;
                renderProblemList();
            } else if (e.target.id === 'algo-workbench-pattern') {
                ui.playgroundPattern = e.target.value;
                var panel = root.querySelector('.algo-workbench-left');
                if (panel) panel.innerHTML = workbenchLeftHtml();
            } else if (e.target.id === 'algo-filter-status') {
                ui.status = e.target.value;
                renderProblemList();
            } else if (e.target.id === 'algo-import-file') {
                importJsonFile(e.target.files && e.target.files[0]);
                e.target.value = '';
            }
        });

        root.addEventListener('submit', function (e) {
            if (e.target && e.target.id === 'algo-problem-form') {
                e.preventDefault();
                saveProblemForm(e.target);
            }
        });
    }

    function deleteProblem(id) {
        var p = findProblem(id);
        if (!p) return;
        if (!window.confirm('确定删除「' + p.title + '」吗？此操作不可撤销。')) return;
        store.problems = store.problems.filter(function (item) { return item.id !== id; });
        saveStore();
        render();
        toast('已删除');
    }

    function startDueQueue() {
        var due = dueProblems();
        if (!due.length) {
            toast('今天没有到期题目');
            return;
        }
        ui.queue = due.map(function (p) { return p.id; });
        ui.queueIndex = 0;
        openReviewModal(ui.queue[0]);
    }

    function startRandomQueue() {
        var pool = store.problems.filter(function (p) { return p.stage < 3; });
        if (!pool.length) pool = store.problems.slice();
        if (!pool.length) {
            toast('先录入几道题再练习');
            return;
        }
        var count = Math.min(5, pool.length);
        var recent = ui.recentRandomIds || [];
        var fresh = pool.filter(function (p) { return recent.indexOf(p.id) === -1; });
        if (fresh.length < count) fresh = pool.slice();
        pool = shuffle(fresh).slice(0, count);
        ui.recentRandomIds = recent.concat(pool.map(function (p) { return p.id; }))
            .slice(-Math.max(0, store.problems.length - count));
        ui.queue = pool.map(function (p) { return p.id; });
        ui.queueIndex = 0;
        openReviewModal(ui.queue[0]);
    }

    /* ===================== 生命周期 ===================== */

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || !root) return;
        var modalRoot = root.querySelector('#algo-modal-root');
        if (modalRoot && modalRoot.children.length) closeModal();
    });

    document.addEventListener('pjax:send', function () {
        closeModal();
    });

    document.addEventListener('pjax:complete', init);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
