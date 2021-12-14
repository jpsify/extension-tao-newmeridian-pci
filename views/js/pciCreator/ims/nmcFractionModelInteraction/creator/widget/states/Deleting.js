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
    'taoQtiItem/qtiCreator/helper/xmlRenderer',

], function (
    $,
    stateFactory,
    Deleting,
    xmlRenderer,

) {
    'use strict';

    var InteractionStateDeleting = stateFactory.extend(
        Deleting,
        init,
        exit,
    );

    function init() {
        var widget = this.widget;
        removeRp( widget );
        removeOutcome(widget);

    }
    function exit() {

    }

    function removeRp(widget) {
        var interaction = widget.element;
        var item = interaction.getRelatedItem();
        var rp = item.responseProcessing;
        var renderedRp = rp.render(xmlRenderer.get()) || '<responseProcessing template=\"EMPTY\"/>';
        var $rpXml = $($.parseXML(renderedRp));
        var rootElem = $rpXml[0].documentElement;
        var respId = interaction.attr('responseIdentifier');
        var parents = $rpXml.find('variable[identifier="' + respId + '"]').closest('responseCondition');
        var corrMatchId = interaction.attr('matchId');
        var corrMatchParents = $rpXml.find('variable[identifier="' + corrMatchId + '"]').closest('responseCondition');
        var xml;

        corrMatchParents.remove();
        parents.remove();

        xml = (new XMLSerializer()).serializeToString(rootElem);
        rp.xml = xml;
        return parents;
    }

    function removeOutcome(widget) {
        var interaction = widget.element;
        var item = interaction.getRelatedItem();
        var correctId = interaction.attr('matchId');

        if (!correctId) {
            return;
        }
        item.removeOutcome(correctId);
    }

    return InteractionStateDeleting;
});