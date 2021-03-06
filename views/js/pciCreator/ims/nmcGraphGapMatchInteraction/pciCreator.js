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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 */

define([
    'lodash',
    'nmcGraphGapMatchInteraction/creator/widget/Widget',
    'nmcGraphGapMatchInteraction/runtime/js/renderer',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/markup'
], function(_, Widget, Renderer, markupTpl){
    'use strict';

    var _typeIdentifier = 'nmcGraphGapMatchInteraction';

    var graphGapMatchInteractionCreator = {
        /**
         * (required) Get the typeIdentifier of the custom interaction
         *
         * @returns {String}
         */
        getTypeIdentifier : function getTypeIdentifier(){
            return _typeIdentifier;
        },
        /**
         * (required) Get the widget prototype
         * Used in the renderer
         *
         * @returns {Object} Widget
         */
        getWidget : function getWidget(){
            Widget.beforeStateInit(function (event, pci, state) {
                if (pci.typeIdentifier && pci.typeIdentifier === _typeIdentifier) {
                    if (!pci.widgetRenderer) {
                        pci.widgetRenderer = new Renderer({
                            serial : pci.serial,
                            $container : state.widget.$container,
                            templates : {
                                body : markupTpl,
                            },
                            interaction: pci
                        });
                    }
                    //pci.widgetRenderer.setState(state.name);
                    pci.widgetRenderer.render(pci.properties);
                }
            });
            return Widget;
        },
        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        getDefaultProperties : function getDefaultProperties(){
            return {
                backgroundImage: '',
                preserveImgOrder: false,
                preserveImgCount: false,
            };
        },
        /**
         * (optional) Callback to execute on the
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        afterCreate : function afterCreate(pci){
            //do some stuff
        },
        /**
         * (required) Gives the qti pci xml template
         *
         * @returns {function} handlebar template
         */
        getMarkupTemplate : function getMarkupTemplate(){
            return markupTpl;
        },
        /**
         * (optional) Allows passing additional data to xml template
         *
         * @returns {function} handlebar template
         */
        getMarkupData : function getMarkupData(pci, defaultData){
            defaultData.prompt = pci.data('prompt');
            return defaultData;
        },

    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return graphGapMatchInteractionCreator;
});
