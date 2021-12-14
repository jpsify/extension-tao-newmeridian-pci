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
    'jquery',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/rpTemplate',
], function (
    $,
    xmlRenderer,
    rpTemplateTpl,
) {
    'use strict';
    var responseMethods = {
        /**
         * @param {string}  xmlString
         * @return {Node}
         */
        xmlToCondition: function xmlToCondition(xmlString) {
            var xml = $.parseXML(xmlString);
            return $(xml).find('responseCondition')[0];
        },
        /**
         * @return {Node}
         */
        clearRp: function clearRp(widget, stateName ) {
            var interaction = widget.element;
            var item = interaction.getRootElement();
            var rp = item.responseProcessing;
            var renderedRp = rp.render(xmlRenderer.get()) || '<responseProcessing />';
            var $rpXml = $($.parseXML(renderedRp));
            var templateDeclaration;
            var root = $rpXml[0].documentElement;

            $rpXml.find('responseCondition responseIf not match baseValue').toArray()
                .filter(function (elem) {
                    return elem.textContent === interaction.attr('responseIdentifier');
                }).forEach(function (elem) {
                    $(elem).closest('responseCondition').remove();
                });

            root.removeAttribute('template');
            removeOutcomeParentCondition(interaction.attr('responseIdentifier'), $rpXml);
            removeOutcomeParentCondition(responseMethods.getTargetOutcomeId(widget), $rpXml);
            if (interaction.attr('hotspotTempOutcome')) {
                removeOutcomeParentCondition(interaction.attr('hotspotTempOutcome'), $rpXml);
            }
            if(stateName){
                templateDeclaration = responseMethods.xmlToCondition(rpTemplateTpl({
                    responseId: interaction.attr('responseIdentifier'),
                    stateName: stateName,
                    outcome: responseMethods.getTargetOutcomeId(widget),
                }));
                root.appendChild(templateDeclaration);
            }
            return root;
        },
        /**
         * @return {string}
         */
        getTargetOutcomeId: function getTargetOutcomeId(widget){
            var interaction = widget.element;
            var parentItem = interaction.getRootElement();
            var outcomeId = interaction.attr('targetOutcomeId');
            var newOutcome;
            if (!outcomeId || !parentItem.getOutcomeDeclaration(outcomeId)) {
                newOutcome = parentItem.createOutcomeDeclaration({
                    identifier: 'TARGET_VALUE',
                    cardinality: 'single',
                    baseType: 'float',
                });
                outcomeId = newOutcome.attributes.identifier;
                interaction.attr('targetOutcomeId', outcomeId);
            }
            return outcomeId;
        },
        updateResponseProcessing : function updateResponseProcessing(widget, conditions, stateName) {
            var interaction = widget.element;
            var item = interaction.getRootElement();
            var rp = item.responseProcessing;
            var newRcs = conditions;
            var rootElem = responseMethods.clearRp(widget, stateName);
            var xml;
            newRcs.forEach(function (conditionElem) {
                rootElem.appendChild(conditionElem);
            });
            xml = (new XMLSerializer()).serializeToString(rootElem);
            rp.setProcessingType('custom');
            rp.xml = xml;
        },
    };
    /**
     * @param {string} outcomeId 
     * @param {Object} $rpXml
     */
    function removeOutcomeParentCondition(outcomeId, $rpXml) {
        var outcomeClosestCondition;
        if (!outcomeId) {
            return;
        }
        outcomeClosestCondition = $rpXml.find('variable[identifier="' + outcomeId + '"]').closest('responseCondition');
        outcomeClosestCondition.remove();
        $rpXml.find('setOutcomeValue[identifier="' + outcomeId + '"]').remove();
    }
    return responseMethods;
});