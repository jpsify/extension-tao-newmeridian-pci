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
    'tpl!nmcTextHightLightInteraction/creator/tpl/responseProps',
    'tpl!nmcTextHightLightInteraction/creator/tpl/matchCondition',
    'tpl!nmcTextHightLightInteraction/creator/tpl/scoreCondition'
], function (
    $,
    stateFactory,
    Custom,
    xmlRenderer,
    responsePropsTpl,
    matchConditionTpl,
    scoreConditionTpl,

) {
    'use strict';

    var DEFAULT_PART_SCORE = 0;

    var InteractionStateCustom = stateFactory.create(
        Custom,
        init,
        exit,
    );
    var observer;

    function init() {

        var widget = this.widget;
        var interaction = widget.element;
        var parentItem = interaction.getRelatedItem();
        var newOutcome;
        var outcomeScore;
        var rp = parentItem.responseProcessing;

        rp.setProcessingType( 'custom' );

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

        updatePartialMatch( widget );
        initResponseDeclarationWidget( widget );
        updateResponseProcessing( widget );
        renderUi( widget );

    }
    function updatePartialMatch( widget ) {
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var correct = response.getCorrect() || [];
        var parentItem = interaction.getRelatedItem();
        var $rp = $( $.parseXML( parentItem.responseProcessing.xml ) );
        var result = {};
        var correctId;
        var $parents;

        correct.forEach( function ( item, i ) {
            result[ i + 1 ] = DEFAULT_PART_SCORE;
        } );
        correctId = interaction.attr( 'matchId' );
        $parents = $rp.find( 'responseIf > match > variable[identifier="' + correctId + '"]' ).closest( 'responseCondition' );

        $parents.toArray().forEach( function ( parentElem ) {
            var key = parentElem.querySelector( 'responseIf > match > baseValue' ).textContent;
            var value = parentElem.querySelector( 'setOutcomeValue[identifier="SCORE"] > sum > baseValue' ).textContent;
            if ( result[ key ] === undefined ) {
                return;
            }
            result[ key ] = parseFloat( value ) || 0;
        } );

        interaction.data( 'partialMatch', result );
    }

    function exit() {
        var widget = this.widget;

        observer.disconnect();

        updateResponseProcessing( widget );
        destroyUi( widget );
        saveCorrect( widget );
        destroyResponseDeclarationWidget( widget );
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
    function getCountCondition( choiceId, responseId, correctId ) {
        var xml = $.parseXML( matchConditionTpl( {
            identifierString: choiceId,
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

    function getCountConditions( widget ) {
        var interaction = widget.element;
        var responseId = interaction.attr( 'responseIdentifier' );
        var correctId = interaction.attr( 'matchId' );
        var correct = getCorrect( widget );
        var conditions = correct.map( function ( choiceId ) {
            return getCountCondition( choiceId, responseId, correctId );
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
        var pairConditions = getCountConditions( widget );
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


    function saveCorrect( widget ) {
        var interaction = widget.element;
        var $editable = widget.$container.find( '.qti-flow-container' );
        var dom = $editable[ 0 ];
        var responseDeclaration = interaction.getResponseDeclaration();
        var boxes = Array.prototype.slice.call( dom.querySelectorAll( '.text-hl-choice' ) );
        var correct = boxes.filter( function ( box ) {
            return box.dataset.correct === "true";
        } ).map( function ( box ) {
            return box.dataset.id;
        } );
        responseDeclaration.setCorrect( correct );

    }
    function getCorrect( widget ) {
        var $editable = widget.$container.find( '.qti-flow-container' );
        var dom = $editable[ 0 ];
        var boxes = Array.prototype.slice.call( dom.querySelectorAll( '.text-hl-choice' ) );
        var correct = boxes.filter( function ( box ) {
            return box.dataset.correct === "true";
        } ).map( function ( box ) {
            return box.dataset.id;
        } );

        return correct;
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

        boxes.forEach( function ( box ) {
            box.addEventListener( 'click', onClickBox );

            if ( correct.some( function ( id ) {
                return id === box.dataset.id;
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
                box.removeEventListener( 'click', onClickBox );
                box.addEventListener( 'click', onClickBox );
                correct = responseDeclaration.getCorrect() || [];

                if ( correct.some( function ( id ) {
                    return id === box.dataset.id;
                } ) ) {
                    box.dataset.correct = "true";
                } else {
                    box.dataset.correct = "false";
                }
            } );

        };

        observer = new MutationObserver( callback );
        observer.observe( $editable[ 0 ], config );

        function onClickBox( event ) {
            var elem = event.currentTarget;
            if ( elem.className.indexOf('text-hl-choice') === -1 ) {
                return;
            }
            elem.dataset.correct = elem.dataset.correct === "true" ? "false" : "true";
            saveCorrect( widget );
            updatePartialMatch( widget );
            renderUi( widget );

        }
    }

    function destroyResponseDeclarationWidget( widget ) {
        var $editable = widget.$container.find( '.qti-flow-container' );
        var dom = $editable[ 0 ];
        var boxes = Array.prototype.slice.call( dom.querySelectorAll( '.text-hl-choice' ) );
        boxes.forEach( function ( box ) {
            box.removeAttribute( 'data-correct' );
        } );
        dom.innerHTML = dom.innerHTML;
    }


    return InteractionStateCustom;
} );