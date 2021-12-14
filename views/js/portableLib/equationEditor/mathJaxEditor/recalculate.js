define(["exports", "nmcPci/portableLib/equationEditor/mathJaxEditor/each", "nmcPci/portableLib/equationEditor/mathJaxEditor/id", "nmcPci/portableLib/equationEditor/mathJaxEditor/newline"], function (_exports, _each, _id, _newline) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = recalculate;
  /**
   * Get the viewport coordinates of draw mathematics by MathJax.
   * This will then be used to draw the cursor.
   * @param {HTMLElement} math 
   * @todo HIGHLY REFACTOR THIS CODE!!!
   */

  function recalculate(math) {
    var cache = {};
    /** @type {Array} */

    var path = [];
    /** @type {HTMLElement} */

    var previous = null;
    /** @type {Object} */

    var prevData = null;
    /** @type {Object} */

    var lastParentRect;
    /** @type {Object} */

    var lastLineRect;

    var bounding = function bounding(element, id) {
      if (!element) {
        return;
      }

      if (!cache.hasOwnProperty(id)) {
        var _bounding = element.getBoundingClientRect();

        _bounding.x = _bounding.left;
        _bounding.y = _bounding.top;
        _bounding.y += window.pageYOffset;
        cache[id] = _bounding;
      }

      return cache[id];
    };

    var firstBlockBounding = function firstBlockBounding() {
      var bounding = document.getElementById(math.id).querySelector('.mjx-block').getBoundingClientRect();
      bounding.x = bounding.left; // edge

      bounding.y = bounding.top; // edge

      return bounding;
    };

    var findBlock = function findBlock(element) {
      var el = element.parentNode;

      while (el) {
        if (el.className == 'mjx-math') {
          return false;
        }

        if (el.className == 'mjx-box') {
          // assign an id for caching.
          el.setAttribute('id', (0, _id.default)());
          return el;
        }

        el = el.parentNode;
      } // this really should not be called...
      //console.warning('mathJaxEditor: could not found a block for this line');


      return false;
    };

    (0, _each.default)(math, function (source) {
      var element = document.getElementById(source.id);

      if (!element) {
        return;
      }

      var has = source.children.length;
      var last = element.lastElementChild;
      var parent = source.parentNode;
      var tag = source.tagName.toLowerCase();
      var rect = bounding(element, source.id);
      var parentElement;
      var parentRect;
      var parentId;
      var flag;
      var data = {
        y: rect.top,
        height: rect.height,
        source: source,
        previous: previous,
        element: element
      };

      if (parent && tag !== 'mrow') {
        flag = false;
        parentId = parent.id;

        if (parent === math) {
          flag = true;
          parentElement = findBlock(element);
        }

        if (parentElement) {
          parentId = parentElement.id;
        } else {
          parentElement = document.getElementById(parent.id);
        }

        parentRect = bounding(parentElement, parentId);
        data.y = parentRect.top;
        data.height = parentElement.clientHeight;

        if (flag) {
          if (!lastLineRect) {
            lastLineRect = parentRect;
          }

          if (lastParentRect && parentRect !== lastParentRect) {
            lastLineRect = lastParentRect;
          }

          lastParentRect = parentRect;
        }
      }

      if (prevData) {
        prevData.next = source;
      }

      switch (tag.toLowerCase()) {
        case 'mspace':
          if (!(0, _newline.default)(source)) {
            break;
          }

          var sibling = source.previousElementSibling;
          var prevline = sibling && (0, _newline.default)(sibling);
          var first = math.firstElementChild === source;
          var other = first ? firstBlockBounding() : lastLineRect;
          data.x = other.x + (first ? 0 : prevline ? 0 : other.width);
          data.y = other.y;
          data.height = other.height;
          break;

        case 'math':
          var lastChild = source.lastElementChild;
          var dont = lastChild && (0, _newline.default)(lastChild);

          if (lastParentRect) {
            data.x = lastParentRect.x + (dont ? 0 : lastParentRect.width);
            data.y = lastParentRect.y;
            data.height = lastParentRect.height;
          } else {
            data.x = (has ? rect.width : 0) + rect.left;
          }

          break;

        case 'mrow':
          data.x = (has ? rect.width - last.clientWidth : 0) + rect.left;
          break;

        default:
          data.x = rect.left;
          break;
      }

      path.push(data);
      previous = source;
      prevData = data;
    });
    return path;
  }
});