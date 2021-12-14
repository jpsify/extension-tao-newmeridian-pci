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
    'taoQtiItem/portableLib/jquery_2_1_1',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicInteraction/Widget',
    'taoQtiItem/qtiCreator/model/choices/GapImg',
    'taoQtiItem/qtiCreator/model/choices/AssociableHotspot',
    'nmcGraphGapMatchInteraction/creator/widget/states/states',
], function ($, _, Widget, GraphicWidget, GapImg, AssociableHotspot, states) {
    'use strict';

    var GraphGapMatchInteractionWidget = _.extend(Widget.clone(), GraphicWidget, {

        initCreator: function (options) {
            var self = this,
                choices = this.element.prop('choices');

            _.forEach(choices, function(choice) {
                self.createChoice(self.element, choice);
            });

            this.registerStates(states);

            Widget.initCreator.call(this);
        },

        buildGapIdentifier: function(interaction, prefix) {
            var exists = false,
                i = 1,
                id,
                gaps = interaction.prop('gaps') || [],
                usedIds = _.reduce(gaps, function(acc, gap) { acc[gap.identifier] = gap.identifier; return acc; }, {});

            do {
                exists = false;
                id = prefix + '_' + i;
                if (usedIds[id]) {
                    exists = true;
                    i++;
                }
            } while (exists);
            return id;
        },

        createGapImg : function(interaction, object, label){
            var gapImg = new GapImg();
            gapImg.object.attributes = object;
            if(label){
                gapImg.attr('objectLabel', label);
            }
            if(!this.gapImgs){
                this.gapImgs = [];
            }

            //TODO: add img to interaction
            gapImg.setRootElement(interaction.getRootElement() || null)

            gapImg.attr('identifier', this.buildGapIdentifier(interaction, 'gapimg'));

            if(interaction.getRenderer()){
                gapImg.setRenderer(interaction.getRenderer());
            }

            $(document).trigger('choiceCreated.qti-widget', {'choice' : gapImg, 'interaction' : this});

            return gapImg;
        },

        createChoice: function (interaction, attr) {
            var choice = new AssociableHotspot('', attr);

            interaction.addChoice(choice);
            if (!choice.attr('identifier')) {
                choice.buildIdentifier('associablehotspot');
            }

            if (interaction.getRenderer()) {
                choice.setRenderer(interaction.getRenderer());
            }

            $(document).trigger('choiceCreated.qti-widget', { 'choice': choice, 'interaction': interaction });

            return choice;
        }
    });

    return GraphGapMatchInteractionWidget;
});