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

define([
    'jquery',
    'lodash',
    'i18n',
    'ui/feedback',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/selectionWrapper',
    'tpl!nmcGapMatchInteraction/creator/tpl/form',
    'css!nmcGapMatchInteraction/creator/css/form',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/gap-create',
    'tpl!nmcGapMatchInteraction/creator/tpl/newMathBtn',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger',
    'nmcGapMatchInteraction/creator/tao/containerEditor',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/addChoice',
    'nmcGapMatchInteraction/creator/lib/tabletoolstoolbar/plugin',
    'css!nmcGapMatchInteraction/creator/lib/tabletoolstoolbar/icons',
    'tpl!nmcGapMatchInteraction/creator/tpl/choice',
    'tpl!nmcGapMatchInteraction/creator/tpl/deleteBtn',
    'tpl!nmcGapMatchInteraction/creator/tpl/mathDelBtn',
    'tpl!nmcGapMatchInteraction/creator/tpl/gap',
    'tpl!nmcGapMatchInteraction/creator/tpl/mathGap',
    'tpl!nmcGapMatchInteraction/creator/tpl/group',
    'nmcGapMatchInteraction/creator/lib/pastefromgdocs/plugin',
    "nmcGapMatchInteraction/creator/lib/tableselection/plugin",
    "css!nmcGapMatchInteraction/creator/lib/tableselection/styles/tableselection",
    "nmcGapMatchInteraction/creator/equationEditor/equationEditor",
    'tpl!nmcGapMatchInteraction/creator/tpl/editorMarkup',
    'nmcGapMatchInteraction/utils/editorText',
    'nmcGapMatchInteraction/utils/choiceColumnCalculator',

], function (
    $,
    _,
    __,
    feedback,
    stateFactory,
    Question,
    formElement,
    selectionWrapper,
    formTpl,
    formCss,
    newGapTpl,
    newMathBtnTpl,
    toolbarTpl,
    containerEditor,
    addChoiceTpl,
    plugin1,
    pluginIcons,
    choiceTpl,
    deleteBtnTpl,
    mathDeleteBtnTpl,
    gapTpl,
    mathGapTpl,
    groupTpl,
    plugin2,
    plugin3,
    css3,
    eqEditorPci,
    editorMarkupTpl,
    editorTextMethods,
    choiceColumnCalculator,
) {
    'use strict';

    var GAP_SELECTOR = '.empty-gap';
    var CHOICE_SELECTOR = '.gap-choice';
    var DEFAULT_GROUP_ID = 'undefined';
    var observer = void 0;
    var selectedElem;
    var $form;
    var $newGapBtn;
    var $container;
    var self;

    var GapMatchInteractionStateQuestion = stateFactory.extend(Question, function init() {
        self = this;
        this.buildEditor();
    }, function exit() {
        this.destroyEditor();
    });

    function getDataFromMarkup(self) {
        var _widget = self.widget;
        var interaction = _widget.element;

        var edText = interaction.data('editorText');
        if (edText) {
            interaction.data('editorText', editorTextMethods.replaceBr(edText));
        }

        var groups = interaction.prop('groups');
        var choices = interaction.prop('choices');
        var groups1 = _.groupBy(choices, function (item) {
            return item.data.groupid || DEFAULT_GROUP_ID;
        });
        var newGroups = groups.filter(function (group) {
            return !!groups1[group.id];
        });
        if (newGroups.length < 1) {
            newGroups.push({
                id: DEFAULT_GROUP_ID,
                title: '',
            });
        }
        interaction.prop('groups', newGroups);
    };

    function choiceCallback(container, _widget, interaction) {
        var choices = container.querySelectorAll(CHOICE_SELECTOR);
        choices.forEach(function (choice) {
            buildChoiceEditor($(choice), _widget);
            addDeleteBtn(choice, interaction);
            choice.addEventListener('click', onClickSelect);
        });
    };

    GapMatchInteractionStateQuestion.prototype.buildEditor = function buildEditor() {

        var self = this;
        var _widget = this.widget;
        $container = _widget.$container;
        var container = $container[0];
        var $editableContainer = $container.find('.qti-flow-container');
        var $editable = $editableContainer.find('[data-html-editable]');
        var interaction = _widget.element;
        var $bodyTlb = $(toolbarTpl({
            serial: _widget.serial,
            state: 'question'
        }));
        var pci = interaction.metaData.pci;
        if (pci) {
            pci.removeAllListeners();
        }
        $form = _widget.$form;

        $editableContainer.attr('data-html-editable-container', true);
        $editableContainer.append($bodyTlb);
        $bodyTlb.show();

        self.initGapCreator();
        initMathCreator(_widget);
        $container.css('z-index', 'auto');

        containerEditor.create($editable, {
            change: function change(text) {
                var newText = editorTextMethods.fixTable('<div>' + text + '</div>') || text;
                newText = editorTextMethods.replaceBr(newText);
                var bodyElem = $('<div>' + newText + '</div>')[0];
                var mathJaxElem = bodyElem.querySelector('.MathJax');
                mathJaxElem ? mathJaxElem.remove() : 0;
                var mathJaxScriptElem = bodyElem.querySelector('script[type="math/mml"]');
                var mathText = mathJaxScriptElem ? mathJaxScriptElem.innerText : '';
                mathJaxScriptElem ? mathJaxScriptElem.after($(mathText)[0]) : 0;
                mathJaxScriptElem ? mathJaxScriptElem.remove() : 0;
                var newnewText = bodyElem.innerHTML;
                interaction.data('editorText', newnewText);
                interaction.updateMarkup();
            },
            markup: interaction.markup,
            markupSelector: '.qti-flow-container [data-html-editable]',
            related: interaction,
            areaBroker: this.widget.getAreaBroker(),
            toolbar: [{
                name: 'basicstyles',
                items: ['Bold', 'Italic', 'Underline', 'Subscript', 'Superscript']
            }, {
                name: 'insert',
                items: ['Image', 'SpecialChar', 'TaoTooltip']
            }, {
                name: 'links',
                items: ['Link']
            }, {
                name: 'styles',
                items: ['Format']
            }, {
                name: 'fontstyles',
                items: ['FontSize']
            }, {
                name: 'paragraph',
                items: ['NumberedList', 'BulletedList', '-', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
            }, {
                name: 'indent',
                items: ['TaoTab', 'TaoUnTab']
            }, {
                name: 'tables',
                items: ['tableinsert', 'tabledelete', 'tableproperties', 'tablerowinsertbefore', 'tablerowinsertafter', 'tablerowdelete', 'tablecolumninsertbefore', 'tablecolumninsertafter', 'tablecolumndelete', 'tablecellinsertbefore', 'tablecellinsertafter', 'tablecelldelete', 'tablecellproperties', 'tablecellsmerge', 'tablecellmergeright', 'tablecellmergedown', 'tablecellsplithorizontal', 'tablecellsplitvertical']
            }],
            extraPlugins: 'tabletoolstoolbar',
            qtiMedia: true,
            qtiImage: true,
            qtiInclude: true
        });

        choiceCallback(container, _widget, interaction);

        var groups = container.querySelectorAll('.choice-area .group');
        groups.forEach(function (group) {
            buildGroupTitleEditor($(group), _widget);
        });
        var callback = function callback() {
            var gaps = container.querySelectorAll(GAP_SELECTOR);
            gaps.forEach(function (gap) {
                addDeleteBtnGap(gap, interaction);
                gap.removeEventListener('click', onClickSelect);
                gap.addEventListener('click', onClickSelect);
                gap.setAttribute("contenteditable", false);
            });

            //restore table styles added by tabletoolstoolbar plugin for ckEditor 
            var styledElems = container.querySelectorAll('[data-style]');
            styledElems.forEach(function (elem) {
                if (elem.getAttribute('style')) {
                    return;
                }
                elem.setAttribute('style', elem.getAttribute('data-style'));
            });
            var mathElems = container.querySelectorAll('span.edit-math');
            mathElems.forEach(function (mathElem) {
                mathElem.setAttribute('contenteditable',"false");
                mathElem.removeEventListener('click', onClickMath);
                mathElem.addEventListener('click', onClickMath);
            });
        };
        callback();
        var observeConfig = {
            childList: true,
            subtree: true
        };
        observer = new MutationObserver(callback);
        observer.observe(container, observeConfig);
    };

    GapMatchInteractionStateQuestion.prototype.destroyEditor = function destroyEditor() {

        var $container = this.widget.$container;
        var $flowContainer = $container.find('.qti-flow-container');
        var $editable = $container.find('.qti-flow-container [data-html-editable]');
        var container = $container[0];
        

        observer.disconnect();

        $container.css('z-index', '');

        var groups = container.querySelectorAll('.choice-area .group');
        groups.forEach(function (group) {
            destroyGroupTitleEditor(group);
        });

        //save table styles added by tabletoolstoolbar plugin in data attribute 
        var styledElems = $editable[0].querySelectorAll('[style]');
        styledElems.forEach(function (elem) {
            elem.setAttribute('data-style', elem.getAttribute('style'));
        });

        var gaps = container.querySelectorAll(GAP_SELECTOR);
        gaps.forEach(function (gap) {
            removeDeleteBtn(gap);
            gap.removeEventListener('click', onClickSelect);
        });

        resetSelected();

        containerEditor.destroy($editable);
        $flowContainer.removeAttr('data-html-editable-container');
        $flowContainer.find('.mini-tlb[data-role=cke-launcher-tlb]').remove();
        $editable.off('gapcreator');

        var choices = container.querySelectorAll(CHOICE_SELECTOR);
        choices.forEach(function (choice) {
            removeDeleteBtn(choice);
            destroyChoiceEditor(choice);
            choice.removeEventListener('click', onClickSelect);
        });
        editorTextMethods.replaceBrInElem($container);

        var mathElems = container.querySelectorAll('span.edit-math');
        mathElems.forEach(function (mathElem) {
            mathElem.removeEventListener('click', onClickMath);
        });

        getDataFromMarkup(this);

        this.widget.element.updateMarkup();

    };
    function initMathCreator(widget) {
        var $editable = widget.$container.find('.qti-flow-container');
        var $flowContainer = widget.$container.find('.qti-flow-container');
        var $toolbar = $flowContainer.find('.mini-tlb[data-role=cke-launcher-tlb]');
        var $newMathBtn = $(newMathBtnTpl());
        var $choiceEditable = widget.$container.find('.choice-container');


        $toolbar.append($newMathBtn);
        $newMathBtn.hide();

        function showMathBtn() {
            setTimeout(function(){
                if (isEditorSelected()) {
                    $newMathBtn.show();
                }
            }, 0)
        }
        
        $editable.on('focus', '*', showMathBtn)
            .on('click', '*', showMathBtn)
            .on('blur', '*', function () {
                $newMathBtn.hide();
            });
        $choiceEditable.on('focus', '*', function(){
            setTimeout(function(){
                if (isChoiceEditorSelected()) {
                    $newMathBtn.show();
                }
            }, 0)
        }).on('blur', '*', function () {
                $newMathBtn.hide();
            });

        $newMathBtn.on('mousedown', function (e) {
            var $parentChoice = $(window.getSelection().anchorNode).closest('.gap-choice');
            var $parent = $parentChoice.length > 0 ? $parentChoice : $container.find('.qti-flow-container [data-html-editable]');
            var $currentEditable = $parent.find('.container-editor.cke_editable');
            $currentEditable.removeClass('cke-placeholder');
            openMathDialog('', undefined, $parentChoice.length === 0);
        });
    };
    function openMathDialog(mathMl, currentMathElem, addGaps) {
        var parent = $container[0].querySelector('.nmcGapMatchInteraction');
        var container = $(editorMarkupTpl())[0];
        if (!currentMathElem) {
            addEmptyMath();
        }
        parent.appendChild(container);
        eqEditorPci.initialize(container, {
            authorizeWhiteSpace: 'false',
            useGapExpression: 'false',
            gapExpression: '',
            gapStyle: '',
            height: 300,
            width: 600,
            mathsymbols: 'true',
            symbols: 'true',
            geometry: 'true',
            groups: 'true',
            relations: 'true',
            statistics: 'true',
            allowNewLine: 'false',
            enableAutoWrap: 'false',
            expression: mathMl || '<math></math>',
            gradeLevel: 'grade_9_12',
            keyboardBehavior: 'NumbersMathAndText',
        });
        var closeBtn = container.querySelector('.close-btn');
        closeBtn.addEventListener('click', function () {
            onCloseMathDialog($container[0]);
        });
        var gapBtn = container.querySelector('.gap-button');
        if (addGaps) {
            gapBtn.addEventListener('click', function () {
                eqEditorPci.addGap(mathGapTpl({
                    id: getNewGapId(parent)
                }));
            });
        } else {
            gapBtn.remove();
        }
    }
    function onCloseMathDialog(dom) {
        var math = eqEditorPci.getMathMl();
        var mathElem = dom.querySelector('span.edit-math[data-active]');
        dom.querySelector('.math-editor').remove();
        if (!$(math)[0].innerHTML.trim()) {
            mathElem.remove();
            return;
        }
        mathElem.removeAttribute('data-active');
        mathElem.removeEventListener('click', onClickMath);
        mathElem.addEventListener('click', onClickMath);
        mathElem.innerHTML = math;
    }
    function onClickMath(e) {
        var clone = e.currentTarget.cloneNode(true);
        var isChoiceMath = $(e.currentTarget).closest('.gap-choice').length > 0;
        clone.querySelectorAll('.empty-gap .delete-btn').forEach(function (delBtnElem) {
            delBtnElem.remove();
        });
        e.currentTarget.setAttribute('data-active', 'true');
        openMathDialog(clone.innerHTML, e.currentTarget, !isChoiceMath);
    }
    function addEmptyMath() {
        var markup = '<span class="edit-math" data-active="true" contenteditable="false"></span>';
        wrapEmpty($(markup));

    }
    GapMatchInteractionStateQuestion.prototype.initGapCreator = function initGapCreator() {
        var self = this;
        var interactionWidget = this.widget;
        var $editable = interactionWidget.$container.find('.qti-flow-container [data-html-editable]');
        var $flowContainer = interactionWidget.$container.find('.qti-flow-container');
        var $toolbar = $flowContainer.find('.mini-tlb[data-role=cke-launcher-tlb]');
        $newGapBtn = $(newGapTpl());
        var wrapper = selectionWrapper({
            $container: $editable,
            allowQtiElements: false
        });

        $toolbar.append($newGapBtn);
        $newGapBtn.hide();

        $editable.on('focus', '*', onFocusEditable )
        .on('click', '*', onFocusEditable )
        .on('blur', '*', function () {
            $newGapBtn.hide();
        });

        $newGapBtn.on('mousedown', function () {
            onGapCreatorClick(wrapper, self);
        });

        function onFocusEditable(){
            if (isEditorSelected() && (wrapper.canWrap() || canWrapEmpty())) {
                $newGapBtn.show();
            }else{
                $newGapBtn.hide();
            }
        }
    };

    function isEditorSelected() {
        var selection = window.getSelection();
        return $(selection.focusNode).parents('.qti-flow-container').length > 0;
    }

    function isChoiceEditorSelected(){
        var selection = window.getSelection();
        return $(selection.focusNode).parents('.gap-choice').length > 0;
    }

    function canWrapEmpty() {
        var selection = window.getSelection();
        try{
            return selection.getRangeAt(0);
        }catch(e){
            return false;
        }
    }

    function wrapEmpty($wrapper) {
        if (!canWrapEmpty()) {
            return false;
        }
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        try {
            range.surroundContents($wrapper[0]);
            selection.removeAllRanges();
            return true;
        } catch (err) {
            return false;
        }
    }

    function onGapCreatorClick(wrapper, self) {
        var interactionWidget = self.widget;
        var $flowContainer = interactionWidget.$container.find('.qti-flow-container');
        var $nnGap = createGapMarkup($flowContainer[0]);
        var selection = canWrapEmpty() ? window.getSelection().getRangeAt(0) : null;
        if(!selection || $( selection.commonAncestorContainer ).closest('.qti-flow-container').length < 1){
            window.getSelection().removeAllRanges();
            return;
        }
        if (wrapper.wrapWith($nnGap.clone())) {
            self.createChoiceFromSelection();
            self.replaceSelectionWithGap();
        } else if (wrapEmpty($nnGap.clone())) {
            self.replaceSelectionWithGap();
        } else {
            feedback().error(__('Cannot create gap from this selection. Please check that you do not have partially selected elements.'));
        }
    }
    function createGapMarkup(container) {
        var $newGap;
        if ($(window.getSelection().anchorNode).closest('math').length > 0) {
            $newGap = $(mathGapTpl({
                id: getNewGapId(container)
            }));
        } else {
            $newGap = $(gapTpl({
                id: getNewGapId(container)
            }));
        }
        return $newGap.clone();
    }
    GapMatchInteractionStateQuestion.prototype.createChoiceFromSelection = function createChoiceFromSelection() {
        var self = this;
        var $container = this.widget.$container;
        var selection = $container.find('.empty-gap[data-new="true"]')[0];

        var widget = this.widget;
        var interaction = widget.element;
        var $addChoiceBtn = $container.find('.choice-area .add-option');
        var selectionContent = selection.tagName === 'mspace' ? '<math>' + selection.innerHTML + '</math>' : selection.innerHTML;

        addChoice(widget, interaction, $addChoiceBtn, selectionContent, self);
    };

    GapMatchInteractionStateQuestion.prototype.addNewChoiceButton = function () {

        var self = this;
        var widget = this.widget;
        var $choiceArea = widget.$container.find('.choice-area');
        var interaction = widget.element;

        if ($choiceArea.length && !$choiceArea.children('.add-option').length) {
            $choiceArea.append(addChoiceTpl({
                serial: this.serial,
                text: __('Add choice')
            }));
            $choiceArea.children('.add-option').show().on('click.qti-widget', function (e) {
                e.stopPropagation();
                addChoice(widget, interaction, this, null, self);
            });
        }
    };
    GapMatchInteractionStateQuestion.prototype.replaceSelectionWithGap = function replaceSelectionWithGap() {
        var interactionWidget = this.widget;
        var newGap = interactionWidget.$container.find(GAP_SELECTOR + '[data-new="true"]')[0];
        var interaction = interactionWidget.element;

        newGap.innerHtml = '';
        newGap.innerText = newGap.tagName.toLowerCase() === 'span' ? '​' : '';
        addDeleteBtnGap(newGap, interaction);
        newGap.setAttribute('data-new', false);
    };

    GapMatchInteractionStateQuestion.prototype.initForm = function () {
        var _widget = this.widget;
        var $form = _widget.$form;
        var interaction = _widget.element;
        var self = this;
        var position = interaction.prop('position');

        $form.html(formTpl({
            width: "",
            height: "",
            groupid: "",
            matchmax: "",
            position: position,
            display: interaction.prop('display'),
            minChoices: interaction.prop('minChoices'),
            numColumns: interaction.prop('numColumns')
        }));

        formElement.initWidget($form);

        function styleCallback(interaction, value, name) {
            if (!selectedElem) {
                return;
            }
            if ($(selectedElem).closest('.math-editor').length > 0) {
                mathGapStyleCallback(interaction, value, name);
                return;
            }
            if (name == 'minHeight') {
                var DEFAULT_HEIGHT = 20;
                if (value !== '' && value < DEFAULT_HEIGHT) {
                    selectedElem.style['lineHeight'] = value + 'px';
                } else {
                    selectedElem.style['line-height'] = '';
                }
            }
            if (value === '') {
                selectedElem.style[name] = '';

                return;
            }

            selectedElem.style[name] = value + 'px';

        };

        function mathGapStyleCallback(interaction, value, name) {
            var newName = name === 'minHeight' ? 'height' : 'width';
            eqEditorPci.changeGapData(selectedElem.getAttribute('data-id'), newName,value? value + 'px': '');
            selectedElem = _widget.$container.find('.math-editor span[data-id="'+selectedElem.getAttribute('data-id')+'"]')[0];
        }

        function maxCallback(interaction, value, name) {
            if (!selectedElem) {
                return;
            }
            var chs = interaction.prop('choices');
            var newChs;
            if (!value) {
                selectedElem.removeAttribute('data-' + name);
                newChs = chs.map(function (choice) {
                    if (selectedElem.getAttribute('data-id') === choice.data.id) {
                        choice.data[name] = undefined;
                    }
                    return choice;
                });
            } else {
                selectedElem.setAttribute('data-' + name, value);
                newChs = chs.map(function (choice) {
                    if (selectedElem.getAttribute('data-id') === choice.data.id) {
                        choice.data[name] = value;
                    }
                    return choice;
                });
            }
            interaction.prop('choices', newChs);
        }

        function groupCallback(interaction, value, name) {
            if (!selectedElem) {
                return;
            }
            var chs = interaction.prop('choices');
            var newChs;
            if ($(selectedElem).closest('.math-editor').length > 0) {
                eqEditorPci.changeGapData(selectedElem.getAttribute('data-id'), 'data-' + name, value);
                return;
            }
            if (!value) {
                selectedElem.removeAttribute('data-' + name);
                newChs = chs.map(function (choice) {
                    if (selectedElem.getAttribute('data-id') === choice.data.id) {
                        choice.data[name] = undefined;
                    }
                    return choice;
                });
            } else {
                selectedElem.setAttribute('data-' + name, value);

                newChs = chs.map(function (choice) {
                    if (selectedElem.getAttribute('data-id') === choice.data.id) {
                        choice.data[name] = value;
                    }
                    return choice;
                });
            }
            interaction.prop('choices', newChs);

            if (selectedElem.classList.contains('gap-choice')) {
                addGroup(interaction, value);

                if (interaction.prop('display') === 'groups') {
                    interaction.prop('display', 'list');
                    self.refreshMarkup();
                    interaction.prop('display', 'groups');
                    self.refreshMarkup();
                }
            }
        }

        function displayCallback(interaction, value, name) {

            interaction.prop('display', value);
            self.refreshMarkup();
            $('.panel.numberColumns').toggle(value === 'columns');
        }

        function numColumnsCallback(interaction, value, name) {
            interaction.prop('numColumns', value);
            self.refreshMarkup();
        }

        function positionCallback(interaction, value, name) {
            interaction.prop('position', value);
            interaction.updateMarkup();
            var $positionContainer = _widget.$container.find('.choice-position-container');
            var pContainer = $positionContainer[0];
            pContainer.className = ['choice-position-container', 'position-' + value].join(' ');
        }
        function propCallback(interaction, value, name) {
            interaction.prop(name, value);
            interaction.updateMarkup();
        }

        formElement.setChangeCallbacks($form, interaction, {
            minWidth: styleCallback,
            minHeight: styleCallback,
            groupid: groupCallback,
            matchmax: maxCallback,
            choicesposition: positionCallback,
            choicesdisplay: displayCallback,
            minChoices: propCallback,
            numColumns: numColumnsCallback
        });

    };

    function removeGap(event, interaction) {
        var gap = event.target;
        removeFromResponse(gap.getAttribute('data-id'), interaction);
        gap.remove();
    }
    function getNewChoiceId(container) {
        var CHOICE_ID_PREFIX = 'choice_';
        return getNewId(container, CHOICE_SELECTOR, CHOICE_ID_PREFIX);
    }
    function getNewGapId(container) {
        var GAP_ID_PREFIX = 'gap_';
        return getNewId(container, GAP_SELECTOR, GAP_ID_PREFIX);
    }

    function getNewId(container, selector, prefix) {
        var boxes = Array.prototype.slice.call(container.querySelectorAll(selector));
        var ids = boxes.map(function (box) {
            return box.getAttribute('data-id');
        });

        function isValidId(newElemId) {
            return !ids.some(function (id) {
                return id === newElemId;
            });
        };

        var counter = 1;
        while (!isValidId(prefix + counter)) {
            counter++;
        }
        return prefix + counter;
    }
    function addChoice(widget, interaction, $addChoiceBtn, content, self) {

        var id = getNewChoiceId(widget.$container[0]);
        if (!content) {
            content = id;
        }
        var choice = {
            content: content,
            data: {
                id: id,
            },
        };
        var $newChoice = $(choiceTpl(choice));

        var ch = interaction.prop('choices');
        ch.push(choice);
        interaction.prop('choices', ch);
        interaction.updateMarkup();


        if (interaction.prop('display') === 'groups') {
            var newContainer = widget.$container[0].querySelector('.choice-container .group[data-id="' + DEFAULT_GROUP_ID + '"] .choices');
            if (!newContainer) {
                addGroup(interaction, DEFAULT_GROUP_ID);
                var $groupElem = $(groupTpl({ id: DEFAULT_GROUP_ID }));
                $($addChoiceBtn).before($groupElem);

                newContainer = widget.$container[0].querySelector('.choice-container .group[data-id="' + DEFAULT_GROUP_ID + '"] .choices');
            }
            newContainer.append($newChoice[0]);
        } else {
            $($addChoiceBtn).before($newChoice);
        }

        buildChoiceEditor($newChoice, widget);
        addDeleteBtn($newChoice[0], interaction);
        $newChoice[0].addEventListener('click', onClickSelect);

        self.refreshMarkup();

    }
    function deleteChoice(interaction, elem) {

        var chs = interaction.prop('choices');
        var nChs = chs.filter(function (item) {
            return item.data.id !== elem.getAttribute('data-id');
        });
        interaction.prop('choices', nChs);


        var container = interaction.metaData.widget.$container[0];

        var groups = interaction.prop('groups');

        var groupedChoices = _.groupBy(nChs, function (item) {
            return item.data.groupid || DEFAULT_GROUP_ID;
        });
        var newGroups = groups.filter(function (group) {
            if (!groupedChoices[group.id]) {
                var elem = container.querySelector('.choice-area .group[data-id="' + group.id + '"]');
                if (elem) {
                    elem.remove();
                }
                return false;
            }
            return true;
        });
        if (newGroups.length < 1) {
            newGroups.push({
                id: DEFAULT_GROUP_ID
            });
        };
        interaction.prop('groups', newGroups);
        self.refreshMarkup()

        interaction.updateMarkup();

        removeFromResponse(elem.getAttribute('data-id'), interaction);
        elem.remove();

    }
    function addGroup(interaction, groupid) {
        var groups = interaction.prop('groups');
        var groupExists = groups.some(function (group) {
            return group.id === (groupid || DEFAULT_GROUP_ID);
        });

        if (!groupExists) {
            groups.push({
                id: groupid,
                title: '',
            });
            interaction.prop('groups', groups);
            interaction.updateMarkup();
        };

    };

    function buildChoiceEditor($elem, widget) {

        var elem = $elem[0];
        var ed = elem.querySelector('[data-html-editable]');

        containerEditor.create($(ed), {
            change: function change(text) {
                var chs = widget.element.prop('choices');
                var newChs = chs.map(function (choice) {
                    if (elem.getAttribute('data-id') === choice.data.id) {
                        choice.content = text.replace(/[^-]style=/g, ' data-style=');
                    }
                    return choice;
                });
                widget.element.prop('choices', newChs);
            },
            markup: widget.element.markup,
            markupSelector: CHOICE_SELECTOR + '[data-id="' + elem.getAttribute('data-id') + '"] [data-html-editable]',
            related: widget.element,
            areaBroker: widget.getAreaBroker(),
            toolbar: [{
                name: 'basicstyles',
                items: ['Bold', 'Italic', 'Underline', 'Subscript', 'Superscript']
            }, {
                name: 'styles',
                items: ['Format']
            }, {
                name: 'fontstyles',
                items: ['FontSize']
            }, {
                name: 'paragraph',
                items: ['NumberedList', 'BulletedList', '-', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
            }, {
                name: 'indent',
                items: ['TaoTab', 'TaoUnTab']
            }]
        });
    }
    function destroyChoiceEditor(elem) {
        var editable = elem.querySelector('[data-html-editable]');
        containerEditor.destroy($(editable));
    }

    function removeFromResponse(id, interaction) {

        var response = interaction.getResponseDeclaration();
        var correct = response.getCorrect() || [];

        var newCorrect = correct.map(function (pairString) {
            return pairString.split(' ');
        }).filter(function (pair) {
            return pair[0] !== id && pair[1] !== id;
        }).map(function (pair) {
            return pair.join(' ');
        });
        response.setCorrect(newCorrect);
    }
    function addDeleteBtn(choice, interaction) {
        var deleteBtn = $(deleteBtnTpl())[0];
        choice.append(deleteBtn);
        deleteBtn.addEventListener('click', function () {
            deleteChoice(interaction, choice);
        });
    }
    function removeDeleteBtn(choice) {
        var btn = choice.querySelector('.delete-btn');
        if (!btn) {
            return;
        }
        btn.remove();
    }

    function addDeleteBtnGap(gap, interaction) {
        var deleteBtn;
        if (gap.querySelector('.delete-btn')) {
            return;
        }
        if ($(gap).closest('math').length > 0) {
            deleteBtn = $(mathDeleteBtnTpl())[0];
        } else {
            deleteBtn = $(deleteBtnTpl())[0];
        }
        gap.append(deleteBtn);
        deleteBtn.addEventListener('click', function () {
            removeGap({ target: gap }, interaction);
        });
    }

    function onClickSelect(event) {
        var target = event.currentTarget;
        resetSelected();
        setSelected(target);

        var selectedForm = $form[0];
        if ($(selectedElem).hasClass("gap-choice")) {
            var matchmax = selectedForm.querySelector('input[name="matchmax"]');
            matchmax.value = selectedElem.getAttribute("data-matchmax") || '';
        } else {
            if ($(selectedElem).closest('.math-editor').length > 0) {
                var minWidth = selectedForm.querySelector('input[name="minWidth"]');
                var minHeight = selectedForm.querySelector('input[name="minHeight"]');
                minWidth = selectedElem.getAttribute('width');
                minHeight = selectedElem.getAttribute('height');
            } else {
                var styleInputs = selectedForm.querySelectorAll('.style input[name]');
                styleInputs.forEach(function (input) {
                    var name = input.getAttribute('name') || '';
                    input.value = selectedElem.style && selectedElem.style[name] ? parseInt(selectedElem.style[name], 10) : '';
                });
            }
        }

        var groupInput = selectedForm.querySelector('.group input[name="groupid"]');
        groupInput.value = selectedElem.getAttribute("data-groupid") || '';
    }
    function resetSelected() {
        if (!selectedElem) {
            return;
        }
        selectedElem.removeAttribute('data-selected');
        selectedElem = undefined;
        $form.find('.selected').addClass('hidden');
        $form.find('.selected-choice').addClass('hidden');
        $form.find('.group').addClass('hidden');
    }
    function setSelected(elem) {
        selectedElem = elem;
        selectedElem.setAttribute('data-selected', true);
        var className = selectedElem.className;
        var classList = className.split(' ');
        if (classList.some(function (cl) {
            return cl === "empty-gap";
        })) {
            $form.find('.selected').removeClass('hidden');
        } else if (classList.some(function (cl) {
            return cl === "gap-choice";
        })) {
            $form.find('.selected-choice').removeClass('hidden');
        }
        $form.find('.group').removeClass('hidden');
    }

    GapMatchInteractionStateQuestion.prototype.refreshMarkup = function refreshMarkup() {
        var interaction = this.widget.element;
        var container = this.widget.$container.find('.choice-area')[0];
        var choices = interaction.prop('choices');
        var groups = interaction.prop('groups');

        interaction.updateMarkup();

        unGroupChoices(container, choices);
        changeColumnCount(container, -1);

        if (interaction.prop('display') === 'groups') {
            groupChoices(container, groups, this.widget);
        } else if (interaction.prop('display') === 'columns') {
            putChoicesInColumns(container, choices, this.widget);
        }
    };
    function changeColumnCount(choiceContainer, count){
        if(count < 0 ){
            choiceContainer.removeAttribute("data-columns");
            return;
        }
        choiceContainer.setAttribute("data-columns", count);
    }

    function putChoicesInColumns(choiceContainer, choices, widget) {
        var interaction = widget.element;
        var addOption = choiceContainer.querySelector('.add-option');
        var numColumns = parseInt(interaction.prop('numColumns'), 10) || 0;

        var columns = choiceColumnCalculator.calculateChoiceColumns(choices, numColumns);
        columns.forEach(function (column) {
            column.choices.forEach(function (choice, index) {
                var choiceElem = choiceContainer.querySelector('.gap-choice[data-id="' + choice.data.id + '"]');
                if (choiceElem) {
                    choiceElem.setAttribute('data-row', index);
                    choiceElem.setAttribute('data-column', column.idx);
                }
            });
        });

        if (addOption) {
            choiceContainer.appendChild(addOption);
        };
        changeColumnCount(choiceContainer, columns.length)
    };

    function groupChoices(choiceContainer, groups, widget) {
        var addOption = choiceContainer.querySelector('.add-option');
        groups.forEach(function (group) {
            var groupElem = $(groupTpl(group))[0];
            var chList = groupElem.querySelector('.choices');
            var choiceElems;
            if (group.id === DEFAULT_GROUP_ID) {
                choiceElems = choiceContainer.querySelectorAll('.gap-choice:not([data-groupid])');
            } else {
                choiceElems = choiceContainer.querySelectorAll('.gap-choice[data-groupid="' + group.id + '"]');
            }
            if (choiceElems.length === 0) {
                return;
            }
            choiceElems.forEach(function (choice) {
                chList.appendChild(choice);
            });
            choiceContainer.appendChild(groupElem);
        });
        var groupElems = choiceContainer.querySelectorAll('.group');
        groupElems.forEach(function (group) {
            buildGroupTitleEditor($(group), widget);
        });
        if (addOption) {
            choiceContainer.appendChild(addOption);
        }
    };

    function unGroupChoices(choiceContainer, choices) {

        var addOption = choiceContainer.querySelector('.add-option');
        var groupElems = choiceContainer.querySelectorAll('.group');
        groupElems.forEach(function (group) {
            destroyGroupTitleEditor(group);
        });
        choices.forEach(function (choice) {
            var choiceElem = choiceContainer.querySelector('.gap-choice[data-id="' + choice.data.id + '"]');
            if (choiceElem) {
                choiceContainer.appendChild(choiceElem);
            }
        });
        choiceContainer.querySelectorAll('.group').forEach(function (groupElem) {
            groupElem.remove();
        });
        if (addOption) {
            choiceContainer.appendChild(addOption);
        }
    }

    function buildGroupTitleEditor($elem, widget) {

        var elem = $elem[0];
        var ed = elem.querySelector('.group-title');

        containerEditor.create($(ed), {
            change: function change(text) {
                var groups = widget.element.prop('groups');
                var newGroups = groups.map(function (group) {
                    if (elem.getAttribute('data-id') === group.id) {
                        group.title = editorTextMethods.replaceBr(text);
                    }
                    return group;
                });
                widget.element.prop('groups', newGroups);
                widget.element.updateMarkup();
            },
            markup: widget.element.markup,
            markupSelector: '.choice-area .group[data-id="' + elem.getAttribute('data-id') + '"] .group-title',
            related: widget.element,
            areaBroker: widget.getAreaBroker(),
            toolbar: [{
                name: 'basicstyles',
                items: ['Bold', 'Italic', 'Underline', 'Subscript', 'Superscript']
            }, {
                name: 'styles',
                items: ['Format']
            }, {
                name: 'fontstyles',
                items: ['FontSize']
            }]
        });

    }

    function destroyGroupTitleEditor(elem) {
        var editable = elem.querySelector('.group-title');
        containerEditor.destroy($(editable));
    }
    return GapMatchInteractionStateQuestion;
});