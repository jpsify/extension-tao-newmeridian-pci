define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = view;

  function view() {
    /** @type {HTMLElement} */
    var _wrapper = MathJax.HTML.Element('div', {
      className: 'mje-wrapper'
    });
    /** @type {HTMLElement} */


    var container = MathJax.HTML.Element('div', {
      className: 'mje-container'
    });
    /** @type {HTMLElement} */

    var input = MathJax.HTML.Element('input', {
      className: 'mje-input'
    });
    /** @type {Object} MathJax's Jax element. */

    var jax = null;
    /** @type {Boolean} Focus state of the controller. */

    var focused = false;
    /** @type {Boolean} Hover state of the controller. */

    var hover = false;
    /** @type {Object} Event handlers of the controller. */

    var events = {
      click: null,
      input: null,
      code: null
    };
    /**
     * Update the user interface.
     * @return {Void}
     */

    var update = function update() {
      if (focused) {
        container.classList.add('focused');
      } else {
        container.classList.remove('focused');
      }
    };
    /**
     * Handle outside UI bounds clicks.
     * @return {Void}
     */


    var handleOutsideClick = function handleOutsideClick(e) {
      if (!hover) {
        focused = false;
        input.blur();
        return update();
      }
    };
    /**
     * Handle inside UI bounds clicks.
     * @param {MouseEvent} e 
     * @return {Void}
     */


    var handleInsideClick = function handleInsideClick(e) {
      focused = true;
      events.click(e.clientX, e.clientY + window.pageYOffset, e.target);
      input.focus({
        preventScroll: true
      });
      update();
    };
    /**
     * Handle UI mouseenter event.
     * @return {Void}
     */


    var handleMouseEnter = function handleMouseEnter() {
      hover = true;
    };
    /**
     * Handle UI mouseleave event.
     * @return {Void}
     */


    var handleMouseLeave = function handleMouseLeave() {
      hover = false;
    };
    /**
     * Handle input blur event.
     * @return {Void}
     */


    var handleBlur = function handleBlur() {
      if (!hover) {
        focused = false;
        return update();
      }

      input.focus({
        preventScroll: true
      });
      return update();
    };
    /**
     * Handle input event.
     * @return {Void}
     */


    var handleInput = function handleInput(e) {
      e.preventDefault();
      if (e.ctrlKey || e.altKey) {
        events.command(e.charCode, e.ctrlKey, e.altKey);
      } else {
        events.input(String.fromCharCode(e.which));
      }
    };
    /**
     * Handle input keydown event.
     * @param {KeyboardEvent} e
     * @return {Void}
     */


    var handleKeydown = function handleKeydown(e) {
      events.code(e.keyCode);
    };

    _wrapper.appendChild(container);

    _wrapper.appendChild(input); //document.addEventListener('click', handleOutsideClick);


    _wrapper.addEventListener('click', handleInsideClick);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    input.addEventListener('blur', handleBlur);
    input.addEventListener('keypress', handleInput);
    input.addEventListener('keydown', handleKeydown);
    return {
      events: events,

      /**
       * Get the main wrapper.
       * @return {HTMLElement}
       */
      wrapper: function wrapper() {
        return _wrapper;
      },

      /**
       * Set display mathematics.
       * @param {HTMLElement} val 
       */
      value: function value(val) {
        return new Promise(function (resolve) {
          if (jax) {
            return jax.Text(val, resolve);
          }

          container.innerHTML = val;

          var render = function render() {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, container, function () {
              jax = MathJax.Hub.getAllJax(input)[0];
              resolve();
            }]);
          };

          if (MathJax.isReady) {
            render();
          } else {
            // When MathJax first load all its contents, even when it
            // triggers the "End" event, it may be still rendering
            // the webfont and markup, so the `recalculate` function
            // may get wrong size and position values. We add an one
            // second delay to ensure it will be ready so far.
            // (still not the perfect solution)
            MathJax.Hub.Register.StartupHook('End', function () {
              setTimeout(render, 1000);
            });
          }
        });
      },
      removeClass: function removeClass(className) {
        var elements = _wrapper.getElementsByClassName(className);

        while (elements.length > 0) {
          elements[0].classList.remove(className);
        }
      },

      /**
       * Draw cursor.
       * @param {Object} data 
       */
      draw: function draw(data) {
        if (!data) {
          return;
        }

        this.removeClass('editor-cursor');
        this.removeClass('end-of-line');

        if ((data.source.getAttribute('linebreak') === 'newline' || data.source.tagName.toLowerCase() === 'math') 
           && data.previous && data.previous.tagName.toLowerCase() !== 'mrow' && data.previous.getAttribute('selectable') !== 'false') {
          $(_wrapper).find('#' + data.previous.id).addClass('editor-cursor end-of-line');
        } else {
          data.element.classList.add('editor-cursor');
        }

        var editor = container.parentElement.parentElement;
        editor.scrollLeft = data.element.offsetLeft + data.element.offsetWidth;
        var elementRect = data.element.getBoundingClientRect();
        input.style.left = "".concat(elementRect.x, "px");
        input.style.top = "".concat(elementRect.y, "px");
      },
      focus: function focus() {
        focused = true;
        input.focus({
          preventScroll: true
        });
        update();
      }
    };
  }
});