(function () {
    // DOM元素
    const originalWidthInput = document.getElementById('original-width');
    const originalHeightInput = document.getElementById('original-height');
    const scaleTypeRadios = document.querySelectorAll('.tool-container input[name="scale-type"]');
    const percentControls = document.getElementById('percent-controls');
    const dimensionControls = document.getElementById('dimension-controls');
    const scalePercentInput = document.getElementById('scale-percent-value');
    const targetWidthInput = document.getElementById('target-width');
    const targetHeightInput = document.getElementById('target-height');
    const calculateBtn = document.getElementById('calculate-btn');
    const newWidthElement = document.getElementById('new-width');
    const newHeightElement = document.getElementById('new-height');
    const aspectRatioElement = document.getElementById('aspect-ratio');
    const aspectRatioTextElement = document.getElementById('aspect-ratio-text');
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseFiles = document.getElementById('browse-files');
    const fileList = document.getElementById('file-list');
    const batchResults = document.getElementById('batch-results');
    const batchResultsBody = document.getElementById('batch-results-body');
    const resetSingleBtn = document.getElementById('reset-single-btn');
    const resetAllBtn = document.getElementById('reset-all-btn');

    // 存储拖拽的图片数据
    let draggedImages = [];

    // 示例尺寸点击事件
    const exampleListItems = document.querySelectorAll('.tool-example-list li');
    exampleListItems.forEach(item => {
        item.addEventListener('click', function () {
            const text = this.querySelector('span').textContent;
            const dimensions = text.split(' × ');
            if (dimensions.length === 2) {
                originalWidthInput.value = dimensions[0].trim();
                originalHeightInput.value = dimensions[1].trim();
                calculateScale();
            }
        });
    });

    // 缩放类型切换
    scaleTypeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === 'percent') {
                percentControls.style.display = 'block';
                dimensionControls.style.display = 'none';
            } else {
                percentControls.style.display = 'none';
                dimensionControls.style.display = 'block';
            }
            calculateScale();
        });
    });

    // 输入变化时重新计算
    const inputs = [
        originalWidthInput, originalHeightInput,
        scalePercentInput, targetWidthInput, targetHeightInput
    ];

    inputs.forEach(input => {
        input.addEventListener('input', calculateScale);
    });

    // 计算按钮点击事件
    calculateBtn.addEventListener('click', calculateScale);

    // 重置按钮事件
    resetSingleBtn.addEventListener('click', resetSingleCalculation);
    resetAllBtn.addEventListener('click', resetAll);

    // 文件浏览点击事件
    browseFiles.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽事件处理
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('dragover');
    }

    function unhighlight() {
        dropArea.classList.remove('dragover');
    }

    // 处理文件拖放
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        draggedImages = [];
        fileList.innerHTML = '';

        if (files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.match('image.*')) continue;

            const reader = new FileReader();

            reader.onload = (function (file) {
                return function (e) {
                    const img = new Image();
                    img.onload = function () {
                        draggedImages.push({
                            name: file.name,
                            width: img.width,
                            height: img.height,
                            size: formatFileSize(file.size)
                        });

                        // 更新文件列表显示
                        updateFileList();

                        // 如果是第一个文件，更新到单个计算器
                        if (draggedImages.length === 1) {
                            originalWidthInput.value = img.width;
                            originalHeightInput.value = img.height;
                            calculateScale();
                        }

                        // 如果有多张图片，显示批量结果区域
                        if (draggedImages.length > 1) {
                            calculateBatchScaling();
                        }
                    };
                    img.src = e.target.result;
                };
            })(file);

            reader.readAsDataURL(file);
        }
    }

    function updateFileList() {
        fileList.innerHTML = '';

        draggedImages.forEach((image, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                    <div class="file-icon">🖼️</div>
                    <div class="file-name" title="${image.name}">${image.name}</div>
                    <div class="file-size">${image.size} • ${image.width}×${image.height}</div>
                `;
            fileList.appendChild(fileItem);
        });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 计算最大公约数函数
    function gcd(a, b) {
        return b ? gcd(b, a % b) : a;
    }

    // 计算宽高比简化形式
    function simplifyAspectRatio(width, height) {
        const divisor = gcd(width, height);
        return `${width / divisor}:${height / divisor}`;
    }

    // 计算缩放后的尺寸
    function calculateScaledDimensions(originalWidth, originalHeight) {
        let newWidth, newHeight;
        const scaleType = document.querySelector('.tool-container input[name="scale-type"]:checked').value;

        if (scaleType === 'percent') {
            // 按百分比缩放
            const percent = parseFloat(scalePercentInput.value) || 100;
            const scaleFactor = percent / 100;

            newWidth = Math.round(originalWidth * scaleFactor);
            newHeight = Math.round(originalHeight * scaleFactor);
        } else {
            // 按目标尺寸缩放
            const targetWidth = targetWidthInput.value ? parseInt(targetWidthInput.value) : null;
            const targetHeight = targetHeightInput.value ? parseInt(targetHeightInput.value) : null;

            if (targetWidth && !targetHeight) {
                // 只有目标宽度
                const scaleFactor = targetWidth / originalWidth;
                newWidth = targetWidth;
                newHeight = Math.round(originalHeight * scaleFactor);
            } else if (!targetWidth && targetHeight) {
                // 只有目标高度
                const scaleFactor = targetHeight / originalHeight;
                newWidth = Math.round(originalWidth * scaleFactor);
                newHeight = targetHeight;
            } else if (targetWidth && targetHeight) {
                // 两者都有，计算哪个缩放比例更小以保持宽高比
                const widthRatio = targetWidth / originalWidth;
                const heightRatio = targetHeight / originalHeight;
                const scaleFactor = Math.min(widthRatio, heightRatio);

                newWidth = Math.round(originalWidth * scaleFactor);
                newHeight = Math.round(originalHeight * scaleFactor);
            } else {
                // 两者都为空，保持原尺寸
                newWidth = originalWidth;
                newHeight = originalHeight;
            }
        }

        // 确保最小尺寸为1像素
        newWidth = Math.max(1, newWidth);
        newHeight = Math.max(1, newHeight);

        return { newWidth, newHeight };
    }

    // 主计算函数（单个）
    function calculateScale() {
        // 获取原始尺寸
        const originalWidth = parseInt(originalWidthInput.value) || 1;
        const originalHeight = parseInt(originalHeightInput.value) || 1;

        const { newWidth, newHeight } = calculateScaledDimensions(originalWidth, originalHeight);

        // 更新结果显示
        newWidthElement.textContent = newWidth;
        newHeightElement.textContent = newHeight;

        // 计算宽高比
        const aspectRatio = (newWidth / newHeight).toFixed(2);
        aspectRatioElement.textContent = aspectRatio;

        // 计算并显示简化宽高比
        const simplifiedRatio = simplifyAspectRatio(newWidth, newHeight);
        aspectRatioTextElement.textContent = simplifiedRatio;
    }

    // 批量计算函数
    function calculateBatchScaling() {
        if (draggedImages.length <= 1) {
            batchResults.style.display = 'none';
            return;
        }

        batchResults.style.display = 'block';
        batchResultsBody.innerHTML = '';

        draggedImages.forEach(image => {
            const { newWidth, newHeight } = calculateScaledDimensions(image.width, image.height);

            const row = document.createElement('tr');
            row.innerHTML = `
                    <td>${image.name}</td>
                    <td class="tool-dimension-cell">
                        <span class="original">${image.width} × ${image.height}</span>
                    </td>
                    <td class="tool-dimension-cell">
                        <span class="original">${image.width} × ${image.height}</span>
                        <span class="arrow">→</span>
                        <span class="result">${newWidth} × ${newHeight}</span>
                    </td>
                `;
            batchResultsBody.appendChild(row);
        });
    }

    // 重置单个计算
    function resetSingleCalculation() {
        originalWidthInput.value = '1920';
        originalHeightInput.value = '1080';
        scalePercentInput.value = '50';
        targetWidthInput.value = '';
        targetHeightInput.value = '';
        calculateScale();
    }

    // 重置全部
    function resetAll() {
        resetSingleCalculation();
        draggedImages = [];
        fileList.innerHTML = '';
        batchResults.style.display = 'none';
        fileInput.value = '';
    }

    // 初始化计算
    calculateScale();
})();