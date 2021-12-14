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


define( [
    'taoQtiItem/portableLib/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/util/event',
    'css!nmcPci/pciCreator/ims/nmcTextHighlightInteraction/runtime/css/nmcTextHightLightInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',

], function ( $, qtiCustomInteractionContext, _, event, css, instructionMgr ) {
    'use strict';

    var _typeIdentifier = 'nmcTextHightLightInteraction';
    var nmcTextHightLightInteraction = {
        id: -1,
        getInstance: function getInstance( dom, config, state ) {
            var response = config.boundTo; //simply mapped to existing TAO PCI API

            this.initialize( Object.getOwnPropertyNames( response ).pop(), dom, config.properties, config.assetManager );
            this.setSerializedState( state ); //tell the rendering engine that I am ready

            if ( typeof config.onready === 'function' ) {
                config.onready( this, this.getState() );
            }
        },
        getState: function getState() {
            //simply mapped to existing TAO PCI API
            return this.getSerializedState();
        },
        oncompleted: function oncompleted() {
            this.destroy();
        },
        getResponse: function getResponse() {
            var value = this.getRawResponse();
            if(!this.isValidResponse(value)){
                return {
                    "list": {
                        "identifier": null
                    }
                }
            };
            return {
                "list": {
                    "identifier": value
                }
            };
        },
        destroy: function destroy() {
            var $container = $( this.dom );
            $container.off().empty();
        },
        getTypeIdentifier: function getTypeIdentifier() {
            return _typeIdentifier;
        },
        initialize: function initialize( id, dom, config ) {
            var self = this;
            var mathJax = window.MathJax;
            var boxes;
            var interaction;
            var styledElems;


            event.addEventMgr( this );
            this.interaction = this._taoCustomInteraction;
            this.id = id;
            this.dom = dom;
            this.config = config || {};


            function getChoices() {
                var textHLElems = dom.querySelectorAll( '.text-hl-choice' );
                var myArr = Array.prototype.slice.call( textHLElems );
                var chss = myArr.map( function ( item ) {
                    return item.dataset;
                } ).filter( function ( data ) {
                    return data.checked === "true";
                } ).map( function ( data ) {
                    return data.id;
                } );
                return chss;
            }

            this.getRawResponse = function () {
                return getChoices();
            };

            this.initBoxListener = function (event) {
                var elem = event.currentTarget;
                if ( !elem.className == 'text-hl-choice' ) {
                    return;
                };

                elem.dataset.checked = elem.dataset.checked === "true" ? "false" : "true";
                instructionMgr.validateInstructions( self.interaction, {
                    count: getChoices().length,
                    newElem: elem
                } );
            };

            this.setRawResponse = function ( raw ) {};

            boxes =  dom.querySelectorAll( '.text-hl-choice' ) ;
            boxes.forEach( function(box) {
                box.addEventListener( 'click', self.initBoxListener );
            } );
            interaction = this.interaction;

            if ( interaction.attributes.minChoices && parseInt( interaction.attributes.minChoices, 10 ) ) {
                instructionMgr.appendInstruction( interaction, '', function ( data ) {
                    var interaction = this.interaction;
                    var attrs = interaction.attributes;
                    var min = parseInt( attrs.minChoices, 10 ) || NaN;
                    var count = data.count || 0;
                    this.update( {
                        message: `You must select at least ${min} choices`
                    } );

                    if ( count < min ) {
                        this.update( {
                            level: 'info'
                        } );
                        return;
                    }

                    this.update( {
                        level: 'success'
                    } );
                } );
            }

            if ( interaction.attributes.maxChoices && parseInt( interaction.attributes.maxChoices, 10 ) ) {
                instructionMgr.appendInstruction( interaction, '', function ( data ) {
                    var interaction = this.interaction;
                    var attrs = interaction.attributes;
                    var max = parseInt( attrs.maxChoices, 10 ) || NaN;
                    var count = data.count || 0;
                    var newElem = data.newElem;
                    var self = this;
                    this.update( {
                        message: `You can select maximum ${max} choices`
                    } );

                    if ( count > max ) {
                        this.update( {
                            level: 'warning'
                        } );
                        if ( newElem && newElem.dataset.checked ) {
                            newElem.dataset.checked = false;
                            setTimeout( function(){
                                self.update( {
                                    level: 'info'
                                } );
                            }, 1000 );
                        }
                        return;
                    }

                    this.update( {
                        level: 'info'
                    } );
                } );
            }

            instructionMgr.validateInstructions( interaction, {
                count: getChoices().length
            } );

            
            if ( mathJax ) {
                mathJax.Hub.Queue( [ "Typeset", mathJax.Hub ] );
            } 
            
            //restore table styles added by tabletoolstoolbar plugin for ckEditor 
            styledElems = dom.querySelectorAll( '.qti-flow-container [data-style]' );
            styledElems.forEach( function ( elem ) {
                if ( elem.getAttribute( 'style' ) ) {
                    return;
                }
                elem.setAttribute( 'style', elem.dataset.style );
            } );

            this.isValidResponse = function isValidResponse(raw){
                var minChoices =  interaction.attributes.minChoices;

                if(minChoices && raw.length < minChoices){
                    return false;
                }
                return true;
            }
        },
        setResponse: function ( response ) {
            var raw = response && response.list ? response.list.identifier : [];
            this.setRawResponse( raw );
        },
        resetResponse: function () { },
        setSerializedState: function ( state ) {
            this.setResponse( state );
        },
        getSerializedState: function () {
            return this.getResponse();
        }
    };
    qtiCustomInteractionContext.register( nmcTextHightLightInteraction );
} );
