/**
 * Copyright (c) 2020 Open Assessment Technologies SA ;
 */

define(['nmcPci/portableLib/equationEditor/tools/grade'],
    function(grade) {
        var tools = {};

        tools[grade.grade_3_5] = [
                { toolType: 'operator', value: '+', tooltip: 'plus sign' },
                { toolType: 'operator', value: '−', tooltip: 'minus sign' },
                { toolType: 'operator', value: '×', tooltip: 'times sign' },
                { toolType: 'operator', value: '÷', tooltip: 'division sign' },
                'fraction', 'mixedNumber',
                { toolType: 'operator', value: '=', tooltip: 'equal' },
                { toolType: 'operator', value: '<', tooltip: 'less than' },
                { toolType: 'operator', value: '>', tooltip: 'greater than' },
                'parenthesis', 'bracket',
                { toolType: 'operator', value: '$', tooltip: 'dollar sign' },
            ];
        tools[grade.grade_6_8] = [
                { toolType: 'operator', value: '+', tooltip: 'plus sign' },
                { toolType: 'operator', value: '−', tooltip: 'minus sign' },
                { toolType: 'operator', value: '×', tooltip: 'times sign' },
                { toolType: 'operator', value: '÷', tooltip: 'division sign' },
                'fraction', 'mixedNumber', 'exponent', 'sqrt', 'cubeRoot',
                { toolType: 'operator', value: '=', tooltip: 'equal' },
                'parenthesis',
                { toolType: 'identifier', value: '%', tooltip: 'percent sign' },
                { toolType: 'operator', value: '±', tooltip: 'plus minus sign' },
                'negative',
                { toolType: 'operator', value: '·', tooltip: 'times dot' },
                { toolType: 'operator', value: '⁄', tooltip: 'division slash' },
                'bracket', 'absolute',
                { toolType: 'operator', value: '<', tooltip: 'less than' },
                { toolType: 'operator', value: '>', tooltip: 'greater than' },
                { toolType: 'operator', value: '≤', tooltip: 'less than or equal' },
                { toolType: 'operator', value: '≥', tooltip: 'greater than or equal' },
                { toolType: 'operator', value: '°', tooltip: 'degree sign' },
                { toolType: 'operator', value: 'π', tooltip: 'constant pi' },
            ];
        tools[grade.grade_9_12] = [
                { toolType: 'operator', value: '+', tooltip: 'plus sign' },
                { toolType: 'operator', value: '−', tooltip: 'minus sign' },
                { toolType: 'operator', value: '×', tooltip: 'times sign' },
                { toolType: 'operator', value: '÷', tooltip: 'division sign' },
                'fraction', 'mixedNumber', 'exponent', 'sqrt', 'cubeRoot',
                { toolType: 'operator', value: '=', tooltip: 'equal' },
                'parenthesis',
                { toolType: 'identifier', value: '%', tooltip: 'percent sign' },
                { toolType: 'operator', value: '±', tooltip: 'plus minus sign' },
                'negative',
                { toolType: 'operator', value: '·', tooltip: 'times dot' },
                { toolType: 'operator', value: '⁄', tooltip: 'division slash' },
                'bracket', 'absolute',
                { toolType: 'operator', value: '<', tooltip: 'less than' },
                { toolType: 'operator', value: '>', tooltip: 'greater than' },
                { toolType: 'operator', value: '≤', tooltip: 'less than or equal' },
                { toolType: 'operator', value: '≥', tooltip: 'greater than or equal' },
                'root', 'log',
                { toolType: 'operator', value: '°', tooltip: 'degree sign' },
                { toolType: 'operator', value: 'π', tooltip: 'constant pi' },
                { toolType: 'identifier', value: '∞', tooltip: 'infinity' },
                { toolType: 'identifier', value: 'i', tooltip: 'imaginary i' },
                { toolType: 'identifier', value: 'e', tooltip: 'exponential e' },
                { toolType: 'identifier', value: 'θ', tooltip: 'theta' },
                'sin', 'cos', 'tan', 'inverseSin', 'inverseCos', 'inverseTan'
            ];
        return tools;
    }
)
