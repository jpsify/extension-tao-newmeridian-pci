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

define( [ 'lodash', 'i18n', 'taoQtiItem/qtiCreator/widgets/states/factory', 'taoQtiItem/qtiCreator/widgets/states/Correct' ], function ( _, __, stateFactory, Correct ) {
    'use strict';

    var GapMatchInteractionStateCorrect = stateFactory.create( Correct, function () {

        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var correct = response.getCorrect() || [];
        var dom = widget.$container[ 0 ];
        var pci = interaction.metaData.pci;

        var callback = function callback() {
            pci.removeAllListeners();
            pci.initialize(-1, dom);

            correct.forEach( function ( pairString ) {
                var pair = pairString.split( ' ' );
                var gapId = pair[ 0 ];
                var choiceId = pair[ 1 ];
                var gap = dom.querySelector( '.empty-gap[data-id="' + gapId + '"]' );
                var choice = dom.querySelector( '.gap-choice[data-id=' + choiceId + ']' );

                if ( !gap || !choice ) {
                    return;
                }

                pci.putChoiceIntoGap( choice.cloneNode( true ), gap );
            } );
            pci.disableChoices();
        };
        setTimeout( callback, 500 );
    }, function () {
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var pci = interaction.metaData.pci;

        pci.removeAllListeners();
        /*
            runtimeResponse = { "list" : {"pair": [["gap_1","choice_1"],["gap_2","choice_2"]] }}
            runtimeRawResponse = [["gap_1","choice_1"],["gap_2","choice_2"]];
            correctResponse = ["gap_1 choice_1","gap_2 choice_2"];
        */
        var rawResponse = pci.getRawResponse();
        var correct = rawResponse.map( function ( pair ) {
            return pair.join( ' ' );
        } );

        response.setCorrect( correct );
        clearGaps( widget );
    } );

    function clearGaps( widget ) {
        var dom = widget.$container[ 0 ];

        var gaps = dom.querySelectorAll( '.empty-gap' );
        gaps.forEach( function ( gap ) {
            gap.innerHTML = '';
        } );
    }

    return GapMatchInteractionStateCorrect;
} );