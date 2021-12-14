/**
 * Copyright (c) 2020 Open Assessment Technologies SA ;
 */

define(["taoQtiItem/portableLib/jquery_2_1_1"],
    function ($) {

        var availableTools = {
            number: {
                fn: function (mje, n) {
                    mje.number(n);
                }
            },
            operator: {
                fn: function (mje, o) {
                    mje.operator(o, true);
                }
            },
            identifier: {
                fn: function (mje, i) {
                    mje.identifier(i, true);
                }
            },
            sqrt: {
                icon: 'sqrt',
                tooltip: 'square root',
                desc: 'Square root',
                fn: function (mje) {
                    var msqrt = MathJax.HTML.Element('msqrt');
                    var mrow = MathJax.HTML.Element('mrow');
                    msqrt.appendChild(mrow);
                    mje.tryExpression();
                    mje.addElement(msqrt, mrow);
                }
            },
            sum: {
                label: 'Σ',
                tooltip: 'summation sigma',
                fn: function (mje) {
                    var munderover = MathJax.HTML.Element('munderover');
                    var mrow, mrow1, mrow2;
                    munderover.appendChild(MathJax.HTML.Element('mo', {}, ['Σ']));
                    mrow1 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(MathJax.HTML.Element('mi', { style: { fontSize: "60%" } }, ['i']));
                    mrow1.appendChild(MathJax.HTML.Element('mo', { style: { fontSize: "60%" } }, ['=']));
                    mrow1.appendChild(MathJax.HTML.Element('mn', { style: { fontSize: "60%" } }, ['1']));
                    mrow2 = MathJax.HTML.Element('mrow');
                    mrow2.appendChild(MathJax.HTML.Element('mi', { style: { fontSize: "60%" } }, ['n']));
                    munderover.appendChild(mrow1);
                    munderover.appendChild(mrow2);
                    mje.addElement(munderover);
                    mrow = MathJax.HTML.Element('mrow');
                    mje.addElement(mrow, mrow);
                }
            },
            fraction: {
                icon: 'frac',
                tooltip: 'fraction',
                fn: function (mje) {
                    var mfrac = MathJax.HTML.Element('mfrac');
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mfrac.appendChild(mrow1);
                    mfrac.appendChild(mrow2);
                    mje.addElement(mfrac, mrow1);
                }
            },
            mixedNumber: {
                icon: 'mxf',
                tooltip: 'mixed number',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mfrac = MathJax.HTML.Element('mfrac');
                    var mrow2 = MathJax.HTML.Element('mrow');
                    var mrow3 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mfrac.appendChild(mrow2);
                    mfrac.appendChild(mrow3);
                    mrow.appendChild(mfrac);
                    mje.addElement(mrow, mrow1);
                }
            },
            parenthesis: {
                label: '(·)',
                tooltip: 'parenthesis',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var mo1 = MathJax.HTML.Element('mo', {}, ['(']);
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mo2 = MathJax.HTML.Element('mo', { className: 'soft' }, [')']);
                    mrow.appendChild(mo1);
                    mrow.appendChild(mrow1);
                    mrow.appendChild(mo2);
                    mje.addElement(mrow, mrow1);
                }
            },
            bracket: {
                label: '[·]',
                tooltip: 'bracket',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var mo1 = MathJax.HTML.Element('mo', {}, ['[']);
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mo2 = MathJax.HTML.Element('mo', { className: 'soft' }, [']']);
                    mrow.appendChild(mo1);
                    mrow.appendChild(mrow1);
                    mrow.appendChild(mo2);
                    mje.addElement(mrow, mrow1);
                }
            },
            brace: {
                label: '{·}',
                tooltip: 'brace',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var mo1 = MathJax.HTML.Element('mo', {}, ['{']);
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mo2 = MathJax.HTML.Element('mo', { className: 'soft' }, ['}']);
                    mrow.appendChild(mo1);
                    mrow.appendChild(mrow1);
                    mrow.appendChild(mo2);
                    mje.addElement(mrow, mrow1);
                }
            },
            absolute: {
                label: '∣·∣',
                tooltip: 'absolute value',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var mo1 = MathJax.HTML.Element('mo', {}, ['|']);
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mo2 = MathJax.HTML.Element('mo', { className: 'soft' }, ['|']);
                    mrow.appendChild(mo1);
                    mrow.appendChild(mrow1);
                    mrow.appendChild(mo2);
                    mje.addElement(mrow, mrow1);
                }
            },
            openInterval: {
                label: '(·,·)',
                tooltip: 'open interval',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var mo1 = MathJax.HTML.Element('mo', {}, ['(']);
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(mrow2);
                    mrow1.appendChild(MathJax.HTML.Element('mo', {}, [',']));
                    mrow1.appendChild(MathJax.HTML.Element('mrow'));
                    var mo2 = MathJax.HTML.Element('mo', {}, [')']);
                    mrow.appendChild(mo1);
                    mrow.appendChild(mrow1);
                    mrow.appendChild(mo2);
                    mje.addElement(mrow, mrow2);
                }
            },
            closedInterval: {
                label: '[·,·]',
                tooltip: 'closed interval',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var mo1 = MathJax.HTML.Element('mo', {}, ['[']);
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(mrow2);
                    mrow1.appendChild(MathJax.HTML.Element('mo', {}, [',']));
                    mrow1.appendChild(MathJax.HTML.Element('mrow'));
                    var mo2 = MathJax.HTML.Element('mo', {}, [']']);
                    mrow.appendChild(mo1);
                    mrow.appendChild(mrow1);
                    mrow.appendChild(mo2);
                    mje.addElement(mrow, mrow2);
                }
            },
            openClosedInterval: {
                label: '(·,·]',
                tooltip: 'open-closed interval',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var mo1 = MathJax.HTML.Element('mo', {}, ['(']);
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(mrow2);
                    mrow1.appendChild(MathJax.HTML.Element('mo', {}, [',']));
                    mrow1.appendChild(MathJax.HTML.Element('mrow'));
                    var mo2 = MathJax.HTML.Element('mo', {}, [']']);
                    mrow.appendChild(mo1);
                    mrow.appendChild(mrow1);
                    mrow.appendChild(mo2);
                    mje.addElement(mrow, mrow2);
                }
            },
            closedOpenInterval: {
                label: '[·,·)',
                tooltip: 'closed-open interval',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var mo1 = MathJax.HTML.Element('mo', {}, ['[']);
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(mrow2);
                    mrow1.appendChild(MathJax.HTML.Element('mo', {}, [',']));
                    mrow1.appendChild(MathJax.HTML.Element('mrow'));
                    var mo2 = MathJax.HTML.Element('mo', {}, [')']);
                    mrow.appendChild(mo1);
                    mrow.appendChild(mrow1);
                    mrow.appendChild(mo2);
                    mje.addElement(mrow, mrow2);
                }
            },
            exponent: {
                label: '<span style="font-style:italic;">y<span class="sup">x</span></span>',
                tooltip: 'exponent',
                fn: function (mje) {
                    mje.operator('^');
                }
            },
            ln: {
                label: 'ln',
                tooltip: 'natural logarithm',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mi', {}, ['ln']));
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mje.addElement(mrow, mrow1);
                }
            },
            exponential: {
                label: '<span style="font-style:italic;">e<span class="sup">x</span></span>',
                tooltip: 'exponential',
                fn: function (mje) {
                    var msup = MathJax.HTML.Element('msup');
                    var mi = MathJax.HTML.Element('mi', {}, ['e']);
                    var mrow = MathJax.HTML.Element('mrow');
                    msup.appendChild(mi);
                    msup.appendChild(mrow);
                    mje.addElement(msup, mrow);
                }
            },
            subscript: {
                label: '<span style="font-style:italic;">x<span class="sub">i</span></span>',
                tooltip: 'subscript',
                fn: function (mje) {
                    mje.operator('_');
                }
            },
            root: {
                icon: 'root',
                tooltip: 'general root',
                fn: function (mje) {
                    var root = MathJax.HTML.Element('mroot');
                    var mrow1 = MathJax.HTML.Element('mrow');
                    var mrow2 = MathJax.HTML.Element('mrow');
                    root.appendChild(mrow1);
                    root.appendChild(mrow2);
                    mje.tryExpression();
                    mje.addElement(root, mrow1);
                }
            },
            cubeRoot: {
                icon: 'rt-3',
                tooltip: 'cube root',
                fn: function (mje) {
                    var root = MathJax.HTML.Element('mroot');
                    var mrow = MathJax.HTML.Element('mrow');
                    var number = MathJax.HTML.Element('mn', {}, ['3']);
                    root.appendChild(mrow);
                    root.appendChild(number);
                    mje.tryExpression();
                    mje.addElement(root, mrow);
                }
            },
            negative: {
                label: '<span><span class="sup">−</span></span>',
                tooltip: 'negative sign',
                fn: function (mje) {
                    mje.tryExpression();
                    var node = mje.getCurrentNode();
                    if (node && node.tagName.toLowerCase() !== 'mtext') {
                        mje.operator('-', true);
                    } else {
                        var msup = MathJax.HTML.Element('msup');
                        var space = MathJax.HTML.Element('mo');
                        var mo = MathJax.HTML.Element('mo', {}, ['-']);
                        msup.appendChild(space);
                        msup.appendChild(mo);
                        mje.addElement(msup);
                        var mrow = MathJax.HTML.Element('mrow');
                        mje.addElement(mrow, mrow);
                    }
                }
            },
            ray: {
                label: '→',
                tooltip: 'ray',
                fn: function (mje) {
                    var mover = MathJax.HTML.Element('mover');
                    var mrow = MathJax.HTML.Element('mrow');
                    mje.handleMover();
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mover.appendChild(mrow);
                    mover.appendChild(MathJax.HTML.Element('mo', {}, ['→']))
                    mje.addElement(mover, mrow1);
                }
            },
            line: {
                label: '↔',
                tooltip: 'line',
                fn: function (mje) {
                    var mover = MathJax.HTML.Element('mover');
                    var mrow = MathJax.HTML.Element('mrow');
                    mje.handleMover();
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mover.appendChild(mrow);
                    mover.appendChild(MathJax.HTML.Element('mo', {}, ['↔']))
                    mje.addElement(mover, mrow1);
                }
            },
            lineSegment: {
                label: '¯',
                tooltip: 'line segment',
                fn: function (mje) {
                    var mover = MathJax.HTML.Element('mover');
                    var mrow = MathJax.HTML.Element('mrow');
                    mje.handleMover();
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mover.appendChild(mrow);
                    mover.appendChild(MathJax.HTML.Element('mo', {}, ['¯']))
                    mje.addElement(mover, mrow1);
                }
            },
            arc: {
                label: '⁀',
                tooltip: 'arc',
                fn: function (mje) {
                    var mover = MathJax.HTML.Element('mover');
                    var mrow = MathJax.HTML.Element('mrow');
                    mje.handleMover();
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mover.appendChild(mrow);
                    mover.appendChild(MathJax.HTML.Element('mo', {}, ['⏜']))
                    mje.addElement(mover, mrow1);
                }
            },
            angleMeasure: {
                label: '<span style="font-weight:normal;"><span style="font-size: 80%; vertical-align: 20%">m</span>∠</span>',
                tooltip: 'angle measure',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mtext', {}, ['m']));
                    mrow.appendChild(MathJax.HTML.Element('mo', {}, ['∠']));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mje.tryExpression();
                    mje.addElement(mrow, mrow1);
                }
            },
            log: {
                label: 'log',
                tooltip: 'common logarithm',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mi', {}, ['log']));
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mje.addElement(mrow, mrow1);
                }
            },
            logarithm: {
                label: '<span>log<span class="sub"><i>b</i></span></span>',
                tooltip: 'general logarithm',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var msub = MathJax.HTML.Element('msub');
                    msub.appendChild(MathJax.HTML.Element('mi', {}, ['log']));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    msub.appendChild(mrow1);
                    mrow.appendChild(msub);
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    mrow.appendChild(MathJax.HTML.Element('mrow'));
                    mje.addElement(mrow, mrow1);
                }
            },
            sin: {
                label: 'sin',
                tooltip: 'sine',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mi', {}, ['sin']));
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mje.addElement(mrow, mrow1);
                }
            },
            cos: {
                label: 'cos',
                tooltip: 'cosine',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mi', {}, ['cos']));
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mje.addElement(mrow, mrow1);
                }
            },
            tan: {
                label: 'tan',
                tooltip: 'tangent',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mi', {}, ['tan']));
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mje.addElement(mrow, mrow1);
                }
            },
            inverseSin: {
                label: '<span>sin<span class="sup">-1</span></span>',
                tooltip: 'inverse sine',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var msup = MathJax.HTML.Element('msup');
                    mrow.appendChild(msup);
                    msup.appendChild(MathJax.HTML.Element('mi', {}, ['sin']));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(MathJax.HTML.Element('mo', {}, ['-']));
                    mrow1.appendChild(MathJax.HTML.Element('mn', {}, ['1']));
                    msup.appendChild(mrow1);
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    mrow.appendChild(mrow2);
                    mje.addElement(mrow, mrow2);
                }
            },
            inverseCos: {
                label: '<span>cos<span class="sup">-1</span></span>',
                tooltip: 'inverse cosine',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var msup = MathJax.HTML.Element('msup');
                    mrow.appendChild(msup);
                    msup.appendChild(MathJax.HTML.Element('mi', {}, ['cos']));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(MathJax.HTML.Element('mo', {}, ['-']));
                    mrow1.appendChild(MathJax.HTML.Element('mn', {}, ['1']));
                    msup.appendChild(mrow1);
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    mrow.appendChild(mrow2);
                    mje.addElement(mrow, mrow2);
                }
            },
            inverseTan: {
                label: '<span>tan<span class="sup">-1</span></span>',
                tooltip: 'inverse tangent',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var msup = MathJax.HTML.Element('msup');
                    mrow.appendChild(msup);
                    msup.appendChild(MathJax.HTML.Element('mi', {}, ['tan']));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(MathJax.HTML.Element('mo', {}, ['-']));
                    mrow1.appendChild(MathJax.HTML.Element('mn', {}, ['1']));
                    msup.appendChild(mrow1);
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    mrow.appendChild(mrow2);
                    mje.addElement(mrow, mrow2);
                }
            },
            secant: {
                label: 'sec',
                tooltip: 'secant',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mi', {}, ['sec']));
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mje.addElement(mrow, mrow1);
                }
            },
            inverseSecant: {
                label: '<span>sec<span class="sup">-1</span></span>',
                tooltip: 'inverse secant',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var msup = MathJax.HTML.Element('msup');
                    mrow.appendChild(msup);
                    msup.appendChild(MathJax.HTML.Element('mi', {}, ['sec']));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(MathJax.HTML.Element('mo', {}, ['-']));
                    mrow1.appendChild(MathJax.HTML.Element('mn', {}, ['1']));
                    msup.appendChild(mrow1);
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    mrow.appendChild(mrow2);
                    mje.addElement(mrow, mrow2);
                }
            },
            cosecant: {
                label: 'csc',
                tooltip: 'cosecant',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mi', {}, ['csc']));
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mje.addElement(mrow, mrow1);
                }
            },
            inverseCosecant: {
                label: '<span>csc<span class="sup">-1</span></span>',
                tooltip: 'inverse cosecant',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var msup = MathJax.HTML.Element('msup');
                    mrow.appendChild(msup);
                    msup.appendChild(MathJax.HTML.Element('mi', {}, ['csc']));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(MathJax.HTML.Element('mo', {}, ['-']));
                    mrow1.appendChild(MathJax.HTML.Element('mn', {}, ['1']));
                    msup.appendChild(mrow1);
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    mrow.appendChild(mrow2);
                    mje.addElement(mrow, mrow2);
                }
            },
            cotangent: {
                label: 'cot',
                tooltip: 'cotangent',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mi', {}, ['cot']));
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mje.addElement(mrow, mrow1);
                }
            },
            inverseCotangent: {
                label: '<span>cot<span class="sup">-1</span></span>',
                tooltip: 'inverse cotangent',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var msup = MathJax.HTML.Element('msup');
                    mrow.appendChild(msup);
                    msup.appendChild(MathJax.HTML.Element('mi', {}, ['cot']));
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow1.appendChild(MathJax.HTML.Element('mo', {}, ['-']));
                    mrow1.appendChild(MathJax.HTML.Element('mn', {}, ['1']));
                    msup.appendChild(mrow1);
                    var mrow2 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(MathJax.HTML.Element('mo'));
                    mrow.appendChild(mrow2);
                    mje.addElement(mrow, mrow2);
                }
            },
            factorial: {
                label: '<span><i>x</i>!</span>',
                tooltip: 'factorial',
                fn: function (mje) {
                    var mrow = MathJax.HTML.Element('mrow');
                    var mrow1 = MathJax.HTML.Element('mrow');
                    mrow.appendChild(mrow1);
                    mrow.appendChild(MathJax.HTML.Element('mo', {}, ['!']));
                    mje.addElement(mrow, mrow1);
                }
            },
            overBar: {
                label: '<span><span style="display: inline-block; line-height: 0.6em; border-top: 1px solid; font-style: italic;">x</span></span>',
                tooltip: 'sample mean x-bar',
                fn: function (mje) {
                    var mover = MathJax.HTML.Element('mover');
                    mover.setAttribute('selectable', true);
                    mover.appendChild(MathJax.HTML.Element('mi', {}, ['x']));
                    mover.appendChild(MathJax.HTML.Element('mo', {}, ['‾']));
                    mje.addElement(mover);
                }
            },
            overBarBlock: {
                label: '<span><span style="display: inline-block; line-height: 0.6em; border-top: 1px solid; font-style: italic;">y</span></span>',
                tooltip: 'sample mean y-bar',
                fn: function (mje) {
                    var mover = MathJax.HTML.Element('mover');
                    mover.setAttribute('selectable', true);
                    mover.appendChild(MathJax.HTML.Element('mi', {}, ['y']));
                    mover.appendChild(MathJax.HTML.Element('mo', {}, ['‾']));
                    mje.addElement(mover);
                }
            },
            'superscript': {
                label: '<span style="font-style:italic;">x<span class="sup">i</span></span>',
                tooltip: 'superscript',
                fn: function (mje) {
                    mje.operator('^');
                }
            },
            'prime': {
                label: '′',
                tooltip: 'prime',
                fn: function (mje) {
                    var msup = MathJax.HTML.Element('msup');
                    var mrow = MathJax.HTML.Element('mrow');
                    var nodes = mje.tryExpression();
                    var mo, node;
                    msup.appendChild(mrow);

                    if (nodes.length) {
                        _.forEachRight(nodes, function (n) {
                            n.remove();
                            mrow.insertBefore(n, mrow.firstChild);
                        });
                    } else {
                        node = mje.getCurrentNode();
                        if (node && node.tagName.toLowerCase() !== 'mtext') {
                            if (node.parentNode && node.parentNode.tagName.toLowerCase() === 'mrow') {
                                nodes.push(node.parentNode);
                            } else {
                                nodes.push(node);
                            }
                            _.forEachRight(nodes, function (n) {
                                n.remove();
                                mrow.insertBefore(n, mrow.firstChild);
                            });
                        }
                    }

                    mo = MathJax.HTML.Element('mo', null, ["'"]);
                    msup.appendChild(mo);
                    mje.addElement(msup);
                }
            }
        };
        return availableTools;
    }
)