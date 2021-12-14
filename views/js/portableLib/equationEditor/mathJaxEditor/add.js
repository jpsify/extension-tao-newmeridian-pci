define(["exports", "nmcPci/portableLib/equationEditor/mathJaxEditor/lower"], function (_exports, _lower) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = add;

  /**
   * Add an element next to the current cursor positon.
   * @param {HTMLElement} what 
   * @param {HTMLElement} source 
   * @return {Boolean}
   */
  function add(what, source) {
    switch ((0, _lower.default)(source.tagName)) {
      case 'mrow':
      case 'math':
        if (!source.children.length) {
          source.appendChild(what);
          return true;
        }

        source.insertBefore(what, source.lastElementChild.nextSibling);
        return true;

      default:
        source.parentNode.insertBefore(what, source);
        return true;
    }
  }
});