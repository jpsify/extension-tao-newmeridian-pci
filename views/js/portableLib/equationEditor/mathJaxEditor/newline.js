define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = isNewline;

  function isNewline(el) {
    return el.getAttribute('linebreak') === 'newline';
  }
});