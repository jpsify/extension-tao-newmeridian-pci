define(["exports",
    "taoQtiItem/portableLib/jquery_2_1_1",
    "nmcPci/portableLib/equationEditor/mathJaxEditor/add",
    "nmcPci/portableLib/equationEditor/mathJaxEditor/backspace",
    "nmcPci/portableLib/equationEditor/mathJaxEditor/del",
    "nmcPci/portableLib/equationEditor/mathJaxEditor/display",
    "nmcPci/portableLib/equationEditor/mathJaxEditor/each",
    "nmcPci/portableLib/equationEditor/mathJaxEditor/operators",
    "nmcPci/portableLib/equationEditor/mathJaxEditor/recalculate",
    "nmcPci/portableLib/equationEditor/mathJaxEditor/view"],
    function (_exports, $, _add, _backspace, _del, _display, _each, _operators, _recalculate, _view) {
        "use strict";

        Object.defineProperty(_exports, "__esModule", {
            value: true
        });
        _exports.default = mathJaxEditor;
        /**
         * Create a mathJaxEditor instance.
         * @param {HTMLElement|String} target HTML Element or string selector
         */

        function mathJaxEditor(target) {
            if (!MathJax) {
                throw new Error('mathJaxEditor: MathJax not found. Ensure that MathJax is loaded before calling mathJaxEditor.');
            }
            /** @type {String} Version of the library. */

            var version = '1.0.2';
            /** @type {Object} Public API of the library. */

            var api = {};
            /** @type {HTMLElement} Value of this instance. */

            var math = MathJax.HTML.Element('math');
            /** Create the user interface of this instance. */

            var ui = (0, _view.default)();
            /** @type {HTMLElement} Current editor cursor element. */

            var current = math;
            /** @type {Object} Current editor cursor data. */

            var pos = null;
            /** @type {Array} Path of editor cursor data. */

            var path = null;
            /** @type {Boolean} */

            var readonly = false;
            /** @type {Array} Tags allowed to be inserted. */

            var allowedTags = [];
            /** @type {Boolean} Allow newline insertion. */

            var allowNewline = false;
            var allowText = true;
            var hasChanged = false;
            var historyPointer = 0;
            var history = [];

            /**
             * Draw the cursor in the viewport.
             * @return {Void}
             */

            var draw = function draw() {
                pos = path.find(function (predicate) {
                    return predicate.source === current;
                });
                ui.draw(pos);
            };
            /**
             * Update the math in the viewport.
             * @param {HTMLElement} to Cursor position element.
             * @param {HTMLElement} math Root value element.
             * @return {Void}
             */


            var update = function update(to, math) {
                if (to) {
                    current = to;
                }

                if (math) {
                    return ui.value((0, _display.default)(math)).then(function () {
                        path = (0, _recalculate.default)(math);
                        draw();
                    });
                }

                return draw();
            };

            var canSelect = function canSelect(el) {
                if (el.getAttribute('selectable') === 'false') {
                    return false;
                }

                if (readonly && !el.getAttribute('editable') && !$(el).parents('[editable=true]').length) {
                    return false;
                }

                return true;
            };

            var findSelectable = function findSelectable(el, to) {
                while (el) {
                    $('#' + el.id).removeClass('soft');
                    $(math).find('#' + el.id).removeClass('soft')
                    if (canSelect(el)) {
                        return el;
                    }

                    var _this = path.find(function (p) {
                        return p.source === el;
                    });

                    if (_this) {
                        el = _this[to];
                    } else {
                        return;
                    }
                }
            };

            var add = function add(what, source) {
                storeState();
                (0, _add.default)(what, source);

                if (typeof api.onChange == 'function') {
                    api.onChange(math);
                }
            };

            var storeState = function storeState() {
                history = history.slice(0, historyPointer);
                history.push({
                    math: math.outerHTML,
                    current: current.id
                });
                historyPointer++;
                hasChanged = true;
            };

            var restoreState = function restoreState(pointer) {
                var state = history[pointer];
                var parser = new DOMParser();
                var doc = parser.parseFromString(state.math, 'text/html');
                math = doc.body.firstElementChild;
                math.parentNode.removeChild(math);
                var current = $(math).find('#' + state.current)[0];
                update(current || math, math);
            };
            /**
             * Check whether it is possible to input a change in the value.
             * @param {HTMLElement} el
             * @return {Boolean}
             */


            var canInput = function canInput(tag) {
                if (!readonly) {
                    return true;
                }

                if (tag && allowedTags.length && allowedTags.indexOf(tag) === -1) {
                    return false;
                }

                var curr = current;

                while (curr) {
                    if (curr.hasAttribute('editable')) {
                        return true;
                    }

                    curr = curr.parentNode;
                }

                return false;
            };

            var getCurrentNode = function getCurrentNode() {
                if (current.tagName.toLowerCase() === 'math') {
                    return current.lastElementChild;
                }
                if (current.tagName.toLowerCase() === 'mrow') {
                    if (current.children.length) {
                        return current.lastElementChild;
                    }
                    return current;
                }
                return current.previousElementSibling || (current.parentNode && current.parentNode.previousElementSibling);
            }

            var getTagName = function getTagName(defaultName, notEmpty) {
                var node, tagName, selectable;
                if (allowText) {
                    node = getCurrentNode();
                    if (!notEmpty && !node) {
                        return 'mtext';
                    }
                    if (node) {
                        tagName = node.tagName.toLowerCase();
                        selectable = node.getAttribute('selectable') === 'true';
                        if (tagName === 'mtext' || tagName === 'mspace' || (tagName === 'mover' && !selectable && !notEmpty)) {
                            return 'mtext';
                        }
                        if (node.textContent === '.' && node.previousSibling && node.previousSibling.tagName.toLowerCase() === 'mi') {
                            return 'mtext';
                        }
                    }
                };
                return defaultName;
            }

            var tryExpression = function tryExpression() {
                var nodesToChange = [], node, chars = 3, text, $node, $newNode, tagName, mspace, changed = false, newNodes = [];
                var backTo = 0, dollarChars = 0;
                if (allowText) {
                    node = getCurrentNode();
                    while (chars && node && node.tagName.toLowerCase() === 'mtext') {
                        text = node.textContent;
                        if (text.match(/[a-zA-Z!]/)) {
                            if (chars <= 1) {
                                nodesToChange.splice(backTo);
                                break;
                            }
                            chars--;
                        } else if (text === '.' || text === ',') {
                            if (chars !== 3 || (node.previousElementSibling && !node.previousElementSibling.textContent.match(/\d/))) {
                                break;
                            }
                        } else if (text === '$' || text === '%' || text === '?') {
                            chars--;
                            backTo = nodesToChange.length + 1;
                        } else if (text.match(/\d/)) {
                            chars = 1;
                            backTo = nodesToChange.length + 1;
                        } else {
                            break;
                        }
                        nodesToChange.push(node);
                        node = node.previousElementSibling;
                    }
                    if (nodesToChange.length) {
                        changed = true;
                        if (node && node.tagName.toLowerCase() === 'mtext' && node.textContent.trim().length) {
                            mspace = MathJax.HTML.Element('mspace');
                            mspace.setAttribute('width', '0.5em');
                            mspace.setAttribute('height', '1em');
                            $(mspace).insertBefore(nodesToChange[nodesToChange.length - 1]);
                        }

                        for (var i = 0; i < nodesToChange.length; i++) {
                            $node = $(nodesToChange[i]);
                            text = $node.html();
                            if (text.match(/[a-zA-Z]/)) {
                                tagName = 'mi';
                            } else if (text.match(/[\d.,]/)) {
                                tagName = 'mn';
                            } else if (text === '$') {
                                if (i === nodesToChange.length - 1) {
                                    tagName = 'mi';
                                } else {
                                    dollarChars++;
                                    nodesToChange[i].remove();
                                    continue;
                                }
                            } else {
                                tagName = 'mo';
                            }
                            $newNode = $('<' + tagName + '/>').html($node.html());
                            newNodes.unshift($newNode.get(0));
                            $node.replaceWith($newNode);
                        }
                        while (dollarChars--) {
                            $newNode = $(MathJax.HTML.Element('mi', null, ['$']));
                            $newNode.insertBefore(newNodes[0]);
                            newNodes.unshift($newNode.get(0));
                        }
                    }
                }
                return newNodes;
            }

            var moverChars = ['→', '↔', '¯'];

            var tryMover = function (parentNode) {
                if (parentNode && parentNode.childElementCount >= 2 &&
                    (parentNode = parentNode.parentNode) && parentNode.nextSibling &&
                    moverChars.indexOf(parentNode.nextSibling.textContent) >= 0) {
                    return api.handleMover();
                }
                return false;
            };

            var geometryChars = {
                '∠': 3,
                '△': 3,
                '▱': 4,
                '⊙': 3
            };

            var tryGeometryChar = function () {
                var node = getCurrentNode();
                var parentNode = node ? node.parentNode : null;
                var char, count, mo, prev;
                if (parentNode && parentNode.previousSibling) {
                    prev = parentNode.previousSibling;
                    char = prev.textContent;
                    count = geometryChars[char];
                    if (count && parentNode.textContent.match(/[a-zA-Z]/) && parentNode.textContent.length >= count) {
                        mo = MathJax.HTML.Element('mo', null, ['(']);
                        if (char === '∠' && prev.previousSibling && prev.previousSibling.textContent === 'm') {
                            prev = prev.previousSibling;
                        }
                        $(mo).insertBefore(prev);
                        mo = MathJax.HTML.Element('mo', null, [')']);
                        $(mo).insertAfter(parentNode);
                        api.setCurrent(mo.nextSibling);
                        return true;
                    }
                }
                return false;
            }

            var operator = function operator(c) {
                var tagName = getTagName('mo');
                if (!canInput(tagName)) {
                    return;
                }

                var mo = MathJax.HTML.Element(tagName, null, [c]);
                add(mo, current);
                update(null, math);
            };

            var mathIdentifier = function operator(c, isTool) {
                tryExpression();
                var tagName = isTool ? 'mi' : getTagName('mi');
                if (!canInput(tagName)) {
                    return;
                }

                var mo = MathJax.HTML.Element(tagName, null, [c]);
                add(mo, current);
                update(null, math);
            };

            var binaryOperator = function binaryOperator(o, isTool) {
                var tagName, mo, mrow;
                tryExpression();
                tagName = isTool ? 'mo' : getTagName('mo', true);
                if (!canInput(tagName)) {
                    return;
                }
                mo = MathJax.HTML.Element(tagName, null, [o]);
                add(mo, current);
                if (tagName === 'mo') {
                    mrow = MathJax.HTML.Element('mrow');
                    add(mrow, current);
                    update(mrow, math);
                } else {
                    update(null, math);
                }
            };

            var relation = function relation(o, isTool, dontTry) {
                var tagName, mo, mrow, node, char;
                if (!dontTry) {
                    tryExpression();
                }
                if (isTool) {
                    tagName = 'mo';
                } else {
                    tagName = getTagName('mo', !dontTry);
                }
                if (!canInput(tagName)) {
                    return;
                }
                node = getCurrentNode();
                if (tagName === 'mo' && (!node || node.tagName.toLowerCase() === 'mtext' || (readonly && node.className === 'ee-gap'))) {
                    mrow = MathJax.HTML.Element('mrow');
                    add(mrow, current);
                }
                if (_.isArray(o)) {
                    char = tagName === 'mtext' ? o[0] : o[1];
                } else {
                    char = o;
                }
                mo = MathJax.HTML.Element(tagName, null, [char]);
                if (current.tagName.toLowerCase() === 'mrow' && !current.children.length && (readonly && current.className !== 'ee-gap')) {
                    current = math;
                }
                add(mo, current);

                if (tagName === 'mo') {
                    mrow = MathJax.HTML.Element('mrow');
                    add(mrow, current);
                    update(mrow, math);
                } else {
                    update(null, math);
                }
            };

            var group = function (open, close, onlyMath) {
                var tagName, mrow, emptyRow;
                tryExpression();
                tagName = getTagName('mo', !onlyMath);
                if (!canInput(tagName)) {
                    return;
                }

                if (tagName === 'mo') {
                    mrow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element(tagName, null, [open]));
                    emptyRow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(emptyRow);
                    mrow.appendChild(MathJax.HTML.Element(tagName, { className: 'soft' }, [close]));
                    add(mrow, current);
                    update(emptyRow, math);
                } else {
                    add(MathJax.HTML.Element(tagName, null, [open]), current);
                    update(null, math);
                }
            }

            var onlyText = function onlyText(c) {
                var mtext, tagName = getTagName('mo');
                if (!canInput(tagName)) {
                    return;
                }

                if (tagName !== 'mo') {
                    var mo = MathJax.HTML.Element(tagName, null, [c]);
                    add(mo, current);
                    update(null, math);
                } else if (allowText && current && current.parentNode) {
                    mtext = MathJax.HTML.Element('mtext');
                    add(mtext, math);
                    update(math, math);
                }
            }

            var reverseString = function (s) {
                return s.split('').reverse().join('');
            }

            var functions = {};

            functions[reverseString('sin')] = { type: 'func', value: 'sin' },
                functions[reverseString('sec')] = { type: 'func', value: 'sec' },
                functions[reverseString('cos')] = { type: 'func', value: 'cos' },
                functions[reverseString('csc')] = { type: 'func', value: 'csc' },
                functions[reverseString('tan')] = { type: 'func', value: 'tan' },
                functions[reverseString('cot')] = { type: 'func', value: 'cot' },
                functions[reverseString('pi')] = { type: 'const', value: 'π' },

                api.raw = function () {
                    return math;
                };

            api.path = function () {
                return path;
            };

            api.version = function () {
                return version;
            };

            api.right = function () {
                update(findSelectable(pos.next, 'next'));
            };

            api.left = function () {
                update(findSelectable(pos.previous, 'previous'));
            };

            api.del = function () {
                if (!canInput()) {
                    return;
                }

                storeState();
                update((0, _del.default)(math, current, null, readonly), math);

                if (typeof api.onChange == 'function') {
                    api.onChange(math);
                }
            };

            api.backspace = function () {
                if (!canInput()) {
                    return;
                }

                storeState();
                update((0, _backspace.default)(math, current, readonly), math);

                if (typeof api.onChange == 'function') {
                    api.onChange(math);
                }
            };

            api.newline = function () {
                var linebreak, mspace, node;
                if (!allowNewline) {
                    return;
                }

                if (!canInput()) {
                    return;
                }

                if (current.parentNode !== math && current !== math) {
                    return;
                }

                storeState();
                linebreak = MathJax.HTML.Element('mspace');
                linebreak.setAttribute('linebreak', 'newline');

                if (current === math) {
                    node = math.lastElementChild;
                    $(linebreak).insertAfter(node);
                } else {
                    node = current;
                    while (node.parentNode !== math) {
                        node = node.parentNode;
                    }
                    if (node.nextSibling && node.nextSibling.textContent) {
                        $(linebreak).insertBefore(node);
                    } else {
                        $(linebreak).insertAfter(node);
                    }
                }

                if (node.nextSibling) {
                    mspace = MathJax.HTML.Element('mtext');
                    $(mspace).insertAfter(linebreak);
                }

                //add(mrow, current);
                update(mspace, math);
            };

            api.number = function (n) {
                var tagName = getTagName('mn');
                if (!canInput(tagName)) {
                    return;
                }

                var mn = MathJax.HTML.Element(tagName, null, [n]);
                add(mn, current);
                update(null, math);
            };

            api.whitespace = function () {
                if (!canInput('mspace')) {
                    return;
                }
                if (current && current.tagName.toLowerCase() === 'mrow' && !current.children.length) {
                    return;
                }

                var mspace = MathJax.HTML.Element('mspace');
                mspace.setAttribute('width', '0.5em');
                mspace.setAttribute('height', '1em');
                if (current.parentNode && current.parentNode.tagName.toLowerCase() !== 'math') {
                    while (current && current.parentNode.tagName.toLowerCase() !== 'math') {
                        current = current.parentNode;
                    }
                    current = current.nextSibling || math;
                }
                add(mspace, current);
                update(null, math);
            };

            api.identifier = function (c, isTool) {
                var tagName = isTool ? 'mi' : getTagName('mi');
                var node = getCurrentNode(), text = c.toLowerCase(), index, mi, mrow, nodes = [], func, keys, key;
                var parentNode = node ? node.parentNode : null;
                if (!canInput(tagName)) {
                    return;
                }

                if (tagName === 'mi') {
                    if (!tryMover(parentNode) && !tryGeometryChar()) {
                        while (node && node.tagName.toLowerCase() === 'mi') {
                            text += node.textContent.toLowerCase();
                            nodes.push(node);
                            node = node.previousSibling;
                        }
                        if (text.length) {
                            keys = _.keys(functions);
                            for (var i = 0; i < keys.length; i++) {
                                key = keys[i];
                                index = text.indexOf(key);
                                if (index === 0) {
                                    func = functions[key];
                                    for (var j = 0; j < key.length - 1; j++) {
                                        nodes[j].remove();
                                    }
                                    if (nodes.length > j) {
                                        tagName = nodes[j].tagName.toLowerCase();
                                        if (tagName === 'mi' || tagName === 'mn') {
                                            api.whitespace();
                                        }
                                    }
                                    mi = MathJax.HTML.Element('mi', {}, [func.value])
                                    add(mi, current);
                                    if (func.type === 'func') {
                                        mrow = MathJax.HTML.Element('mrow')
                                        add(mrow, current);
                                    }
                                    update(mrow, math);
                                    return;
                                }
                            }
                        }
                    }
                }

                mi = MathJax.HTML.Element(tagName, null, [c]);
                add(mi, current);
                update(null, math);

            };

            api.handleMover = function () {
                var node = getCurrentNode();
                var moverNode = null, bkt;
                while (node) {
                    if (node.tagName.toLowerCase() === 'mover') {
                        moverNode = node;
                        break;
                    }
                    node = node.parentNode;
                }
                if (moverNode) {
                    $(MathJax.HTML.Element('mo', {}, ['('])).insertBefore(moverNode);
                    bkt = MathJax.HTML.Element('mo', {}, [')']);
                    $(bkt).insertAfter(moverNode);
                    api.setCurrent(bkt.nextSibling);
                    return true;
                }
                return false;
            };


            api.operator = function (char, isTool) {
                if (_operators.binary.hasOwnProperty(char)) {
                    return binaryOperator(_operators.binary[char], isTool);
                } else if (_operators.relations.hasOwnProperty(char)) {
                    return relation(_operators.relations[char], isTool);
                } else if (_operators.mathChars.hasOwnProperty(char)) {
                    return mathIdentifier(_operators.mathChars[char], isTool);
                } else if (_operators.onlyMathRelations.hasOwnProperty(char)) {
                    return relation(_operators.onlyMathRelations[char], isTool, true);
                } else if (_operators.groups.hasOwnProperty(char)) {
                    return group(char, _operators.groups[char], isTool);
                } else if (_operators.onlyMathGroups.hasOwnProperty(char)) {
                    return group(char, _operators.onlyMathGroups[char], true);
                } else if (_operators.onlyText.hasOwnProperty(char)) {
                    return onlyText(_operators.onlyText[char], isTool);
                } else if (_operators.custom.hasOwnProperty(char)) {
                    return _operators.custom[char](this, isTool);
                } else {
                    return operator(char);
                }
            };

            api.tryExpression = tryExpression;

            api.getTagName = getTagName;

            api.getCurrentNode = getCurrentNode;

            api.setCurrent = function (value) {
                current = value || math;
            };

            api.getCurrent = function () {
                return current;
            }

            api.addElement = function (element, row) {
                (0, _each.default)(element, function (el) {
                    if (el.tagName.toLowerCase() !== 'mrow' || el.children.length) {
                        if (!el.hasAttribute('selectable')) {
                            el.setAttribute('selectable', false);
                        }
                    }
                });
                storeState();
                (0, _add.default)(element, current);
                update(row ? row : null, math);

                if (typeof api.onChange == 'function') {
                    api.onChange(math);
                }
            };

            api.root = function () {
                if (!canInput('mroot')) {
                    return;
                }

                var mroot = MathJax.HTML.Element('mroot');
                var mrow1 = MathJax.HTML.Element('mrow');
                var mrow2 = MathJax.HTML.Element('mrow');
                mroot.appendChild(mrow1);
                mroot.appendChild(mrow2);
                add(mroot, current);
                update(mrow1, math);
            };

            api.get = function () {
                var output = math.cloneNode(true);
                (0, _each.default)(output, function (source) {
                    source.removeAttribute('id');
                    source.removeAttribute('selectable');
                });
                return output.outerHTML;
            };

            api.set = function (dom) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(dom, 'text/html');
                var $mrow;
                math = doc.body.firstElementChild;
                math.parentNode.removeChild(math);
                $mrow = $(math).find('mrow[editable=true]');
                update($mrow.length ? $mrow[0] : math, math);
            };

            api.readonly = function (val) {
                readonly = val;
            };

            api.allowedTags = function (val) {
                allowedTags = val;
            };

            api.allowNewline = function (val) {
                allowNewline = val;
            };

            api.allowText = function (val) {
                if (typeof val !== 'undefined') {
                    allowText = val;
                }
                return allowText;
            };

            api.focus = function () {
                ui.focus();
            };

            api.undo = function () {
                if (hasChanged) {
                    storeState();
                    hasChanged = false;
                    historyPointer--;
                }

                if (history.length >= historyPointer && historyPointer > 0) {
                    restoreState(--historyPointer);
                }
            };

            api.redo = function () {
                if (history.length > historyPointer + 1) {
                    restoreState(++historyPointer);
                }
            };

            api.onChange = null; // UI functions

            /**
             * Handle cursor placement.
             * @param {Number} x
             * @param {Number} y
             * @return {Void}
             */

            ui.events.click = function (x, y, target) {
                if (target) {
                    var data;

                    if (target.parentElement.classList.contains('mje-placeholder')) {
                        target = target.parentElement;
                    }

                    data = _.find(path || [], function (data) {
                        return data.element == target || data.element == target.parentElement;
                    });

                    if (data) {
                        update(findSelectable(data.source, 'next'));
                        return;
                    }
                }

                var smaller = Infinity;
                var candidate = null;

                _.forEach(path || [], function (data) {
                    var p1x = data.x;
                    var p1y = data.y;
                    var p2y = p1y + data.height;
                    var d = Math.abs(p1x - x);

                    if (p1y <= y && y <= p2y && smaller > d) {
                        smaller = d;
                        candidate = data;
                    }
                });

                if (candidate) {
                    update(candidate.source);
                }
            };


            ui.events.command = function (charCode, ctrlKey, altKey) {
                if (charCode === 26 && ctrlKey) {
                    api.undo()
                }
                if (charCode === 25 && ctrlKey) {
                    api.redo();
                }
            }

            /**
             * Handle basic input.
             * @param {String} char
             * @return {Void}
             */


            ui.events.input = function (char) {
                if (char.match(/\d/)) {
                    return api.number(char);
                } else if (char.match(/[a-zA-Z]/)) {
                    return api.identifier(char);
                } else if (char === ' ') {
                    return api.whitespace();
                } else {
                    return api.operator(char);
                }
            };
            /**
             * Handle basic actions.
             * @param {Number} code
             * @return {Void}
             */


            ui.events.code = function (code) {
                switch (code) {
                    case 8:
                        return api.backspace(readonly);

                    case 13:
                        return api.newline();

                    case 37:
                        return api.left();

                    case 39:
                        return api.right();

                    case 46:
                        return api.del(readonly);
                }
            }; // Initialization flow


            if (typeof target === 'string') {
                target = document.querySelector(target);
            }

            if (!target || !target.parentNode) {
                throw new Error('mathJaxEditor: target element not found.');
            }

            target.parentNode.replaceChild(ui.wrapper(), target);
            MathJax.Hub.processSectionDelay = 0;
            update(math, math);
            return api;
        }
    });