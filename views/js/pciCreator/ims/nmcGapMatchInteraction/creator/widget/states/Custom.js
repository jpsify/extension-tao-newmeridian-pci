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
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Custom',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'tpl!nmcGapMatchInteraction/creator/tpl/responseProps',
    'tpl!nmcGapMatchInteraction/creator/tpl/matchCondition',
    'tpl!nmcGapMatchInteraction/creator/tpl/scoreCondition',
], function (
    $,
    stateFactory,
    Custom,
    xmlRenderer,
    responsePropsTpl,
    matchConditionTpl,
    scoreConditionTpl

) {
    'use strict';

    var DEFAULT_PART_SCORE = 0;

    var InteractionStateCustom = stateFactory.create(
        Custom,
        init,
        exit,
    );

    function init() {

        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var correct = response.getCorrect() || [];
        var dom = widget.$container[ 0 ];
        var pci = interaction.metaData.pci;
        var parentItem = interaction.getRelatedItem();
        var rp = parentItem.responseProcessing;
        var $rp = $( $.parseXML( rp.xml ) );
        var result = {};
        var newOutcome;
        var gaps;
        var correctId;
        var $parents;
        
        rp.setProcessingType( 'custom' );
        
        var outcomeScore;
        if(!parentItem.getOutcomeDeclaration('SCORE')){
            outcomeScore = parentItem.createOutcomeDeclaration({
                cardinality : 'single',
                baseType : 'float'
            });
            outcomeScore.buildIdentifier('SCORE', false);
        }

        if ( !interaction.attr( 'matchId' ) || !parentItem.getOutcomeDeclaration( interaction.attr( 'matchId' ) ) ) {
            newOutcome = parentItem.createOutcomeDeclaration( {
                identifier: 'CORRECT_MATCHES',
                cardinality: 'single',
                baseType: 'integer',
            } );
            interaction.attr( 'matchId', newOutcome.attributes.identifier );
        }


        gaps = pci.getGaps();
        correctId = interaction.attr( 'matchId' );
        $parents = $rp.find( 'responseIf > match > variable[identifier="' + correctId + '"]' ).closest( 'responseCondition' );

        gaps.forEach( function ( gap, i ) {
            result[ i + 1 ] = DEFAULT_PART_SCORE;
        } );
        $parents.toArray().forEach( function ( parentElem ) {
            var key = parentElem.querySelector( 'responseIf > match > baseValue' ).textContent;
            var value = parentElem.querySelector( 'setOutcomeValue[identifier="SCORE"] > sum > baseValue' ).textContent;
            result[ key ] = parseFloat( value ) || 0;
        } );

        interaction.data( 'partialMatch', result );

        function callback() {
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

            updateResponseProcessing( widget );
            renderUi( widget );
            
        };
        setTimeout( callback, 500 );

    }
    function exit() {
        var widget = this.widget;

        updateResponseProcessing( widget );
        destroyUi( widget );
        saveCorrect( widget );
    }
    function getPartialCorrectCondition( matches, score, correctId ) {
        var xml;
        if ( !score ) {
            return null;
        }
        xml = $.parseXML( scoreConditionTpl( {
            matches: matches,
            score: score,
            correctId: correctId
        } ) );
        return $( xml ).find( 'responseCondition' )[ 0 ];
    }
    function getPairCondition( pairString, responseId, correctId ) {
        var xml = $.parseXML( matchConditionTpl( {
            pairString: pairString,
            responseId: responseId,
            correctId: correctId
        } ) );
        return $( xml ).find( 'responseCondition' )[ 0 ];
    }

    function getResponseConditions( widget ) {
        var interaction = widget.element;
        var partialScores = interaction.data( 'partialMatch' ) || {};
        var correctId = interaction.attr( 'matchId' );
        var conditions = Object.keys( partialScores ).map( function ( matches ) {
            return getPartialCorrectCondition( matches, partialScores[ matches ], correctId );
        } ).filter( function ( elem ) {
            return !!elem;
        } );
        return conditions;
    }
    function getPairConditions( widget ) {
        var interaction = widget.element;
        var responseId = interaction.attr( 'responseIdentifier' );
        var correctId = interaction.attr( 'matchId' );
        var correct = getCorrect( widget );
        var conditions = correct.map( function ( pair ) {
            return getPairCondition( pair, responseId, correctId );
        } );
        return conditions;

    }

    function updateResponseProcessing( widget ) {
        var interaction = widget.element;
        var item = interaction.getRelatedItem();
        var rp = item.responseProcessing;
        var renderedRp = rp.render( xmlRenderer.get() ) || '<responseProcessing template=\"EMPTY\"/>';
        var $rpXml = $( $.parseXML( renderedRp ) );
        var newRcs = getResponseConditions( widget );
        var pairConditions = getPairConditions( widget );
        var rootElem = $rpXml[ 0 ].documentElement;
        var respId = interaction.attr( 'responseIdentifier' );
        var parents = $rpXml.find( 'variable[identifier="' + respId + '"]' ).closest( 'responseCondition' );
        var corrMatchId = interaction.attr( 'matchId' );
        var corrMatchParents = $rpXml.find( 'variable[identifier="' + corrMatchId + '"]' ).closest( 'responseCondition' );
        var xml;

        corrMatchParents.remove();
        parents.remove();

        pairConditions.forEach( function ( conditionElem ) {
            rootElem.appendChild( conditionElem );
        } );

        newRcs.forEach( function ( conditionElem ) {
            rootElem.appendChild( conditionElem );
        } );

        xml = ( new XMLSerializer() ).serializeToString( rootElem );
        

        rp.xml = xml;
    };

    function renderUi( widget ) {
        var dom = widget.$container[ 0 ];
        var container = dom.querySelector( '.response-props-ui' );
        var interaction = widget.element;
        var partialScores = interaction.data( 'partialMatch' );
        var max = Object.keys( partialScores ).sort( function ( a, b ) {
            return parseInt( b, 10 ) - parseInt( a, 10 );
        } )[ 0 ];
        var respProps = $( responsePropsTpl( {
            maxCorrect: max,
            ns: partialScores,
        } ) )[ 0 ];
        var inputs = respProps.querySelectorAll( 'input' );
        container.innerHTML = '';

        inputs.forEach( function ( input ) {
            input.addEventListener( 'change', onInputChange );
        } );

        container.appendChild( respProps );

        function onInputChange( e ) {
            var data = interaction.data( 'partialMatch' ) || {};
            data[ e.target.name ] = parseFloat( e.target.value ) || 0;
            interaction.data( 'partialMatch', data );
        }
    }
    function destroyUi( widget ) {
        var dom = widget.$container[ 0 ];
        var container = dom.querySelector( '.response-props-ui' );
        container.innerHTML = '';
    }

    function clearGaps( widget ) {
        var dom = widget.$container[ 0 ];
        var gaps = dom.querySelectorAll( '.empty-gap' );
        gaps.forEach( function ( gap ) {
            gap.innerHTML = '';
        } );
    }
    function saveCorrect( widget ) {
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var pci = interaction.metaData.pci;
        var correct = getCorrect( widget );

        pci.removeAllListeners();
        response.setCorrect( correct );
        clearGaps( widget );
    }
    function getCorrect( widget ) {
        var interaction = widget.element;
        var pci = interaction.metaData.pci;
        var raw = pci.getRawResponse();

        return raw.map( function ( pair ) {
            return pair.join( ' ' );
        } );
    }


    return InteractionStateCustom;
} );