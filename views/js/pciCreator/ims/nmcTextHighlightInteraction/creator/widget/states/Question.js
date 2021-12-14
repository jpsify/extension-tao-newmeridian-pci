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
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'taoQtiItem/qtiCreator/widgets/helpers/selectionWrapper',
    'tpl!nmcTextHightLightInteraction/creator/tpl/hottextForm',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/hottext-create',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'nmcTextHightLightInteraction/creator/tao/containerEditor',
    'nmcTextHightLightInteraction/creator/lib/workarounds',
    'tpl!nmcTextHightLightInteraction/creator/tpl/hottext',
    'ui/feedback',

    'css!nmcTextHightLightInteraction/creator/css/authoring',
    'css!nmcTextHightLightInteraction/creator/lib/tabletoolstoolbar/icons',
    'nmcTextHightLightInteraction/creator/lib/tabletoolstoolbar/plugin',
    'css!nmcTextHightLightInteraction/creator/lib/tabletoolstoolbar/icons',
    'nmcTextHightLightInteraction/creator/lib/pastefromgdocs/plugin',
    "nmcTextHightLightInteraction/creator/lib/tableselection/plugin",
    "css!nmcTextHightLightInteraction/creator/lib/tableselection/styles/tableselection"

], function (
    $,
    stateFactory,
    Question,
    formElement,
    minMaxComponentFactory,
    selectionWrapper,
    formTpl,
    toolbarTpl,
    newHottextBtnTpl,
    instructionMgr,
    containerEditor,
    workarounds,
    hottextTpl,
    feedback
) {
    'use strict';

    var ID_PREFIX = "choice_";
    var observer;
    var form;
    var anotherObserver;
    var TextHighLightInteractionStateQuestion = stateFactory.extend( Question, function () {
        this.buildEditor();
    }, function () {
        this.destroyEditor();
    } );

    TextHighLightInteractionStateQuestion.prototype.buildEditor = function buildEditor() {
        var self = this;
        var _widget = this.widget;
        var $container = _widget.$container;

        var $editableContainer = $container.find( '.qti-flow-container' );

        var $bodyTlb;
        var $editable = $editableContainer.find( '[data-html-editable]' );
        var interaction = _widget.element;
        var sharedContainer = $container.find( '.shared-stimulus-container' )[ 0 ];

        var observeConfig = {
            childList: true,
            subtree: true
        };
        instructionMgr.removeInstructions( interaction );
        $editableContainer.attr( 'data-html-editable-container', true );
        $bodyTlb = $( toolbarTpl( {
            serial: _widget.serial,
            state: 'question'
        } ) );
        $editableContainer.append( $bodyTlb );
        $bodyTlb.show();
        self.initHottextCreator();
        containerEditor.create( $editable, {
            change: function change( text ) {
                var newText = workarounds.fixTable( "<div>" + text + "</div>" ) || text;
                newText = workarounds.replaceBr( newText );
                interaction.data( 'editorText', newText );
                interaction.updateMarkup();
            },
            markup: interaction.markup,
            markupSelector: '.qti-flow-container [data-html-editable]',
            related: interaction,
            areaBroker: this.widget.getAreaBroker(),
            toolbar: [ {
                name: 'basicstyles',
                items: [ 'Bold', 'Underline', 'Italic', 'Subscript', 'Superscript' ]
            }, {
                name: 'insert',
                items: [ 'Image', 'SpecialChar', 'TaoTooltip' ]
            }, {
                name: 'links',
                items: [ 'Link' ]
            }, {
                name: 'styles',
                items: [ 'Format' ]
            }, {
                name: 'fontstyles',
                items: [ 'FontSize' ]
            }, {
                name: 'paragraph',
                items: [ 'NumberedList', 'BulletedList', '-', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ]
            }, {
                name: 'indent',
                items: [ 'TaoTab', 'TaoUnTab' ]
            }, {
                name: 'tables',
                items: [ 'tableinsert', 'tabledelete', 'tableproperties', 'tablerowinsertbefore', 'tablerowinsertafter', 'tablerowdelete', 'tablecolumninsertbefore', 'tablecolumninsertafter', 'tablecolumndelete', 'tablecellinsertbefore', 'tablecellinsertafter', 'tablecelldelete', 'tablecellproperties', 'tablecellsmerge', 'tablecellmergeright', 'tablecellmergedown', 'tablecellsplithorizontal', 'tablecellsplitvertical' ]
            } ],
            extraPlugins: 'tabletoolstoolbar',
            qtiMedia: true,
            qtiImage: true,
            qtiInclude: true,
            mathJax: true
        } );

        function callback() {
            var HlElems = $editableContainer[ 0 ].querySelectorAll( '.text-hl-choice' );
            var sharedStimulusDeleteBtns;
            HlElems.forEach( function ( elem ) {
                elem.addEventListener( 'click', function () {
                    removeHlElem( elem, interaction );
                } );
            } );

            sharedStimulusDeleteBtns = $editableContainer[ 0 ].querySelectorAll( '[data-serial^="include"] .mini-tlb [data-role="delete"]' );
            sharedStimulusDeleteBtns.forEach( function ( delBtn ) {
                delBtn.addEventListener( 'click', function () {
                    anotherObserver.observe( $container[ 0 ], observeConfig );
                    interaction.prop( 'sharedHtml', '' );
                    interaction.updateMarkup();
                    sharedContainer.innerHTML = '';
                    sharedContainer.dataset[ "delete" ] = true;
                } );
            } );
            workarounds.applyStyles( $editable[ 0 ] );


        };

        observer = new MutationObserver( callback );
        observer.observe( $editableContainer[ 0 ], observeConfig );

        function sharedStimulusCallack() {
            var shared = $editableContainer[ 0 ].querySelector( '.qti-include' );
            var sharedContainer;
            var html;
            var text1;
            var text2;
            if ( !shared ) {
                return;
            }

            sharedContainer = $container.find( '.shared-stimulus-container' )[ 0 ];
            if ( sharedContainer.dataset[ "delete" ] == "true" ) {
                sharedContainer.innerHTML = '';
                sharedContainer.removeAttribute( 'data-delete' );
                return;
            }

            html = shared.innerHTML;
            if ( !html.trim() ) {
                return;
            }

            text1 = shared.textContent;
            text2 = sharedContainer.textContent;
            if ( removeEmptyChars( text1 ) == removeEmptyChars( text2 ) ) {
                return;
            }

            if ( sharedContainer.innerHTML.trim() ) {
                //feedback().error( 'Shared stimulus source content was changed.' );
                return;
            }

            sharedContainer.innerHTML = html;
            interaction.prop( 'sharedHtml', html );
            anotherObserver.disconnect();
            sharedContainer.addEventListener( 'click', function () {
                $container[ 0 ].querySelector( '[data-qti-class="include"]' ).click();
            } );
        }
        anotherObserver = new MutationObserver( sharedStimulusCallack );
        anotherObserver.observe( $container[ 0 ], observeConfig );
    };

    TextHighLightInteractionStateQuestion.prototype.destroyEditor = function destroyEditor() {
        var $container = this.widget.$container;
        var interaction = this.widget.element;
        var $flowContainer = $container.find( '.qti-flow-container' );
        var $editable = $flowContainer.find( '[data-html-editable]' );
        var sharedContainer;
        observer.disconnect();
        anotherObserver.disconnect();
        workarounds.saveStyles( $editable[ 0 ] );
        $editable.off( 'hottextcreator' );
        $flowContainer.attr( 'data-html-editable-container', false );
        $flowContainer.find( '.mini-tlb[data-role=cke-launcher-tlb]' ).remove();
        containerEditor.destroy( $editable );
        sharedContainer = $container.find( '.shared-stimulus-container' )[ 0 ];
        sharedContainer.innerHTML = sharedContainer.innerHTML;
        interaction.prop( 'sharedHtml', sharedContainer.innerHTML );
        interaction.updateMarkup();
    };

    TextHighLightInteractionStateQuestion.prototype.initForm = function initForm() {
        var widget = this.widget;
        var $form = widget.$form;
        var interaction = widget.element;
        var formMinMaxCallbacks;
        $form.html( formTpl() );
        minMaxComponentFactory( $form.find( '.min-max-panel' ), {
            min: {
                value: parseInt( interaction.attr( 'minChoices' ), 10 ) || 0
            },
            max: {
                value: parseInt( interaction.attr( 'maxChoices' ), 10 ) || 0
            },
            upperThreshold: countChoices( widget.$container[ 0 ] )
        } ).on( 'render', function () {
            form = this;
            form.updateThresholds( 1, countChoices( widget.$container[ 0 ] ) );
        } );
        formElement.initWidget( $form );

        function setAttribute( element, value, name ) {
            element.attr( name, value );
        };

        formMinMaxCallbacks = {
            minChoices: setAttribute,
            maxChoices: setAttribute
        };
        formElement.setChangeCallbacks( $form, interaction, formMinMaxCallbacks );
    };

    TextHighLightInteractionStateQuestion.prototype.initHottextCreator = function initHottextCreator() {
        var self = this;
        var interactionWidget = this.widget;
        var $editable = interactionWidget.$container.find( '.qti-flow-container [data-html-editable]' );
        var $flowContainer = interactionWidget.$container.find( '.qti-flow-container' );
        var $toolbar = $flowContainer.find( '.mini-tlb[data-role=cke-launcher-tlb]' );
        var $newHottextBtn = $( newHottextBtnTpl() );
        var interaction = interactionWidget.element;
        var wrapper = selectionWrapper( {
            $container: $editable,
            allowQtiElements: true
        } );
        var $shared;
        var sharedWrapper;
        $toolbar.append( $newHottextBtn );
        $newHottextBtn.hide();
        $editable.on( 'mouseup.hottextcreator', function () {
            if ( wrapper.canWrap() ) {
                $newHottextBtn.show();
            } else {
                $newHottextBtn.hide();
            }
        } ).on( 'blur.hottextcreator', function () {
            $newHottextBtn.hide();
        } );
        $newHottextBtn.on( 'mousedown.hottextcreator', function () {
            var $newHottext = $( hottextTpl( {
                id: getNewHlElemId( $flowContainer[ 0 ] )
            } ) );
            $newHottextBtn.hide();

            wrapper.wrapWith( $newHottext.clone() );
            self.createNewTextHl();
        } );

        $shared = interactionWidget.$container.find( '.shared-stimulus-container' );
        sharedWrapper = selectionWrapper( {
            $container: $shared,
            allowQtiElements: true
        } );
        $shared.on( 'mouseup.hottextcreator', function () {
            if ( sharedWrapper.canWrap() ) {
                $newHottextBtn.show();
            } else {
                $newHottextBtn.hide();
            }
        } ).on( 'blur.hottextcreator', function () {
            $newHottextBtn.hide();
        } );
        $newHottextBtn.on( 'mousedown.hottextcreator', function () {
            var sharedHtml = interactionWidget.$container.find( '.shared-stimulus-container' )[ 0 ].innerHTML;
            var $newHottext = $( hottextTpl( {
                id: getNewHlElemId( $flowContainer[ 0 ] )
            } ) );
            $newHottextBtn.hide();
            sharedWrapper.wrapWith( $newHottext.clone() );
            self.createNewTextHl();
            interaction.prop( 'sharedHtml', sharedHtml );
            interaction.updateMarkup();
        } );
    };

    TextHighLightInteractionStateQuestion.prototype.createNewTextHl = function createNewTextHl() {
        var interactionWidget = this.widget;
        var $editableContainer = interactionWidget.$container;
        var editable = $editableContainer.find( '.qti-flow-container' )[ 0 ];
        var newHlElem = editable.querySelectorAll( '.text-hl-choice[data-new=true]' )[ 0 ];
        var interactionElement = interactionWidget.element;
        var nestedHlElems;

        if ( !newHlElem ) {
            return;
        }

        nestedHlElems = editable.querySelectorAll( '.text-hl-choice .text-hl-choice' );

        if ( nestedHlElems.length > 0 ) {
            removeHlElem( newHlElem, interactionElement );
            return;
        }

        form.updateThresholds( 1, countChoices( $editableContainer[ 0 ] ) );
        newHlElem.dataset[ "new" ] = false;
        newHlElem.addEventListener( 'click', function () {
            removeHlElem( newHlElem, interactionElement );
        } );
    };

    function removeHlElem( elem, interaction ) {

        var responseDeclaration = interaction.getResponseDeclaration();
        var correct = responseDeclaration.getCorrect() || [];
        var newCorrect = correct.filter( function ( ans ) {
            return ans !== elem.dataset.id;
        } );
        var chNodes = elem.childNodes;
        chNodes.forEach( function ( child ) {
            elem.before( child );
        } );
        responseDeclaration.setCorrect( newCorrect );
        elem.remove();
        form.updateThresholds( 1, countChoices( elem ) );
    }

    function getNewHlElemId( container ) {
        var counter = 1;
        var boxes = Array.prototype.slice.call( container.querySelectorAll( '.text-hl-choice' ) );
        var ids = boxes.map( function ( box ) {
            return box.dataset.id;
        } );

        function isValidId( newElemId ) {
            return !ids.some( function ( id ) {
                return id === newElemId;
            } );
        }

        ;

        while ( !isValidId( ID_PREFIX + counter ) ) {
            counter++;
        }

        return ID_PREFIX + counter;
    }

    function countChoices( container ) {
        return container.querySelectorAll( '.text-hl-choice' ).length;
    }
    function removeEmptyChars( text ) {
        return text.replace( /\r?\n/g, "" ).replace( /\s/g, '' );
    }


    return TextHighLightInteractionStateQuestion;
} );
