define(['lodash'], function (_) {
    "use strict";

    var frac = function frac(mje) {
        var msup, mrow, mrow2, node, currentNode, nextSibling, tagName;
        var forwardNodes = mje.tryExpression();
        var trailingNodes = [];
        var maxChar = 1;
        currentNode = mje.getCurrentNode();
        nextSibling = currentNode ? currentNode.nextSibling : mje.raw().firstElementChild;
        node = currentNode;
        if (node && !forwardNodes.length) {
            tagName = node.tagName.toLowerCase();
            if (tagName === 'mn') {
                while (node && tagName === node.tagName.toLowerCase()) {
                    forwardNodes.unshift(node);
                    node = node.previousSibling;
                }
            }
        }

        if (!mje.allowText()) {
            node = nextSibling;
            if (node) {
                tagName = node.tagName.toLowerCase();
                if (tagName === 'mn' || tagName === 'mi') {
                    if (tagName === 'mi') {
                        forwardNodes = [];
                    }
                    while (node && tagName === node.tagName.toLowerCase()) {
                        trailingNodes.push(node);
                        node = node.nextSibling;
                    }
                }
            }
        }

        node = mje.getCurrentNode();
        if (node && node.tagName.toLowerCase() === 'mtext') {
            mje.whitespace();
        }
        msup = MathJax.HTML.Element('mfrac');
        mrow = MathJax.HTML.Element('mrow');
        msup.appendChild(mrow);
        mrow2 = MathJax.HTML.Element('mrow');
        _.forEachRight(forwardNodes, function (n) {
            if (maxChar) {
                if (mje.getCurrent() === n) {
                    mje.setCurrent(n.nextSibling);
                }
                n.remove();
                mrow.insertBefore(n, mrow.firstChild);
                if (n.tagName.toLowerCase() === 'mi') {
                    maxChar--;
                }
            }
        });
        _.forEach(trailingNodes, function (n) {
            if (maxChar) {
                if (mje.getCurrent() === n) {
                    mje.setCurrent(n.nextSibling);
                }
                n.remove();
                mrow2.appendChild(n);
                if (n.tagName.toLowerCase() === 'mi') {
                    maxChar--;
                }
            }
        });
        msup.appendChild(mrow2);
        mje.addElement(msup, forwardNodes.length ? mrow2 : mrow);
    };

    var groupTag = function groupTag(mje, tag, second, maxChar) {
        var msup, mrow, node, tagName;
        var newNodes = mje.tryExpression();
        maxChar = maxChar ? maxChar : 999;
        node = mje.getCurrentNode();
        if (node && !newNodes.length) {
            tagName = node.tagName.toLowerCase();
            if (tagName === 'mn' || tagName === 'mi') {
                while (node && tagName === node.tagName.toLowerCase()) {
                    newNodes.unshift(node);
                    node = node.previousSibling;
                }
            }
        }
        if (newNodes.length) {
            msup = MathJax.HTML.Element(tag);
            mrow = MathJax.HTML.Element('mrow');
            msup.appendChild(mrow);
            _.forEachRight(newNodes, function (n) {
                if (maxChar) {
                    n.remove();
                    mrow.insertBefore(n, mrow.firstChild);
                    if (n.tagName.toLowerCase() === 'mi') {
                        maxChar--;
                    }
                }
            });
            if (second) {
                msup.appendChild(second);
                mrow = null;
            } else {
                mrow = MathJax.HTML.Element('mrow');
                msup.appendChild(mrow);
            }
            mje.addElement(msup, mrow);
        } else {
            node = mje.getCurrentNode();
            if (node && node.tagName.toLowerCase() === 'mtext') {
                mje.whitespace();
            }
            msup = MathJax.HTML.Element(tag);
            mrow = MathJax.HTML.Element('mrow');
            msup.appendChild(mrow);
            msup.appendChild(second || MathJax.HTML.Element('mrow'));
            mje.addElement(msup, mrow);
        }
    };

    var operators = {
        binary: {
            '+': '+',
            '-': '-',
            //unicode chars
            '−': '-',
            '±': '±',
            'Σ': 'Σ',
            '∠': '∠',
            '△': '△',
            '▱': '▱',
            '⊙': '⊙',
        },
        groups: {
            '[': ']',
            //'|': '|',
            '{': '}',
        },
        onlyMathGroups: {
            '(': ')'
        },
        onlyText: {
            '}': '}',
            ']': ']',
            ')': ')'
        },
        relations: {
            '=': '=',
            '≠': '≠',
            '∼': '∼',
            '≁': '≁',
            '<': '<',
            '>': '>',
            '≈': '≈',
            '≉': '≉',
            '≤': '≤',
            '≥': '≥',
            '≅': '≅',
            '≇': '≇',
            '·': '·',
            '*': ['*', '×'],
            '∥': '∥',
            '⊥': '⊥',
            '×': '×',
            '÷': '÷',
            '⁄': '⁄',
        },
        onlyMathRelations: {
            '~': ['~', '∼'],
            ':': ':',
        },
        mathChars: {
            'π': 'π',
            '°': '°',
        },
        custom: {
            '|': function (mje) {
                var mrow, emptyRow;
                mrow = MathJax.HTML.Element('mrow');
                mrow.appendChild(MathJax.HTML.Element('mo', null, ['|']));
                emptyRow = MathJax.HTML.Element('mrow');
                mrow.appendChild(emptyRow);
                mrow.appendChild(MathJax.HTML.Element('mo', { className: 'soft' }, ['|']));
                mje.addElement(mrow, emptyRow);
            },
            '`': function (mje) {
                var msqrt = MathJax.HTML.Element('msqrt');
                var mrow = MathJax.HTML.Element('mrow');
                msqrt.appendChild(mrow);
                mje.tryExpression();
                mje.addElement(msqrt, mrow);
            },
            '^': function (mje) {
                groupTag(mje, 'msup');
            },
            '_': function (mje) {
                groupTag(mje, 'msub');
            },
            "'": function (mje) {
                var node, element;
                node = mje.getCurrentNode();
                if (mje.allowText() && (!node || node.tagName.toLowerCase() === 'mtext')) {
                    element = MathJax.HTML.Element('mtext', null, ["'"]);
                } else {
                    element = MathJax.HTML.Element('mn', null, ["'"]);
                }
                mje.addElement(element);
            },
            '/': function (mje) {
                var node, mtext;
                mje.tryExpression();
                node = mje.getCurrentNode();
                if (node && node.tagName.toLowerCase() === 'mtext') {
                    mtext = MathJax.HTML.Element('mtext', null, ['/']);
                    mje.addElement(mtext);
                } else {
                    frac(mje);
                }
            },
            '\\': function (mje) {
                var node, mtext;
                mje.tryExpression();
                node = mje.getCurrentNode();
                if (node && node.tagName.toLowerCase() === 'mtext') {
                    mtext = MathJax.HTML.Element('mtext', null, ['\\']);
                    mje.addElement(mtext);
                } else {
                    frac(mje);
                }
            },
            '$': function (mje) {
                var node = mje.getCurrentNode();
                var count = 0, mo, idBefore;
                var tagName = node ? node.tagName.toLowerCase() : '';
                if (tagName === 'mn') {
                    mje.left(); count++;
                    while (node.previousSibling && (node.previousSibling.tagName.toLowerCase() === 'mn' || node.previousSibling.textContent === '.')) {
                        node = node.previousSibling;
                        mje.left(); count++;
                    }
                    idBefore = node.previousSibling && node.previousSibling.tagName.toLowerCase() === 'mi';
                    if (idBefore) {
                        mo = MathJax.HTML.Element('mo', null, ['('])
                        mje.addElement(mo);
                    }
                    mje.addElement(MathJax.HTML.Element('mi', null, ['$']));
                    while (count--) {
                        mje.right();
                    }
                    if (idBefore) {
                        mo = MathJax.HTML.Element('mo', null, [')'])
                        mje.addElement(mo, mo);
                    }
                } else if (tagName === 'mi') {
                    tagName = node.previousSibling ? node.previousSibling.tagName.toLowerCase() : '';
                    if (tagName === 'mi' || tagName === 'mn') {
                        mje.addElement(MathJax.HTML.Element('mrow'));
                    } else {
                        mje.left();
                        mje.addElement(MathJax.HTML.Element('mi', null, ['$']));
                        mje.right();
                    }
                } else {
                    tagName = mje.getTagName('mi');
                    mje.addElement(MathJax.HTML.Element(tagName, null, ['$']));
                }
            },
            '!': function (mje) {
                var tagName, node = mje.getCurrentNode();
                var selectable = node && node.getAttribute('selectable') === 'true';
                var mrow, mrow1, bkt;
                if ((!node && !mje.allowText()) || (node && node.tagName.toLowerCase() === 'mrow')) {
                    mrow = MathJax.HTML.Element('mrow');
                    mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mrow.appendChild(MathJax.HTML.Element('mo', null, ['!']));
                    mje.addElement(mrow, mrow1);
                } else {
                    if (node && node.tagName.toLowerCase() === 'mover' && !selectable) {
                        $(MathJax.HTML.Element('mo', {}, ['('])).insertBefore(node);
                        bkt = MathJax.HTML.Element('mo', {}, [')']);
                        $(bkt).insertAfter(node);
                    }
                    tagName = mje.getTagName('mo');
                    mje.addElement(MathJax.HTML.Element(tagName, null, ['!']));
                }
            },
            ',': function (mje) {
                var node = mje.getCurrentNode();
                var mtext, tagName;
                if (mje.allowText() && (!node || (node.tagName.toLowerCase() === 'mtext' || node.tagName.toLowerCase() === 'mi'))) {
                    tagName = 'mtext';
                } else if (node && node.tagName.toLowerCase() === 'mn') {
                    tagName = 'mn';
                }
                if (tagName) {
                    mtext = MathJax.HTML.Element(tagName, null, [',']);
                    mje.addElement(mtext);
                }
            },
            '.': function (mje) {
                var node = mje.getCurrentNode();
                var mtext, tagName = 'mn';
                if (mje.allowText() && (!node || (node.tagName.toLowerCase() === 'mtext' || node.tagName.toLowerCase() === 'mi'))) {
                    tagName = 'mtext';
                }
                mtext = MathJax.HTML.Element(tagName, null, ['.']);
                mje.addElement(mtext);

            },
            '∴': function (mje) {
                mje.tryExpression();
                mje.addElement(MathJax.HTML.Element('mo', null, ['∴']));
            }
        }
    };
    return operators;
});