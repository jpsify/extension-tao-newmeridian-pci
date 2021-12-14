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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA;
 */

define([
    'jquery',
    'i18n',
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/helper/popup',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'nmcPci/portableLib/equationEditor/tools/grade',
    'nmcPci/portableLib/equationEditor/tools/keyboardBehavior',
    'nmcPci/portableLib/equationEditor/tools/availableTools',    
    'nmcPci/portableLib/equationEditor/tools/authoringTools',
    'nmcPci/portableLib/equationEditor/accordion/accordion',
    'tpl!nmcEquationEditorInteraction/creator/tpl/propertiesForm',
    'tpl!nmcEquationEditorInteraction/creator/tpl/addGap'
], function ($, __, _, stateFactory, Question, formElement, popup, simpleEditor, containerEditor, grade, keyboardBehavior, tools, authoringTools, accordion, formTpl, addGapBtnTpl) {
    'use strict';

    var $addGapBtn = $(addGapBtnTpl());
    var ns = '.nmcEquationEditorInteraction';
    var $toolBarCloser;

    var EquationEditorInteractionStateQuestion = stateFactory.extend(Question, function create() {

        var $container = this.widget.$container,
            $prompt = $container.find('.prompt'),
            interaction = this.widget.element;

        containerEditor.create($prompt, {
            change: function (text) {
                interaction.data('prompt', text);
                interaction.updateMarkup();
            },
            markup: interaction.markup,
            markupSelector: '.prompt',
            related: interaction,
            areaBroker: this.widget.getAreaBroker()
        });

        if (toBoolean(interaction.prop('useGapExpression'), false)) {
            this.createAddGapBtn();
        }

        this.addMathFieldListener();

    }, function exit() {
        var $container = this.widget.$container,
            $prompt = $container.find('.prompt');

        simpleEditor.destroy($container);
        containerEditor.destroy($prompt);

        this.removeAddGapBtn();

        if ($toolBarCloser) {
            $toolBarCloser.trigger('click');
        }
    });

    function toBoolean(value, defaultValue) {
        if (typeof (value) === "undefined") {
            return defaultValue;
        } else {
            return (value === true || value === "true");
        }
    }
    /**
     * Callback for configuration change
     * @param {Object} interaction - the current interaction
     * @param {String} value - new value of the changed property
     * @param {String} name - changed property
     */
    function configChangeCallBack(interaction, value, name) {
        interaction.prop(name, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    EquationEditorInteractionStateQuestion.prototype.initForm = function initForm() {

        var self = this,
            _widget = this.widget,
            $form = _widget.$form,
            $toolGroups,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            gradeOptions = {},
            keyboardBehaviorOptions = {},
            gradeLevel = interaction.prop('gradeLevel'),
            keyboardBehaviorVal = interaction.prop('keyboardBehavior');

        gradeOptions[grade.grade_3_5] = { label: __('Grade 3-5'), selected: false };
        gradeOptions[grade.grade_6_8] = { label: __('Grade 6-8'), selected: false };
        gradeOptions[grade.grade_9_12] = { label: __('Grade 9-12'), selected: false };

        keyboardBehaviorOptions[keyboardBehavior.numbersAndFraction] = { label: __('Positive/Negative and Fractions'), selected: false };
        keyboardBehaviorOptions[keyboardBehavior.numbersAndMath] = { label: __('Numbers and Math Symbols'), selected: false };
        keyboardBehaviorOptions[keyboardBehavior.numbersMathAndText] = { label: __('Numbers, Math Symbols, and Text'), selected: false };

        if (gradeLevel && gradeOptions[gradeLevel]) {
            gradeOptions[gradeLevel].selected = true;
        }
        if (keyboardBehaviorVal && keyboardBehaviorOptions[keyboardBehaviorVal]) {
            keyboardBehaviorOptions[keyboardBehaviorVal].selected = true;
        }

        //render the form using the form template
        $form.html(formTpl({
            serial: response.serial,
            identifier: interaction.attr('responseIdentifier'),

            authorizeWhiteSpace: toBoolean(interaction.prop('authorizeWhiteSpace'), false),
            useGapExpression: toBoolean(interaction.prop('useGapExpression'), false),

            height: interaction.prop('height'),
            width: interaction.prop('width'),

            gradeOptions: gradeOptions,
            gradeLevel: gradeLevel,
            keyboardBehaviorOptions: keyboardBehaviorOptions,

            allowNewLine: toBoolean(interaction.prop('allowNewLine'), false),
            enableAutoWrap: toBoolean(interaction.prop('enableAutoWrap'), false)
        }));

        //init form javascript
        formElement.initWidget($form);

        $('.grade-options').hide();
        $('.' + gradeLevel).show();

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            identifier: function (i, value) {
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },
            useGapExpression: function gapChangeCallback(i, value) {
                if (toBoolean(value, false)) {
                    self.createAddGapBtn();
                    response.attr('cardinality', 'record');
                    response.removeAttr('baseType');
                } else {
                    self.removeAddGapBtn();
                    response.attr('cardinality', 'single');
                    response.attr('baseType', 'string');
                }
                configChangeCallBack(i, value, 'useGapExpression');
            },
            gapStyle: function gapStyleChangeCallback(i, newStyle) {

                i.prop('gapStyle', newStyle);

                configChangeCallBack(i, newStyle, 'gapStyle');
            },
            authorizeWhiteSpace: configChangeCallBack,

            width: configChangeCallBack,
            height: configChangeCallBack,

            gradeLevel: function(interaction, value, name) {
                $('.grade-options').hide();
                $('.' + value).show();
                configChangeCallBack(interaction, value, name);
            },
            keyboardBehavior: configChangeCallBack,

            allowNewLine: configChangeCallBack,
            enableAutoWrap: configChangeCallBack
        });

        $toolGroups = $form.find('.tool-groups');

        $form.find('.sidebar-popup-trigger').each(function(){

            var $trigger = $(this),
                $popup = $trigger.siblings('.sidebar-popup'),
                $panel = $trigger.siblings('.sidebar-popup').find('.sidebar-popup-content');

            $toolBarCloser = $popup.find('.closer');

            $('#item-editor-wrapper').append($popup);
            // basic popup functionality
            popup.init($trigger, {popup : $popup, top: 10});

            var $accordion = $('<div>', {
                'class': 'item-editor-sidebar'
            });

            authoringTools.forEach(function (toolgroup) {
                $accordion.append(createToolGroup(toolgroup));
            });

            accordion.init($accordion);
            accordion.closeSections($accordion.find('section'));

            $panel.append($accordion);

            $panel.find('.math-entry-tool')
                .off('click' + ns)
                .on('click' + ns, function (e) {
                    var $target = $(e.currentTarget),
                        id = $target.data('identifier'),
                        value = $target.data('value');

                    e.stopPropagation();
                    e.preventDefault();

                    var tool = tools[id];
                    interaction.triggerPci('questionToolbarClick', [tool, value]);
                });

        });


    };

    function createToolGroup(group) {
        var $toolGroup = $('<section>', {
            'class': 'tool-group',
            'data-identifier': group.id
        });

        $toolGroup.append($('<h2>', {
            html: group.title
        }));

        var $panel = $('<div>', {
            'class': 'panel'
        });

        $toolGroup.append($panel);

        group.tools.forEach(function (tool) {
            $panel.append(createTool(tool));
        });

        return $toolGroup;
    };

    function createTool(tool) {
        var label, toolType, value;
        var title;
        if (typeof tool == 'string') {
            label = tools[tool].icon
                ? '<span><i class="icon-' + tools[tool].icon + '"></i></span>'
                : '<span>' + tools[tool].label + '</span>';
            value = null;
            toolType = tool;
            title = tools[tool].tooltip;
        } else {
            label = tool.value;
            value = tool.value;
            toolType = tool.toolType;
            title = tool.tooltip;
        }
        return $('<div>', {
            'class': 'math-entry-tool',
            'data-identifier': toolType,
            'data-value': value,
            'data-tooltip': title,
            html: label
        });
    };

    /**
     * Change callback for editable math field
     */

    EquationEditorInteractionStateQuestion.prototype.addMathFieldListener = function addMathFieldListener() {
        var _widget = this.widget,
            interaction = _widget.element;

        interaction.onPci('responseChange', function (math) {
            interaction.prop('expression', math);
        });
    };

    /**
     * Display the "Add Gap" button
     */
    EquationEditorInteractionStateQuestion.prototype.createAddGapBtn = function createAddGapBtn() {
        var _widget = this.widget,
            $container = _widget.$container,
            $cleanBtn = $container.find('.clear-button'),
            interaction = _widget.element;

        $cleanBtn.after($addGapBtn);
        $addGapBtn.parent().addClass('with-gap');
        $addGapBtn.on('click', function () {
            interaction.triggerPci('addGap');
        });
    };

    /**
     * Remove the "Add Gap" button from the DOM
     */
    EquationEditorInteractionStateQuestion.prototype.removeAddGapBtn = function removeAddGapBtn() {
        $addGapBtn.off('click');
        $addGapBtn.parent().removeClass('with-gap');
        $addGapBtn.remove();
    };

    return EquationEditorInteractionStateQuestion;
});
