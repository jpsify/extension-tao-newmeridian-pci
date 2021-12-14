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
 *
 * @author Christophe Noël <christophe@taotesting.com>
 *
 */
define([
    'qtiCustomInteractionContext',
    'taoQtiItem/portableLib/jquery_2_1_1',
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/util/event',
    'nmcPci/portableLib/equationEditor/mathJaxEditor/editor',
    'nmcPci/portableLib/equationEditor/tools/grade',
    'nmcPci/portableLib/equationEditor/tools/keyboardBehavior',
    'nmcPci/portableLib/equationEditor/tools/numbersAndFraction',
    'nmcPci/portableLib/equationEditor/tools/numbersAndMath',
    'nmcPci/portableLib/equationEditor/tools/numbersMathAndText',
    'nmcPci/portableLib/equationEditor/tools/availableTools',
    'nmcPci/portableLib/equationEditor/accordion/accordion',
    'nmcEquationEditorInteraction/runtime/utils/mathMlUtils',
    'taoQtiItem/qtiCommonRenderer/renderers/Math',
    'nmcPci/portableLib/equationEditor/polyfill/es6-collections',
], function (
    qtiCustomInteractionContext,
    $,
    _,
    event,
    editor,
    grade,
    keyboardBehavior,
    numbersAndFraction,
    numbersAndMath,
    numbersMathAndText,
    tools,
    accordion,
    mathMlUtils
) {
    'use strict';
    var ns = '.nmcEquationEditorInteraction';

    var equationEditorInteraction = {

        /**
         * return {Boolean} - Are we in a TAO QTI Creator context?
         */
        inQtiCreator: function isInCreator() {
            if (_.isUndefined(this._inQtiCreator) && this.$container) {
                this._inQtiCreator = this.$container.hasClass('tao-qti-creator-context');
            }
            return this._inQtiCreator;
        },

        addGap: function () {
            var mrow = MathJax.HTML.Element('mrow', {editable: true});
            mrow.classList.add('ee-gap');
            this.mje.addElement(mrow, mrow);
            this.mje.focus();
        },

        toolBarClick: function(tool, value) {
            tool.fn(this.mje, value);
            this.mje.focus();
        },

        /**
         * Render PCI
         */
        render: function render(config) {
            var $entry, $container, $toolbar;
            this.initConfig(config);

            $entry = this.$container.find('.math-entry');
            $container = this.$container.find('.editor-container');
            $toolbar = this.$container.find('.toolbar-container');

            $container.height(parseInt(this.config.height, 10) || 'auto');
            if (this.config.keyboardBehavior === keyboardBehavior.numbersMathAndText) {
                $toolbar.height(parseInt(this.config.height, 10) || 'auto');
            } else {
                $toolbar.height('auto');
            }
            $entry.width(this.config.width);
            $entry.removeClass (function (index, className) {
                return (className.match (/(^|\s)kb-\S+/g) || []).join(' ');
            });
            $entry.removeClass (function (index, className) {
                return (className.match (/(^|\s)grade-\S+/g) || []).join(' ');
            });
            $entry.addClass('kb' + this.config.keyboardBehavior.replace( /([A-Z])/g, '-$1').toLowerCase());
            $entry.addClass('grade-' + this.config.gradeLevel.replace( /([A-Z])/g, '-$1').toLowerCase());

            this.setEditorOptions();
            
            this.createToolbar();
            this.addToolbarListeners();
        },

        /**
         * @param {Object} config
         * @param {Boolean} config.authorizeWhiteSpace - if space key creates a space
         * @param {Boolean} config.useGapExpression - create a math expression with gaps (placeholders)
         * @param {Boolean} config.gapExpression - content of the math expression
         * @param {('math-gap-small'|'math-gap-medium'|'math-gap-large')} config.gapStyle - size of the gaps
         * @param {Boolean} config.tool_toolId - is the given tool enabled?
         * @param {Boolean} config.allowNewLine - experimental... allows the test taker to create a new line on Enter
         * @param {Boolean} config.enableAutoWrap - experimental... allows the editor to auto wrap the content
         */
        initConfig: function initConfig(config) {
            function toBoolean(value, defaultValue) {
                if (typeof (value) === "undefined") {
                    return defaultValue;
                } else {
                    return (value === true || value === "true");
                }
            }
            
            this.config = {
                toolGroups: {
                    mathsymbols: toBoolean(config.mathsymbols, true),
                    symbols: toBoolean(config.symbols, true),
                    geometry: toBoolean(config.geometry, true),
                    groups: toBoolean(config.groups, true),
                    relations: toBoolean(config.relations, true),
                    greek: toBoolean(config.greek, true),
                    trigonometry: toBoolean(config.trigonometry, true),
                    statistics: toBoolean(config.statistics, true),
                },

                allowNewLine:   toBoolean(config.allowNewLine, false),
                useGapExpression: toBoolean(config.useGapExpression, false),

                width: parseInt(config.width, 10) || 960,
                height: parseInt(config.height, 10) || 'auto',

                expression: config.expression,

                gradeLevel: config.gradeLevel || grade.grade_9_12,
                keyboardBehavior: config.keyboardBehavior || keyboardBehavior.numbersAndFraction,
            };
        },

        setEditorOptions: function setEditorOptions() {
            if (this.mje) {
                this.mje.allowNewline(this.config.allowNewLine);
                this.mje.allowText(this.config.keyboardBehavior === keyboardBehavior.numbersMathAndText);
            }
        },

        /**
         * Transform a DOM element into a MathQuill Editable Field
         */
        createMathEditable: function createMathEditable() {
            var $mje = $('<div>'), self = this;
            this.$editor.empty();
            this.$editor.append($mje);
            this.mje = editor.default($mje[0]);
            if (this.inQtiCreator()) {
                this.mje.onChange = function (math) {
                    self.trigger('responseChange', [ self.mje.get() ]);
                };
            }
            this.setEditorOptions();
            if (!this.inQtiCreator()) {
                this.mje.readonly(this.config.useGapExpression);
            }
            if (this.config.expression) {
                self.mje.set(self.config.expression);
            }

            this.$clearButton.on('click', function() {
                var expression = '<math></math>';
                if (!self.inQtiCreator() && self.config.expression) {
                    expression = self.config.expression;
                }
                self.mje.set(expression);
                if (self.inQtiCreator()) {
                    self.trigger('responseChange', [ expression ]);
                }
                self.mje.focus();
            });

            this.$undoButton.on('click', function() {
                self.mje.undo();
                self.mje.focus();
            });

            this.$redoButton.on('click', function() {
                self.mje.redo();
                self.mje.focus();
            });
        },

        /**
         * =======
         * Toolbar
         * =======
         */

        /**
         * Create the toolbar markup
         */
        createToolbar: function createToolbar() {

            // create buttons
            this.$toolbar.empty();
            switch (this.config.keyboardBehavior) {
                case keyboardBehavior.numbersAndFraction:
                    this.createTools(numbersAndFraction);
                    break;
                case keyboardBehavior.numbersAndMath:
                    this.createTools(numbersAndMath[this.config.gradeLevel] || numbersAndMath[grade.grade_9_12]);
                    break;
                case keyboardBehavior.numbersMathAndText:
                    this.createToolGroups(numbersMathAndText[this.config.gradeLevel] || numbersMathAndText[grade.grade_9_12]);
                    break;
            }
        },

        createTools: function createTools(tools) {
            var self = this;
            var $tools = $('<div>', {
                'class': 'item-editor-sidebar'
            });

            tools.forEach(function (tool, idx) {
                $tools.append(self.createTool(tool, idx));
            });

            self.$toolbar.append($tools);
        },

        createToolGroups: function(groups) {
            var self = this;

            var $accordion = $('<div>', {
                'class': 'item-editor-sidebar'
            });

            self.activeTools = [];
            groups.forEach(function (toolgroup) {
                $accordion.append(self.createToolGroup(toolgroup));
            });

            accordion.init($accordion);
            accordion.closeSections($accordion.find('section'));

            self.$toolbar.append($accordion);
        },

        /**
         * Create a group of buttons
         * @param {String} group - description of the toolgroup
         * @param {String} group.id
         * @param {Array} group.tools - ids of tools
         * @param {Object} availableTools - tools descriptions
         * @returns {jQuery|string} the created element or an empty string
         */
        createToolGroup: function createToolGroup(group) {
            var self = this,
                $toolGroup = $('<section>', {
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

            group.tools.forEach(function (tool, idx) {
                $panel.append(self.createTool(tool, idx));
            });

            return $toolGroup;
        },

        /**
         * Create a single button
         * @param {Object} config
         * @param {String} config.id    - id of the tool
         * @param {String} config.latex - latex code to be generated
         * @param {String} config.fn    - Mathquill function to be called (ie. cmd or write)
         * @param {String} config.label - label of the rendered button
         * @param {String} config.tooltip - tooltip apeears when hovering on button
         * @returns {jQuery} - the created button
         */
        createTool: function createTool(tool) {
            var label, toolType, value;
            var title;
            if (typeof tool == 'string') {
                label = tools[tool].icon
                    ? '<span><i class="icon-' + tools[tool].icon + '"></i></span>'
                    : tools[tool].label.indexOf('<span>') === 0 ? tools[tool].label : '<span>' + tools[tool].label + '</span>';
                value = null;
                toolType = tool;
                title = tools[tool].tooltip;
            } else {
                label = tool.value.indexOf('<span>') === 0 ? tool.value : '<span>' + tool.value + '</span>';
                value = tool.value;
                toolType = tool.toolType;
                title = tool.tooltip;
            }
            return $('<button>', {
                'class': 'math-entry-tool',
                'data-identifier': toolType,
                'data-value': value,
                'data-tooltip': title,
                html: label
            });
        },

        /**
         * Attach events to toolbar buttons
         */
        addToolbarListeners: function addToolbarListeners() {
            var self = this;

            this.$toolbar.find('.math-entry-tool')
                .off('click' + ns)
                .on('click' + ns, function (e) {
                    var $target = $(e.currentTarget),
                        id = $target.data('identifier'),
                        value = $target.data('value');

                    e.stopPropagation();
                    e.preventDefault();

                    var tool = tools[id];
                    tool.fn(self.mje, value);
                    self.mje.focus();
                });
        },

        /**
         * ====================
         * PCI public interface
         * ====================
         */

        id: -1,

        getTypeIdentifier: function getTypeIdentifier() {
            return 'nmcEquationEditorInteraction';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize: function initialize(id, dom, config) {
            var self = this;

            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;

            this.$container = $(dom);
            this.$mathEntry = this.$container.find('math-entry');
            this.$toolbarContainer = this.$container.find('.toolbar-container');
            this.$toolbar = this.$container.find('.toolbar');
            this.$moreLessButton = this.$container.find('.more-less-button');
            this.$editor = this.$container.find('.mje-editor');
            this.$clearButton = this.$container.find('.clear-button');
            this.$undoButton = this.$container.find('.undo-button');
            this.$redoButton = this.$container.find('.redo-button');
            this.activeTools = [];

            this.render(config);
            this.createMathEditable();

            this.on('configChange', function (newConfig) {
                self.render(newConfig);
            });

            this.on('questionToolbarClick', function(tool, value) {
                self.toolBarClick(tool, value);
            });

            this.on('addGap', function(){
                self.addGap();
            });

            this.$moreLessButton.on('click', function() {
                self.$toolbarContainer.toggleClass('show-less');
            });

            //tell the rendering engine that I am ready
            qtiCustomInteractionContext.notifyReady(this);
        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse: function setResponse(response) {
        },

        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse: function getResponse() {
            var rawData = this.mje.get(),
                response;
            if (this.config.useGapExpression) {
                var gaps = $(rawData).find('mrow[editable=true]').toArray(),
                    record = gaps.map(function(gap, idx) {
                        return {
                            name: 'gap_' + idx + '_value',
                            base: {
                                float: mathMlUtils.parseFloat(gap.innerHTML)
                            }
                        };
                    }, {});
                response = { record: record };
            } else {
                response = {
                    base: {
                        string: rawData
                    }
                };
            }
            return response;
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse: function resetResponse() {
        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy: function destroy() {
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} state - json format
         */
        setSerializedState: function setSerializedState(state) {
        },

        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState: function getSerializedState() {
            return { response: this.getResponse() };
        }
    };

    qtiCustomInteractionContext.register(equationEditorInteraction);
});