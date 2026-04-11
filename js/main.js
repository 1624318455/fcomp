/**
 * FComp 主入口文件
 * 负责初始化应用、绑定事件、全局状态管理
 * 严格遵循架构方案设计规范
 */

(function() {
  'use strict';

  // ========================================
  // Toast 通知工具函数
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
  
  var elements = {
    // 面板
    sourcePanel: null,
    targetPanel: null,
    sourceCodeContent: null,
    targetCodeContent: null,
    sourceLineNumbers: null,
    targetLineNumbers: null,
    
    // 文件名显示
    sourceFileName: null,
    targetFileName: null,
    
    // 文件输入
    sourceFileInput: null,
    targetFileInput: null,
    
    // 按钮
    sourceUploadBtn: null,
    targetUploadBtn: null,
    compareBtn: null,
    clearLeftBtn: null,
    clearRightBtn: null,
    clearAllBtn: null,
    
    // 开关
    syncScrollToggle: null,
    
    // 统计
    statTotal: null,
    statAdded: null,
    statRemoved: null,
    statModified: null
  };

  // ========================================
  // 初始化
  // ========================================
  
  /**
   * 清除差异结果并恢复原始编辑状态
   * 当用户在显示差异的面板上再次输入时调用
   * @param {HTMLElement} panel - 面板元素
   * @param {string} side - 'source' 或 'target'
   */
  function clearDiffAndRestoreEdit(panel, side) {
    var codeContent = panel.querySelector('.code-content');
    var lineNumbers = panel.querySelector('.line-numbers');
    var stateKey = side === 'source' ? 'sourceContent' : 'targetContent';
    
    // 恢复原始内容
    codeContent.textContent = state[stateKey] || '';
    
    // 清除行号
    lineNumbers.innerHTML = '';
    
    // 清除差异摘要
    var summaryList = document.getElementById('diff-summary-list');
    if (summaryList) summaryList.innerHTML = '';
    document.getElementById('stat-total').textContent = '0';
    document.getElementById('stat-added').textContent = '0';
    document.getElementById('stat-removed').textContent = '0';
    document.getElementById('stat-modified').textContent = '0';
    
    // 清除差异结果状态
    state.diffResult = null;
  }

  /**
   * 初始化应用
   */
  function init() {
    // 缓存 DOM 元素
    cacheElements();
    
    // 绑定事件
    bindEvents();
    
    // 初始化同步滚动
    ScrollSync.init(elements.sourcePanel, elements.targetPanel);
    
    // 检测 jsdiff 是否加载成功
    checkJsDiffLoaded();
    
    console.log('FComp 初始化完成');
  }

  /**
   * 缓存 DOM 元素引用
   */
  function cacheElements() {
    elements.sourcePanel = document.getElementById('source-panel');
    elements.targetPanel = document.getElementById('target-panel');
    elements.sourceCodeContent = document.getElementById('source-code-content');
    elements.targetCodeContent = document.getElementById('target-code-content');
    elements.sourceLineNumbers = document.getElementById('source-line-numbers');
    elements.targetLineNumbers = document.getElementById('target-line-numbers');
    
    elements.sourceFileName = document.getElementById('source-file-name');
    elements.targetFileName = document.getElementById('target-file-name');
    
    elements.sourceFileInput = document.getElementById('source-file-input');
    elements.targetFileInput = document.getElementById('target-file-input');
    
    elements.sourceUploadBtn = document.getElementById('source-upload-btn');
    elements.targetUploadBtn = document.getElementById('target-upload-btn');
    elements.compareBtn = document.getElementById('compare-btn');
    elements.clearLeftBtn = document.getElementById('clear-left');
    elements.clearRightBtn = document.getElementById('clear-right');
    elements.clearAllBtn = document.getElementById('clear-all');
    
    elements.syncScrollToggle = document.getElementById('sync-scroll-toggle');
    
    elements.statTotal = document.getElementById('stat-total');
    elements.statAdded = document.getElementById('stat-added');
    elements.statRemoved = document.getElementById('stat-removed');
    elements.statModified = document.getElementById('stat-modified');
  }

  /**
   * 检查 jsdiff 是否加载成功
   */
  function checkJsDiffLoaded() {
    if (typeof Diff === 'undefined') {
      showToast('错误：jsdiff 库加载失败，请检查网络连接后刷新页面重试。', 'error');
      elements.compareBtn.disabled = true;
      return false;
    }
    return true;
  }

  // ========================================
  // 事件绑定
  // ========================================
  
  /**
   * 绑定所有事件
   */
  function bindEvents() {
    // 文件上传按钮
    elements.sourceUploadBtn.addEventListener('click', function() {
      elements.sourceFileInput.click();
    });
    
    elements.targetUploadBtn.addEventListener('click', function() {
      elements.targetFileInput.click();
    });
    
    // 文件选择
    elements.sourceFileInput.addEventListener('change', function(e) {
      handleFileSelect(e, 'source');
    });
    
    elements.targetFileInput.addEventListener('change', function(e) {
      handleFileSelect(e, 'target');
    });
    
    // 文本编辑区输入（支持粘贴）- 使用 textContent 保留空行
    elements.sourceCodeContent.addEventListener('input', function(e) {
      state.sourceContent = e.target.textContent;
    });
    
    // 检测用户输入时清除差异结果，恢复原始编辑状态
    elements.sourceCodeContent.addEventListener('input', function(e) {
      if (state.diffResult) {
        clearDiffAndRestoreEdit(elements.sourcePanel, 'source');
      }
      state.sourceContent = e.target.textContent;
    });
    
    elements.targetCodeContent.addEventListener('input', function(e) {
      if (state.diffResult) {
        clearDiffAndRestoreEdit(elements.targetPanel, 'target');
      }
      state.targetContent = e.target.textContent;
    });
    
    // 粘贴事件
    elements.sourceCodeContent.addEventListener('paste', handlePaste);
    elements.targetCodeContent.addEventListener('paste', handlePaste);
    
    // 开始比对按钮
    elements.compareBtn.addEventListener('click', handleCompare);
    
    // 清空按钮
    elements.clearLeftBtn.addEventListener('click', handleClearLeft);
    elements.clearRightBtn.addEventListener('click', handleClearRight);
    elements.clearAllBtn.addEventListener('click', handleClearAll);
    
    // 同步滚动开关
    elements.syncScrollToggle.addEventListener('change', function(e) {
      state.syncScrollEnabled = e.target.checked;
      ScrollSync.toggle(state.syncScrollEnabled);
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyDown);
  }

  // ========================================
  // 事件处理函数
  // ========================================
  
  /**
   * 处理文件选择
   * @param {Event} e - 事件对象
   * @param {string} panel - 面板类型 ('source' 或 'target')
   */
  async function handleFileSelect(e, panel) {
    var fileInput = e.target;
    var file = fileInput.files[0];
    
    if (!file) {
      return;
    }
    
    try {
      // 读取文件
      var result = await FileHandler.handleFile(file);
      
      // 更新状态
      if (panel === 'source') {
        state.sourceContent = result.content;
        state.sourceFileName = result.name;
        UIRenderer.setFileName(elements.sourcePanel, result.name);
      } else {
        state.targetContent = result.content;
        state.targetFileName = result.name;
        UIRenderer.setFileName(elements.targetPanel, result.name);
      }
      
      // 渲染内容
      var panelEl = panel === 'source' ? elements.sourcePanel : elements.targetPanel;
      UIRenderer.renderPlainText(panelEl, result.content);
      
      // 同步滚动位置
      ScrollSync.syncScroll();
      
    } catch (error) {
      showToast('文件读取失败：' + error.message, 'error');
    }
    
    // 清除文件输入，以便再次选择同一文件
    fileInput.value = '';
  }

  /**
   * 处理粘贴事件
   * @param {Event} e - 粘贴事件对象
     */
  function handlePaste(e) {
    // 延迟处理，确保粘贴完成
    setTimeout(function() {
      // 检测差异结果是否存在，存在则清除
      if (state.diffResult) {
        if (e.target === elements.sourceCodeContent) {
          clearDiffAndRestoreEdit(elements.sourcePanel, 'source');
        } else if (e.target === elements.targetCodeContent) {
          clearDiffAndRestoreEdit(elements.targetPanel, 'target');
        }
      }
      
      // 使用 textContent 保留原始格式，包括空行
      var sourceText = elements.sourceCodeContent.textContent;
      var targetText = elements.targetCodeContent.textContent;
      
      // 更新状态
      state.sourceContent = sourceText;
      state.targetContent = targetText;
      
      // 如果是粘贴到空面板，更新文件名显示
      if (e.target === elements.sourceCodeContent && !state.sourceFileName && sourceText) {
        elements.sourceFileName.innerHTML = '<span class="file-name-placeholder">粘贴内容</span>';
      }
      if (e.target === elements.targetCodeContent && !state.targetFileName && targetText) {
        elements.targetFileName.innerHTML = '<span class="file-name-placeholder">粘贴内容</span>';
      }
    }, 0);
  }

  /**
   * 获取面板内容的统一方法
   * 保留原始格式，包括空行
   */
  function getPanelContent(element) {
    return element.textContent || element.innerText || '';
  }

  /**
   * 处理比对
   */
  function handleCompare() {
    // 检查输入
    if (!state.sourceContent && !state.targetContent) {
      showToast('请至少在一个面板中输入或上传文件内容', 'warning');
      return;
    }
    
    if (!checkJsDiffLoaded()) {
      return;
    }
    
    // 显示加载状态
    state.isComparing = true;
    UIRenderer.setLoadingState(elements.compareBtn, true);
    
    // 使用 setTimeout 确保 UI 更新
    setTimeout(function() {
      try {
        // 执行比对
        var diffResult = DiffEngine.compare(state.sourceContent, state.targetContent);
        
        // 渲染结果
        UIRenderer.renderDiff(elements.sourcePanel, elements.targetPanel, diffResult);
        
        // 渲染对比结果摘要
        UIRenderer.renderDiffSummary(diffResult);
        
        // 保存结果到状态
        state.diffResult = diffResult;
        
        // 同步滚动位置
        ScrollSync.syncScroll();
        
      } catch (error) {
        showToast('比对失败：' + error.message, 'error');
        console.error(error);
      } finally {
        state.isComparing = false;
        UIRenderer.setLoadingState(elements.compareBtn, false);
      }
    }, 50);
  }

  /**
   * 清空左侧面板
   */
  function handleClearLeft() {
    if (state.sourceContent) {
      elements.sourceCodeContent.textContent = '';
      state.sourceContent = '';
      state.sourceFileName = '';
      elements.sourceFileName.innerHTML = '<span class="file-name-placeholder">未选择文件</span>';
      UIRenderer.clearPanel(elements.sourcePanel);
      showToast('左侧已清空', 'info');
    }
  }

  /**
   * 清空右侧面板
   */
  function handleClearRight() {
    if (state.targetContent) {
      elements.targetCodeContent.textContent = '';
      state.targetContent = '';
      state.targetFileName = '';
      elements.targetFileName.innerHTML = '<span class="file-name-placeholder">未选择文件</span>';
      UIRenderer.clearPanel(elements.targetPanel);
      showToast('右侧已清空', 'info');
    }
  }

  /**
   * 清空所有面板
   */
  function handleClearAll() {
    elements.sourceCodeContent.textContent = '';
    elements.targetCodeContent.textContent = '';
    state.sourceContent = '';
    state.targetContent = '';
    state.sourceFileName = '';
    state.targetFileName = '';
    state.diffResult = null;
    elements.sourceFileName.innerHTML = '<span class="file-name-placeholder">未选择文件</span>';
    elements.targetFileName.innerHTML = '<span class="file-name-placeholder">未选择文件</span>';
    UIRenderer.clearBothPanels(elements.sourcePanel, elements.targetPanel);
    // 清空对比结果摘要
    var summaryList = document.getElementById('diff-summary-list');
    if (summaryList) summaryList.innerHTML = '';
    document.getElementById('stat-total').textContent = '0';
    document.getElementById('stat-added').textContent = '0';
    document.getElementById('stat-removed').textContent = '0';
    document.getElementById('stat-modified').textContent = '0';
    showToast('已清空所有内容', 'info');
  }

  /**
   * 处理键盘快捷键
   * @param {Event} e - 键盘事件
   */
  function handleKeyDown(e) {
    // Ctrl+Enter 开始比对
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleCompare();
    }
  }

  // 初始化应用
  init();

})();

// 导出全局状态（用于调试）
// window.FCompState = state;