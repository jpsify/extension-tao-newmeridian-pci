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
    'taoQtiItem/qtiCreator/widgets/interactions/states/Custom',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!nmcFractionModelInteraction/creator/tpl/answerForm',
    'tpl!nmcFractionModelInteraction/creator/tpl/excludedValueRow',
    'tpl!nmcFractionModelInteraction/creator/tpl/responseCondition',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
], function (
    _,
    $,
    __,
    stateFactory,
    Custom,
    formElement,
    answerFormTpl,
    excludedValeRowTpl,
    rcTpl,
    xmlRenderer,
) {

    var StateCustom = stateFactory.create(Custom, function () {
        var widget = this.widget;
        var interaction = widget.element;
        adjustResonseXml(interaction);
        initResponseDeclarationWidget(this.widget);
        initResponseDeclarationForm(this.widget);
    }, function () {
        destroyResponseDeclarationWidget(this.widget);
        destroyResponseDeclarationForm(this.widget);
    });
    function destroyResponseDeclarationForm(widget) {
        widget.$responseForm.parent().find('.fraction-model-panel').remove();
    }

    function adjustResonseXml(interaction) {
        var item = interaction.getRootElement();
        var rp = item.responseProcessing;
        var renderedRp = rp.render(xmlRenderer.get()) || '<responseProcessing template=\"EMPTY\"/>';
        var $rpXml = $($.parseXML(renderedRp));
        var responseIdentifier = interaction.attr('responseIdentifier');
        var $respVar;
        var $conditionParent;
        var newResponseConditionXml;
        var rcXml;
        var newRc;
        var outcomeScore;

        //remove default xml left after changing to match ot map response modes
        var $matchConditionParent = $rpXml.find('match variable[identifier="'+responseIdentifier+'"]').closest('responseCondition');
        var $mapConditionParent = $rpXml.find('mapResponse[identifier="'+responseIdentifier+'"]').closest('responseCondition');
        $matchConditionParent.remove();
        $mapConditionParent.remove();
        
        //add default xml for custom mode
        $respVar = $rpXml.find('variable[identifier="'+responseIdentifier+'"]');
        $conditionParent = $respVar.closest('responseCondition');
        if($conditionParent.length === 0){
            newResponseConditionXml =  rcTpl({
                responseIdentifier: interaction.attr('responseIdentifier'),
                score: 1
            });
            rcXml = $.parseXML(newResponseConditionXml);
            newRc = $rpXml[0].importNode(rcXml.documentElement, true);
            $rpXml[0].documentElement.appendChild(newRc);
        }

        if(!item.getOutcomeDeclaration('SCORE')){
            outcomeScore = item.createOutcomeDeclaration({
                cardinality : 'single',
                baseType : 'float'
            });
            outcomeScore.buildIdentifier('SCORE', false);
        }
        rp.xml = (new XMLSerializer()).serializeToString($rpXml[0].documentElement);
    }
    /**
     * Init the form to edit the response declaration option
     *
     * @param widget
     */
    function initResponseDeclarationForm(widget) {
        var responseDeclaration = widget.element.getResponseDeclaration();
        var excludedValues = getRpExcludedValues(widget);

        var $form = $(answerFormTpl({
            exactMatch: getCorrectResponseRecordEntryValue(responseDeclaration, 'exactMatch') === '1',
            excludedValues: excludedValues.map(function (ev) {
                var ft = ev.split('/');
                return {
                    fractions: ft[0],
                    total: ft[1]
                };
            })
        }));

        var fractionInputs = $form.find('tbody input');
        var newExcludedValueBtn = $form.find('.new-excluded-value');
        var deleteBtns = $form.find('.excluded-value-delete');

        fractionInputs.on('change', updateExcludedValues);
        newExcludedValueBtn.on('click', createNewExcludedValue);
        deleteBtns.on('click', deleteRow);

        widget.$responseForm.after($form);

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, responseDeclaration, {
            exactMatch: function updateEquation(r, value) {
                setCorrectResponseRecordEntry(responseDeclaration, 'exactMatch', 'string', value ? '1' : '0');
            }
        });

        function updateExcludedValues() {
            var rows = $form.find('.excluded-value-row');
            var entries = rows.map(function (i, elem) {
                var fractionsInput = $(elem).find('.fractions-num-input');
                var totalInput = $(elem).find('.fractions-total-input');
                var fractions;
                var total;
                if (!fractionsInput || !totalInput) {
                    return;
                }
                fractions = parseInt($(fractionsInput).val(), 10) || 0;
                total = parseInt($(totalInput).val(), 10) || 0;
                return fractions + '/' + total;
            });
            setRpExcludedValues(entries.toArray());
        };

        function createNewExcludedValue() {

            var parent = $form.find('tbody');
            var newRow = $(excludedValeRowTpl());
            newRow.find('input').each(function (i, input) {
                $(input).on('change', updateExcludedValues);
            });
            newRow.find('.excluded-value-delete').on('click', deleteRow);

            formElement.initWidget(newRow);

            parent.append(newRow);

        };

        function deleteRow(e) {
            var row = $(e.currentTarget).closest('.excluded-value-row')[0];
            row.remove();
            updateExcludedValues();
        };

        function getRpExcludedValues() {
            var excludedValues = getCorrectResponseRecordEntryValue(responseDeclaration, 'excludedValues');
            return excludedValues ? excludedValues.split(',') : [];
        };

        function setRpExcludedValues(excludedValues) {
            return setCorrectResponseRecordEntry(responseDeclaration, 'excludedValues', 'string', excludedValues.reduce(function (acc, cv) { return acc + (acc ? ',' : '') + cv; }, ''));
        };

    }


    /**
     * Set the correct response to the state of interaction and set the correct response listener
     *
     * @param widget
     */
    function initResponseDeclarationWidget(widget) {

        var interaction = widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();
        var correctResponse = getCorrectResponseRecordEntryValue(responseDeclaration, 'sampleResponse');
        var correct = correctResponse ? correctResponse : ('0/' + interaction.prop('partitionInit'));

        //set correct response as defined in the model
        interaction.setResponse({
            record: [
                {
                    name: 'response',
                    base: { string: correct }
                }
            ]
        });

        //init editing widget event listener
        interaction.onPci('responseChange', function (response) {

            if (response &&
                _.isArray(response.record) &&
                response.record[0] &&
                response.record[0].name === 'response' &&
                response.record[0].base &&
                response.record[0].base.string
            ) {
                setCorrectResponseRecordEntry(responseDeclaration, 'sampleResponse', 'string', response.record[0].base.string);
            }

        });

        //remove the response processing mode selector as this interaction only supports custom rp
        // widget.$responseForm.find('select[name="template"]').closest('.panel').remove();
    }

    /**
     * Restore default interaction state and remove listeners
     *
     * @param widget
     */
    function destroyResponseDeclarationWidget(widget) {
        var interaction = widget.element;
        interaction.offPci('responseChange');
        interaction.resetResponse();
    }

    /**
     * Set an entry into the record typed correct response
     *
     * @param responseDeclaration
     * @param fieldIdentifier
     * @param baseType
     * @param value
     */
    function setCorrectResponseRecordEntry(responseDeclaration, fieldIdentifier, baseType, value) {
        var record = responseDeclaration.correctResponse;
        var recordEntry = _.find(record, { fieldIdentifier: fieldIdentifier });
        if (!recordEntry) {
            recordEntry = { fieldIdentifier: fieldIdentifier };
            responseDeclaration.correctResponse[fieldIdentifier] = recordEntry;
        }
        recordEntry.baseType = baseType;
        recordEntry.value = value;
    }

    /**
     * Get an entry from the record typed correct response
     *
     * @param responseDeclaration
     * @param fieldIdentifier
     * @returns {*}
     */
    function getCorrectResponseRecordEntryValue(responseDeclaration, fieldIdentifier) {
        var record = responseDeclaration.correctResponse;
        var recordEntry = _.find(record, { fieldIdentifier: fieldIdentifier });
        if (recordEntry) {
            return recordEntry.value;
        }
    }

    return StateCustom;
});
