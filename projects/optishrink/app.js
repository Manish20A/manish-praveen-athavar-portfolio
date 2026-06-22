/* ==========================================================================
   OptiShrink Pro - Core Client-Side JavaScript Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // State Variables
    let filesQueue = [];
    let activeFileId = null;
    let isDraggingSlider = false;

    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const workspace = document.getElementById('workspace');
    const queueSection = document.getElementById('queue-section');
    const queueList = document.getElementById('queue-list');
    const queueCount = document.getElementById('queue-count');
    
    // Preview Elements
    const currentImageName = document.getElementById('current-image-name');
    const imgBefore = document.getElementById('img-before');
    const imgAfter = document.getElementById('img-after');
    const sizeBefore = document.getElementById('size-before');
    const sizeAfter = document.getElementById('size-after');
    const percentSaved = document.getElementById('percent-saved');
    const comparisonSlider = document.getElementById('comparison-slider');
    const sliderHandle = document.getElementById('slider-handle');
    const processingOverlay = document.getElementById('processing-overlay');
    const btnToggleFit = document.getElementById('btn-toggle-fit');
    
    // Control Elements
    const rangeQuality = document.getElementById('range-quality');
    const qualityVal = document.getElementById('quality-val');
    const selectFormat = document.getElementById('select-format');
    const selectResize = document.getElementById('select-resize');
    const customDimensions = document.getElementById('custom-dimensions');
    const inputWidth = document.getElementById('input-width');
    const inputHeight = document.getElementById('input-height');
    const checkAspect = document.getElementById('check-aspect');
    const btnDownloadSingle = document.getElementById('btn-download-single');
    const btnDownloadAll = document.getElementById('btn-download-all');

    /* ==========================================================================
       1. Event Listeners for File Selection
       ========================================================================== */

    // Drag-and-drop actions
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Process uploaded files
    function handleFiles(files) {
        if (!files.length) return;

        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (!imageFiles.length) {
            alert('Please select valid image files (JPEG, PNG, WebP, GIF, SVG).');
            return;
        }

        imageFiles.forEach(file => {
            const fileItem = {
                id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                file: file,
                name: file.name,
                originalSize: file.size,
                optimizedSize: 0,
                optimizedBlob: null,
                originalWidth: 0,
                originalHeight: 0,
                optimizedWidth: 0,
                optimizedHeight: 0,
                status: 'waiting',
                settings: {
                    quality: parseInt(rangeQuality.value),
                    format: selectFormat.value,
                    resizeScale: selectResize.value,
                    customWidth: '',
                    customHeight: '',
                    lockAspect: checkAspect.checked
                }
            };

            filesQueue.push(fileItem);
            
            // Read dimensions first
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                fileItem.originalWidth = img.width;
                fileItem.originalHeight = img.height;
                fileItem.settings.customWidth = img.width;
                fileItem.settings.customHeight = img.height;
                URL.revokeObjectURL(img.src);
                
                // Trigger compression once dimensions are loaded
                processFile(fileItem);
            };
        });

        // Show UI elements
        workspace.classList.remove('hidden');
        queueSection.classList.remove('hidden');
        
        // Auto-select first item if none is active
        if (!activeFileId && filesQueue.length > 0) {
            setActiveFile(filesQueue[filesQueue.length - imageFiles.length].id);
        }

        updateQueueUI();
    }

    /* ==========================================================================
       2. Active File State & Settings Panel Controls
       ========================================================================== */

    function setActiveFile(id) {
        activeFileId = id;
        const fileItem = filesQueue.find(item => item.id === id);
        if (!fileItem) return;

        currentImageName.textContent = fileItem.name;
        
        // Set values in controls panel to active file's settings
        rangeQuality.value = fileItem.settings.quality;
        qualityVal.textContent = fileItem.settings.quality + '%';
        selectFormat.value = fileItem.settings.format;
        selectResize.value = fileItem.settings.resizeScale;
        checkAspect.checked = fileItem.settings.lockAspect;

        // Custom dimension states
        if (fileItem.settings.resizeScale === 'custom') {
            customDimensions.classList.remove('hidden');
            inputWidth.value = fileItem.settings.customWidth || fileItem.originalWidth;
            inputHeight.value = fileItem.settings.customHeight || fileItem.originalHeight;
        } else {
            customDimensions.classList.add('hidden');
        }

        // Set Image Preview sources
        imgBefore.src = URL.createObjectURL(fileItem.file);
        sizeBefore.textContent = formatBytes(fileItem.originalSize);
        
        if (fileItem.status === 'done' && fileItem.optimizedBlob) {
            if (imgAfter.src) {
                URL.revokeObjectURL(imgAfter.src);
            }
            imgAfter.src = URL.createObjectURL(fileItem.optimizedBlob);
            sizeAfter.textContent = formatBytes(fileItem.optimizedSize);
            
            const pct = Math.round(((fileItem.originalSize - fileItem.optimizedSize) / fileItem.originalSize) * 100);
            percentSaved.textContent = pct > 0 ? `-${pct}%` : `+${Math.abs(pct)}%`;
            percentSaved.className = pct > 0 ? 'saving-badge' : 'saving-badge warning';
            
            btnDownloadSingle.href = imgAfter.src;
            btnDownloadSingle.download = getOptimizedFilename(fileItem);
            btnDownloadSingle.classList.remove('disabled');
        } else {
            imgAfter.src = '';
            sizeAfter.textContent = 'Processing...';
            percentSaved.textContent = '...';
            btnDownloadSingle.classList.add('disabled');
        }

        updateQueueUI();
    }

    // Settings adjustments re-trigger optimization for active file
    rangeQuality.addEventListener('input', (e) => {
        qualityVal.textContent = e.target.value + '%';
        updateActiveSettings('quality', parseInt(e.target.value));
    });

    selectFormat.addEventListener('change', (e) => {
        updateActiveSettings('format', e.target.value);
    });

    selectResize.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value === 'custom') {
            customDimensions.classList.remove('hidden');
            const fileItem = filesQueue.find(item => item.id === activeFileId);
            if (fileItem) {
                inputWidth.value = fileItem.settings.customWidth || fileItem.originalWidth;
                inputHeight.value = fileItem.settings.customHeight || fileItem.originalHeight;
            }
        } else {
            customDimensions.classList.add('hidden');
        }
        updateActiveSettings('resizeScale', value);
    });

    inputWidth.addEventListener('input', () => {
        const widthVal = parseInt(inputWidth.value);
        if (isNaN(widthVal) || widthVal <= 0) return;
        
        const fileItem = filesQueue.find(item => item.id === activeFileId);
        if (!fileItem) return;

        updateActiveSettings('customWidth', widthVal);

        if (checkAspect.checked && fileItem.originalWidth) {
            const heightVal = Math.round((widthVal / fileItem.originalWidth) * fileItem.originalHeight);
            inputHeight.value = heightVal;
            updateActiveSettings('customHeight', heightVal, false); // Don't trigger dual optimization
        }
        triggerActiveOptimizationDelayed();
    });

    inputHeight.addEventListener('input', () => {
        const heightVal = parseInt(inputHeight.value);
        if (isNaN(heightVal) || heightVal <= 0) return;
        
        const fileItem = filesQueue.find(item => item.id === activeFileId);
        if (!fileItem) return;

        updateActiveSettings('customHeight', heightVal);

        if (checkAspect.checked && fileItem.originalHeight) {
            const widthVal = Math.round((heightVal / fileItem.originalHeight) * fileItem.originalWidth);
            inputWidth.value = widthVal;
            updateActiveSettings('customWidth', widthVal, false);
        }
        triggerActiveOptimizationDelayed();
    });

    checkAspect.addEventListener('change', (e) => {
        updateActiveSettings('lockAspect', e.target.checked);
    });

    // Helper: update settings of active image
    function updateActiveSettings(key, value, reprocess = true) {
        if (!activeFileId) return;
        const fileItem = filesQueue.find(item => item.id === activeFileId);
        if (fileItem) {
            fileItem.settings[key] = value;
            if (reprocess && key !== 'customWidth' && key !== 'customHeight') {
                processFile(fileItem);
            }
        }
    }

    // Debounce for width/height typing to avoid freezing browser canvas operations
    let debounceTimeout;
    function triggerActiveOptimizationDelayed() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            if (!activeFileId) return;
            const fileItem = filesQueue.find(item => item.id === activeFileId);
            if (fileItem) processFile(fileItem);
        }, 300);
    }

    /* ==========================================================================
       3. Image Compression & Canvas Engine
       ========================================================================== */

    function processFile(fileItem) {
        fileItem.status = 'processing';
        updateQueueUI();

        if (fileItem.id === activeFileId) {
            processingOverlay.classList.remove('hidden');
        }

        // Run client-side optimization inside a promise
        optimizeImageLocal(fileItem)
            .then(result => {
                fileItem.status = 'done';
                fileItem.optimizedBlob = result.blob;
                fileItem.optimizedSize = result.blob.size;
                fileItem.optimizedWidth = result.width;
                fileItem.optimizedHeight = result.height;

                updateQueueUI();

                if (fileItem.id === activeFileId) {
                    processingOverlay.classList.add('hidden');
                    // Reset preview source
                    if (imgAfter.src) {
                        URL.revokeObjectURL(imgAfter.src);
                    }
                    imgAfter.src = URL.createObjectURL(result.blob);
                    sizeAfter.textContent = formatBytes(result.blob.size);
                    
                    const pct = Math.round(((fileItem.originalSize - result.blob.size) / fileItem.originalSize) * 100);
                    percentSaved.textContent = pct > 0 ? `-${pct}%` : `+${Math.abs(pct)}%`;
                    percentSaved.className = pct > 0 ? 'saving-badge' : 'saving-badge warning';
                    
                    btnDownloadSingle.href = imgAfter.src;
                    btnDownloadSingle.download = getOptimizedFilename(fileItem);
                    btnDownloadSingle.classList.remove('disabled');
                }
            })
            .catch(err => {
                console.error('Compression failed:', err);
                fileItem.status = 'error';
                updateQueueUI();
                if (fileItem.id === activeFileId) {
                    processingOverlay.classList.add('hidden');
                    sizeAfter.textContent = 'Optimization Error';
                }
            });
    }

    function optimizeImageLocal(fileItem) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(fileItem.file);
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate new dimensions
                    let targetWidth = fileItem.originalWidth || img.width;
                    let targetHeight = fileItem.originalHeight || img.height;
                    
                    const scale = fileItem.settings.resizeScale;
                    if (scale !== 'custom') {
                        const scaleNum = parseFloat(scale);
                        targetWidth = Math.round(img.width * scaleNum);
                        targetHeight = Math.round(img.height * scaleNum);
                    } else {
                        targetWidth = parseInt(fileItem.settings.customWidth) || img.width;
                        targetHeight = parseInt(fileItem.settings.customHeight) || img.height;
                    }

                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    
                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                    
                    // Select format
                    let mimeType = fileItem.settings.format;
                    if (mimeType === 'original') {
                        mimeType = fileItem.file.type;
                    }
                    
                    // WebP and JPEG accept quality sliders. PNG is lossless.
                    const quality = fileItem.settings.quality / 100;
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve({
                                blob: blob,
                                width: targetWidth,
                                height: targetHeight
                            });
                        } else {
                            reject(new Error('Canvas blob generation returned null'));
                        }
                    }, mimeType, quality);

                    URL.revokeObjectURL(img.src);
                } catch (e) {
                    URL.revokeObjectURL(img.src);
                    reject(e);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                reject(new Error('Failed to load image source'));
            };
        });
    }

    /* ==========================================================================
       4. Visual Comparison Split Slider Interaction
       ========================================================================== */

    sliderHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDraggingSlider = true;
        document.addEventListener('mousemove', moveSlider);
        document.addEventListener('mouseup', stopSlider);
    });

    sliderHandle.addEventListener('touchstart', (e) => {
        isDraggingSlider = true;
        document.addEventListener('touchmove', moveSlider);
        document.addEventListener('touchend', stopSlider);
    });

    function moveSlider(e) {
        if (!isDraggingSlider) return;
        
        const rect = comparisonSlider.getBoundingClientRect();
        let clientX = e.clientX;
        
        // Support touch events
        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
        }

        let posX = clientX - rect.left;
        let percentage = (posX / rect.width) * 100;
        
        // Bound checks
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        
        comparisonSlider.style.setProperty('--slider-pos', `${percentage}%`);
    }

    function stopSlider() {
        isDraggingSlider = false;
        document.removeEventListener('mousemove', moveSlider);
        document.removeEventListener('mouseup', stopSlider);
        document.removeEventListener('touchmove', moveSlider);
        document.removeEventListener('touchend', stopSlider);
    }

    // Toggle Fit/Scale
    btnToggleFit.addEventListener('click', () => {
        comparisonSlider.classList.toggle('fit-image');
        const isFit = comparisonSlider.classList.contains('fit-image');
        btnToggleFit.querySelector('i').className = isFit ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
        btnToggleFit.title = isFit ? 'Restore Original Scale' : 'Fit Image to Window';
    });

    /* ==========================================================================
       5. Batch List UI Updates & Operations
       ========================================================================== */

    function updateQueueUI() {
        queueCount.textContent = filesQueue.length;
        queueList.innerHTML = '';
        
        filesQueue.forEach(item => {
            const tr = document.createElement('tr');
            if (item.id === activeFileId) {
                tr.classList.add('active-row');
            }

            // Create simple row click to select active
            tr.addEventListener('click', (e) => {
                // Prevent trigger active row change when clicking buttons inside row
                if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I' && e.target.tagName !== 'A') {
                    setActiveFile(item.id);
                }
            });

            // Create temporary object URL for queue preview thumbnail
            const previewUrl = URL.createObjectURL(item.file);

            // Status Badge HTML
            let statusHtml = '';
            if (item.status === 'waiting') {
                statusHtml = '<span class="badge-status waiting"><i class="fa-solid fa-clock"></i> Queued</span>';
            } else if (item.status === 'processing') {
                statusHtml = '<span class="badge-status processing"><i class="fa-solid fa-spinner fa-spin"></i> Processing</span>';
            } else if (item.status === 'done') {
                statusHtml = '<span class="badge-status done"><i class="fa-solid fa-circle-check"></i> Optimized</span>';
            } else {
                statusHtml = '<span class="badge-status done" style="background: rgba(239, 68, 68, 0.1); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.2);"><i class="fa-solid fa-triangle-exclamation"></i> Error</span>';
            }

            const optimizedSizeText = item.status === 'done' ? formatBytes(item.optimizedSize) : '—';
            
            // Actions
            let actionHtml = '';
            if (item.status === 'done' && item.optimizedBlob) {
                const optimizedUrl = URL.createObjectURL(item.optimizedBlob);
                actionHtml = `
                    <a href="${optimizedUrl}" download="${getOptimizedFilename(item)}" class="btn btn-secondary btn-sm" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; color: var(--color-success); border-color: rgba(16, 185, 129, 0.3);">
                        <i class="fa-solid fa-download"></i> Save
                    </a>
                `;
            } else {
                actionHtml = `<button class="btn btn-secondary btn-sm" disabled style="padding: 0.35rem 0.75rem; font-size: 0.75rem; opacity: 0.5;"><i class="fa-solid fa-spinner fa-spin"></i> Wait</button>`;
            }
            
            actionHtml += `
                <button class="btn btn-icon btn-sm btn-delete-item" data-id="${item.id}" title="Remove file" style="width: 28px; height: 28px; font-size: 0.75rem; margin-left: 0.5rem; color: #EF4444; border-color: rgba(239, 68, 68, 0.2);">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            tr.innerHTML = `
                <td><img class="queue-preview" src="${previewUrl}" alt="Preview"></td>
                <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;" title="${item.name}">${item.name}</td>
                <td>${formatBytes(item.originalSize)}</td>
                <td>${optimizedSizeText}</td>
                <td>${statusHtml}</td>
                <td>${actionHtml}</td>
            `;
            
            queueList.appendChild(tr);
            
            // Hook delete action
            const deleteBtn = tr.querySelector('.btn-delete-item');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFileFromQueue(item.id);
            });
        });

        // Toggle ZIP download visibility
        if (filesQueue.length > 1) {
            btnDownloadAll.classList.remove('hidden');
        } else {
            btnDownloadAll.classList.add('hidden');
        }
    }

    function removeFileFromQueue(id) {
        filesQueue = filesQueue.filter(item => item.id !== id);
        
        if (filesQueue.length === 0) {
            activeFileId = null;
            workspace.classList.add('hidden');
            queueSection.classList.add('hidden');
        } else if (activeFileId === id) {
            setActiveFile(filesQueue[0].id);
        } else {
            updateQueueUI();
        }
    }

    /* ==========================================================================
       6. Zipping & Bulk Export
       ========================================================================== */

    btnDownloadAll.addEventListener('click', () => {
        const completedItems = filesQueue.filter(item => item.status === 'done' && item.optimizedBlob);
        if (!completedItems.length) {
            alert('No files have completed optimization yet.');
            return;
        }

        btnDownloadAll.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Bundling ZIP...';
        btnDownloadAll.disabled = true;

        const zip = new JSZip();
        
        completedItems.forEach(item => {
            const filename = getOptimizedFilename(item);
            zip.file(filename, item.optimizedBlob);
        });

        zip.generateAsync({ type: 'blob' })
            .then((content) => {
                const zipUrl = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = zipUrl;
                a.download = `optishrink_compressed_images_${Date.now()}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(zipUrl);

                btnDownloadAll.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Download All as ZIP';
                btnDownloadAll.disabled = false;
            })
            .catch(err => {
                console.error('Failed to create zip file:', err);
                alert('An error occurred while building the zip download.');
                btnDownloadAll.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Download All as ZIP';
                btnDownloadAll.disabled = false;
            });
    });

    /* ==========================================================================
       7. Utility Handlers
       ========================================================================== */

    // Format bytes to readable string
    function formatBytes(bytes, decimals = 1) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Determine download filename extension based on settings
    function getOptimizedFilename(item) {
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        
        let ext = 'webp';
        let format = item.settings.format;
        if (format === 'original') {
            format = item.file.type;
        }
        
        if (format === 'image/jpeg') {
            ext = 'jpg';
        } else if (format === 'image/png') {
            ext = 'png';
        } else if (format === 'image/webp') {
            ext = 'webp';
        }
        
        return `${baseName}_optimized.${ext}`;
    }
});
