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
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Deleting',
    'nmcGraphGapMatchInteraction/creator/helpers/response',

], function (
    $,
    stateFactory,
    Deleting,
    responseMethods,

) {
    'use strict';

    var InteractionStateDeleting = stateFactory.extend(
        Deleting,
        init,
        exit,
    );

    function init() {

    }
    function exit() {
        var widget = this.widget;
        var interaction = widget.element;
        var item = interaction.getRootElement();
        var rp = item.responseProcessing;

        if (rp.processingType == 'custom' && !document.querySelector('div[data-serial="' + widget.serial + '"]')) {
            responseMethods.clearRp(widget);
            removeOutcome(widget);
        }
    }

    function removeOutcome(widget) {
        var interaction = widget.element;
        var item = interaction.getRootElement();
        var outcomeId = interaction.attr('targetOutcomeId');
        var tempOutcome = interaction.attr('hotspotTempOutcome')

        if (outcomeId) {
            item.removeOutcome(outcomeId);
        }
        if(tempOutcome){
            item.removeOutcome(tempOutcome);
        }
        
    }

    return InteractionStateDeleting;
});