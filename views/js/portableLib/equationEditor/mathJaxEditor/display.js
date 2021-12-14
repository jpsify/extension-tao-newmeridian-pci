define(["exports", "nmcPci/portableLib/equationEditor/mathJaxEditor/each", "nmcPci/portableLib/equationEditor/mathJaxEditor/id", "nmcPci/portableLib/equationEditor/mathJaxEditor/lower", "nmcPci/portableLib/equationEditor/mathJaxEditor/newline"], function (_exports, _each, _id, _lower, _newline) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = display;
  var skip = ['mo', 'mi', 'mn', 'mspace', 'mfrac'];
  /**
   * Get the editor value as a HTML string.
   * @param {HTMLElement} math 
   * @return {String}
   */

  function display(math) {
    (0, _each.default)(math, function (source) {
      if (!source.id) {
        source.id = (0, _id.default)();
      }

      if (source.editable) {
        source.setAttribute('editable', 'true');
      }
    });
    var displayed = math.cloneNode(true);

    var mspace = function mspace() {
      var el = MathJax.HTML.Element('mspace');
      el.setAttribute('width', 'thinmathspace');
      return el;
    };

    var mnewline = function mnewline() {
      return MathJax.HTML.Element('mo', {
        className: 'mje-newline'
      }, ['⏎']);
    };

    var mplaceholder = function mplaceholder(tag) {
      return MathJax.HTML.Element('mi', {
        className: 'mje-placeholder ' + tag + '-placeholder'
      }, ["\u2B1A"]);
    };

    (0, _each.default)(displayed, function (source) {
      var tag = (0, _lower.default)(source.tagName);

      switch (tag) {
        case 'mspace':
          if (!source.id) {
            break;
          }

          if (!(0, _newline.default)(source)) {
            break;
          }

          var next = source.nextElementSibling || displayed.lastElementChild;
          var prev = displayed.firstChild;
          var addNewlinePlaceholder = next === source;

          if (next && (0, _lower.default)(next.tagName) === 'mspace') {
            if ((0, _newline.default)(next)) {
              addNewlinePlaceholder = true;
            }
          }

          if (addNewlinePlaceholder) {
            source.parentNode.insertBefore(mnewline(), source.nextSibling);
          }

          if (prev === source) {
            source.parentNode.insertBefore(mnewline(), source);
          }

          break;

        case 'mrow':
        case 'math':
          if (!source.children.length) {
            source.appendChild(mplaceholder(tag));
            break;
          }

          if (tag !== 'math') {//source.appendChild(mspace());
            //source.insertBefore(mspace(), source.firstChild);
          }

          break;

        default:
          if (skip.indexOf(tag) === -1) {//source.parentNode.insertBefore(mspace(), source.nextSibling);
          }

      }
    });
    return displayed.outerHTML;
  }
});