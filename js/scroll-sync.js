/**
 * FComp 同步滚动模块
 * 负责实现左右面板双向滚动同步
 */

var ScrollSync = (function() {
  'use strict';

  var enabled = true;
  var isScrolling = false;

  var sourceContent = null;
  var targetContent = null;

  var sourceScrollHandler = null;
  var targetScrollHandler = null;

  function init(sourcePanelEl, targetPanelEl) {
    // .file-preview 是滚动容器（内含 .editor-container 有 overflow: auto）
    sourceContent = sourcePanelEl.querySelector('.file-preview');
    targetContent = targetPanelEl.querySelector('.file-preview');

    if (!sourceContent || !targetContent) return;

    // 移除旧监听
    if (sourceScrollHandler) {
      sourceContent.removeEventListener('scroll', sourceScrollHandler);
    }
    if (targetScrollHandler) {
      targetContent.removeEventListener('scroll', targetScrollHandler);
    }

    sourceScrollHandler = function() {
      onScroll(sourceContent, targetContent);
    };

    targetScrollHandler = function() {
      onScroll(targetContent, sourceContent);
    };

    sourceContent.addEventListener('scroll', sourceScrollHandler);
    targetContent.addEventListener('scroll', targetScrollHandler);
  }

  function onScroll(source, target) {
    if (!enabled || isScrolling) return;

    isScrolling = true;

    var scrollTop = source.scrollTop;
    var scrollHeight = source.scrollHeight - source.clientHeight;

    if (scrollHeight <= 0) {
      target.scrollTop = 0;
      requestAnimationFrame(function() {
        isScrolling = false;
      });
      return;
    }

    var ratio = scrollTop / scrollHeight;
    var targetScrollTop = ratio * (target.scrollHeight - target.clientHeight);

    target.scrollTop = targetScrollTop;

    requestAnimationFrame(function() {
      isScrolling = false;
    });
  }

  function toggle(newEnabled) {
    enabled = newEnabled;
  }

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

  return {
    init: init,
    toggle: toggle,
    destroy: destroy
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollSync;
}
