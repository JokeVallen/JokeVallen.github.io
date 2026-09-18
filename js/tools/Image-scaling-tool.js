(function () {
    // ==================== Pica动态加载器 ====================
    class PicaLoader {
        constructor() {
            this.picaInstance = null;
            this.isLoaded = false;
            this.isLoading = false;
            this.loadCallbacks = [];
            this.fallbackMode = false;

            // 多个CDN源，增加可靠性
            this.CDN_SOURCES = [
                'https://unpkg.com/pica@9.0.1/dist/pica.min.js',
                'https://cdn.jsdelivr.net/npm/pica@9.0.1/dist/pica.min.js',
                'https://fastly.jsdelivr.net/npm/pica@9.0.1/dist/pica.min.js'
            ];
        }

        // 加载Pica库
        async load() {
            // 如果已经加载完成，直接返回实例
            if (this.isLoaded && this.picaInstance) {
                return this.picaInstance;
            }

            // 如果正在加载中，等待完成
            if (this.isLoading) {
                return new Promise((resolve) => {
                    this.loadCallbacks.push(resolve);
                });
            }

            this.isLoading = true;

            try {
                // 方法1: 检查全局是否已存在pica
                if (window.pica) {
                    console.log('Pica已在全局环境存在');
                    this.picaInstance = window.pica();
                    this.isLoaded = true;
                    this.completeLoad();
                    return this.picaInstance;
                }

                // 方法2: 尝试从多个CDN加载
                this.picaInstance = await this.loadFromCDN();
                this.isLoaded = true;
                this.completeLoad();
                return this.picaInstance;

            } catch (error) {
                console.warn('Pica加载失败，启用降级模式:', error);
                this.fallbackMode = true;
                this.picaInstance = this.createFallbackPica();
                this.isLoaded = true;
                this.completeLoad();
                return this.picaInstance;
            }
        }

        // 从CDN加载（带重试机制）
        async loadFromCDN() {
            let lastError = null;

            // 尝试所有CDN源
            for (const cdnUrl of this.CDN_SOURCES) {
                try {
                    return await this.loadScript(cdnUrl);
                } catch (error) {
                    lastError = error;
                    console.log(`CDN ${cdnUrl} 加载失败，尝试下一个...`);
                    await new Promise(resolve => setTimeout(resolve, 500)); // 延迟500ms
                }
            }

            throw lastError || new Error('所有CDN源均加载失败');
        }

        // 加载单个脚本
        loadScript(url) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.onload = () => {
                    if (window.pica) {
                        resolve(window.pica());
                    } else {
                        reject(new Error('脚本已加载但未找到pica对象'));
                    }
                };
                script.onerror = () => reject(new Error(`加载失败: ${url}`));

                // 设置10秒超时
                const timeoutId = setTimeout(() => {
                    script.remove();
                    reject(new Error('加载超时'));
                }, 10000);

                script.onload = () => {
                    clearTimeout(timeoutId);
                    if (window.pica) {
                        resolve(window.pica());
                    } else {
                        reject(new Error('脚本已加载但未找到pica对象'));
                    }
                };

                document.head.appendChild(script);
            });
        }

        // 创建降级版的pica（使用Canvas原生方法）
        createFallbackPica() {
            console.warn('使用Canvas原生缩放作为降级方案');

            return {
                resize: function (img, canvas, options) {
                    return new Promise((resolve) => {
                        const ctx = canvas.getContext('2d');

                        // 设置高质量缩放参数
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';

                        // 使用Canvas原生缩放
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas);
                    });
                },
                // 降级模式标识
                isFallback: true
            };
        }

        // 完成加载，执行回调
        completeLoad() {
            this.isLoading = false;
            while (this.loadCallbacks.length > 0) {
                const callback = this.loadCallbacks.shift();
                callback(this.picaInstance);
            }
        }

        // 检查是否处于降级模式
        isFallbackMode() {
            return this.fallbackMode;
        }
    }

    // 创建Pica加载器实例
    const picaLoader = new PicaLoader();

    // ==================== 主应用代码 ====================
    // DOM元素（保持不变）
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const originalImg = document.getElementById('original-img');
    const scaledImg = document.getElementById('scaled-img');
    const originalWidth = document.getElementById('original-width');
    const originalHeight = document.getElementById('original-height');
    const scaledWidth = document.getElementById('scaled-width');
    const scaledHeight = document.getElementById('scaled-height');
    const scalePercent = document.getElementById('scale-percent');
    const targetWidth = document.getElementById('target-width');
    const targetHeight = document.getElementById('target-height');
    const methodOptions = document.querySelectorAll('.tool-method-option');
    const presetButtons = document.querySelectorAll('.tool-preset-btn');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const scaleBtn = document.getElementById('scale-btn');
    const downloadBtn = document.getElementById('download-btn');
    const compareBtn = document.getElementById('compare-btn');
    const resetBtn = document.getElementById('reset-btn');
    const loading = document.getElementById('loading');
    const progressFill = document.getElementById('progress-fill');
    const status = document.getElementById('status');

    // 全局变量
    let originalImageData = null;
    let scaledImageData = null;
    let originalImageWidth = 0;
    let originalImageHeight = 0;
    let currentFileType = '';
    let canvasComparison = null;
    let currentPicaInstance = null;

    // ==================== 初始化函数 ====================
    async function initializeApp() {
        try {
            // 预加载Pica（但不阻塞UI）
            preloadPica();

            // 设置事件监听器
            setupEventListeners();

            // 初始化滑块
            setupSlider();

            // 初始化UI状态
            scaleBtn.disabled = true;
            downloadBtn.disabled = true;

            showStatus('应用初始化完成，准备就绪', 'info');

        } catch (error) {
            console.error('应用初始化失败:', error);
            showStatus('应用初始化失败，请刷新页面', 'error');
        }
    }

    // 预加载Pica（在后台加载）
    function preloadPica() {
        setTimeout(async () => {
            try {
                currentPicaInstance = await picaLoader.load();
                if (picaLoader.isFallbackMode()) {
                    console.warn('Pica降级模式已激活');
                    // 可以在这里更新UI提示用户
                } else {
                    console.log('Pica高质量缩放引擎已就绪');
                }
            } catch (error) {
                console.error('Pica预加载失败:', error);
            }
        }, 1000);
    }

    // 滑块设置函数
    function setupSlider() {
        const qualitySlider = document.getElementById('quality-slider');
        const qualityValue = document.getElementById('quality-value');
        const qualitySliderFill = document.getElementById('quality-slider-fill');
        const qualitySliderTooltip = document.getElementById('quality-slider-tooltip');

        if (!qualitySlider || !qualitySliderFill) return;

        // 初始化填充
        updateSliderFill(qualitySlider, qualitySliderFill, qualitySliderTooltip);

        // 滑块输入事件
        qualitySlider.addEventListener('input', function () {
            const value = this.value;

            // 更新显示值
            if (qualityValue) {
                qualityValue.textContent = value + '%';
            }

            // 更新填充和提示
            updateSliderFill(this, qualitySliderFill, qualitySliderTooltip);

            // 如果是JPG图片，自动缩放
            if (originalImageData && currentFileType === 'image/jpeg') {
                clearTimeout(scaleTimeout);
                scaleTimeout = setTimeout(() => {
                    scaleImage();
                }, 300);
            }
        });

        // 鼠标悬停显示提示
        qualitySlider.addEventListener('mousemove', function (e) {
            if (qualitySliderTooltip) {
                const rect = this.getBoundingClientRect();
                const percent = (this.value - this.min) / (this.max - this.min);
                const left = percent * 100;

                qualitySliderTooltip.style.left = left + '%';
                qualitySliderTooltip.textContent = this.value + '%';
                qualitySliderTooltip.classList.add('show');
            }
        });

        qualitySlider.addEventListener('mouseleave', function () {
            if (qualitySliderTooltip) {
                qualitySliderTooltip.classList.remove('show');
            }
        });

        // 触摸设备支持
        qualitySlider.addEventListener('touchstart', function () {
            if (qualitySliderTooltip) {
                qualitySliderTooltip.classList.add('show');
            }
        });

        qualitySlider.addEventListener('touchend', function () {
            setTimeout(() => {
                if (qualitySliderTooltip) {
                    qualitySliderTooltip.classList.remove('show');
                }
            }, 1000);
        });
    }

    // 更新滑块填充函数
    function updateSliderFill(slider, fillElement, tooltipElement) {
        if (!slider || !fillElement) return;

        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const value = parseFloat(slider.value);
        const percent = ((value - min) / (max - min)) * 100;

        fillElement.style.width = percent + '%';

        if (tooltipElement) {
            tooltipElement.style.left = percent + '%';
            tooltipElement.textContent = value + '%';
        }
    }

    // ==================== 事件监听器设置 ====================
    function setupEventListeners() {
        // 上传区域事件
        uploadArea.addEventListener('click', () => fileInput.click());

        // 拖拽功能
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');

            if (e.dataTransfer.files.length) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('image/')) {
                    fileInput.files = e.dataTransfer.files;
                    handleFileSelect(file);
                } else {
                    showStatus('请选择图片文件', 'error');
                }
            }
        });

        // 文件选择
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileSelect(e.target.files[0]);
            }
        });

        // 缩放方法选择
        methodOptions.forEach(option => {
            option.addEventListener('click', () => {
                methodOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                if (originalImageData) {
                    scaleImage();
                }
            });
        });

        // 预设按钮
        presetButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const container = this.closest('.tool-method-option');
                const method = container.dataset.method;
                const value = this.dataset.value;

                container.querySelectorAll('.tool-preset-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                if (method === 'percent') {
                    scalePercent.value = value;
                } else if (method === 'width') {
                    targetWidth.value = value;
                } else if (method === 'height') {
                    targetHeight.value = value;
                }

                if (container.classList.contains('active')) {
                    scaleImage();
                }
            });
        });

        // 输入变化时自动缩放（防抖处理）
        let scaleTimeout;
        [scalePercent, targetWidth, targetHeight].forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(scaleTimeout);
                scaleTimeout = setTimeout(() => {
                    if (originalImageData) {
                        scaleImage();
                    }
                }, 300);
            });
        });

        // 缩放按钮
        scaleBtn.addEventListener('click', scaleImage);

        // 下载按钮
        downloadBtn.addEventListener('click', downloadImage);

        // 对比按钮
        compareBtn.addEventListener('click', compareEffects);

        // 重置按钮
        resetBtn.addEventListener('click', resetApp);
    }

    // ==================== 核心功能函数 ====================

    // 处理文件选择
    async function handleFileSelect(file) {
        // 验证文件大小（最大20MB）
        if (file.size > 20 * 1024 * 1024) {
            showStatus('文件太大，请选择小于20MB的图片', 'error');
            return;
        }

        // 如果是JPG文件，启用滑块提示
        if (file.type === 'image/jpeg') {
            const qualitySliderTooltip = document.getElementById('quality-slider-tooltip');
            if (qualitySliderTooltip) {
                qualitySliderTooltip.style.display = 'block';
            }
        } else {
            const qualitySliderTooltip = document.getElementById('quality-slider-tooltip');
            if (qualitySliderTooltip) {
                qualitySliderTooltip.style.display = 'none';
            }
        }

        // 记录文件类型
        currentFileType = file.type;

        // 确保Pica已加载
        try {
            if (!currentPicaInstance) {
                showStatus('正在加载缩放引擎...', 'info');
                currentPicaInstance = await picaLoader.load();

                if (picaLoader.isFallbackMode()) {
                    showStatus('使用基础缩放模式（高质量引擎加载失败）', 'warning');
                } else {
                    showStatus('高质量缩放引擎已就绪', 'success');
                }
            }
        } catch (error) {
            showStatus('缩放引擎加载失败，使用基础功能', 'warning');
        }

        // 读取图片
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImg.src = e.target.result;
            originalImageData = e.target.result;

            originalImg.onload = () => {
                originalImageWidth = originalImg.naturalWidth;
                originalImageHeight = originalImg.naturalHeight;

                originalWidth.textContent = originalImageWidth;
                originalHeight.textContent = originalImageHeight;

                // 启用缩放按钮
                scaleBtn.disabled = false;
                scaleBtn.textContent = picaLoader.isFallbackMode() ? '⚡ 基础缩放' : '⚡ 高质量缩放';

                // 自动进行初始缩放
                setTimeout(scaleImage, 100);

                const modeText = picaLoader.isFallbackMode() ? '基础缩放模式' : '高质量缩放模式';
                showStatus(`图片加载成功，使用${modeText}`, 'info');
            };
        };

        reader.readAsDataURL(file);
    }

    // 高质量缩放图片
    async function scaleImage() {
        if (!originalImageData) {
            showStatus('请先选择图片', 'error');
            return;
        }

        // 确保Pica实例存在
        if (!currentPicaInstance) {
            try {
                showStatus('正在加载缩放引擎...', 'info');
                currentPicaInstance = await picaLoader.load();
            } catch (error) {
                showStatus('缩放引擎加载失败，无法处理图片', 'error');
                return;
            }
        }

        // 显示加载动画
        loading.classList.add('show');
        progressFill.style.width = '30%';
        showStatus('开始处理图片...', 'info');

        try {
            // 获取当前缩放方法
            const activeMethod = document.querySelector('.tool-method-option.active');
            const method = activeMethod.dataset.method;

            // 计算目标尺寸
            let targetWidthValue, targetHeightValue;

            if (method === 'percent') {
                const percent = parseFloat(scalePercent.value) || 25;
                const scaleFactor = percent / 100;
                targetWidthValue = Math.round(originalImageWidth * scaleFactor);
                targetHeightValue = Math.round(originalImageHeight * scaleFactor);
            } else if (method === 'width') {
                targetWidthValue = parseInt(targetWidth.value) || 800;
                const scaleFactor = targetWidthValue / originalImageWidth;
                targetHeightValue = Math.round(originalImageHeight * scaleFactor);
            } else if (method === 'height') {
                targetHeightValue = parseInt(targetHeight.value) || 600;
                const scaleFactor = targetHeightValue / originalImageHeight;
                targetWidthValue = Math.round(originalImageWidth * scaleFactor);
            }

            // 确保最小尺寸
            targetWidthValue = Math.max(1, targetWidthValue);
            targetHeightValue = Math.max(1, targetHeightValue);

            progressFill.style.width = '60%';
            const modeText = picaLoader.isFallbackMode() ? '基础缩放' : 'Lanczos高质量缩放';
            showStatus(`使用${modeText}算法处理中...`, 'info');

            // 创建Canvas用于处理
            const canvas = document.createElement('canvas');
            canvas.width = targetWidthValue;
            canvas.height = targetHeightValue;

            // 使用Pica进行缩放
            await currentPicaInstance.resize(originalImg, canvas, {
                quality: 3,
                unsharpAmount: picaLoader.isFallbackMode() ? 0 : 80,
                unsharpRadius: 0.6,
                unsharpThreshold: 2
            });

            progressFill.style.width = '90%';
            showStatus('生成最终图片...', 'info');

            // 获取缩放后的图片数据
            let mimeType = currentFileType || 'image/png';
            let quality = mimeType === 'image/jpeg' ? (parseInt(qualitySlider.value) / 100) : 1;

            scaledImageData = canvas.toDataURL(mimeType, quality);

            // 更新显示
            scaledImg.src = scaledImageData;
            scaledWidth.textContent = targetWidthValue;
            scaledHeight.textContent = targetHeightValue;

            // 启用下载按钮
            downloadBtn.disabled = false;

            progressFill.style.width = '100%';
            setTimeout(() => {
                loading.classList.remove('show');
                progressFill.style.width = '0%';
                const qualityText = picaLoader.isFallbackMode() ? '基础' : '高质量';
                showStatus(`${qualityText}缩放完成！新尺寸: ${targetWidthValue} × ${targetHeightValue} 像素`, 'success');
            }, 300);

        } catch (error) {
            console.error('缩放图片时出错:', error);
            loading.classList.remove('show');
            progressFill.style.width = '0%';
            showStatus('处理图片时出错: ' + error.message, 'error');
        }
    }

    // 对比效果
    async function compareEffects() {
        if (!originalImageData) {
            showStatus('请先选择图片', 'error');
            return;
        }

        // 确保Pica实例存在
        if (!currentPicaInstance) {
            try {
                currentPicaInstance = await picaLoader.load();
            } catch (error) {
                showStatus('无法加载对比功能所需的缩放引擎', 'error');
                return;
            }
        }

        // 在降级模式下无法进行对比
        if (picaLoader.isFallbackMode()) {
            showStatus('对比功能需要高质量缩放引擎支持', 'warning');
            return;
        }

        showStatus('正在生成对比效果...', 'info');

        // 获取目标尺寸
        const activeMethod = document.querySelector('.tool-method-option.active');
        const method = activeMethod.dataset.method;
        let targetWidthValue, targetHeightValue;

        if (method === 'percent') {
            const percent = parseFloat(scalePercent.value) || 25;
            const scaleFactor = percent / 100;
            targetWidthValue = Math.round(originalImageWidth * scaleFactor);
            targetHeightValue = Math.round(originalImageHeight * scaleFactor);
        } else if (method === 'width') {
            targetWidthValue = parseInt(targetWidth.value) || 800;
            const scaleFactor = targetWidthValue / originalImageWidth;
            targetHeightValue = Math.round(originalImageHeight * scaleFactor);
        } else if (method === 'height') {
            targetHeightValue = parseInt(targetHeight.value) || 600;
            const scaleFactor = targetHeightValue / originalImageHeight;
            targetWidthValue = Math.round(originalImageWidth * scaleFactor);
        }

        // 创建对比窗口
        const comparisonWindow = window.open('', '_blank', 'width=1200,height=700');
        comparisonWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>缩放效果对比</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                    .comparison-container { display: flex; gap: 20px; max-width: 1000px; margin: 0 auto; }
                    .comparison-box { flex: 1; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
                    .comparison-title { text-align: center; font-weight: bold; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid; }
                    .canvas-default { border-color: #e74c3c; }
                    .canvas-pica { border-color: #2ecc71; }
                    canvas { width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px; }
                    .info { text-align: center; margin-top: 20px; color: #7f8c8d; }
                    .warning { 
                        background: #fff3cd; 
                        border: 1px solid #ffeaa7; 
                        padding: 10px; 
                        margin: 10px 0; 
                        border-radius: 5px; 
                        color: #856404;
                    }
                </style>
            </head>
            <body>
                <h1 style="text-align: center; color: #2c3e50;">缩放效果对比 (${targetWidthValue} × ${targetHeightValue})</h1>
                <div class="warning">
                    ℹ️ 左侧使用浏览器默认Canvas缩放，右侧使用Pica库的Lanczos算法，可以明显看到右侧图片更清晰
                </div>
                <div class="comparison-container">
                    <div class="comparison-box">
                        <div class="comparison-title canvas-default">Canvas默认缩放 (双线性插值)</div>
                        <canvas id="canvas-default"></canvas>
                    </div>
                    <div class="comparison-box">
                        <div class="comparison-title canvas-pica">Pica高质量缩放 (Lanczos算法)</div>
                        <canvas id="canvas-pica"></canvas>
                    </div>
                </div>
                <div class="info">关闭此窗口可返回主界面</div>
            </body>
            </html>
        `);

        comparisonWindow.document.close();

        // 等待窗口加载
        setTimeout(async () => {
            const img = new Image();
            img.src = originalImageData;

            img.onload = async () => {
                const canvasDefault = comparisonWindow.document.getElementById('canvas-default');
                const canvasPica = comparisonWindow.document.getElementById('canvas-pica');

                canvasDefault.width = targetWidthValue;
                canvasDefault.height = targetHeightValue;
                canvasPica.width = targetWidthValue;
                canvasPica.height = targetHeightValue;

                // 默认Canvas缩放
                const ctxDefault = canvasDefault.getContext('2d');
                ctxDefault.imageSmoothingEnabled = true;
                ctxDefault.imageSmoothingQuality = 'high';
                ctxDefault.drawImage(img, 0, 0, targetWidthValue, targetHeightValue);

                // Pica高质量缩放
                await currentPicaInstance.resize(img, canvasPica, {
                    quality: 3,
                    unsharpAmount: 80,
                    unsharpRadius: 0.6,
                    unsharpThreshold: 2
                });

                showStatus('对比窗口已打开，可以查看缩放效果差异', 'success');
            };
        }, 500);
    }

    // 下载图片
    function downloadImage() {
        if (!scaledImageData) {
            showStatus('没有可下载的图片', 'error');
            return;
        }

        const link = document.createElement('a');
        const timestamp = new Date().getTime();
        const extension = currentFileType === 'image/jpeg' ? 'jpg' :
            currentFileType === 'image/png' ? 'png' :
                currentFileType === 'image/gif' ? 'gif' :
                    currentFileType === 'image/webp' ? 'webp' : 'png';

        link.download = `scaled-image-${timestamp}.${extension}`;
        link.href = scaledImageData;
        link.click();

        showStatus('图片下载已开始', 'success');
    }

    // 重置应用
    function resetApp() {
        fileInput.value = '';
        originalImg.src = '';
        scaledImg.src = '';
        originalWidth.textContent = '-';
        originalHeight.textContent = '-';
        scaledWidth.textContent = '-';
        scaledHeight.textContent = '-';
        scaleBtn.disabled = true;
        downloadBtn.disabled = true;
        originalImageData = null;
        scaledImageData = null;
        showStatus('已重置，请上传新图片', 'info');
    }

    // 显示状态消息
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type} show`;

        // 添加警告类型
        if (type === 'warning') {
            status.style.backgroundColor = '#fff3cd';
            status.style.color = '#856404';
            status.style.borderLeftColor = '#ffc107';
        }

        // 3秒后自动隐藏成功/信息/警告消息
        if (type === 'success' || type === 'info' || type === 'warning') {
            setTimeout(() => {
                status.classList.remove('show');
            }, 3000);
        }
    }

    // ==================== 启动应用 ====================
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();