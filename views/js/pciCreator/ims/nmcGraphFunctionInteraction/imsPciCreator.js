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
    'lodash',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'nmcGraphFunctionInteraction/creator/widget/Widget',
    'tpl!nmcGraphFunctionInteraction/creator/tpl/markup',
    'tpl!nmcGraphFunctionInteraction/creator/tpl/responseCondition',
    'nmcPci/pciCreator/helper/responseCondition'
], function(_, ciRegistry, Widget, markupTpl, rcTpl, responseCondition){

    var _typeIdentifier = 'nmcGraphFunctionInteraction';

    var likertScaleInteractionCreator = {
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
         * @returns {Object}
         */
        getDefaultProperties : function(pci){
            return {
                graphs : {
                    linear : {label : 'Linear', checked : true},
                    absolute : {label : 'Absolute Value', checked : true},
                    quadratic : {label : 'Quadratic', checked : true},
                    exponential : {label : 'Exponential', checked : true},
                    logarithmic : {label : 'Logarithmic', checked : true},
                    cosine : {label : 'Sin/Cos', checked : true},
                    tangent : {label : 'Tan/Cotan', checked : true}
                },
        
                "graphTitle": null,
                "graphTitleRequired": false,
                "plotColor": "#0000FF",
                "plotThickness": 6,
                "pointColor": "#0000FF",
                "pointGlow": true,
                "pointRadius": 8,
                "weight": 1,
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
         * @returns {Object}
         */
        afterCreate : function(pci){

            //turn into custom rp and substitute the resp cond
            responseCondition.replace(pci, rcTpl({
                responseIdentifier : pci.attr('responseIdentifier'),
                score : 1
            }));

            //set default (and fixed) correct "numberPointsRequired" value
            pci.getResponseDeclaration().correctResponse = {numberPointsRequired : {
                fieldIdentifier : 'numberPointsRequired',
                baseType : 'integer',
                value : 2//it is presently always 2
            }};
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
         *
         * @returns {function} handlebar template
         */
        getMarkupData : function(pci, defaultData){
            return _.defaults(defaultData , {
                graphs : pci.prop('graphs')
            });
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return likertScaleInteractionCreator;
});
