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
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/partialScoreContainer',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/mappedValueInput',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/mappedValueInputInSvg',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/mapTargetValueScore',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/accociableHotspotRp',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'nmcGraphGapMatchInteraction/creator/helpers/response',

], function (
    stateFactory,
    partialScoreContainerTpl,
    mappedValueInputTpl,
    mappedValueInputInSvgTpl,
    mapTargetValueScoreTpl,
    accociableHotspotRpTpl,
    xmlRenderer,
    responseMethods,
) {
    'use strict';
    var stateName = "customMapChoiceSumToGap";

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
        resetRpMapTargetToScore(widget)
        renderUi(widget);
        renderUiChoices(widget);
        renderUiGaps(widget);
        widget.element.prop('preserveImgCount', false);
    }
    function exit() {
        var widget = this.widget;
        destroyUi(widget);
        responseMethods.updateResponseProcessing(widget, getConditions(widget), stateName);

    }

    function renderUi(widget) {
        var dom = widget.$container[0];
        var container = dom.querySelector('.qti-interaction.qti-customInteraction');
        var interaction = widget.element;
        var partialScores = getRpMapTargetToScore(widget);
        var max = Object.keys(partialScores).sort(function (a, b) {
            return parseInt(b, 10) - parseInt(a, 10);
        })[0];
        var respProps = $(partialScoreContainerTpl({
            maxCorrect: max,
            ns: partialScores,
        }))[0];
        var inputs = respProps.querySelectorAll('input');

        inputs.forEach(function (input) {
            input.addEventListener('change', onInputChange);
        });

        container.appendChild(respProps);

        function onInputChange(e) {
            var data = getRpMapTargetToScore(widget);
            data[e.target.name] = parseFloat(e.target.value) || 0;
            interaction.data('rpMapMatchTargetToScore', data);
        }
    }
    /**
     * @returns { Object }
     */
    function getRpMapTargetToScore(widget) {
        var interaction = widget.element;
        var targetToScore = interaction.data('rpMapMatchTargetToScore');
        var max = getChoicesArray(widget).length;

        if (targetToScore) {
            return targetToScore;
        }

        targetToScore = getTargetToScoreFromXml(widget);
        if (!targetToScore) {
            max = getChoicesArray(widget).length;
            targetToScore = {};
            targetToScore[max] = 1;
        }
        interaction.data('rpMapMatchTargetToScore', targetToScore);
        return targetToScore;
    };

    function resetRpMapTargetToScore(widget) {
        var result = {};
        var interaction = widget.element;
        var fromXml = getTargetToScoreFromXml(widget) || {};

        getChoicesArray(widget).forEach(function (item, i) {
            result[i + 1] = fromXml[i + 1] || 0;
        });
        interaction.data('rpMapMatchTargetToScore', result);
    }
    /**
     * @returns { Object }
     */
    function getTargetToScoreFromXml(widget) {
        var interaction = widget.element;
        var item = interaction.getRootElement();
        var rp = item.responseProcessing;
        var renderedRp = rp.render(xmlRenderer.get());
        var $rpXml = $($.parseXML(renderedRp));
        var targetOutcomeId = responseMethods.getTargetOutcomeId(widget);
        var result = {};

        var parentArray = $rpXml.find('variable[identifier="' + targetOutcomeId + '"] + baseValue')
            .closest('responseCondition')
            .toArray();
        if (parentArray.length === 0) {
            return;
        }
        parentArray.forEach(function (parent) {
            var targetElem = parent.querySelector('match baseValue');
            var scoreElem = parent.querySelector('setOutcomeValue baseValue');
            var target;
            var score;
            if (!targetElem) {
                return;
            }
            target = parseFloat(targetElem.textContent);
            score = scoreElem ? parseFloat(scoreElem.textContent) : 0;
            result[target] = score || 0;
        });;

        return result;
    };

    function renderUiGaps(widget) {
        var dom = widget.$container[0];
        var gapImgs = getGapsArray(widget);
        var gapSelector = '.qti-gapImg.qti-choice';
        gapImgs.map(function (gap) {
            return gap.identifier;
        }).map(function (gapId) {
            return {
                id: gapId,
                value: getGapValue(widget, gapId),
                elem: dom.querySelector('[data-identifier="' + gapId + '"]' + gapSelector),
            };
        }).forEach(function (gap) {
            var input = $(mappedValueInputTpl(gap))[0];
            input.addEventListener('change', onChange);
            gap.elem.appendChild(input);
            function onChange(e) {
                setGapValue(widget, gap.id, e.target.value);
            }
        });
    };
    /**
     * @returns { Array }
     */
    function getGapsArray(widget) {
        return widget.element.properties.gaps || [];
    }
    /**
     * @returns { Object }
     */
    function getChoicesArray(widget) {
        var props = widget.element.properties;
        return typeof (props.choices) === 'string' ? JSON.parse(props.choices) : props.choices || [];
    }
    /**
     * @param {string} id
     * @returns {number}
     */
    function getGapValue(widget, id) {
        var vals = getGapValuesMap(widget);
        var val = 0;

        if (vals) {
            vals.some(function (item) {
                if (item.id === id) {
                    val = item.value;
                    return true;
                }
                return false;
            });
        }
        return val;
    }
    /**
     * @param {string} id
     * @returns {number}
     */
    function getChoiceValue(widget, id) {
        var vals = getRpChoiceValuesMap(widget);
        var val = 0;
        if (vals) {
            vals.some(function (item) {
                if (item.id === id) {
                    val = item.value;
                    return true;
                }
                return false;
            });
        }
        return val;
    }
    /**
     * 
     * @returns {Array} 
     */
    function getRpChoiceValuesMap(widget) {
        var interaction = widget.element;
        var choiceValuesMap = interaction.data('rpChoiceValues');

        if (choiceValuesMap) {
            return choiceValuesMap;
        }

        choiceValuesMap = getChoiceValuesMapFromXml(widget) || [];
        interaction.data('rpChoiceValues', choiceValuesMap);
        return choiceValuesMap;
    }
    /**
     * @returns {Array}
     */
    function getChoiceValuesMapFromXml(widget) {
        var interaction = widget.element;
        var item = interaction.getRootElement();
        var rp = item.responseProcessing;
        var renderedRp = rp.render(xmlRenderer.get());
        var $rpXml = $($.parseXML(renderedRp));
        var targetOutcomeId = responseMethods.getTargetOutcomeId(widget);
        var result = [];
        $rpXml.find('setOutcomeValue[identifier="' + targetOutcomeId + '"] sum')
            .closest('responseCondition')
            .toArray()
            .forEach(function (parent) {
                var id = parent.querySelector('isNull baseValue').textContent;
                var value = parent.querySelector(' match baseValue').textContent;
                result.push({
                    id: id,
                    value: value
                });
            });

        return result;
    }
    /**
     * @returns {Array}
     */
    function getGapValuesMap(widget) {
        var interaction = widget.element;
        var gapImgMap = interaction.data('rpGapValues');

        if (gapImgMap) {
            return gapImgMap;
        }

        gapImgMap = getGapValuesMapFromXml(widget) || [];
        interaction.data('rpGapValues', gapImgMap);
        return gapImgMap;
    }
    /**
     * @returns {Array}
     */
    function getGapValuesMapFromXml(widget) {
        var interaction = widget.element;
        var item = interaction.getRootElement();
        var rp = item.responseProcessing;
        var renderedRp = rp.render(xmlRenderer.get());
        var $rpXml = $($.parseXML(renderedRp));
        var hotspotOutcome = getрHotspotOutcomeId(widget);
        var result = [];
        var firstGapId;

        $rpXml.find('setOutcomeValue[identifier="' + hotspotOutcome + '"] sum')
            .closest('responseCondition')
            .toArray()
            .some(function (parent) {
                var pair = parent.querySelector('baseValue[baseType="directedPair"]').textContent.split(' ');
                var gapId = pair[1];
                if (!firstGapId) {
                    firstGapId = gapId;
                }
                if (gapId !== firstGapId) {
                    return true;
                }
                var id = pair[0];
                var value = parseFloat(parent.querySelector('sum baseValue').textContent);

                result.push({
                    id: id,
                    value: value
                });
                return false;
            });

        return result;
    }
    /**
     * @param {string} id
     * @param {number} value
     */
    function setGapValue(widget, id, value) {
        var interaction = widget.element;
        var oldArr = getGapValuesMap(widget);
        var newArr = oldArr.filter(function (item) {
            return item.id !== id
        });
        newArr.push({
            id: id,
            value: value
        });
        interaction.data('rpGapValues', newArr);
    }
    /**
     * @param {string} id
     * @param {number} value
     */
    function setChoiceValue(widget, id, value) {
        var interaction = widget.element;
        var oldArr = getRpChoiceValuesMap(widget);
        var newArr = oldArr.filter(function (item) {
            return item.id !== id;
        });
        newArr.push({
            id: id,
            value: value
        });
        interaction.data('rpChoiceValues', newArr);
    };

    function renderUiChoices(widget) {
        var dom = widget.$container[0];
        var choices = getChoicesArray(widget);
        var svgParent = dom.querySelector('.main-image-box .svggroup svg');
        var DEFAULT_ELEM_HEIGHT = 20;
        choices.map(function (choice) {
            return {
                id: choice.identifier,
                x: choice.coords.split(',')[0],
                y: choice.coords.split(',')[1],
                value: getChoiceValue(widget, choice.identifier),
            };
        }).forEach(function (choice) {
            var foreign = document.createElementNS('http://www.w3.org/2000/svg', "foreignObject");
            foreign.setAttribute('width', 45);
            foreign.setAttribute('height', DEFAULT_ELEM_HEIGHT);
            foreign.setAttribute('x', choice.x);
            foreign.setAttribute('y', choice.y);
            foreign.setAttribute('class', 'mapped-value');
            var newInput = $(mappedValueInputInSvgTpl(choice))[0];
            newInput.addEventListener('change', onChange);

            svgParent.appendChild(foreign);
            foreign.appendChild(newInput);
            function onChange(e) {
                setChoiceValue(widget, choice.id, e.target.value);
            };

            scale(foreign);
        });

        function getScale(foreign) {
            var rect = foreign.getBoundingClientRect();
            var h = rect.height;
            return DEFAULT_ELEM_HEIGHT / h;
        }
        function scale(foreign) {
            var scale = getScale(foreign);
            var input = foreign.querySelector('input');
            foreign.setAttribute('height', scale * DEFAULT_ELEM_HEIGHT);
            foreign.setAttribute('width', scale * foreign.getAttribute('width'));
            input.style.transform = 'scale(' + scale + ')';
        }

    };
    function destroyUi(widget) {
        var dom = widget.$container[0];
        var container = dom.querySelector('.custom-score-container');
        var gaps = dom.querySelectorAll('.qti-gapImg.qti-choice');
        var choices = dom.querySelectorAll('svg foreignObject.mapped-value');
        if (container) {
            container.remove();
        }
        gaps.forEach(function (item) {
            item.remove();
        })
        choices.forEach(function (item) {
            item.remove();
        })
    };

    /**
     * @return {Node[]}
     */
    function getConditions(widget) {
        var targetOutcomeId = responseMethods.getTargetOutcomeId(widget);
        var targetToScore = getRpMapTargetToScore(widget);
        var conditions = [];
        var plainConditions = [];
        var scoreCondition = Object.keys(targetToScore).map(function (key) {
            return getScoreCondition(key, targetToScore[key], targetOutcomeId);
        }).filter(function (elem) {
            return !!elem;
        });
        var hotspotTempOutcome = getрHotspotOutcomeId(widget);
        var hotspots = getRpChoiceValuesMap(widget);
        var gapImgsValues = getGapValuesMap(widget);

        var hotspotConditions = hotspots.map(function (hotspot) {
            return getHotspotConditions(targetOutcomeId, hotspotTempOutcome, hotspot.id, hotspot.value, gapImgsValues);
        });
        conditions = hotspotConditions;
        conditions.push(scoreCondition);
        plainConditions = Array.prototype.concat.apply(plainConditions, conditions);
        return plainConditions;
    };

    /**
     * @return {Node}
     */
    function getScoreCondition(target, score, targetOutcome) {
        var xml;
        if (!score) {
            return null;
        }
        xml = mapTargetValueScoreTpl({
            target: targetOutcome,
            targetValue: target,
            score: score,
        })
        return responseMethods.xmlToCondition(xml);
    }
    /**
     * @param {string}  targetOutcome
     * @param {string}  hotspotOutcome
     * @param {string}  hotspotId
     * @param {number}  hotspotValue
     * @param {Object} gapImgsMappedValues
     * @return {Node[]}
     */
    function getHotspotConditions(targetOutcome, hotspotOutcome, hotspotId, hotspotValue, gapImgsMappedValues) {
        var xmlStr = accociableHotspotRpTpl({
            hotspotOutcome: hotspotOutcome,
            hotspotId: hotspotId,
            hotspotValue: hotspotValue,
            gapImgs: gapImgsMappedValues,
            targetOutcome: targetOutcome,
        });
        var xml = $.parseXML(xmlStr);
        var xmlElements = Array.prototype.slice.call($(xml).find('xml')[0].childNodes);
        return xmlElements;
    }
    /**
     * @return {string}
     */
    function getрHotspotOutcomeId(widget) {
        var interaction = widget.element;
        var parentItem = interaction.getRootElement();
        var outcomeId = interaction.attr('hotspotTempOutcome');
        var newOutcome;
        if (!outcomeId || !parentItem.getOutcomeDeclaration(outcomeId)) {
            newOutcome = parentItem.createOutcomeDeclaration({
                identifier: 'HOTSPOT_TEMP',
                cardinality: 'single',
                baseType: 'float',
            });
            outcomeId = newOutcome.attributes.identifier;
            interaction.attr('hotspotTempOutcome', outcomeId);
        }
        return outcomeId;
    }

    return StateCustom;
});
