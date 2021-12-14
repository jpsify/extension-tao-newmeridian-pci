/**
 * Copyright (c) 2020 Open Assessment Technologies SA ;
 */

define(function () {
    var tools = [
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
        {
            id: 'symbols',
            title: 'Symbols',
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
                'fraction', 'mixedNumber', 'exponent', 'sqrt', 'cubeRoot', 'root', 'subscript',
                { toolType: 'operator', value: 'π', tooltip: 'constant pi' },
                { toolType: 'identifier', value: '∞', tooltip: 'infinity' },
                'parenthesis',
                { toolType: 'identifier', value: 'λ', tooltip: 'small lambda' },
                { toolType: 'identifier', value: 'Δ', tooltip: 'capital delta' },
                { toolType: 'identifier', value: 'Ω', tooltip: 'capital omega' },
                { toolType: 'operator', value: '°', tooltip: 'degree sign' },
            ]
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
                { toolType: 'operator', value: 'π', tooltip: 'constant pi' },
                'sin', 'cos', 'tan', 'inverseSin', 'inverseCos', 'inverseTan',
                { toolType: 'identifier', value: 'θ', tooltip: 'theta' },
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
            id: 'relations',
            title: 'Relations',
            tools: _.map([
                ['=', 'equal'],
                ['≠', 'not equal'],
                ['∼', 'similar'],
                ['≁', 'not similar'],
                ['<', 'less than'],
                ['>', 'greater than'],
                ['≃', 'similar or equal'],
                ['≄', 'not similar or equal'],
                ['≤', 'less than or equal'],
                ['≥', 'greater than or equal'],
                ['≈', 'approximately equal'],
                ['≉', 'not approximately equal'],
                ['≡', 'equivalent'],
                ['≢', 'not equivalent'],
                ['≅', 'congruent'],
                ['≇', 'not congruent'],
                ['≺', 'precedes'],
                ['≻', 'succeeds'],
                ['≐', 'dot equal'],
                ['≑', 'dot equal dot'],
                [':', 'ratio'],
                ['::', 'proportion'],
                ['≪', 'much less than'],
                ['≫', 'much greater than'],
                ['⪡', 'nested less than'],
                ['⪢', 'nested greater than'],
                ['∝', 'varies as'],
                ['≎', 'equivalence']
            ], function (c) { return { toolType: 'operator', value: c[0], tooltip: c[1] } }),
        },
        {
            id: 'greek',
            title: 'Greek',
            tools: _.map([['Α', 'capital alpha'], ['Β', 'capital beta'], ['Γ', 'capital gamma'], ['Δ', 'capital delta'], ['Ε', 'capital epsilon'], ['Ζ', 'capital zeta'], ['Η', 'capital eta'], ['Θ', 'capital theta'], ['Ι', 'capital iota'], ['Κ', 'capital kappa'], ['Λ', 'capital lambda'], ['Μ', 'capital mu'], ['Ν', 'capital nu'], ['Ξ', 'capital xi'], ['Ο', 'capital omicron'], ['Π', 'capital pi'], ['Ρ', 'capital rho'], ['Σ', 'capital sigma'], ['Τ', 'capital tau'], ['Υ', 'capital upsilon'], ['Φ', 'capital phi'], ['Χ', 'capital chi'], ['Ψ', 'capital psi'], ['Ω', 'capital omega'],
            ['α', 'small alpha'], ['β', 'small beta'], ['γ', 'small gamma'], ['δ', 'small delta'], ['ε', 'small epsilon'], ['ζ', 'small zeta'], ['η', 'small eta'], ['θ', 'small theta'], ['ι', 'small iota'], ['κ', 'small kappa'], ['λ', 'small lambda'], ['μ', 'small mu'], ['ν', 'small nu'], ['ξ', 'small xi'], ['ο', 'small omicron'], ['π', 'small pi'], ['ρ', 'small rho'], ['σ', 'small sigma'], ['τ', 'small tau'], ['υ', 'small upsilon'], ['φ', 'small phi'], ['χ', 'small chi'], ['ψ', 'small psi'], ['ω', 'small omega'],
            ['ϐ', 'beta symbol'], ['ϵ', 'epsilon symbol'], ['ϑ', 'theta symbol'], ['ϰ', 'kappa symbol'], ['ϖ', 'pi symbol'], ['ϱ', 'rho symbol'], ['ς', 'sigma symbol'], ['ϕ', 'phi symbol'], ['ϙ', 'qoph'], ['ϛ', 'stigma'], ['ϝ', 'digamma'], ['ϡ', 'sampi']], function (c) { return { toolType: 'identifier', value: c[0], tooltip: c[1] } }),
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
        }
    ];
    return tools;
}
)
