define(["exports", "nmcPci/portableLib/equationEditor/mathJaxEditor/lower"], function (_exports, _lower) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = del;
  /**
   * Perform a delete relative to current cursor position.
   * @param {HTMLElement} value 
   * @param {HTMLElement} current
   * @param {HTMLElement} initial
   * @return {HTMLElement} New cursor position.
   */

  function del(value, current, initial, readonly) {
    var parent = current.parentNode;

    if (readonly && (current.hasAttribute('editable') || initial && initial.hasAttribute('editable'))) {
      return initial || current;
    }

    if (current.parentNode && current.parentNode.tagName.toLowerCase() === 'mroot' && current.tagName.toLowerCase() == 'mrow') {
      if (!current.children.length) {
        return initial || current;
      }

      current = current.children[current.children.length - 1];
    }

    if (current.className === 'ee-gap') {
      return initial || current;
    }

    switch ((0, _lower.default)(current.tagName)) {
      /*      case 'mrow':
              if (current.children.length) {
                return del(value, parent, current);
              }
              break;*/
      case 'math':
        if (current.children.length) {
          parent = current;
          current = current.children[current.children.length - 1];
        } else {
          return current;
        }

    }

    var to = current.nextElementSibling || parent;
    parent.removeChild(current);
    return to;
  }
});