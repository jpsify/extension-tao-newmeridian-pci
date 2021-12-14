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
    'nmcFractionModelInteraction/creator/widget/Widget',
    'tpl!nmcFractionModelInteraction/creator/tpl/markup',
    'tpl!nmcFractionModelInteraction/creator/tpl/responseCondition',
    'nmcPci/pciCreator/helper/responseCondition'
], function(_, ciRegistry, Widget, markupTpl, rcTpl, responseCondition){
    'use strict';

    var _typeIdentifier = 'nmcFractionModelInteraction';

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
                'title' : 'Fraction Model',
                'type' : 0,
                'subtype' : 0,
                'radius' : 100,
                'height' : 200,
                'width' : 200,
                'selectedPartitionsColor' : '#ff0000',
                'partitionColor' : '#ffffff',
                'outlineColor' : '#000000',
                'outlineThickness' : 1,
                'partitionMax' : 12,
                'partitionMin' : 1,
                'partitionInit' : 1,
                'selectedPartitionsInit' : 0,
                'selectedPartitions' : '[]'
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
            }), {
                responseIdentifierCount : 5
            });

            //set default "exactMatch" and "excludedValues" values
            pci.getResponseDeclaration().correctResponse = {
                exactMatch : {
                    fieldIdentifier : 'exactMatch',
                    baseType : 'string',
                    value : '0'
                },
                excludedValues : {
                    fieldIdentifier : 'excludedValues',
                    baseType : 'string',
                    value : ''
                }
            };
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
                title : pci.prop('title')
            });
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return likertScaleInteractionCreator;
});
