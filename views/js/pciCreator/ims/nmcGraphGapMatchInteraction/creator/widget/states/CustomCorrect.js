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
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/mapTemplate',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/mapTargetIntervalsToScore',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/partialScoreContainer',
    'nmcGraphGapMatchInteraction/creator/helpers/response',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/exactMatchFormPanel',
], function (
    stateFactory,
    $,
    _,
    __,
    xmlRenderer,
    mapTpl,
    mapTargetIntervalsToScoreTpl,
    partialScoreContainerTpl,
    responseMethods,
    exactMatchFormPanelTpl,
) {
    'use strict';
    var stateName = "customCorrect";
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
        responseMethods.updateResponseProcessing(widget, getMapConditions(widget), stateName);
        renderUi(this.widget);
        this.widget.element.prop('preserveImgCount', true);
        this.widget.element.metaData.pci.initialize(-1);
        fillPaper(widget);
        initResponseForm(widget);
    }
    function exit() {

        var widget = this.widget;
        var interaction = widget.element;
        destroyUi(this.widget);
        responseMethods.updateResponseProcessing(widget, getMapConditions(widget), stateName);
        clearResponseForm(widget);
        saveMapEntries(this.widget);
        clearPaper(widget);
        interaction.data('rpMapTargetToScore2', []);
        
    }

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
        var targetToScore = interaction.data('rpMapTargetToScore2');
        var hotspotCount;
        var xmlTargetToScore;

        if (targetToScore && targetToScore.length) {
            return targetToScore;
        }
        hotspotCount = Object.keys(interaction.getChoices()).map(function (key, i) {
            return i + 1;
        });

        targetToScore = []
        xmlTargetToScore = getTargetToScoreFromXml(widget);
        targetToScore = hotspotCount.map(function (key) {
            var targetScoreTuple;
            xmlTargetToScore.some(function (item) {
                if (item[0] === key) {
                    targetScoreTuple = item;
                    return true;
                }
            });
            return [key, targetScoreTuple ? targetScoreTuple[1] : 0];
        })
        interaction.data('rpMapTargetToScore2', targetToScore);
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
        var container = dom.querySelector('.qti-interaction.qti-customInteraction');
        var interaction = widget.element;
        var partialScores = {};
        var max;
        var respProps;
        var inputs;
        getRpMapTargetToScore(widget).forEach(function (arr) {
            partialScores[arr[0]] = arr[1];
        });
        max = Object.keys(partialScores).sort(function (a, b) {
            return parseInt(b, 10) - parseInt(a, 10);
        })[0];
        respProps = $(partialScoreContainerTpl({
            maxCorrect: max,
            ns: partialScores,
        }))[0];
        inputs = respProps.querySelectorAll('input');

        inputs.forEach(function (input) {
            input.addEventListener('change', onInputChange);
        });
        container.appendChild(respProps);

        function onInputChange(e) {
            var data = getRpMapTargetToScore(widget);
            data = data.filter(function (item) {
                return item[0].toString() !== e.target.name;
            });
            data.push([e.target.name, parseFloat(e.target.value) || 0]);
            interaction.data('rpMapTargetToScore2', data);
        }
    }
    function destroyUi(widget) {
        var dom = widget.$container[0];
        var container = dom.querySelector('.custom-score-container');
        if (container) {
            container.remove();
        }
    }
    function saveMapEntries(widget) {
        var interaction = widget.element;
        var resp = interaction.metaData.pci.getResponse();
        var newResp = resp.list.directedPair;
        var rdcl = interaction.getResponseDeclaration()
        rdcl.removeMapEntries();
        newResp.forEach(function (pair) {
            rdcl.setMapEntry(pair.join(' '), 1);
        });
    };

    function clearPaper(widget) {
        var paperElem = widget.element.paper.canvas;
        var imgs = $(paperElem).find('image[x!="0"]');
        var rects = imgs.prev();
        var interaction = widget.element;
        var hotspots = interaction.getChoices();
        rects.remove();
        imgs.remove();
        Object.keys(hotspots).map(function (key) {
            return hotspots[key].serial;
        }).forEach(function (serial) {
            var element = interaction.paper.getById(serial);
            element.data('matching', []);
            element.data('fillers', []);
        });
    };

    function fillPaper(widget) {
        var interaction = widget.element;
        var hotspots = interaction.getChoices();
        var hotspotSerials = {};
        var dom = widget.$container[0];
        var rdcl = interaction.getResponseDeclaration();
        var entries = rdcl.getMapEntries();
        var correctPairs = Object.keys(entries).map(function (pairStr) {
            return pairStr.split(' ');
        });
        Object.keys(hotspots).forEach(function (key) {
            var idKey = hotspots[key].attributes.identifier;
            hotspotSerials[idKey] = hotspots[key].serial;
        });

        correctPairs.forEach(function (pairArr) {
            var hotspotId = pairArr[1];
            var optionsArr = pairArr[0].split('__');
            var hotspotSerial = hotspotSerials[hotspotId];
            var hotspotElem = widget.element.paper.getById(hotspotSerial);
            optionsArr.filter(function (option) {
                return option && option !== 'null';
            }).forEach(function (option) {
                var optionElem = dom.querySelector('[data-identifier="' + option + '"');
                if (!optionElem) {
                    return;
                }
                optionElem.classList.add('active');
                widget.element.metaData.pci._selectShape(interaction, hotspotElem);
                optionElem.classList.remove('active');
            })
        });
    }

    function initResponseForm(widget) {
        var form = widget.$responseForm[0];
        var elem = $(exactMatchFormPanelTpl({
            order: widget.element.prop('preserveImgOrder')
        }))[0];
        var orderInput = elem.querySelector('input');
        orderInput.addEventListener('change', function (e) {
            widget.element.prop('preserveImgOrder', e.currentTarget.checked);
            clearPaper(widget);
            fillPaper(widget);
        });
        form.appendChild(elem);
    }

    function clearResponseForm(widget) {
        var form = widget.$responseForm[0];
        form.querySelector('.correct-match-response-props-panel').remove();
    }
    return StateCustom;
});
