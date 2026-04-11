/**
 * FComp 同步滚动模块
 * 负责实现左右面板双向滚动同步
 * 严格遵循架构方案设计规范
 */

const ScrollSync = (function() {
  'use strict';

  // 状态变量
  var enabled = true;
  var isScrolling = false;
  
  // 面板引用
  var sourcePanel = null;
  var targetPanel = null;
  
  // 代码内容区域引用
  var sourceContent = null;
  var targetContent = null;
  
  // 滚动回调函数（用于解绑）
  var sourceScrollHandler = null;
  var targetScrollHandler = null;

  /**
   * 初始化同步滚动
   * @param {HTMLElement} sourcePanelEl - 源文件面板元素
   * @param {HTMLElement} targetPanelEl - 目标文件面板元素
   */
  function init(sourcePanelEl, targetPanelEl) {
    sourcePanel = sourcePanelEl;
    targetPanel = targetPanelEl;
    
    sourceContent = sourcePanelEl.querySelector('.code-content');
    targetContent = targetPanelEl.querySelector('.code-content');
    
    // 如果已存在，先移除旧的事件监听
    if (sourceScrollHandler) {
      sourceContent.removeEventListener('scroll', sourceScrollHandler);
    }
    if (targetScrollHandler) {
      targetContent.removeEventListener('scroll', targetScrollHandler);
    }
    
    // 创建滚动处理函数
    sourceScrollHandler = function() {
      onScroll(sourceContent, targetContent);
    };
    
    targetScrollHandler = function() {
      onScroll(targetContent, sourceContent);
    };
    
    // 添加事件监听
    sourceContent.addEventListener('scroll', sourceScrollHandler);
    targetContent.addEventListener('scroll', targetScrollHandler);
  }

  /**
   * 滚动事件处理函数
   * @param {HTMLElement} source - 源滚动元素
   * @param {HTMLElement} target - 目标滚动元素
   */
  function onScroll(source, target) {
    // 如果同步未启用或正在滚动中，直接返回
    if (!enabled || isScrolling) {
      return;
    }
    
    // 防止递归调用
    isScrolling = true;
    
    // 计算滚动比例
    var scrollTop = source.scrollTop;
    var scrollHeight = source.scrollHeight - source.clientHeight;
    
    // 处理边界情况
    if (scrollHeight <= 0) {
      target.scrollTop = 0;
      requestAnimationFrame(function() {
        isScrolling = false;
      });
      return;
    }
    
    // 计算目标滚动位置
    var ratio = scrollTop / scrollHeight;
    var targetScrollTop = ratio * (target.scrollHeight - target.clientHeight);
    
    // 应用滚动位置
    target.scrollTop = targetScrollTop;
    
    // 使用 requestAnimationFrame 延迟重置标志
    requestAnimationFrame(function() {
      isScrolling = false;
    });
  }

  /**
   * 启用同步滚动
   */
  function enable() {
    enabled = true;
  }

  /**
   * 禁用同步滚动
   */
  function disable() {
    enabled = false;
  }

  /**
   * 切换同步滚动状态
   * @param {boolean} newEnabled - 新的启用状态
   */
  function toggle(newEnabled) {
    enabled = newEnabled;
  }

  /**
   * 获取当前启用状态
   * @returns {boolean} 当前是否启用同步滚动
   */
  function isEnabled() {
    return enabled;
  }

  /**
   * 移除事件监听（清理函数）
   */
  function destroy() {
    if (sourceContent && sourceScrollHandler) {
      sourceContent.removeEventListener('scroll', sourceScrollHandler);
    }
    if (targetContent && targetScrollHandler) {
      targetContent.removeEventListener('scroll', targetScrollHandler);
    }
    
    sourceScrollHandler = null;
    targetScrollHandler = null;
    sourceContent = null;
    targetContent = null;
  }

  /**
   * 手动同步滚动位置（当内容变化后调用）
   */
  function syncScroll() {
    if (!enabled || !sourceContent || !targetContent) {
      return;
    }
    
    // 将源面板滚动到顶部
    sourceContent.scrollTop = 0;
    targetContent.scrollTop = 0;
  }

  // 公开的 API
  return {
    init: init,
    enable: enable,
    disable: disable,
    toggle: toggle,
    isEnabled: isEnabled,
    destroy: destroy,
    syncScroll: syncScroll
  };
})();

// 导出模块（支持 ES6 模块和 CommonJS）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollSync;
}