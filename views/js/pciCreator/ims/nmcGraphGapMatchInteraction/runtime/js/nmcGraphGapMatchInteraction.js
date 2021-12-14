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
    'qtiCustomInteractionContext',
    'jquery',
    'lodash',
    'taoQtiItem/portableLib/OAT/util/event',
    'nmcGraphGapMatchInteraction/runtime/js/renderer',
    'nmcGraphGapMatchInteraction/runtime/js/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/container',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'interact',
    'ui/interactUtils',
    'css!nmcGraphGapMatchInteraction/runtime/css/nmcGraphGapMatchInteraction',
],
    function (
        qtiCustomInteractionContext,
        $,
        _,
        event,
        Renderer,
        graphic,
        containerHelper,
        instructionMgr,
        interact,
        interactUtils) {

        var activeDrop = null;
        var isDragAndDropEnabled = true;

        /**
         * Check if a shape can accept matches
         * @private
         * @param {Raphael.Element} element - the shape
         * @returns {Boolean} true if the element is matchable
         */
        var _isMatchable = function (element, groupId) {
            var matchable = false;
            var matching, matchMax, group;
            if (element) {
                matchMax = element.data('max') || 0;
                matching = element.data('matching') || [];
                group = element.data('groupId') || '';
                matchable = (matchMax === 0 || matchMax > matching.length) && group === (groupId || '');
            }
            return matchable;
        };

        /**
         * Makes the shapes selectable (at least those who can still accept matches)
         * @private
         * @param {Object} interaction
         */
        var _shapesSelectable = function _shapesSelectable(interaction, groupId) {
            var tooltip = 'Select the area to add an image';

            //update the shape state
            _.forEach(interaction.getChoices(), function (choice) {
                var element = interaction.paper.getById(choice.serial);
                if (_isMatchable(element, groupId)) {
                    element.selectable = true;
                    graphic.setStyle(element, 'selectable');
                    graphic.updateTitle(element, tooltip);
                }
            });

            //update the gap images tooltip
            _.forEach(interaction.gapFillers, function (gapFiller) {
                gapFiller.forEach(function (element) {
                    graphic.updateTitle(element, tooltip);
                });
            });
        };

        /**
         * Makes all the shapes UNselectable
         * @private
         * @param {Object} interaction
         */
        var _shapesUnSelectable = function _shapesUnSelectable(interaction) {
            _.forEach(interaction.getChoices(), function (choice) {
                var element = interaction.paper.getById(choice.serial);
                if (element) {
                    element.selectable = false;
                    graphic.setStyle(element, 'basic');
                    graphic.updateTitle(element, 'Select an image first');
                }
            });

            //update the gap images tooltip
            _.forEach(interaction.gapFillers, function (gapFiller) {
                gapFiller.forEach(function (element) {
                    graphic.updateTitle(element, 'Remove');
                });
            });
        };

        var _iFrameDragFix = function _iFrameDragFix(draggableSelector, target) {
            interactUtils.iFrameDragFixOn(function () {
                if (activeDrop) {
                    interact(activeDrop).fire({
                        type: 'drop',
                        target: activeDrop,
                        relatedTarget: target
                    });
                }
                interact(draggableSelector).fire({
                    type: 'dragend',
                    target: target
                });
            });
        };

        /**
         * Render a choice (= hotspot) inside the paper.
         * Please note that the choice renderer isn't implemented separately because it relies on the Raphael paper instead of the DOM.
         *
         * @private
         * @param {Object} interaction
         * @param {Object} choice - the hotspot choice to add to the interaction
         */
        var _renderChoice = function _renderChoice(interaction, choice) {
            //create the shape
            var rElement = interaction.paper.getById(choice.serial);

            interact(rElement.node).on('tap', function onClickShape() {
                if (!document.getElementsByClassName('prevent-click-handler').length) {
                    handleShapeSelect();
                }
            });

            if (isDragAndDropEnabled) {
                interact(rElement.node).dropzone({
                    overlap: 0.15,
                    ondragenter: function (e) {
                        if (_isMatchable(rElement, e.relatedTarget.dataset.groupid)) {
                            graphic.setStyle(rElement, 'hover');
                            activeDrop = rElement.node;
                        }
                    },
                    ondrop: function (e) {
                        var groupId = e.relatedTarget.dataset.groupid;
                        if (_isMatchable(rElement, groupId)) {
                            graphic.setStyle(rElement, 'selectable');
                            handleShapeSelect(groupId);
                            activeDrop = null;
                        }
                    },
                    ondragleave: function (e) {
                        if (_isMatchable(rElement, e.relatedTarget.dataset.groupid)) {
                            graphic.setStyle(rElement, 'selectable');
                            activeDrop = null;
                        }
                    }
                });
            }

            function handleShapeSelect(groupId) {
                // check if can make the shape selectable on click
                if (_isMatchable(rElement, groupId) && rElement.selectable === true) {
                    _selectShape(interaction, rElement);
                }
            }
        };

        /**
         * Render the list of gap fillers
         * @private
         * @param {Object} interaction
         * @param {jQueryElement} $gapList - the list than contains the orderers
         */
        var _renderGapList = function _renderGapList(interaction, $gapList) {
            var gapFillersSelector = $gapList.selector + ' li';
            var dragOptions;
            var scaleX, scaleY;

            interact(gapFillersSelector).on('tap', function onClickGapImg(e) {
                if (!document.getElementsByClassName('prevent-click-handler').length) {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleActiveGapState($(e.currentTarget));
                }
            });

            if (isDragAndDropEnabled) {
                dragOptions = {
                    inertia: false,
                    autoScroll: true,
                    restrict: {
                        restriction: '.qti-interaction',
                        endOnly: false,
                        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                    }
                };

                $(gapFillersSelector).each(function (index, gap) {
                    interact(gap)
                        .draggable(
                            _.assign({}, dragOptions, {
                                onstart: function (e) {
                                    var $target = $(e.target);
                                    var scale;
                                    _setActiveGapState($target);
                                    $target.addClass('dragged');

                                    _iFrameDragFix(gapFillersSelector, e.target);
                                    scale = interactUtils.calculateScale(e.target);
                                    scaleX = scale[0];
                                    scaleY = scale[1];
                                },
                                onmove: function (e) {
                                    interactUtils.moveElement(e.target, e.dx / scaleX, e.dy / scaleY);
                                },
                                onend: function (e) {
                                    _.defer(function () {
                                        var $target = $(e.target);
                                        _setInactiveGapState($target);
                                        $target.removeClass('dragged');
                                        interactUtils.restoreOriginalPosition($target);
                                        interactUtils.iFrameDragFixOff();
                                    });
                                }
                            })
                        )
                        .styleCursor(false);
                });
            }

            function toggleActiveGapState($target) {
                if (!$target.hasClass('disabled')) {
                    if ($target.hasClass('active')) {
                        _setInactiveGapState($target);
                    } else {
                        _setActiveGapState($target);
                    }
                }
            }

            function _setActiveGapState($target) {
                $gapList.children('li').removeClass('active');
                $target.addClass('active');
                _shapesSelectable(interaction, $target.data('groupid') || '');
            }

            function _setInactiveGapState($target) {
                $target.removeClass('active');
                _shapesUnSelectable(interaction);
            }
        };

        /**
         * Set the response to the rendered interaction.
         *
         * The response format follows the IMS PCI recommendation :
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * Available base types are defined in the QTI v2.1 information model:
         * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
         *
         * Special value: the empty object value {} resets the interaction responses
         *
         * @param {object} interaction
         * @param {object} response
         */
        var setResponse = function setResponse(interaction, response) {
            var $container = containerHelper.get(interaction);
            var responseValues = null;
            if (response && interaction.paper) {
                if (response.list && response.list.directedPair) {
                    responseValues = response.list.directedPair;
                }

                if (_.isArray(responseValues)) {
                    _.forEach(interaction.getChoices(), function (choice) {
                        var element = interaction.paper.getById(choice.serial);
                        if (element) {
                            _.forEach(responseValues, function (pair) {
                                var responseChoice;
                                var responseGap;
                                if (pair.length === 2) {
                                    //backward support of previous order
                                    responseChoice = pair[1];
                                    responseGap = pair[0];
                                    if (responseChoice === choice.serial) {
                                        $('[data-identifier="' + responseGap + '"]', $container).addClass('active');
                                        _selectShape(interaction, element, false);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        };

        /**
         * Select a shape (= hotspot) (a gap image must be active)
         * @private
         * @param {Object} interaction
         * @param {Raphael.Element} element - the selected shape
         * @param {Boolean} [trackResponse = true] - if the selection trigger a response chane
         */
        var _selectShape = function _selectShape(interaction, element, trackResponse) {
            var $img, $clone, gapFiller, fillers, id, bbox, shapeOffset, activeOffset, matching, filler;

            //lookup for the active element
            var $container = containerHelper.get(interaction);
            var $gapList = $('ul', $container);
            var $active = $gapList.find('.active:first');
            var $imageBox = $('.main-image-box', $container);
            var boxOffset = $imageBox.offset();

            if (typeof trackResponse === 'undefined') {
                trackResponse = true;
            }

            if ($active.length) {
                //the macthing elements are linked to the shape
                id = $active.data('identifier');
                matching = element.data('matching') || [];
                matching.push(id);
                element.data('matching', matching);
                fillers = element.data('fillers') || [];

                //the image to clone
                $img = $active.find('img');

                //then reset the state of the shapes and the gap images
                _shapesUnSelectable(interaction);
                $gapList.children().removeClass('active');

                _setChoice(interaction, $active);

                $clone = $img.clone();
                shapeOffset = $(element.node).offset();
                activeOffset = $active.offset();

                $clone.css({
                    position: 'absolute',
                    display: 'block',
                    'z-index': 10000,
                    opacity: 0.8,
                    top: activeOffset.top - boxOffset.top,
                    left: activeOffset.left - boxOffset.left
                });

                $clone.appendTo($imageBox);
                $clone.animate(
                    {
                        top: shapeOffset.top - boxOffset.top,
                        left: shapeOffset.left - boxOffset.left
                    },
                    20,
                    function animationEnd() {
                        var gapFillerImage, pos, width, height;

                        $clone.remove();

                        //extract some coords for positioning
                        bbox = element.getBBox();
                        width = parseInt($img.attr('width'), 10);
                        height = parseInt($img.attr('height'), 10);

                        filler = fillers.slice(-1)[0];
                        pos = getPosition(bbox, filler ? filler.getBBox() : null, width);

                        //create an image into the paper and move it to the selected shape
                        gapFiller = graphic
                            .createBorderedImage(interaction.paper, {
                                url: $img.attr('src'),
                                left: pos.left,
                                top: pos.top,
                                width: width,
                                height: height,
                                padding: 0,
                                border: true,
                            })
                            .data('identifier', id)
                            .toFront();

                        fillers.push(gapFiller);
                        element.data('fillers', fillers);

                        gapFillerImage = gapFiller[1].node;
                        interact(gapFillerImage).on('tap', function (e) {
                            if (document.getElementsByClassName('prevent-click-handler').length) {
                                return;
                            }
                            var target = e.currentTarget;
                            var rElement = interaction.paper.getById(target.raphaelid);
                            var bbox, prevBBox = null;

                            e.preventDefault();
                            e.stopPropagation();

                            // adding a new gapfiller on the hotspot by simulating a click on the underlying shape...
                            if ($gapList.find('.active').length > 0) {
                                interactUtils.tapOn(element.node);

                                // ... or removing the existing gapfiller
                            } else {
                                //update the element matching array
                                matching = element.data('matching') || [];
                                id = matching.indexOf(rElement.data('identifier'));
                                if (id > -1) {
                                    matching.splice(id, 1);
                                    element.data('matching', matching);
                                }
                                //delete interaction.gapFillers[interaction.gapFillers.indexOf(gapFiller)];
                                interaction.gapFillers = _.without(interaction.gapFillers, gapFiller);

                                fillers = element.data('fillers') || [];
                                id = fillers.indexOf(gapFiller);
                                if (id > -1) {
                                    fillers.splice(id, 1);
                                    element.data('fillers', fillers);
                                }

                                gapFiller.remove();

                                bbox = element.getBBox();
                                _.forEach(fillers, function (filler) {
                                    var width = filler.getBBox().width,
                                        pos = getPosition(bbox, prevBBox, width);
                                    filler.move(pos.left, pos.top, 100);
                                    prevBBox = {
                                        y: pos.top,
                                        x2: pos.left + width
                                    };
                                });

                                _unsetChoice(interaction, $active);

                                containerHelper.triggerResponseChangeEvent(interaction);
                            }
                        });

                        interaction.gapFillers.push(gapFiller);

                        containerHelper.triggerResponseChangeEvent(interaction);
                    }
                );

                var getPosition = function getPosition(bbox, prevBBox, width) {
                    var maxBottom, left, top;
                    if (prevBBox) {
                        left = prevBBox.x2 + 8;
                        if (left + width > bbox.x2) {
                            maxBottom = _(fillers)
                                .filter(function (filler) {
                                    var bbox = filler.getBBox();
                                    return bbox.y === prevBBox.y;
                                })
                                .map(function (filler) {
                                    var bbox = filler.getBBox();
                                    return bbox.y2;
                                })
                                .max(_.map(fillers));
                            left = bbox.x + 4;
                            top = maxBottom + 4;
                        } else {
                            top = prevBBox.y;
                        }
                        return {
                            left: left,
                            top: top,
                        };
                    } else {
                        return {
                            left: bbox.x + 4,
                            top: bbox.y + 4
                        };
                    }
                }
            }
        };

        /**
         * Sets a choice and marks as disabled if at max
         * @private
         * @param {Object} interaction
         * @param {JQuery Element} $choice
         */
        var _setChoice = function _setChoice(interaction, $choice) {
            var choiceSerial = $choice.data('serial');
            var choice = _.find(interaction.prop('gaps'), { serial: choiceSerial });
            var matchMax;
            var usages;

            if (!interaction.choiceUsages[choiceSerial]) {
                interaction.choiceUsages[choiceSerial] = 0;
            }

            interaction.choiceUsages[choiceSerial]++;

            // disable choice if maxium usage reached
            if (!interaction.responseMappingMode && choice.matchMax) {
                matchMax = +choice.matchMax;
                usages = +interaction.choiceUsages[choiceSerial];

                // note: if matchMax is 0, then test taker is allowed unlimited usage of that choice
                if (matchMax !== 0 && matchMax <= usages) {
                    interact($choice.get(0)).draggable(false);
                    $choice.addClass('disabled');
                    $choice.removeClass('selectable');
                }
            }
        };

        /**
         * Unset a choice and unmark as disabled
         * @private
         * @param {Object} interaction
         * @param {JQuery Element} $choice
         */
        var _unsetChoice = function _unsetChoice(interaction, $choice) {
            var choiceSerial = $choice.data('serial');

            interaction.choiceUsages[choiceSerial]--;

            $choice.removeClass('disabled');
            $choice.addClass('selectable');
            interact($choice.get(0)).draggable(true);
        };

        /**
         * Get the responses from the interaction
         * @private
         * @param {Object} interaction
         * @returns {Array} of matches
         */
        var _getRawResponse = function _getRawResponse(interaction) {
            var pairs = [], element, matching, matchMin, isValid = true;

            _.forEach(interaction.getChoices(), function (choice) {
                var gapImgsArray;
                element = interaction.paper.getById(choice.serial);
                if (element) {
                    matchMin = choice.attributes.matchMin;
                    matching = element.data('matching');
                    if (_.isArray(matching)) {
                        if (matchMin && matchMin > matching.length) {
                            isValid = false;
                        }
                        if (interaction.getProperties().preserveImgCount) {
                            gapImgsArray = element.data('matching');
                            if (!interaction.getProperties().preserveImgOrder) {
                                gapImgsArray.sort();
                            }
                            pairs.push([gapImgsArray.join('__') || 'null', choice.attributes.identifier]);
                        } else {
                            _.forEach(matching, function (gapImg) {
                                pairs.push([gapImg, choice.serial]);
                            });
                        }
                    }
                }
            });
            return {
                isValid: isValid,
                list: _.sortBy(pairs, [0, 1])
            };
        };


        var nmcGraphGapMatchInteraction = {

            /**
             * - Custom Interaction Hook API: id
             * The unique identifier provided at instantiation time, identifying the
             * Custom Interaction Hook Instance at runtime.
             */
            id: -1,

            /**
             * Custom Interaction Hook API: getTypeIdentifier
             *
             * @returns {String} The unique identifier of the Custom Interaction Hook
             */
            getTypeIdentifier: function () {
                return 'nmcGraphGapMatchInteraction';
            },

            /**
             * - Custom Interaction Hook API: initialize
             *
             * This method initializes the Custom Interaction Hook Instance.
             * The Id parameter is the custom is a system generated id.
             * The XMLNode parameter is the custom interaction root XML node
             * displayed by the rendering engine. The config parameter may be
             * undefined or a JSON object representing the configuration.
             *
             * @param {String} id
             * @param {Node} dom
             * @param {Object} config
             */
            initialize: function (id, dom, config) {
                var pci = this._taoCustomInteraction,
                    $gapList;

                this.id = id;
                this.dom = dom;
                this.config = config || {};
                this.$container = $(dom);

                pci.gapFillers = [];
                pci.choiceUsages = {};

                $gapList = containerHelper.get(pci).find('ul.source');

                if (!pci.widgetRenderer) {
                    pci.widgetRenderer = new Renderer({
                        serial: pci.serial,
                        $container: this.$container,
                        interaction: pci
                    });
                    pci.choices = _.reduce(
                        pci.prop('choices'),
                        function (acc, choice) {
                            acc[choice.identifier] = {
                                serial: choice.identifier,
                                attributes: choice,
                            };
                            return acc;
                        },
                        {}
                    );
                    pci.widgetRenderer.render(pci.properties);

                    _.forEach(pci.getChoices(), _.partial(_renderChoice, pci));

                    _renderGapList(pci, $gapList);
                };

                if (pci.metaData.widget &&
                    pci.metaData.widget.getCurrentState() &&
                    pci.metaData.widget.getCurrentState().name === "customCorrect"
                ) {
                    _.forEach(pci.getChoices(), _.partial(_renderChoice, pci));
                    _renderGapList(pci, $gapList);
                }
            },

            /**
             * - Custom Interaction Hook API: setResponse
             *
             * This method can be called multiple times, once, or not at all. The
             * given response data must be compliant with the baseType and cardinality
             * of the response declaration referenced by the
             * qti:customInteraction->responseIdentifier attribute.
             *
             * @param {Object} response A response object in the PCI JSON format.
             */
            setResponse: function (response) {
                // Do something with response...
            },

            /**
             * - Custom Interaction Hook API: getResponse
             *
             * This method can be called multiple times, once, or not at all.
             * The response data must correspond with the baseType and cardinality
             * of the response declaration referenced by the
             * qti:customInteraction->responseIdentifier attribute.
             *
             * @returns {Object} A response object in the PCI JSON format.
             */
            getResponse: function () {
                var raw = _getRawResponse(this._taoCustomInteraction);
                return {
                    list: {
                        directedPair: raw.isValid ? raw.list : null
                    }
                };
            },

            /**
             * - Custom Interaction Hook API: resetResponse
             *
             * This method can be called multiple times, once, or not at all.
             * The reason of this new method in the API is that a rendering engine
             * would like to provide a "reset responses" feature to the candidate.
             */
            resetResponse: function () {
                // Reset the response and reflect the change on the internal state
                // and/or DOM...
            },

            /**
             * - Custom Interaction Hook API: destroy
             *
             * The destroy method is called when the rendering engine decides
             * the interaction must disappear. This is the last chance for the
             * Custom Interaction Hook instance to clean up anything that might
             * "pollute" the rendering environment in the future.
             *
             * Open Assessment Technologies do not recommend to ask the implementor
             * to clean the DOM in this method for performance reason. Indeed,
             * destroying each item related DOM one by one requests a lot of
             * redrawings to the browsers. We therefore recommend to delegate this
             * to the rendering engine itself, on an item basis.
             *
             * Because event listeners will be destroyed automatically when the
             * interaction disappears from the DOM, we do not expect a lot of code
             * for this method in implementations.
             */
            destroy: function () {
                var interaction = this._taoCustomInteraction,
                    $container;
                if (interaction.paper) {
                    $container = containerHelper.get(interaction);

                    $(window).off('resize.qti-widget.' + interaction.serial);
                    $container.off('resize.qti-widget.' + interaction.serial);

                    interaction.paper.clear();
                    instructionMgr.removeInstructions(interaction);

                    $('.main-image-box', $container)
                        .empty()
                        .removeAttr('style');
                    $('.image-editor', $container).removeAttr('style');
                    $('ul', $container).empty();

                    interact($container.find('ul.source li').selector).unset(); // gapfillers
                    interact($container.find('.main-image-box rect').selector).unset(); // choices/hotspot
                }
                //remove all references to a cache container
                containerHelper.reset(interaction);
            },

            /**
             * - Custom Interaction Hook API: setSerializedState
             *
             * This method can be called to set the serialized state of the item.
             * The state must be formatted as JSON data and may represent any
             * information required to give the opportunity to the interaction
             * to restore its internal state and/or its DOM representation.
             *
             * @param {Object} A JSON data object.
             */
            setSerializedState: function (state) {
                setResponse(this._taoCustomInteraction, state.response);
            },

            /**
             * - Custom Interaction Hook API: getSerializedState
             *
             * This method can be called to save the serialized state of the item.
             *
             * The state must be formatted as JSON data and may represent any
             * information required to resume the interaction later on.
             *
             * @returns {Object} A JSON data object.
             */
            getSerializedState: function () {
                var raw = _getRawResponse(this._taoCustomInteraction);
                return {
                    response: {
                        list: {
                            directedPair: raw.list
                        }
                    }
                };
            },

            /**
             * - Custom Interaction Hook API: resetSerializedState
             *
             * This method can be called multiple times, once, or not at all.
             *
             * The reason of this new method in the API is that a rendering engine
             * would like to provide, for instance,  a "restart simulation"
             * feature to the candidate.
             */
            resetSerializedState: function () {
                // Reset the state of the custom interaction in an appropriate
                // way...
            },

            /**
             * Custom Interaction Hook implementors are of course free to add
             * their own methods to organize their interactions, or meet the requirements
             * of a particular platform extending the PCI standard for specific
             * projects or purpose.
             */

            _selectShape: _selectShape,

        };

        // The Custom Interaction Hook registers to the qtiCustomInteractionContext
        // object. The owner of the qtiCustomInteractionContext object is now able
        // to clone it into Custom Interaction Hook Instances at will.
        qtiCustomInteractionContext.register(nmcGraphGapMatchInteraction);

    });
