/**
 * FComp 文件处理模块
 * 负责文件上传、读取和编码检测
 * 严格遵循架构方案设计规范
 */

const FileHandler = (function() {
  'use strict';

  // 文件大小限制：10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  /**
   * 读取文件为文本
   * @param {File} file - HTML File 对象
   * @returns {Promise<string>} 文件文本内容
   */
  async function readAsText(file) {
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();
      
      reader.onload = function(event) {
        resolve(event.target.result);
      };
      
      reader.onerror = function() {
        reject(new Error('文件读取失败，请检查文件是否损坏'));
      };
      
      // 尝试使用 UTF-8 编码读取
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * 验证文件大小
   * @param {File} file - 要验证的文件对象
   * @returns {boolean} 是否通过验证
   * @throws {Error} 文件超过限制时抛出错误
   */
  function validateSize(file) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('文件超过 ' + (MAX_FILE_SIZE / 1024 / 1024) + 'MB 限制');
    }
    return true;
  }

  /**
   * 验证文件类型
   * @param {File} file - 要验证的文件对象
   * @returns {boolean} 是否为支持的类型
   */
  function validateType(file) {
    // 支持的文件扩展名
    var supportedExtensions = [
      '.txt', '.js', '.jsx', '.ts', '.tsx', 
      '.json', '.html', '.htm', '.css', 
      '.scss', '.sass', '.less', '.md', 
      '.markdown', '.xml', '.yaml', '.yml', 
      '.sql', '.sh', '.bash', '.log', 
      '.conf', '.ini', '.properties'
    ];
    
    var fileName = file.name.toLowerCase();
    var extension = fileName.substring(fileName.lastIndexOf('.'));
    
    // 检查扩展名
    if (supportedExtensions.indexOf(extension) !== -1) {
      return true;
    }
    
    // 检查没有扩展名的文件（视为文本文件）
    if (extension === fileName) {
      return true;
    }
    
    return false;
  }

  /**
   * 获取文件名（不含路径）
   * @param {File} file - 文件对象
   * @returns {string} 文件名
   */
  function getFileName(file) {
    // 处理不同浏览器的文件路径
    var name = file.name;
    // 移除路径（如果有）
    if (name.indexOf('\\') !== -1) {
      name = name.substring(name.lastIndexOf('\\') + 1);
    }
    if (name.indexOf('/') !== -1) {
      name = name.substring(name.lastIndexOf('/') + 1);
    }
    return name;
  }

  /**
   * 处理文件选择
   * @param {File} file - 用户选择的文件
   * @returns {Promise<Object>} 包含文件名和内容的对象
   */
  async function handleFile(file) {
    // 验证文件大小
    validateSize(file);
    
    // 读取文件内容
    var content = await readAsText(file);
    
    return {
      name: getFileName(file),
      content: content,
      size: file.size
    };
  }

  // 公开的 API
  return {
    readAsText: readAsText,
    validateSize: validateSize,
    validateType: validateType,
    getFileName: getFileName,
    handleFile: handleFile,
    MAX_FILE_SIZE: MAX_FILE_SIZE
  };
})();

// 导出模块（支持 ES6 模块和 CommonJS）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileHandler;
}