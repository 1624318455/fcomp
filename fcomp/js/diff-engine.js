/**
 * FComp 差异比对引擎模块
 * 负责执行文本差异分析，生成差异数据
 * 严格遵循架构方案设计规范
 */

const DiffEngine = (function() {
  'use strict';

  /**
   * 执行行级差异比对
   * @param {string} source - 原始文本
   * @param {string} target - 比较文本
   * @returns {Object} 差异结果对象
   */
  function compare(source, target) {
    // 使用 jsdiff 库的 diffLines 方法
    var linesDiff = Diff.diffLines(source, target);
    
    return normalizeDiffResult(linesDiff);
  }

  /**
   * 执行词级差异比对
   * @param {string} source - 原始文本
   * @param {string} target - 比较文本
   * @returns {Array} 词级差异数组
   */
  function compareWords(source, target) {
    return Diff.diffWords(source, target);
  }

  /**
   * 规范化差异结果
   * 将 jsdiff 的结果转换为便于渲染的格式
   * @param {Array} diffResult - jsdiff 返回的结果数组
   * @returns {Object} 规范化后的差异结果
   */
  function normalizeDiffResult(diffResult) {
    var sourceLines = [];
    var targetLines = [];
    var addedCount = 0;
    var removedCount = 0;
    var modifiedCount = 0;
    
    // 用于跟踪已配对的行（用于检测修改）
    var sourceLineMap = [];
    var targetLineMap = [];
    var lineIndex = 0;
    
    // 第一遍：收集所有行并建立索引
    diffResult.forEach(function(part) {
      // 按行分割内容
      var partLines = part.value.split('\n');
      
      // 处理每一行
      partLines.forEach(function(line, lineIdx) {
        // 跳过最后一个空元素（如果以换行符结尾）
        if (lineIdx === partLines.length - 1 && part.value.slice(-1) === '\n') {
          return;
        }
        
        if (part.added) {
          // 新增行
          targetLines.push({
            content: line,
            type: 'added',
            lineNum: targetLines.length + 1
          });
          sourceLines.push({
            content: '',
            type: 'empty',
            lineNum: sourceLines.length + 1
          });
          addedCount++;
        } else if (part.removed) {
          // 删除行
          sourceLines.push({
            content: line,
            type: 'removed',
            lineNum: sourceLines.length + 1
          });
          targetLines.push({
            content: '',
            type: 'empty',
            lineNum: targetLines.length + 1
          });
          removedCount++;
        } else {
          // 相同行
          sourceLines.push({
            content: line,
            type: 'unchanged',
            lineNum: sourceLines.length + 1
          });
          targetLines.push({
            content: line,
            type: 'unchanged',
            lineNum: targetLines.length + 1
          });
        }
      });
    });
    
    // 第二遍：检测修改行（如果一行在两边都存在但内容不同）
    // 通过比较相邻的删除和新增来识别修改
    detectModifiedLines(sourceLines, targetLines);
    
    // 重新统计
    addedCount = 0;
    removedCount = 0;
    modifiedCount = 0;
    
    sourceLines.forEach(function(line) {
      if (line.type === 'added') addedCount++;
      else if (line.type === 'removed') removedCount++;
      else if (line.type === 'modified') modifiedCount++;
    });
    
    targetLines.forEach(function(line) {
      if (line.type === 'added') addedCount++;
      else if (line.type === 'removed') removedCount++;
      else if (line.type === 'modified') modifiedCount++;
    });
    
    // 计算总差异数
    var totalDiff = addedCount + removedCount + modifiedCount;
    
    return {
      source: sourceLines,
      target: targetLines,
      stats: {
        total: totalDiff,
        added: addedCount,
        removed: removedCount,
        modified: modifiedCount
      }
    };
  }

  /**
   * 检测修改行
   * 识别相邻的删除和新增对，它们可能是修改
   * @param {Array} sourceLines - 源文件行数组
   * @param {Array} targetLines - 目标文件行数组
   */
  function detectModifiedLines(sourceLines, targetLines) {
    var i;
    var j;
    var maxCheck = 3; // 最多检查相邻3行
    
    // 检查源文件中的删除行是否能与目标文件中的新增行配对
    for (i = 0; i < sourceLines.length; i++) {
      if (sourceLines[i].type === 'removed') {
        // 在目标文件中查找相近位置的新增行
        for (j = Math.max(0, i - maxCheck); j < Math.min(targetLines.length, i + maxCheck); j++) {
          if (targetLines[j].type === 'added') {
            // 检查内容是否相似（可能是修改）
            if (areSimilar(sourceLines[i].content, targetLines[j].content)) {
              // 标记为修改
              sourceLines[i].type = 'modified';
              targetLines[j].type = 'modified';
              break;
            }
          }
        }
      }
    }
  }

  /**
   * 检查两行内容是否相似（可能是修改而非完全替换）
   * @param {string} line1 - 第一行内容
   * @param {string} line2 - 第二行内容
   * @returns {boolean} 是否相似
   */
  function areSimilar(line1, line2) {
    // 空行与空行视为相同
    if (!line1 && !line2) return true;
    
    // 只有一个为空，则不相似
    if (!line1 || !line2) return false;
    
    // 长度差异太大视为不相似
    var len1 = line1.length;
    var len2 = line2.length;
    var maxLen = Math.max(len1, len2);
    var minLen = Math.min(len1, len2);
    
    if (maxLen === 0) return true;
    if (minLen / maxLen < 0.3) return false; // 长度差异超过70%
    
    // 使用词级 diff 估算相似度
    var wordsDiff = Diff.diffWords(line1, line2);
    var changes = 0;
    
    wordsDiff.forEach(function(part) {
      if (part.added || part.removed) {
        changes++;
      }
    });
    
    // 如果变化词数不超过总词数的50%，认为是相似的
    var totalWords = wordsDiff.filter(function(p) { return p.value.trim(); }).length;
    
    if (totalWords === 0) return len1 === len2;
    
    return changes / totalWords <= 0.5;
  }

  // 公开的 API
  return {
    compare: compare,
    compareWords: compareWords,
    normalizeDiffResult: normalizeDiffResult
  };
})();

// 导出模块（支持 ES6 模块和 CommonJS）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiffEngine;
}