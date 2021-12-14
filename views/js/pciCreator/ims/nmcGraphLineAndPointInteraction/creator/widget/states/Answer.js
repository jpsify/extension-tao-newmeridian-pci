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
 * Copyright (c) 2020 Open Assessment Technologies SA;
 */

define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'nmcGraphLineAndPointInteraction/creator/widget/helpers/responseCondition',
    'nmcGraphLineAndPointInteraction/creator/widget/helpers/responseConditionBuilder',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/responseCondition/default',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/responseCondition/checkElementByPoints',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/responseCondition/checkElementByParameter',
    "tpl!nmcGraphLineAndPointInteraction/creator/tpl/answer/slopeForm",
], function ($, _, stateFactory, Answer, formElement, responseCondition, rcBuilder, defaultRcTpl, elementByPointsRcTpl, elementByParamRcTpl, slopeFormTpl) {
    var DEFAULT_SLOPE_VALUE = 0;
    var StateAnswer = stateFactory.extend(Answer, function initAnswerState() {
        var widget = this.widget,
            interaction = this.widget.element;
        
        fixCorrectResponseFormat(interaction.getResponseDeclaration())

        initInteractionResponseState(interaction);
        initResponseDeclarationForm(widget);

        interaction.onPci('responseChange', function(response) {
            updateResponseDeclaration(widget, response);
            updateResponseCondition(interaction, response);
            updateSlopeValuesInForm(widget, response);
        });
    }, function exitAnswerState() {
        // unsubscribe and clean interaction state
        var interaction = this.widget.element;
        interaction.offPci('responseChange');
        interaction.resetResponse();
    });

    /**
     * If correctResponse field is Array, changes correctResponse type from Array to Object with correct field names
     * @param {Object} responseDeclaration  
     * @param {Array | Object | null} responseDeclaration.correctResponse 
     */

    function fixCorrectResponseFormat(responseDeclaration){
        var correctResponse = responseDeclaration.correctResponse;
        var newCorrectResponse = {};
        if( !_.isArray(correctResponse) ){
            return;
        }
        correctResponse.forEach(function(field){
            var fieldId = field.fieldIdentifier;
            if(fieldId){
                newCorrectResponse[fieldId] = field;
            }
        });
        responseDeclaration.setCorrect(newCorrectResponse);
        return;
    }

    /**
     * Set interaction state based on already defined correct response
     * (so that correct response will be plotted on switch to Answer widget state)
     * @param {Object} interaction nmcGraphLineAndPointInteraction
     */
    function initInteractionResponseState(interaction) {
        var responseDeclaration = interaction.getResponseDeclaration(),
            correctResponse = responseDeclaration.correctResponse,
            initResponseState = { record: [] };

        if (!correctResponse) {
            interaction.resetResponse();
            return;
        }

        _.forEach(correctResponse, function(respRecord) {
            initResponseState.record.push(
                {
                    name: respRecord.fieldIdentifier,
                    base: {
                        string: respRecord.value
                    }
                }
            );
        });
        interaction.setResponse(initResponseState);
    }

    /**
     * Creates form for adjusting response properties and assigns form callbacks
     * @param {Object} widget
     */
    function initResponseDeclarationForm(widget) {
        var interaction = widget.element,
            responseDeclaration = interaction.getResponseDeclaration();


        // remove the response processing mode selector as this interaction only supports custom rp
        widget.$responseForm.find('select[name="template"]').closest('.panel').remove();

        // NB: this overrides default state $responseForm callbacks (see answerStateHelper)! safe as we do not allow select response processing mode
        // also SCORE per response is not supported
        formElement.setChangeCallbacks(widget.$responseForm, responseDeclaration, {
            identifier: function(respDeclaration, value) {
                var previousResponseIdentifier = respDeclaration.id();

                respDeclaration.id(value);
                interaction.attr('responseIdentifier', value);

                updateResponseCondition(interaction, interaction.getResponse(), previousResponseIdentifier);
            }
        });
        _.defer(function () {
            createFormElementsForSlopeValues(widget);
        });
    }

    /**
     * Update correct responses based on what user has selected in Answer state
     * @param {Object} widget
     * @param {Object} response current user response
     */
    function updateResponseDeclaration(widget, response) {
        var responseDeclaration = widget.element.getResponseDeclaration(),
            correctResponse = {};

        _.forEach(getSlopeValuesFromForm(widget), function (slopeFormValue) {
            if (slopeFormValue.value && !isNaN(parseFloat(slopeFormValue.value))) {
                correctResponse[slopeFormValue.fieldIdentifier] = {
                    fieldIdentifier: slopeFormValue.fieldIdentifier,
                    baseType: 'float',
                    value: String(slopeFormValue.value)
                };
            }
        });

        _.forEach(response.record, function(record) {
            var fieldIdentifier = record.name;

            // determine record type by base value
            if(Object.prototype.hasOwnProperty.call(record.base, 'string')) {
                correctResponse[fieldIdentifier] = {
                    fieldIdentifier: fieldIdentifier,
                    baseType: 'string',
                    value: record.base.string
                };
            } else if (Object.prototype.hasOwnProperty.call(record.base, 'float')) {
                correctResponse[fieldIdentifier] = {
                    fieldIdentifier: fieldIdentifier,
                    baseType: 'float',
                    value: String(record.base.float) // HACK: for zeroes, otherwise setCorrect does not update XML
                };
            }
        });
        // if not response selected then there is no correct answers
        responseDeclaration.setCorrect(response.record.length ? correctResponse : {});
    }

    /**
     * Update response processing based on what user selected as correct response and elements that use slope value
     * @param {*} interaction nmcGraphLineAndPointInteraction
     * @param {*} response correct response
     * @param {String} oldResponseIdentifier response identifier of response that should be updated (used for cases when we change response identifier)
     */
    function updateResponseCondition(interaction, response, oldResponseIdentifier) {
        var responseConditionEl,
            responseIdentifier = interaction.attr('responseIdentifier'),
            elementsUsingSlopeIds = _.map(getInteractionElementsThatUseSlope(interaction), function(element) {
                return element.uid;
            }),
            expression, outcome;

        // removing from what we get in response everything about graph elements that use slope for correct response...
        var responseFieldNames = _(response.record).filter(function(responseRecord) {
            return !elementsUsingSlopeIds.some(function (elementId) {
                return responseRecord.name.indexOf(elementId) !== -1;
            });
        }).map(function (responseRecord) {
            return responseRecord.name;
        }).value();
        // ...to add it explicitly
        responseFieldNames = responseFieldNames.concat(_.map(elementsUsingSlopeIds, function(elementId) {
            return elementId + '_slope';
        }));

        if (!responseFieldNames.length) { // if no correct response use default processing schema
            responseConditionEl = $.parseXML(defaultRcTpl({
                responseIdentifier: responseIdentifier
            })).documentElement;
        } else {
            expression = makeExpressionForElements(responseFieldNames, responseIdentifier);
            outcome = rcBuilder.setSumToOutcomeValue('SCORE', '1');
            responseConditionEl = rcBuilder.createBuilder().responseIf(expression, outcome).getElement();
        }

        responseCondition.replaceResponseCondition(interaction, responseConditionEl, oldResponseIdentifier);
    }

    /**
     * Makes an expression for checking interaction elements from correct response
     * @param {Array} responseFieldNames correct response field names
     * @param {String} responseIdentifier
     *
     * @returns {Element} QTI expression as {Element}
     */
    function makeExpressionForElements(responseFieldNames, responseIdentifier) {
        var recordsAsElementConditions = _(responseFieldNames).map(function(fieldName) {
            var fieldIdentifier = fieldName;
            var templateGenerator = selectElementResponseConditionByType(fieldIdentifier);

            if (templateGenerator) {
                return $.parseXML(templateGenerator({
                    fieldIdentifier: fieldIdentifier,
                    responseIdentifier: responseIdentifier,
                })).documentElement;
            }
        }).filter(function (rc) {
            return !!rc;
        }).value();

        return rcBuilder.joinWithAndOperator(recordsAsElementConditions);
    }

    /**
     * Selects response condition template renderer based on response element type
     * Need special handling for lines as they can only be determined by it's coefficients
     * @param {String} recordFieldName response record field
     *
     * @returns {Function} Template renderer function
     */
    function selectElementResponseConditionByType(recordFieldName) {
        var isLineParameter = /(slope|xIntercept|yIntercept)$/.test(recordFieldName);
        if (/^line/.test(recordFieldName) && !isLineParameter) {
            // NO response condition for lines by its points!
            return null;
        }

        if (isLineParameter) {
            return elementByParamRcTpl;
        } else {
            return elementByPointsRcTpl;
        }
    }

    /**
     * Update slope input values based on what user has plotted
     * @param {Object} widget
     * @param {Object} response current user response
     */
    function updateSlopeValuesInForm(widget, response) {
        var $slopesForm = widget.$responseForm.find('#slopesForm');

        if (!$slopesForm[0] || !response.record || !response.record.length) {
            return;
        }

        _.forEach(response.record, function (record) {
            var fieldIdentifier = record.name,
                $slopeInput = null;

            if(/slope$/.test(fieldIdentifier)) {
                $slopeInput = $slopesForm.find('input#' + fieldIdentifier);
                if ($slopeInput[0]) {
                    $slopeInput.val(parseFloat(record.base.float));
                }
            }
        });
    }

    /**
     * Gets list of slope values for graph elements from slope form
     * @typedef {Object} SlopeFormValue
     * @property {String} fieldIdentifier slope field identifier
     * @property {String|Number} value slope value
     * @param {Object} widget
     * @returns {Array.<SlopeFormValue>} array of objects, each one of which contains slopeFieldIdentifier and slopeValue
     */
    function getSlopeValuesFromForm(widget) {
        var interaction = widget.element,
            $slopesForm = widget.$responseForm.find('#slopesForm'),
            elementsUsingSlopes = getInteractionElementsThatUseSlope(interaction),
            slopeValues = [];

        if (!$slopesForm[0] || elementsUsingSlopes.length === 0) {
            return;
        }

        slopeValues = _.map(elementsUsingSlopes, function (element) {
            var slopeInput = $slopesForm.find('input#' + element.uid + '_slope');
            return {
                fieldIdentifier: element.uid + '_slope',
                value: slopeInput[0].value
            };
        });
        return slopeValues;
    }

    /**
     * Get graph elements that has useSlope setting set (possible only for lines, segments and setOfPoints)
     * @param {Object} interaction nmcLineAndPointInteraction object
     * @returns {Array} array of graph elements
     */
    function getInteractionElementsThatUseSlope(interaction) {
        var graphElements = interaction.prop('graphs'),
            elementsWithSlopes = [];

        if (graphElements.lines.count === 0 && graphElements.segments.count === 0 && graphElements.setPoints.count === 0) {
            return [];
        }

        elementsWithSlopes = [].concat(graphElements.setPoints.elements, graphElements.segments.elements, graphElements.lines.elements);
        return _.filter(elementsWithSlopes, function(element) {
            return element.useSlope;
        });
    }

    /**
     * Creates inputs for entering a slope values if there are any graph elements that need it
     * @param {Object} widget
     */
    function createFormElementsForSlopeValues(widget) {
        var interaction = widget.element,
            graphElements = interaction.prop('graphs'),
            elementsWithSlopes = [],
            $slopesForm = $('<div id="slopesForm" class="panel" />').append(document.createElement('hr'));

        if (graphElements.lines.count === 0 && graphElements.segments.count === 0 && graphElements.setPoints.count === 0) {
            // slope values makes sense only for lines, segments and sets of points
            return;
        }

        elementsWithSlopes = [].concat(graphElements.setPoints.elements, graphElements.segments.elements, graphElements.lines.elements);
        _.forEach(elementsWithSlopes, function(element) {
            createSlopeFormForElement(element, $slopesForm, widget);
        });

        widget.$responseForm.find('#slopesForm').remove();
        widget.$responseForm.append($slopesForm);
    }

    /**
     * Creates and attaches form for entering slope values for single graph element
     * @param {Object} element graph element
     * @param {Node} $slopesForm jQuery node with common form element for all slopes to attach created form to
     * @param {Object} widget
     */
    function createSlopeFormForElement(element, $slopesForm, widget) {
        var interaction = widget.element,
            responseDeclaration = interaction.getResponseDeclaration(),
            correctResponse = responseDeclaration.correctResponse,
            slopeFieldIdentifier = element.uid + '_slope',
            initSlopeValue,
            $slopeFormForElement;

        if (correctResponse && correctResponse[slopeFieldIdentifier] &&
            !isNaN(parseFloat(correctResponse[slopeFieldIdentifier].value))) {
            initSlopeValue = correctResponse[slopeFieldIdentifier].value;
        } else {
            initSlopeValue = DEFAULT_SLOPE_VALUE;
        }

        $slopeFormForElement = $(slopeFormTpl({
            label: element.label,
            useSlope: element.useSlope,
            slopeFieldIdentifier: slopeFieldIdentifier,
            slopeValue: initSlopeValue
        }));

        formElement.initWidget($slopeFormForElement);

        formElement.setChangeCallbacks($slopeFormForElement, element, {
            useSlope: function(el, useSlopeValue) {
                el['useSlope'] = useSlopeValue;
                interaction.triggerPci('configChange', [interaction.getProperties()]);
                interaction.triggerPci('clearElementPoints', [el.uid]);
                removeGraphElementResponse(responseDeclaration, el.uid);
                if (useSlopeValue) {
                    setCorrectSlopeResponse(responseDeclaration, slopeFieldIdentifier, DEFAULT_SLOPE_VALUE);
                }
                updateResponseCondition(interaction, interaction.getResponse());
                createFormElementsForSlopeValues(widget); // redrawing the form
            },
            slopeValue: function(el, value) {
                interaction.triggerPci('clearElementPoints', [el.uid]);
                removeGraphElementResponse(responseDeclaration, el.uid);
                setCorrectSlopeResponse(responseDeclaration, slopeFieldIdentifier, value);
                updateResponseCondition(interaction, interaction.getResponse());
            }
        });
        $slopesForm.append($slopeFormForElement);
    }

    /**
     * Sets correct response record for graph element's slope value
     * @param {Object} responseDeclaration interaction's <responseDeclaration> section object
     * @param {String} slopeFieldIdentifier graph element slope correct value field id
     * @param {String|Number} slopeValue correct slope value
     */
    function setCorrectSlopeResponse(responseDeclaration, slopeFieldIdentifier, slopeValue) {
        var correctResponse = _.clone(responseDeclaration.correctResponse) || {};

        correctResponse[slopeFieldIdentifier] = {
            fieldIdentifier: slopeFieldIdentifier,
            baseType: 'float',
            value: String(slopeValue) // HACK: for zeroes, otherwise setCorrect does not update XML
        };
        responseDeclaration.setCorrect(correctResponse);
    }

    /**
     * Removes response record for graph element's slope value
     * @param {Object} responseDeclaration interaction's <responseDeclaration> section object
     * @param {String} graphElementId graph element id
     */
    function removeGraphElementResponse(responseDeclaration, graphElementId) {
        var correctResponse = _.clone(responseDeclaration.correctResponse),
            responseRecords = correctResponse ? Object.keys(correctResponse) : null;

        if (!correctResponse) return;

        _.forEach(responseRecords, function (responseRecord) {
            if(responseRecord.indexOf(graphElementId) !== -1) { // if response record contains graph element id (id_slope, id_intercept etc)
                delete correctResponse[responseRecord];
            }
        });
        responseDeclaration.setCorrect(correctResponse);
    }

    return StateAnswer;
});
