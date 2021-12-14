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
    'taoQtiItem/qtiCreator/helper/xmlRenderer'
], function ($, _, xmlRenderer) {
    'use strict';

    /**
     * Replaces existing (found by response id) interaction response condition with new one
     * @param {Object} interaction interaction
     * @param {Element} newResponseCondition parsed XML as Element with response conditions needed to insert
     * @param {String} oldResponseIdentifier old response identifier of response that should be replaced (used for cases when we change response identifier itself)
     */
    function replaceResponseCondition(interaction, newResponseCondition, oldResponseIdentifier) {
        var assessmentItem = interaction.getRootElement(),
            responseProcessing = assessmentItem.responseProcessing,
            responseIdentifier = oldResponseIdentifier || interaction.attr('responseIdentifier'),
            rpRenderedToXML = responseProcessing.render(xmlRenderer.get()) || '<responseProcessing />',
            $rpXML = $($.parseXML(rpRenderedToXML)),
            $existingRespCondition = $rpXML.find('variable[identifier="' + responseIdentifier + '"]').closest('responseCondition');

        if($rpXML[0].documentElement.getAttribute('template')) { // if response processing is set to template, simply replace it
            $rpXML[0].documentElement.removeAttribute('template');
        } else if($existingRespCondition.length){ // replace existing response condition for current variable
            $existingRespCondition[0].parentNode.removeChild($existingRespCondition[0]);
        }
        $rpXML[0].documentElement.appendChild(newResponseCondition);

        responseProcessing.setProcessingType('custom');
        delete interaction.getResponseDeclaration().template;

        responseProcessing.xml = (new XMLSerializer()).serializeToString($rpXML[0].documentElement);
    }

    /**
     * Removes existing (found by response identifier) response condition for interaction
     * @param {Object} interaction interaction
     */
    function removeResponseCondition(interaction) {
        var assessmentItem = interaction.getRootElement(),
            responseProcessing = assessmentItem.responseProcessing,
            responseIdentifier = interaction.attr('responseIdentifier'),
            rpRenderedToXML = responseProcessing.render(xmlRenderer.get()) || '<responseProcessing />',
            $rpXML = $($.parseXML(rpRenderedToXML)),
            $existingRespCondition = $rpXML.find('variable[identifier="' + responseIdentifier + '"]').closest('responseCondition');

        $existingRespCondition.remove();

        responseProcessing.xml = (new XMLSerializer()).serializeToString($rpXML[0].documentElement);
    }

    return {
        replaceResponseCondition: replaceResponseCondition,
        removeResponseCondition: removeResponseCondition,
    };
});