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
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Correct',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager'
], function ( _, $, stateFactory, Correct, instructionMgr ) {
    "use strict";

    var observer;

    var StateAnswer = stateFactory.extend( Correct, function () {
        initResponseDeclarationWidget( this.widget );
    }, function () {
        destroyResponseDeclarationWidget( this.widget );
    } );

    function initBoxListener( event ) {
        var elem = event.currentTarget;
        if ( !elem.className == 'text-hl-choice' ) {
            return;
        }
        elem.dataset.correct = elem.dataset.correct === "true" ? "false" : "true";
    }

    function initResponseDeclarationWidget( widget ) {
        var interaction = widget.element;
        var $editable = widget.$container.find( '.qti-flow-container' );
        var dom = $editable[ 0 ];
        var responseDeclaration = interaction.getResponseDeclaration();
        var correct = responseDeclaration.getCorrect() || [];
        var boxes = dom.querySelectorAll( '.text-hl-choice' );
        var config = {
            childList: true,
            subtree: true
        };

        instructionMgr.appendInstruction( interaction, 'Please select the correct text choices below.' );
        boxes.forEach( function ( box ) {
            box.addEventListener( 'click', initBoxListener );

            if ( correct.some( function ( id ) {
                return id == box.dataset.id;
            } ) ) {
                box.dataset.correct = "true";
            } else {
                box.dataset.correct = "false";
            }
        } );

        function callback() {
            boxes = dom.querySelectorAll( '.text-hl-choice' );
            boxes.forEach( function ( box ) {
                var correct;
                box.removeEventListener( 'click', initBoxListener );
                box.addEventListener( 'click', initBoxListener );
                correct = responseDeclaration.getCorrect() || [];

                if ( correct.some( function ( id ) {
                    return id == box.dataset.id;
                } ) ) {
                    box.dataset.correct = "true";
                } else {
                    box.dataset.correct = "false";
                }
            } );
        };

        observer = new MutationObserver( callback );
        observer.observe( $editable[ 0 ], config );
    }

    function destroyResponseDeclarationWidget( widget ) {
        observer.disconnect();
        var interaction = widget.element;
        var $editable = widget.$container.find( '.qti-flow-container' );
        var dom = $editable[ 0 ];
        var responseDeclaration = interaction.getResponseDeclaration();
        var boxes = Array.prototype.slice.call( dom.querySelectorAll( '.text-hl-choice' ) );
        var correct = boxes.filter( function ( box ) {
            box.removeEventListener( 'click', initBoxListener );
            return box.dataset.correct === "true";
        } ).map( function ( box ) {
            return box.dataset.id;
        } );
        boxes.forEach( function ( box ) {
            box.removeAttribute( 'data-correct' );
        } );
        responseDeclaration.setCorrect( correct );
        instructionMgr.removeInstructions( interaction );
    }

    return StateAnswer;
} );
