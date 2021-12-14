define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = each;
  /**
   * Walk through each element within a math element.
   * @param {HTMLElement} source 
   * @param {Function} handler 
   */

  function each(source, handler) {
    var walk = function walk(el) {
      var isContainer = el.tagName.toLowerCase() === 'mrow' || el.tagName.toLowerCase() === 'math';

      if (!isContainer) {
        handler(el);
      }

      if (el.children) {
        var child = el.firstElementChild;

        while (child) {
          walk(child);
          child = child.nextElementSibling;
        }
      }

      if (isContainer) {
        handler(el);
      }
    };

    walk(source);
  }
});