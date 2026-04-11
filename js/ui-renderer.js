/**
 * FComp UI 渲染模块
 * 负责渲染差异行、统计信息、文件内容
 * 严格遵循架构方案设计规范
 */

const UIRenderer = (function() {
  'use strict';

  /**
   * 转义 HTML 特殊字符，防止 XSS
   * @param {string} str - 要转义的字符串
   * @returns {string} 转义后的字符串
   */
  function escapeHTML(str) {
    if (str === null || str === undefined) {
      return '';
    }
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 渲染文本内容到面板（无差异模式）
   * @param {HTMLElement} panel - 面板元素
   * @param {string} content - 文本内容
   */
  function renderPlainText(panel, content) {
    var lineNumbers = panel.querySelector('.line-numbers');
    var codeContent = panel.querySelector('.code-content');
    
    // 按行分割内容
    var lines = content.split('\n');
    
    // 生成行号和内容
    var lineNumberHTML = '';
    var contentHTML = '';
    
    lines.forEach(function(line, index) {
      var lineNum = index + 1;
      lineNumberHTML += '<span class="line-number">' + lineNum + '</span>';
      contentHTML += '<div class="diff-line diff-line-unchanged">';
      contentHTML += '<span class="line-content">' + escapeHTML(line) + '</span>';
      contentHTML += '</div>';
    });
    
    lineNumbers.innerHTML = lineNumberHTML;
    codeContent.innerHTML = contentHTML;
  }

  /**
   * 渲染差异结果到面板
   * @param {HTMLElement} sourcePanel - 源文件面板
   * @param {HTMLElement} targetPanel - 目标文件面板
   * @param {Object} diffResult - 差异结果对象
   */
  function renderDiff(sourcePanel, targetPanel, diffResult) {
    renderLines(sourcePanel, diffResult.source);
    renderLines(targetPanel, diffResult.target);
    updateStats(diffResult.stats);
  }

  /**
   * 渲染行到面板
   * @param {HTMLElement} panel - 面板元素
   * @param {Array} lines - 行数组
   */
  function renderLines(panel, lines) {
    var lineNumbers = panel.querySelector('.line-numbers');
    var codeContent = panel.querySelector('.code-content');
    
    // 使用 DocumentFragment 优化性能
    var lineNumberFragment = document.createDocumentFragment();
    var contentFragment = document.createDocumentFragment();
    
    lines.forEach(function(line, index) {
      var lineNum = index + 1;
      
      // 创建行号元素
      var lineNumSpan = document.createElement('span');
      lineNumSpan.className = 'line-number';
      lineNumSpan.textContent = lineNum;
      lineNumberFragment.appendChild(lineNumSpan);
      
      // 创建内容行元素
      var contentDiv = document.createElement('div');
      contentDiv.className = 'diff-line';
      
      // 根据类型添加样式类
      if (line.type === 'added') {
        contentDiv.classList.add('diff-line-added');
      } else if (line.type === 'removed') {
        contentDiv.classList.add('diff-line-removed');
      } else if (line.type === 'modified') {
        contentDiv.classList.add('diff-line-modified');
      } else if (line.type === 'empty') {
        // 空行不显示
        contentDiv.style.display = 'none';
      } else {
        contentDiv.classList.add('diff-line-unchanged');
      }
      
      // 创建内容 span
      var contentSpan = document.createElement('span');
      contentSpan.className = 'line-content';
      
      if (line.type === 'empty') {
        contentSpan.innerHTML = '&nbsp;';
      } else {
        contentSpan.textContent = line.content;
      }
      
      contentDiv.appendChild(contentSpan);
      contentFragment.appendChild(contentDiv);
    });
    
    lineNumbers.innerHTML = '';
    codeContent.innerHTML = '';
    
    lineNumbers.appendChild(lineNumberFragment);
    codeContent.appendChild(contentFragment);
  }

  /**
   * 更新统计信息栏
   * @param {Object} stats - 统计对象 {total, added, removed, modified}
   */
  function updateStats(stats) {
    var statTotal = document.getElementById('stat-total');
    var statAdded = document.getElementById('stat-added');
    var statRemoved = document.getElementById('stat-removed');
    var statModified = document.getElementById('stat-modified');
    
    if (statTotal) {
      statTotal.textContent = stats.total || 0;
    }
    if (statAdded) {
      statAdded.textContent = stats.added || 0;
    }
    if (statRemoved) {
      statRemoved.textContent = stats.removed || 0;
    }
    if (statModified) {
      statModified.textContent = stats.modified || 0;
    }
  }

  /**
   * 渲染对比结果摘要到可点击列表
   * @param {Object} diffResult - 差异结果对象
   */
  function renderDiffSummary(diffResult) {
    var summaryContainer = document.getElementById('diff-summary-list');
    if (!summaryContainer) return;
    
    summaryContainer.innerHTML = '';
    
    var stats = diffResult.stats || {};
    var sourceLines = diffResult.source || [];
    var targetLines = diffResult.target || [];
    
    // 收集所有差异项
    var diffItems = [];
    
    sourceLines.forEach(function(line, index) {
      if (line.type === 'removed' || line.type === 'modified') {
        diffItems.push({
          type: line.type,
          lineNum: index + 1,
          side: 'source',
          content: line.content
        });
      }
    });
    
    targetLines.forEach(function(line, index) {
      if (line.type === 'added' || line.type === 'modified') {
        diffItems.push({
          type: line.type,
          lineNum: index + 1,
          side: 'target',
          content: line.content
        });
      }
    });
    
    // 限制显示数量
    var maxItems = 20;
    var displayItems = diffItems.slice(0, maxItems);
    
    displayItems.forEach(function(item) {
      var itemEl = document.createElement('div');
      itemEl.className = 'diff-summary-item-clickable ' + item.type;
      itemEl.dataset.lineNum = item.lineNum;
      itemEl.dataset.side = item.side;
      
      var typeLabel = item.type === 'added' ? '新增' : (item.type === 'removed' ? '删除' : '修改');
      var contentPreview = item.content ? item.content.substring(0, 30) : '(空行)';
      if (item.content && item.content.length > 30) {
        contentPreview += '...';
      }
      
      itemEl.innerHTML = '<span class="stat-dot stat-dot-' + item.type + '"></span>' +
        '第' + item.lineNum + '行 (' + typeLabel + ')';
      
      itemEl.addEventListener('click', function() {
        scrollToLine(item.side, item.lineNum);
      });
      
      summaryContainer.appendChild(itemEl);
    });
    
    if (diffItems.length > maxItems) {
      var moreEl = document.createElement('div');
      moreEl.className = 'diff-summary-item-clickable';
      moreEl.style.backgroundColor = 'var(--color-gray-100)';
      moreEl.textContent = '还有 ' + (diffItems.length - maxItems) + ' 处...';
      summaryContainer.appendChild(moreEl);
    }
  }

  /**
   * 滚动到指定行
   * @param {string} side - 'source' 或 'target'
   * @param {number} lineNum - 行号
   */
  function scrollToLine(side, lineNum) {
    var containerId = side === 'source' ? 'source-code-content' : 'target-code-content';
    var container = document.getElementById(containerId);
    if (!container) return;
    
    var lines = container.querySelectorAll('.diff-line');
    if (lines[lineNum - 1]) {
      lines[lineNum - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 高亮一下
      lines[lineNum - 1].style.outline = '2px solid var(--color-primary)';
      setTimeout(function() {
        lines[lineNum - 1].style.outline = '';
      }, 2000);
    }
  }

  /**
   * 清除面板内容
   * @param {HTMLElement} panel - 面板元素
   */
  function clearPanel(panel) {
    var lineNumbers = panel.querySelector('.line-numbers');
    var codeContent = panel.querySelector('.code-content');
    
    if (lineNumbers) {
      lineNumbers.innerHTML = '';
    }
    if (codeContent) {
      codeContent.innerHTML = '';
    }
  }

  /**
   * 清除两个面板
   * @param {HTMLElement} sourcePanel - 源文件面板
   * @param {HTMLElement} targetPanel - 目标文件面板
   */
  function clearBothPanels(sourcePanel, targetPanel) {
    clearPanel(sourcePanel);
    clearPanel(targetPanel);
    updateStats({ total: 0, added: 0, removed: 0, modified: 0 });
  }

  /**
   * 设置文件名称显示
   * @param {HTMLElement} panel - 面板元素
   * @param {string} fileName - 文件名，如果为空则显示默认占位符
   */
  function setFileName(panel, fileName) {
    var fileNameElement = panel.querySelector('.file-name');
    
    if (fileNameElement) {
      if (fileName) {
        fileNameElement.textContent = fileName;
        fileNameElement.classList.remove('has-placeholder');
      } else {
        fileNameElement.innerHTML = '<span class="file-name-placeholder">未选择文件</span>';
        fileNameElement.classList.add('has-placeholder');
      }
    }
  }

  /**
   * 显示/隐藏加载状态
   * @param {HTMLElement} button - 按钮元素
   * @param {boolean} loading - 是否显示加载状态
   */
  function setLoadingState(button, loading) {
    if (loading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  /**
   * 显示确认对话框
   * @param {string} message - 确认消息
   * @returns {Promise<boolean>} 用户确认返回 true，否则返回 false
   */
  function showConfirm(message) {
    return new Promise(function(resolve) {
      resolve(window.confirm(message));
    });
  }

  // 公开的 API
  return {
    escapeHTML: escapeHTML,
    renderPlainText: renderPlainText,
    renderDiff: renderDiff,
    renderLines: renderLines,
    updateStats: updateStats,
    renderDiffSummary: renderDiffSummary,
    scrollToLine: scrollToLine,
    clearPanel: clearPanel,
    clearBothPanels: clearBothPanels,
    setFileName: setFileName,
    setLoadingState: setLoadingState,
    showConfirm: showConfirm
  };
})();

// 导出模块（支持 ES6 模块和 CommonJS）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIRenderer;
}