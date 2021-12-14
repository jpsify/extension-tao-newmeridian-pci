define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = id;
  var counter = 0;

  function id() {
    return "mje-node".concat(counter++);
  }
});