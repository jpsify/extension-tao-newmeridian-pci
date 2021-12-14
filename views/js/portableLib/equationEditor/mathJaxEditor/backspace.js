define(["exports", "nmcPci/portableLib/equationEditor/mathJaxEditor/del", "nmcPci/portableLib/equationEditor/mathJaxEditor/lower"], function (_exports, _del, _lower) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = backspace;
  /**
   * Perform a backspace deletion relative to current cursor position.
   * @param {HTMLElement} value 
   * @param {HTMLElement} current 
   * @return {HTMLElement} New cursor position.
   */

  function backspace(value, current, readonly) {
    var parent = current.parentNode;
    var previous = current.previousElementSibling;
    var tag = (0, _lower.default)(current.tagName);

    switch (tag) {
      case 'mrow':
      case 'math':
        if (current.lastElementChild) {
          return (0, _del.default)(value, current.lastElementChild, current);
        }

        if (tag === 'math') {
          return current;
        }

        return (0, _del.default)(value, parent, current, readonly);
    }

    if (!previous && (0, _lower.default)(parent.tagName) === 'math') {
      return current;
    }

    return (0, _del.default)(value, previous || parent, current);
  }
});