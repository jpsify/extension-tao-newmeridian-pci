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

define(['lodash', 'nmcGapMatchInteraction/creator/widget/Widget', 'tpl!nmcGapMatchInteraction/creator/tpl/markup', 'nmcGapMatchInteraction/utils/choiceColumnCalculator'], function (_, Widget, markupTpl, choiceColumnCalculator) {
    "use strict";

    var _typeIdentifier = 'nmcGapMatchInteraction';
    var DEFAULT_GROUP_ID = 'undefined';
    var nMethods = {
        getTypeIdentifier: function getTypeIdentifier() {
            return _typeIdentifier;
        },
        getMarkupTemplate: function getMarkupTemplate() {
            return markupTpl;
        },

        getWidget: function getWidget() {
            return Widget;
        },

        getDefaultProperties: function getDefaultProperties(pci) {
            return {
                position: 'top',
                display: 'list',
                choices: [],
                columns: [],
                groups: [
                    {
                        id: DEFAULT_GROUP_ID,
                        title: '',
                    }
                ],
                minChoices: 0,
                numColumns: 0
            };
        },
        getMarkupData: function getMarkupData(pci, defaultData) {

            var choices = pci.prop('choices');
            var numColumns = parseInt(pci.prop('numColumns'), 10) || 0;
            var columns = choiceColumnCalculator.calculateChoiceColumns(choices, numColumns);

            defaultData.editorText = pci.data('editorText');
            defaultData.position = pci.prop('position');
            defaultData.choices = choices;
            var groups = pci.prop('groups');
            var groups1 = _.groupBy(choices, function (item) {
                return item.data.groupid || DEFAULT_GROUP_ID;
            });
            var displayGroups = groups.map(function (group) {
                return {
                    id: group.id,
                    title: group.title,
                    choices: groups1[group.id]
                };
            });
            defaultData.groups = displayGroups;
            defaultData.columns = columns;
            defaultData.display = pci.prop('display');
            defaultData.numColumns = columns.length;
            return defaultData;
        }
    };
    return nMethods;
});