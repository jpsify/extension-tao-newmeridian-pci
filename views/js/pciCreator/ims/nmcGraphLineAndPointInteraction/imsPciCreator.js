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
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'nmcGraphLineAndPointInteraction/creator/widget/Widget',
    'nmcGraphLineAndPointInteraction/creator/widget/helpers/responseCondition',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/markup',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/responseCondition/default'
], function($, _, ciRegistry, Widget, responseCondition, markupTpl, defaultRcTpl){
    'use strict';

    var _typeIdentifier = 'nmcGraphLineAndPointInteraction';

    var creatorHook = {
        /**
         * (required) Get the typeIdentifier of the custom interaction
         *
         * @returns {String}
         */
        getTypeIdentifier : function(){
            return _typeIdentifier;
        },

        /**
         * (required) Get the widget prototype
         * Used in the renderer
         *
         * @returns {Object} Widget
         */
        getWidget : function(){
            return Widget;
        },

        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         *
         * @param {Object} pci interaction itself
         * @returns {Object}
         */
        getDefaultProperties : function(pci){
            return {
                graphs : {
                    points : {label : 'Points', count : 0, elements : []},
                    setPoints : {label : 'Sets of Points', count : 0, elements: []},
                    segments : {label : 'Segments', count : 0, elements:[]},
                    lines : {label : 'Lines', count : 0, elements : []},
                    polygons : {label : 'Polygons', count : 0, elements : []},
                    solutionSet : {label : 'Solution Sets', count : 0, elements:[]}
                },
                "graphTitle": null,
                "graphTitleRequired": false,

                "width": 450,
                "height": 450,
                "showOrigin": true,
                "showXAxisTitle": true,
                "showYAxisTitle": true,
                "showSubGrid": false,
                "subGridColor": "#aaaaaa",

                "xAllowOuter": true,
                "xBorderWeight": 3,
                "xStep": 1,
                "xLabel": 'x',
                "xTitle": null,
                "xStart": -10,
                "xEnd": 10,
                "xSubStep": 2,
                "xWeight": 3,
                "xDigits": 0,

                "yAllowOuter": true,
                "yBorderWeight": 3,
                "yStep": 1,
                "yLabel": 'y',
                "yTitle": null,
                "yStart": -10,
                "yEnd": 10,
                "ySubStep": 2,
                "yWeight": 3,
                "yDigits": 0
            };
        },

        /**
         * (optional) Callback to execute on the
         * Used on new pci instance creation
         *
         * @param {Object} interaction
         */
        afterCreate : function(interaction){
            responseCondition.replaceResponseCondition(interaction, $.parseXML(defaultRcTpl({
                responseIdentifier: interaction.attr('responseIdentifier')
            })).documentElement);
        },

        /**
         * (required) Gives the qti pci xml template
         *
         * @returns {function} handlebar template
         */
        getMarkupTemplate : function(){
            return markupTpl;
        },

        /**
         * (optional) Allows passing additional data to xml template
         * @param {Object} pci interaction itself
         * @param {Object} defaultData
         * @returns {function} handlebar template
         */
        getMarkupData : function(pci, defaultData){

            return defaultData;
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return creatorHook;
});
