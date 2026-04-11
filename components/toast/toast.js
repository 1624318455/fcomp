/**
 * Toast 通知组件
 * 用法：showToast(message, type)
 *   - message: 提示内容（字符串）
 *   - type: 类型 - 'info' | 'success' | 'warning' | 'error'（默认 'info'）
 * 
 * 依赖：需要在 HTML 中添加 <div id="toast-container"></div>
 * 样式：引入 toast.css
 */
(function(global) {
  'use strict';

  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) {
      console.warn('Toast: #toast-container not found');
      return;
    }
    
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

  // 导出到全局
  global.showToast = showToast;

})(window);