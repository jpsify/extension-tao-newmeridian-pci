/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *  
 */


define([
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'tpl!nmcEquationEditorInteraction/creator/tpl/answerForm',
    'nmcEquationEditorInteraction/creator/widget/expressionParser/parser',
], function(_, $, __, stateFactory, Answer, formElement, xmlRenderer, answerFormTpl, Parser){

    var StateAnswer = stateFactory.extend(Answer, function(){

        initResponseDeclarationWidget(this.widget);
        
    }, function(){
        
        destroyResponseDeclarationWidget(this.widget);
    });

    /**
     * Set the correct response to the state of interaction and set the correct response listener
     *
     * @param widget
     */
    function initResponseDeclarationWidget(widget){

        var interaction = widget.element;
        if (!interaction.prop('useGapExpression') || interaction.prop('keyboardBehavior') === 'NumbersMathAndText') {
            return;
        }

        var responseDeclaration = interaction.getResponseDeclaration(),
            responseIdentifier = responseDeclaration.attr('identifier');
            correctResponse = responseDeclaration.correctResponse || {},
            expression = interaction.prop('expression'),
            gaps = {},
            editable = $(expression).find('mrow[editable=true]').toArray(),
            callbacks = {};

        if (_.isArray(correctResponse)) {
            correctResponse = {};
        }
        
        gaps = editable.reduce(
            function(acc, value, idx) {
                var field = correctResponse['gap_' + idx + '_expression'];
                acc[idx] = { expression: field ? field.value : '' };
                return acc;
            }, gaps
        );

        var $form = $(answerFormTpl({
            gaps : gaps
        }));
        widget.$responseForm.append($form);

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        var expressionChanged = function expressionChanged(interaction, value, gap) {
            var fieldIdentifier = 'gap_' + gap + '_expression';
            correctResponse[fieldIdentifier] = {
                fieldIdentifier: fieldIdentifier,
                baseType: 'string',
                value: value,
            };
            responseDeclaration.setCorrect(correctResponse);

            updateResponseProcessing();
        };

        var getExpression = function getExpression() {
            var conditions = [];
            _.forEach(correctResponse, function(gap, fieldIdentifier) {
                try {
                    var expressions = Parser.parse(gap.value, responseIdentifier, fieldIdentifier.replace('expression', 'value'));
                    conditions = _.union(conditions, expressions)
                } catch (err) {
                    //TODO:
                    //parse exception
                }
            });
            if (conditions.length) {
                var andElement = document.createElementNS('', 'and');
                conditions.forEach(function(el) {andElement.appendChild(el)});
                return andElement;
            }
        };

        var getResponseCondition = function getResponseCondition(expression, scoreIdentifier) {
            var responseCondition = document.createElementNS('', 'responseCondition'),
                responseIf = document.createElementNS('', 'responseIf'),
                setOutcomeValue = document.createElementNS('', 'setOutcomeValue'),
                sum = document.createElementNS('', 'sum'),
                variable = document.createElementNS('', 'variable'),
                baseValue = document.createElementNS('', 'baseValue');

            responseCondition.appendChild(responseIf);
            responseIf.appendChild(expression);
            setOutcomeValue.setAttribute('identifier', scoreIdentifier);
            responseIf.appendChild(setOutcomeValue);
            setOutcomeValue.appendChild(sum);
            variable.setAttribute('identifier', scoreIdentifier);
            sum.appendChild(variable);
            baseValue.setAttribute('baseType', 'integer');
            baseValue.textContent = '1';
            sum.appendChild(baseValue);

            return responseCondition;
        }

        var updateResponseProcessing = function updateResponseProcessing() {
            var item = interaction.getRelatedItem(),
                rp = item.responseProcessing,
                renderedRp = rp.render(xmlRenderer.get()) || '<responseProcessing template=\"EMPTY\"/>',
                $rpXml = $($.parseXML(renderedRp)),
                $respVar = $rpXml.find('variable[identifier="'+responseIdentifier+'"]'),
                $responseCondition = $respVar.parents('responseCondition'),
                expression = getExpression();
            if (expression) {
                var newRc = getResponseCondition(expression, 'SCORE');

                if ($responseCondition.length) {
                    $responseCondition[0].parentNode.removeChild($responseCondition[0]);
                }
                $rpXml[0].documentElement.appendChild(newRc);
                var xml = (new XMLSerializer()).serializeToString($rpXml[0].documentElement);
                rp.setProcessingType('custom');
                rp.xml = xml;
            }
        }

        callbacks = editable.reduce(function(acc, value, idx) {
            acc[idx] = expressionChanged;
            return acc;
        }, callbacks);
        formElement.setChangeCallbacks($form, responseDeclaration, callbacks);

        //remove the response processing mode selector as this interaction only supports custom rp
        widget.$responseForm.find('select[name="template"]').closest('.panel').remove();
    }

    /**
     * Restore default interaction state and remove listeners
     *
     * @param widget
     */
    function destroyResponseDeclarationWidget(widget){
        var interaction = widget.element;
        interaction.offPci('responseChange');
        interaction.resetResponse();
    }

    return StateAnswer;
});
