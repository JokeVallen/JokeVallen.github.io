(function () {
    // 初始化Pica实例
    const pica = window.pica();

    // DOM元素
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
    const methodOptions = document.querySelectorAll('.method-option');
    const presetButtons = document.querySelectorAll('.preset-btn');
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

    // 处理文件选择
    function handleFileSelect(file) {
        // 验证文件大小（最大20MB）
        if (file.size > 20 * 1024 * 1024) {
            showStatus('文件太大，请选择小于20MB的图片', 'error');
            return;
        }

        // 记录文件类型
        currentFileType = file.type;

        // 读取图片
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImg.src = e.target.result;
            originalImageData = e.target.result;

            // 图片加载完成后获取尺寸
            originalImg.onload = () => {
                originalImageWidth = originalImg.naturalWidth;
                originalImageHeight = originalImg.naturalHeight;

                originalWidth.textContent = originalImageWidth;
                originalHeight.textContent = originalImageHeight;

                // 启用缩放按钮
                scaleBtn.disabled = false;

                // 自动进行初始缩放
                setTimeout(scaleImage, 100);

                showStatus('图片加载成功，使用高质量缩放算法', 'info');
            };
        };

        reader.readAsDataURL(file);
    }

    // 缩放方法选择
    methodOptions.forEach(option => {
        option.addEventListener('click', () => {
            methodOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // 如果有图片，立即应用缩放
            if (originalImageData) {
                scaleImage();
            }
        });
    });

    // 预设按钮
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const container = this.closest('.method-option');
            const method = container.dataset.method;
            const value = this.dataset.value;

            // 更新按钮状态
            container.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 更新对应输入框
            if (method === 'percent') {
                scalePercent.value = value;
            } else if (method === 'width') {
                targetWidth.value = value;
            } else if (method === 'height') {
                targetHeight.value = value;
            }

            // 如果是当前激活的方法，立即应用
            if (container.classList.contains('active')) {
                scaleImage();
            }
        });
    });

    // 质量滑块
    qualitySlider.addEventListener('input', function () {
        qualityValue.textContent = this.value + '%';
        if (originalImageData && currentFileType === 'image/jpeg') {
            scaleImage();
        }
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

    // 高质量缩放图片
    async function scaleImage() {
        if (!originalImageData) {
            showStatus('请先选择图片', 'error');
            return;
        }

        // 显示加载动画
        loading.classList.add('show');
        progressFill.style.width = '30%';
        showStatus('开始处理图片...', 'info');

        try {
            // 获取当前缩放方法
            const activeMethod = document.querySelector('.method-option.active');
            const method = activeMethod.dataset.method;

            // 计算目标尺寸
            let targetWidthValue, targetHeightValue;

            if (method === 'percent') {
                const percent = parseFloat(scalePercent.value) || 50;
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
            showStatus('使用Lanczos算法进行高质量缩放...', 'info');

            // 创建Canvas用于处理
            const canvas = document.createElement('canvas');
            canvas.width = targetWidthValue;
            canvas.height = targetHeightValue;

            // 使用Pica进行高质量缩放
            await pica.resize(originalImg, canvas, {
                quality: 3, // 使用高质量Lanczos算法
                unsharpAmount: 80, // 锐化参数，使缩放后图片更清晰
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
                showStatus(`高质量缩放完成！新尺寸: ${targetWidthValue} × ${targetHeightValue} 像素`, 'success');
            }, 300);

        } catch (error) {
            console.error('缩放图片时出错:', error);
            loading.classList.remove('show');
            progressFill.style.width = '0%';
            showStatus('处理图片时出错，请重试', 'error');
        }
    }

    // 对比效果
    async function compareEffects() {
        if (!originalImageData) {
            showStatus('请先选择图片', 'error');
            return;
        }

        showStatus('正在生成对比效果...', 'info');

        // 获取目标尺寸
        const activeMethod = document.querySelector('.method-option.active');
        const method = activeMethod.dataset.method;
        let targetWidthValue, targetHeightValue;

        if (method === 'percent') {
            const percent = parseFloat(scalePercent.value) || 50;
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
                    </style>
                </head>
                <body>
                    <h1 style="text-align: center; color: #2c3e50;">缩放效果对比 (${targetWidthValue} × ${targetHeightValue})</h1>
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
                    <div class="info">左侧使用浏览器默认Canvas缩放，右侧使用Pica库的Lanczos算法，可以明显看到右侧图片更清晰</div>
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
                ctxDefault.drawImage(img, 0, 0, targetWidthValue, targetHeightValue);

                // Pica高质量缩放
                await pica.resize(img, canvasPica, {
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
    downloadBtn.addEventListener('click', () => {
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

        link.download = `high-quality-scaled-${timestamp}.${extension}`;
        link.href = scaledImageData;
        link.click();

        showStatus('图片下载已开始', 'success');
    });

    // 对比按钮
    compareBtn.addEventListener('click', compareEffects);

    // 重置按钮
    resetBtn.addEventListener('click', () => {
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
    });

    // 显示状态消息
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type} show`;

        // 3秒后自动隐藏成功/信息消息
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                status.classList.remove('show');
            }, 3000);
        }
    }

    // 初始化
    showStatus('准备就绪，请上传图片开始使用高质量缩放', 'info');
})();