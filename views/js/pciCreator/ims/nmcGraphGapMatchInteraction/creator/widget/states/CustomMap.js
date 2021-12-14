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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 */

define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'jquery',
    'lodash',
    'i18n',

    'taoQtiItem/qtiCreator/widgets/interactions/helpers/pairScoringForm',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',

    'tpl!nmcGraphGapMatchInteraction/creator/tpl/mapTemplate',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/responseProps',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/mapPartialScoreRow',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/mapTargetIntervalsToScore',
    'nmcGraphGapMatchInteraction/creator/helpers/response',
], function (
    stateFactory,
    $,
    _,
    __,

    scoringFormFactory,
    xmlRenderer,

    mapTpl,
    responsePropsTpl,
    mapPartialScoreRowTpl,
    mapTargetIntervalsToScoreTpl,
    responseMethods,

) {
    'use strict';
    var stateName = "customMap";
    var scoringForm;
    var StateCustom = stateFactory.create(
        stateName,
        ["answer", "active"],
        init,
        exit,
    );
    function init() {
        var widget = this.widget;
        var interaction = widget.element;
        var parentItem = interaction.getRootElement();
        var outcomeScore;
        if(!parentItem.getOutcomeDeclaration('SCORE')){
            outcomeScore = parentItem.createOutcomeDeclaration({
                cardinality : 'single',
                baseType : 'float'
            });
            outcomeScore.buildIdentifier('SCORE', false);
        }
        updateForm(widget);
        responseMethods.updateResponseProcessing(widget, getMapConditions(widget), stateName);
        renderUi(widget);
        widget.element.prop('preserveImgCount', false);
    }
    function exit() {
        var widget = this.widget;
        destroyScoringForm();
        destroyUi(this.widget);
        responseMethods.updateResponseProcessing(widget, getMapConditions(widget), stateName);
    }
    var updateForm = function updateForm(widget) {
        var props = widget.element.properties;

        var gapImgs = props.gaps || [];
        var choices = typeof (props.choices) === 'string' ? JSON.parse(props.choices) : props.choices || [];
        var mapToPairs = function mapToPairs(item) {
            return {
                id: item.identifier,
                value: item.identifier,
            };
        }

        var options = {
            leftTitle: __('Gap Image'),
            rightTitle: __('Associable Hotspot'),
            type: 'directedPair',
            pairLeft: function () {
                return gapImgs.map(mapToPairs);
            },
            formatLeft: function (id) {
                return id + '';
            },
            pairRight: function () {
                return choices.map(mapToPairs);
            },
        };

        scoringForm = scoringFormFactory(widget, options);
    };

    function destroyScoringForm() {
        scoringForm.destroy();
    };

    function getMapScoreCondition(targetToScoreArrArr, targetOutcome) {
        var xml;
        var map = targetToScoreArrArr.map(function (item) {
            return {
                targetValue: item[0],
                score: item[1],
            }
        }).sort(function (a, b) {
            return b.targetValue - a.targetValue;
        });
        xml = mapTargetIntervalsToScoreTpl({
            target: targetOutcome,
            map: map,
        })
        return responseMethods.xmlToCondition(xml);
    }
    function getMapTargetCondition(responseId, targetOutcome) {
        var xml = mapTpl({
            id: responseId,
            target: targetOutcome
        })
        return responseMethods.xmlToCondition(xml);
    }

    function getMapConditions(widget) {
        var interaction = widget.element;
        var targetOutcomeId = responseMethods.getTargetOutcomeId(widget);
        var responseId = interaction.attr('responseIdentifier');
        var targetToScore = getRpMapTargetToScore(widget);
        var conditions = [
            getMapTargetCondition(responseId, targetOutcomeId),
            getMapScoreCondition(targetToScore, targetOutcomeId)
        ]
        return conditions;
    };

    function getRpMapTargetToScore(widget) {
        var interaction = widget.element;
        var targetToScore = interaction.data('rpMapTargetToScore');
        var max;
        var mapEntries;

        if (targetToScore) {
            return targetToScore;
        }

        targetToScore = getTargetToScoreFromXml(widget);
        if (targetToScore && targetToScore.length > 0) {
            interaction.data('rpMapTargetToScore', targetToScore);
            return targetToScore;
        }

        mapEntries = interaction.getResponseDeclaration().mapEntries;
        max = Object.keys(mapEntries).map(function (key) {
            return mapEntries[key];
        }).filter(function (a) {
            return a > 0;
        }).reduce(function (a, b) {
            return a + b;
        }, 0);
        targetToScore = [[max, 0]];
        interaction.data('rpMapTargetToScore', targetToScore);
        return targetToScore;
    };

    function getTargetToScoreFromXml(widget) {
        var interaction = widget.element;
        var item = interaction.getRootElement();
        var rp = item.responseProcessing;
        var renderedRp = rp.render(xmlRenderer.get());
        var $rpXml = $($.parseXML(renderedRp));
        var targetOutcomeId = responseMethods.getTargetOutcomeId(widget);

        var parents = $rpXml.find('variable[identifier="' + targetOutcomeId + '"] + baseValue').closest('responseCondition').children().toArray();

        var entries = parents.map(function (parent) {
            var target = parseFloat(parent.querySelector('gte baseValue').textContent);
            var score = parseFloat(parent.querySelector('setOutcomeValue baseValue').textContent);
            return [target, score];
        });
        return entries;
    };

    function renderUi(widget) {
        var dom = widget.$container[0];
        var container = dom.querySelector('.mapping-editor');
        var interaction = widget.element;
        var partialScores = getRpMapTargetToScore(widget);

        var respProps = $(responsePropsTpl({
            ns: partialScores,
        }))[0];
        var scoreInputs = respProps.querySelectorAll('input');
        var newScoreBtn = respProps.querySelector('.new-partial-score');
        var deleteBtns = respProps.querySelectorAll('.custom-score-delete');

        scoreInputs.forEach(function (input) {
            input.addEventListener('change', updateTargetScoreMap);
        });

        newScoreBtn.addEventListener('click', createNewScore);

        deleteBtns.forEach(function (elem) {
            elem.addEventListener('click', deleteRow);
        });




        container.appendChild(respProps);

        function updateTargetScoreMap() {
            var rows = container.querySelectorAll('.custom-score');
            var entries = Array.prototype.slice.call(rows).map(function (elem) {
                var targetInput = elem.querySelector('.custom-target-input');
                var scoreInput = elem.querySelector('.custom-score-input');
                var target;
                var score;
                if (!targetInput || !scoreInput) {
                    return;
                }
                target = parseFloat(targetInput.value) || 0;
                score = parseFloat(scoreInput.value) || 0;
                return [target, score];
            });
            interaction.data('rpMapTargetToScore', entries);
        };

        function createNewScore() {
            var parent = respProps.querySelector('tbody');
            var newRow = $(mapPartialScoreRowTpl())[0];
            newRow.querySelectorAll('input').forEach(function (input) {
                input.addEventListener('change', updateTargetScoreMap);
            });
            newRow.querySelector('.custom-score-delete').addEventListener('click', deleteRow);
            parent.appendChild(newRow);
        };

        function deleteRow(e) {
            var row = $(e.currentTarget).closest('.custom-score')[0];
            var key = row.querySelector('.custom-target-input').value;
            var targetToScore = getRpMapTargetToScore(widget);
            targetToScore = targetToScore.filter(function (entry) {
                return entry[0] !== parseFloat(key);
            });
            interaction.data('rpMapTargetToScore', targetToScore);
            row.remove();
        };

    };
    function destroyUi(widget) {
        var dom = widget.$container[0];
        var container = dom.querySelector('.custom-score-container');
        if (container) {
            container.remove();
        }

    };

    return StateCustom;
});
