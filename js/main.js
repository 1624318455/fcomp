/**
 * FComp 主入口文件
 * 负责初始化应用、绑定事件、全局状态管理
 */

(function() {
  'use strict';

  // ========================================
  // 常量
  // ========================================

  var MAX_FILE_SIZE = 10 * 1024 * 1024;

  var SUPPORTED_EXTENSIONS = [
    '.txt', '.js', '.jsx', '.ts', '.tsx',
    '.json', '.html', '.htm', '.css',
    '.scss', '.sass', '.less', '.md',
    '.markdown', '.xml', '.yaml', '.yml',
    '.sql', '.sh', '.bash', '.log',
    '.conf', '.ini', '.properties'
  ];

  // ========================================
  // Toast 通知
  // ========================================

  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(function() {
      toast.style.animation = 'toastFadeOut 0.3s ease-out';
      setTimeout(function() {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // ========================================
  // 全局状态
  // ========================================

  var state = {
    sourceContent: '',
    targetContent: '',
    sourceFileName: '',
    targetFileName: '',
    diffResult: null,
    syncScrollEnabled: true,
    isComparing: false
  };

  // ========================================
  // DOM 元素引用
  // ========================================

  var el = {};

  // ========================================
  // 初始化
  // ========================================

  function init() {
    cacheElements();
    bindEvents();
    setupPasteHandlers();
    setupDiffPanelResize();
    setupScrollSync();
    checkJsDiffLoaded();
  }

  function cacheElements() {
    el.sourceDropZone = document.getElementById('source-drop-zone');
    el.targetDropZone = document.getElementById('target-drop-zone');
    el.sourceFileInput = document.getElementById('source-file-input');
    el.targetFileInput = document.getElementById('target-file-input');
    el.sourceFilePreview = document.getElementById('source-file-preview');
    el.targetFilePreview = document.getElementById('target-file-preview');
    el.sourceLineNumbers = document.getElementById('source-line-numbers');
    el.targetLineNumbers = document.getElementById('target-line-numbers');
    el.sourceCodeContent = document.getElementById('source-code-content');
    el.targetCodeContent = document.getElementById('target-code-content');
    el.sourceFileName = document.getElementById('source-file-name');
    el.targetFileName = document.getElementById('target-file-name');
    el.compareBtn = document.getElementById('compare-btn');
    el.clearLeftBtn = document.getElementById('clear-left');
    el.clearRightBtn = document.getElementById('clear-right');
    el.clearAllBtn = document.getElementById('clear-all');
    el.syncScrollToggle = document.getElementById('sync-scroll-toggle');
    el.diffPanel = document.getElementById('diff-results-panel');
    el.diffContent = document.getElementById('diff-results-content');
  }

  function checkJsDiffLoaded() {
    if (typeof Diff === 'undefined') {
      showToast('错误：jsdiff 库加载失败，请检查网络连接后刷新页面重试。', 'error');
      el.compareBtn.disabled = true;
      return false;
    }
    return true;
  }

  // ========================================
  // 事件绑定
  // ========================================

  function bindEvents() {
    setupDropZone(el.sourceDropZone, el.sourceFileInput, 'source');
    setupDropZone(el.targetDropZone, el.targetFileInput, 'target');

    el.compareBtn.addEventListener('click', handleCompare);

    el.clearLeftBtn.addEventListener('click', handleClearLeft);
    el.clearRightBtn.addEventListener('click', handleClearRight);
    el.clearAllBtn.addEventListener('click', handleClearAll);

    el.syncScrollToggle.addEventListener('change', function(e) {
      state.syncScrollEnabled = e.target.checked;
      ScrollSync.toggle(e.target.checked);
    });

    document.addEventListener('keydown', handleKeyDown);

    var closeBtn = document.getElementById('close-diff-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        el.diffPanel.classList.remove('active');
      });
    }
  }

  // ========================================
  // 拖放区域
  // ========================================

  function setupDropZone(dropZone, fileInput, side) {
    if (!dropZone || !fileInput) return;

    fileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0], side);
      }
    });

    dropZone.addEventListener('click', function(e) {
      if (dropZone.classList.contains('has-file')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    var clearBtn = document.getElementById(side === 'source' ? 'source-clear-btn' : 'target-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        clearPanel(side);
      });
    }

    dropZone.addEventListener('dragenter', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');

      var files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0], side);
      }
    });
  }

  // ========================================
  // 文件校验
  // ========================================

  function validateFile(file) {
    if (file.size > MAX_FILE_SIZE) {
      var sizeMB = (file.size / 1024 / 1024).toFixed(1);
      showToast('文件过大（' + sizeMB + 'MB），最大支持 10MB', 'error');
      return false;
    }

    var fileName = file.name.toLowerCase();
    var ext = fileName.substring(fileName.lastIndexOf('.'));
    if (SUPPORTED_EXTENSIONS.indexOf(ext) === -1 && ext !== fileName) {
      showToast('不支持的文件类型：' + ext + '，将尝试作为文本读取', 'warning');
    }

    return true;
  }

  // ========================================
  // 文件处理
  // ========================================

  function handleFile(file, side) {
    if (!validateFile(file)) return;

    var reader = new FileReader();
    var fileInput = side === 'source' ? el.sourceFileInput : el.targetFileInput;

    reader.onload = function(e) {
      var content = e.target.result;

      if (side === 'source') {
        state.sourceContent = content;
        state.sourceFileName = file.name;
        setFileNameDisplay(el.sourceFileName, file.name);
        renderFileContent(el.sourceLineNumbers, el.sourceCodeContent, content);
        el.sourceDropZone.classList.add('has-file');
      } else {
        state.targetContent = content;
        state.targetFileName = file.name;
        setFileNameDisplay(el.targetFileName, file.name);
        renderFileContent(el.targetLineNumbers, el.targetCodeContent, content);
        el.targetDropZone.classList.add('has-file');
      }

      // 隐藏差异面板
      el.diffPanel.classList.remove('active');
      state.diffResult = null;

      fileInput.value = '';

      showToast('文件 "' + file.name + '" 已加载', 'success');
    };

    reader.onerror = function() {
      showToast('文件读取失败', 'error');
      fileInput.value = '';
    };

    reader.readAsText(file);
  }

  // ========================================
  // 渲染文件内容（行号 + 代码）
  // ========================================

  function renderFileContent(lineNumbersEl, codeContentEl, content) {
    var lines = content.split('\n');

    var lineNumbersHTML = '';
    var codeHTML = '';

    for (var i = 0; i < lines.length; i++) {
      lineNumbersHTML += '<span class="line-number">' + (i + 1) + '</span>';
      codeHTML += '<div class="diff-line diff-line-unchanged" data-line="' + (i + 1) + '">';
      codeHTML += '<span class="line-content">' + escapeHtml(lines[i]) + '</span>';
      codeHTML += '</div>';
    }

    lineNumbersEl.innerHTML = lineNumbersHTML;
    codeContentEl.innerHTML = codeHTML;
  }

  // ========================================
  // 文件名显示
  // ========================================

  function setFileNameDisplay(element, name) {
    if (name) {
      var displayName = name;
      if (displayName.indexOf('\\') !== -1) {
        displayName = displayName.substring(displayName.lastIndexOf('\\') + 1);
      }
      if (displayName.indexOf('/') !== -1) {
        displayName = displayName.substring(displayName.lastIndexOf('/') + 1);
      }
      element.innerHTML = '<span>' + escapeHtml(displayName) + '</span>';
    } else {
      element.innerHTML = '<span class="file-name-placeholder">未选择文件</span>';
    }
  }

  // ========================================
  // 清空面板（带确认）
  // ========================================

  function clearPanel(side, skipConfirm) {
    var hasContent = (side === 'source' && state.sourceContent) || (side === 'target' && state.targetContent);

    if (hasContent && !skipConfirm) {
      var sideLabel = side === 'source' ? '左侧' : '右侧';
      if (!window.confirm('确定清空' + sideLabel + '文件？')) return;
    }

    if (side === 'source') {
      state.sourceContent = '';
      state.sourceFileName = '';
      setFileNameDisplay(el.sourceFileName, '');
      el.sourceCodeContent.innerHTML = '';
      el.sourceLineNumbers.innerHTML = '';
      el.sourceDropZone.classList.remove('has-file');
    } else {
      state.targetContent = '';
      state.targetFileName = '';
      setFileNameDisplay(el.targetFileName, '');
      el.targetCodeContent.innerHTML = '';
      el.targetLineNumbers.innerHTML = '';
      el.targetDropZone.classList.remove('has-file');
    }

    el.diffPanel.classList.remove('active');
    state.diffResult = null;

    updateStats({ total: 0, added: 0, removed: 0, modified: 0 });
  }

  function handleClearLeft() {
    clearPanel('source');
  }

  function handleClearRight() {
    clearPanel('target');
  }

  function handleClearAll() {
    if ((state.sourceContent || state.targetContent) && !window.confirm('确定清空所有内容？')) return;
    clearPanel('source', true);
    clearPanel('target', true);
    showToast('已清空所有内容', 'info');
  }

  // ========================================
  // 比对
  // ========================================

  function handleCompare() {
    if (!state.sourceContent && !state.targetContent) {
      showToast('请先上传两个文件', 'warning');
      return;
    }

    if (!checkJsDiffLoaded()) return;

    state.isComparing = true;
    el.compareBtn.disabled = true;

    setTimeout(function() {
      try {
        var diffResult = DiffEngine.compare(state.sourceContent, state.targetContent);
        state.diffResult = diffResult;

        renderDiffInPlace(diffResult);
        renderDiffResultsPanel(diffResult);

        el.diffPanel.classList.add('active');

        // 初始化同步滚动（内容变化后需重新绑定）
        setupScrollSync();

        showToast('比对完成，发现 ' + diffResult.stats.total + ' 处差异', 'info');

      } catch (error) {
        showToast('比对失败：' + error.message, 'error');
        console.error(error);
      } finally {
        state.isComparing = false;
        el.compareBtn.disabled = false;
      }
    }, 50);
  }

  // ========================================
  // 面板内差异渲染
  // ========================================

  function renderDiffInPlace(diffResult) {
    renderLinesWithDiff(el.sourceLineNumbers, el.sourceCodeContent, diffResult.source, 'source');
    renderLinesWithDiff(el.targetLineNumbers, el.targetCodeContent, diffResult.target, 'target');
  }

  function renderLinesWithDiff(lineNumbersEl, codeContentEl, lines, side) {
    var lineNumbersHTML = '';
    var codeHTML = '';

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var lineNum = i + 1;

      // 行号
      var lineNumClass = 'line-number';
      if (line.type === 'added' || line.type === 'removed' || line.type === 'modified') {
        lineNumClass += ' diff-gutter-' + line.type;
      }
      lineNumbersHTML += '<span class="' + lineNumClass + '">' + lineNum + '</span>';

      // 代码行
      var lineClass = 'diff-line';
      if (line.type === 'added') {
        lineClass += ' diff-line-added';
      } else if (line.type === 'removed') {
        lineClass += ' diff-line-removed';
      } else if (line.type === 'modified') {
        lineClass += ' diff-line-modified';
      } else if (line.type === 'empty') {
        lineClass += ' diff-line-empty';
      } else {
        lineClass += ' diff-line-unchanged';
      }

      var content = '';
      if (line.type === 'empty') {
        content = '&nbsp;';
      } else if (line.type === 'modified' && line.wordDiff) {
        content = renderWordDiff(line.wordDiff);
      } else {
        content = escapeHtml(line.content);
      }

      codeHTML += '<div class="' + lineClass + '" data-line="' + lineNum + '">';
      codeHTML += '<span class="line-content">' + content + '</span>';
      codeHTML += '</div>';
    }

    lineNumbersEl.innerHTML = lineNumbersHTML;
    codeContentEl.innerHTML = codeHTML;
  }

  // ========================================
  // 词级差异渲染
  // ========================================

  function renderWordDiff(wordDiff) {
    var html = '';
    for (var i = 0; i < wordDiff.length; i++) {
      var part = wordDiff[i];
      var escaped = escapeHtml(part.value);
      if (part.added) {
        html += '<span class="word-added">' + escaped + '</span>';
      } else if (part.removed) {
        html += '<span class="word-removed">' + escaped + '</span>';
      } else {
        html += escaped;
      }
    }
    return html;
  }

  function computeWordDiffs(diffResult) {
    var sourceLines = diffResult.source;
    var targetLines = diffResult.target;

    for (var i = 0; i < sourceLines.length; i++) {
      if (sourceLines[i].type === 'modified' && targetLines[i] && targetLines[i].type === 'modified') {
        var wordDiff = DiffEngine.compareWords(sourceLines[i].content, targetLines[i].content);
        sourceLines[i].wordDiff = wordDiff;
        targetLines[i].wordDiff = wordDiff;
      }
    }
  }

  // ========================================
  // 统计更新
  // ========================================

  function updateStats(stats) {
    var statTotal = document.getElementById('stat-total');
    var statAdded = document.getElementById('stat-added');
    var statRemoved = document.getElementById('stat-removed');
    var statModified = document.getElementById('stat-modified');

    if (statTotal) statTotal.textContent = stats.total || 0;
    if (statAdded) statAdded.textContent = stats.added || 0;
    if (statRemoved) statRemoved.textContent = stats.removed || 0;
    if (statModified) statModified.textContent = stats.modified || 0;
  }

  // ========================================
  // 差异详情面板（底部列表）
  // ========================================

  function renderDiffResultsPanel(diffResult) {
    var contentEl = el.diffContent;
    if (!contentEl) return;

    var stats = diffResult.stats || { added: 0, removed: 0, modified: 0, total: 0 };
    updateStats(stats);

    // 计算词级差异
    computeWordDiffs(diffResult);

    contentEl.innerHTML = '';

    var sourceLines = diffResult.source || [];
    var targetLines = diffResult.target || [];
    var items = [];

    sourceLines.forEach(function(line, index) {
      if (line.type === 'removed' || line.type === 'modified') {
        items.push({
          side: 'source',
          lineNum: index + 1,
          type: line.type,
          content: line.content || '(空行)'
        });
      }
    });

    targetLines.forEach(function(line, index) {
      if (line.type === 'added' || line.type === 'modified') {
        items.push({
          side: 'target',
          lineNum: index + 1,
          type: line.type,
          content: line.content || '(空行)'
        });
      }
    });

    if (items.length === 0) {
      contentEl.innerHTML = '<div class="diff-results-placeholder">两份内容完全相同，无差异</div>';
      return;
    }

    items.forEach(function(item) {
      var div = document.createElement('div');
      div.className = 'diff-result-item ' + item.type;

      var sideLabel = item.side === 'source' ? '左侧' : '右侧';

      div.innerHTML = '<span class="diff-result-line">' + sideLabel + ' 第' + item.lineNum + '行</span>' +
        '<span class="diff-result-content">' + escapeHtml(item.content) + '</span>';

      div.addEventListener('click', (function(side, lineNum) {
        return function() {
          scrollToLine(side, lineNum);
        };
      })(item.side, item.lineNum));

      contentEl.appendChild(div);
    });
  }

  // ========================================
  // 滚动到指定行并高亮
  // ========================================

  function scrollToLine(side, lineNum) {
    var codeContentEl = side === 'source' ? el.sourceCodeContent : el.targetCodeContent;
    var lineEl = codeContentEl.querySelector('[data-line="' + lineNum + '"]');

    if (lineEl) {
      lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      lineEl.classList.add('line-highlight');
      setTimeout(function() {
        lineEl.classList.remove('line-highlight');
      }, 1500);
    }
  }

  // ========================================
  // 同步滚动
  // ========================================

  function setupScrollSync() {
    ScrollSync.init(el.sourceDropZone, el.targetDropZone);
    ScrollSync.toggle(state.syncScrollEnabled);
  }

  // ========================================
  // 粘贴处理
  // ========================================

  function setupPasteHandlers() {
    el.sourceDropZone.addEventListener('paste', function(e) {
      handlePaste(e, 'source');
    });
    el.targetDropZone.addEventListener('paste', function(e) {
      handlePaste(e, 'target');
    });
  }

  function handlePaste(e, side) {
    var text = (e.clipboardData || window.clipboardData).getData('text');
    if (!text) return;

    e.preventDefault();

    var file = new File([text], 'pasted-text.txt', { type: 'text/plain' });
    handleFile(file, side);
  }

  // ========================================
  // HTML 转义
  // ========================================

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ========================================
  // 键盘快捷键
  // ========================================

  function handleKeyDown(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleCompare();
    }
  }

  // ========================================
  // 差异面板拖拽调整高度
  // ========================================

  function setupDiffPanelResize() {
    var diffPanel = document.getElementById('diff-results-panel');
    var header = diffPanel ? diffPanel.querySelector('.diff-results-header') : null;
    if (!diffPanel || !header) return;

    var isResizing = false;
    var startY = 0;
    var startHeight = 0;
    var minHeight = 80;
    var maxHeight = window.innerHeight * 0.6;

    header.addEventListener('mousedown', function(e) {
      if (!diffPanel.classList.contains('active')) return;
      if (e.target.closest('.btn-text')) return;
      isResizing = true;
      startY = e.clientY;
      startHeight = diffPanel.offsetHeight;
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
      if (!isResizing) return;
      var delta = startY - e.clientY;
      var newHeight = Math.min(maxHeight, Math.max(minHeight, startHeight + delta));
      diffPanel.style.height = newHeight + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  // ========================================
  // 启动
  // ========================================

  init();

})();
