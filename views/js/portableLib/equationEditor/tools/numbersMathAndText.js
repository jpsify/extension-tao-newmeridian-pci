/**
 * Copyright (c) 2020 Open Assessment Technologies SA ;
 */

define(['nmcPci/portableLib/equationEditor/tools/grade'],
    function (grade) {
        var tools = {};

        tools[grade.grade_3_5] = [
            {
                id: 'mathsymbols',
                title: 'Math symbols',
                tools: [
                    { toolType: 'operator', value: '+', tooltip: 'plus sign' },
                    { toolType: 'operator', value: '−', tooltip: 'minus sign' },
                    { toolType: 'operator', value: '×', tooltip: 'times sign' },
                    { toolType: 'operator', value: '÷', tooltip: 'division sign' },
                    'fraction', 'mixedNumber', 'parenthesis', 'bracket',
                    { toolType: 'operator', value: '=', tooltip: 'equal' },
                    { toolType: 'operator', value: '<', tooltip: 'less than' },
                    { toolType: 'operator', value: '>', tooltip: 'greater than' },
                    { toolType: 'operator', value: '≠', tooltip: 'not equal' },
                    { toolType: 'operator', value: '$', tooltip: 'dollar sign' },
                    { toolType: 'operator', value: '°', tooltip: 'degree sign' },
                    { toolType: 'operator', value: '?', tooltip: 'question mark' },
                ]
            },
        ];
        tools[grade.grade_6_8] = [
            {
                id: 'mathsymbols',
                title: 'Math symbols',
                tools: [
                    { toolType: 'operator', value: '+', tooltip: 'plus sign' },
                    { toolType: 'operator', value: '−', tooltip: 'minus sign' },
                    { toolType: 'operator', value: '×', tooltip: 'times sign' },
                    { toolType: 'operator', value: '÷', tooltip: 'division sign' },
                    { toolType: 'operator', value: '±', tooltip: 'plus minus sign' },
                    'negative',
                    { toolType: 'operator', value: '·', tooltip: 'times dot' },
                    { toolType: 'operator', value: '⁄', tooltip: 'division slash' },
                    { toolType: 'operator', value: '=', tooltip: 'equal' },
                    { toolType: 'operator', value: '≠', tooltip: 'not equal' },
                    'fraction', 'mixedNumber', 'exponent', 'sqrt', 'cubeRoot',
                    { toolType: 'operator', value: 'π', tooltip: 'constant pi' },
                    'parenthesis',
                    { toolType: 'operator', value: '°', tooltip: 'degree sign' },
                    'absolute',
                ]
            },
            {
                id: 'relations',
                title: 'Relations',
                tools: _.map([
                    ['=', 'equal'],
                    ['≠', 'not equal'],
                    ['∼', 'similar'],
                    ['≁', 'not similar'],
                    ['<', 'less than'],
                    ['>', 'greater than'],
                    ['≈', 'approximately equal'],
                    ['≉', 'not approximately equal'],
                    ['≤', 'less than or equal'],
                    ['≥', 'greater than or equal'],
                    ['≅', 'congruent'],
                    ['≇', 'not congruent'],
                ], function (c) { return { toolType: 'operator', value: c[0], tooltip: c[1] } }),
            },
            {
                id: 'geometry',
                title: 'Geometry',
                tools: [
                    'ray', 'line', 'lineSegment',
                    { toolType: 'operator', value: '∥', tooltip: 'parallel' },
                    { toolType: 'operator', value: '⊥', tooltip: 'perpendicular' },
                    { toolType: 'operator', value: '∠', tooltip: 'angle' },
                    'angleMeasure',
                    { toolType: 'operator', value: '△', tooltip: 'triangle' },
                    { toolType: 'operator', value: '▱', tooltip: 'parallelogram' },
                    { toolType: 'operator', value: '⊙', tooltip: 'circle' },
                    { toolType: 'identifier', value: "'", tooltip: 'prime' },
                ]
            },
        ];
        tools[grade.grade_9_12] = [
            {
                id: 'mathsymbols',
                title: 'Math symbols',
                tools: [
                    { toolType: 'operator', value: '+', tooltip: 'plus sign' },
                    { toolType: 'operator', value: '−', tooltip: 'minus sign' },
                    { toolType: 'operator', value: '×', tooltip: 'times sign' },
                    { toolType: 'operator', value: '÷', tooltip: 'division sign' },
                    { toolType: 'operator', value: '±', tooltip: 'plus minus sign' },
                    'negative',
                    { toolType: 'operator', value: '·', tooltip: 'times dot' },
                    { toolType: 'operator', value: '⁄', tooltip: 'division slash' },
                    { toolType: 'operator', value: '=', tooltip: 'equal' },
                    { toolType: 'operator', value: '≠', tooltip: 'not equal' },
                    'fraction', 'mixedNumber', 'exponent', 'sqrt', 'cubeRoot', 'root', 'exponential', 'ln', 'log', 'logarithm',
                    { toolType: 'operator', value: 'π', tooltip: 'constant pi' },
                    { toolType: 'identifier', value: 'i', tooltip: 'imaginary i' },
                    { toolType: 'identifier', value: 'e', tooltip: 'exponential e' },
                    { toolType: 'identifier', value: '∞', tooltip: 'infinity' },
                    { toolType: 'operator', value: '°', tooltip: 'degree sign' },
                    'parenthesis'
                ]
            },
            {
                id: 'relations',
                title: 'Relations',
                tools: _.map([['=', 'equal'], ['≠', 'not equal'], ['∼', 'similar'], ['≁', 'not similar'], ['<', 'less than'], ['>', 'greater than'], ['≈', 'approximately equal'], ['≉', 'not approximately equal'], ['≤', 'less than or equal'], ['≥', 'greater than or equal'], ['≅', 'congruent'], ['≇', 'not congruent'], ['∴','therefore']], function (c) { return { toolType: 'operator', value: c[0], tooltip: c[1] } }),
            },
            {
                id: 'geometry',
                title: 'Geometry',
                tools: [
                    'ray', 'line', 'lineSegment', 'arc',
                    { toolType: 'operator', value: '∥', tooltip: 'parallel' },
                    { toolType: 'operator', value: '⊥', tooltip: 'perpendicular' },
                    { toolType: 'operator', value: '∠', tooltip: 'angle' },
                    'angleMeasure',
                    { toolType: 'operator', value: '△', tooltip: 'triangle' },
                    { toolType: 'operator', value: '▱', tooltip: 'parallelogram' },
                    { toolType: 'operator', value: '⊙', tooltip: 'circle' },
                    'prime'
                ]
            },
            {
                id: 'groups',
                title: 'Groups',
                tools: [
                    'parenthesis', 'bracket', 'brace', 'absolute', 'openInterval', 'closedInterval', 'openClosedInterval', 'closedOpenInterval'
                ]
            },
            {
                id: 'trigonometry',
                title: 'Trigonometry',
                tools: [
                    'sin', 'secant', 'inverseSin', 'inverseSecant',
                    'cos', 'cosecant', 'inverseCos', 'inverseCosecant',
                    'tan', 'cotangent', 'inverseTan', 'inverseCotangent'
                ]
            },
            {
                id: 'statistics',
                title: 'Statistics',
                tools: [
                    { toolType: 'identifier', value: 'μ', tooltip: 'population mean mu' },
                    { toolType: 'identifier', value: 'σ', tooltip: 'standard deviation sigma' },
                    'overBar', 'overBarBlock', 'superscript', 'subscript', 'factorial',
                    'sum'
                ]
            },
            {
                id: 'greek',
                title: 'Greek',
                tools: _.map([['α', 'small alpha'],['β', 'small beta'],['γ', 'small gamma'],['δ', 'small delta'],['θ', 'small theta'],['π', 'small pi']], function (c) { return { toolType: 'identifier', value: c[0], tooltip: c[1] } }),
            },
        ];
        return tools;
    }
)
