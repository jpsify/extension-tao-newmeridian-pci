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
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'tpl!nmcTextHightLightInteraction/creator/tpl/score',
], function ( $, _, stateFactory, Map, instructionMgr, scoreTpl ) {
    'use strict';

    var observer;

    function addScoreInputs( container, response ) {
        if ( container.querySelector( '.text-hl-choice input' ) ) {
            return;
        }

        var mapEntries = response.getMapEntries();
        var defaultMapVal = response.getMappingAttribute( 'defaultValue' );
        container.querySelectorAll( '.text-hl-choice' ).forEach( function ( elem ) {
            var id = elem.dataset.id;
            var inputVal = mapEntries[ id ] || '';
            var scoreInput = $( scoreTpl( {
                id: id,
                value: inputVal
            } ) )[ 0 ];
            elem.append( scoreInput );
            scoreInput.addEventListener( 'input', function ( event ) {
                var newVal = parseInt( event.target.value, 10 );

                if ( isNaN( newVal ) ) {
                    response.removeMapEntry( id, true );
                    return;
                }

                response.setMapEntry( id, parseInt( event.target.value, 10 ) );
            } );
            scoreInput.placeholder = defaultMapVal;
        } );
    }

    ;

    function updateScorePlaceholders( container, newVal ) {
        container.querySelectorAll( '.text-hl-choice input' ).forEach( function ( scoreElem ) {
            scoreElem.placeholder = newVal;
        } );
    }

    function removeScoreInputs( container ) {
        container.querySelectorAll( '.text-hl-choice input' ).forEach( function ( elem ) {
            elem.remove();
        } );
    }

    function initMapState() {
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var container = this.widget.$container[ 0 ];
        var observeConfig = {
            childList: true,
            subtree: true
        };
        var editable;
        addScoreInputs( container, response );
        instructionMgr.removeInstructions( interaction );
        instructionMgr.appendInstruction( interaction,  'Please enter the score for the given text choices.'  );

        observer = new MutationObserver( function () {
            addScoreInputs( container, response );
        } );
        observer.observe( container, observeConfig );
        widget.on( 'mappingAttributeChange', function ( data ) {
            if ( data.key === 'defaultValue' ) {
                updateScorePlaceholders( container, data.value );
            }
        } );
        editable = container.querySelector( '.editor-text' );

        if ( !response.metaData.defineCorrect ) {
            response.setCorrect( [] );
            editable.addEventListener( 'click', stop, true );
            editable.querySelectorAll( '.text-hl-choice' ).forEach( function ( elem ) {
                elem.dataset.correct = false;
            } );
        }

        widget.on( 'metaChange', function ( meta ) {
            if ( meta.key === 'defineCorrect' ) {
                if ( !meta.value ) {
                    response.setCorrect( [] );
                    editable.removeEventListener( 'click', stop, true );
                    editable.addEventListener( 'click', stop, true );
                    editable.querySelectorAll( '.text-hl-choice' ).forEach( function ( elem ) {
                        elem.dataset.correct = false;
                    } );
                    return;
                }

                editable.removeEventListener( 'click', stop, true );
            }
        } );
    }

    function stop( e ) {
        e.stopPropagation();
    }

    function exitMapState() {
        observer.disconnect();
        var container = this.widget.$container[ 0 ];
        var widget = this.widget;
        var interaction = widget.element;
        var editable;
        removeScoreInputs( container );
        instructionMgr.removeInstructions( interaction );
        instructionMgr.appendInstruction( interaction,  'Please select the correct text choices below.'  );
        editable = container.querySelector( '.editor-text' );
        editable.removeEventListener( 'click', stop, true );
    }

    return stateFactory.create( Map, initMapState, exitMapState );
} );
