define([
        'lib/expr-eval/expr-eval'
    ],
    function(exprEval) {

        var opToTags = {};
        opToTags['>'] = 'gt';
        opToTags['<'] = 'lt';
        opToTags['>='] = 'gte';
        opToTags['<='] = 'lte';
        opToTags['=='] = 'match';

        var parse = function parse(expression, identifier, fieldIdentifier) {
            var expr = exprEval.Parser.parse(expression),
                operands = [],
                op1, op2, field, variable, tagName, condition,
                conditions = [];
            for (var i = 0; i < expr.tokens.length; i++) {
                var item = expr.tokens[i];
                var type = item.type;
                switch (type) {
                    case 'INUMBER':
                        op1 = document.createElementNS('', 'baseValue');
                        op1.setAttribute('baseType', 'float');
                        op1.textContent = item.value;
                        operands.push(op1);
                        break;
                    case 'IOP1':
                        op1 = operands.slice(-1)[0];
                        op1.textContent = item.value + op1.textContent;
                        break;
                    case 'IOP2':
                        tagName = opToTags[item.value];
                        if (!tagName) {
                            throw new Error('Unexpected operation');    
                        }
                        op1 = operands.pop();
                        op2 = operands.pop();
                        condition = document.createElementNS('', tagName);
                        condition.appendChild(op2.cloneNode(true));
                        condition.appendChild(op1.cloneNode(true));
                        conditions.push(condition);
                        operands.push(op1);
                        break;
                    case 'IVAR':
                        field = document.createElementNS('', 'fieldValue');
                        field.setAttribute('fieldIdentifier', fieldIdentifier);
                        variable = document.createElementNS('', 'variable');
                        variable.setAttribute('identifier', identifier);
                        field.appendChild(variable);
                        operands.push(field);
                        break;
                    default:
                        throw new Error('Unexpected token');
                }
            }
            return conditions;
        };

        return {
            parse: parse,
        }
    }
)