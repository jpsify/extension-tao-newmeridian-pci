
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

define(['taoQtiItem/portableLib/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'taoQtiItem/portableLib/lodash',
    'css!nmcGapMatchInteraction/runtime/css/nmcGapMatchInteraction',
], function ($, qtiCustomInteractionContext, _) {

    'use strict';

    var _typeIdentifier = 'nmcGapMatchInteraction';
    var EMPTY_CHOICE_ID = 'null';

    var nmcGapMatchInteraction = {
        id: -1,

        getInstance: function getInstance(dom, config, state) {
            var response = config.boundTo;
            this.initialize(Object.getOwnPropertyNames(response).pop(), dom, config.properties, config.assetManager);
            this.setSerializedState(state);
            if (typeof config.onready === 'function') {
                config.onready(this, this.getState());
            }
        },
        getState: function getState() {
            return this.getSerializedState();
        },

        oncompleted: function oncompleted() {
            this.destroy();
        },

        getResponse: function getResponse() {
            var value = this.isValidResponse() ? this.getRawResponse() : null;
            return { "list": { "pair": value } };
        },

        destroy: function destroy() {
            var $container = $(this.dom);
            $container.off().empty();
        },
        getTypeIdentifier: function getTypeIdentifier() {
            return _typeIdentifier;
        },

        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize: function initialize(id, dom, config) {
            var self = this;
            var boxes;
            var emptyGaps;
            var dragged = void 0;
            var currentGapId;
            var mathJax = window.MathJax;
            var styledElems;

            if (id) {
                this.id = id;
            }
            this.dom = dom;
            this.config = config || {};
            this.getGaps = getGaps;

            function getGaps() {
                var gapElems = Array.prototype.slice.call(dom.querySelectorAll('.empty-gap[data-id]'));
                gapElems = gapElems.filter(function (gapElem) {
                    if (gapElem.tagName.toLowerCase() === 'span') {
                        return true;
                    }
                    if (dom.querySelectorAll('.empty-gap[data-id="' + gapElem.getAttribute('data-id') + '"]').length === 1) {
                        return true;
                    }
                    return false;
                });
                return gapElems;
            };

            this.getRawResponse = function () {
                var gapElems = getGaps();
                var response = gapElems.map(function (gap) {
                    var choice = gap.querySelector('.gap-choice');
                    var gapId = gap.getAttribute('data-id') || "";
                    var choiceId = choice ? choice.getAttribute('data-id') : EMPTY_CHOICE_ID;
                    return [gapId, choiceId];
                });
                return response;
            };

            this.mouseMove = function (event) {
                if (!dragged) {
                    return;
                }
                dragged.style.position = "fixed";
                dragged.style.left = event.x + "px";
                dragged.style.top = event.y + "px";
            };
            this.isDisabled = function isDisabled(choice) {
                var limit;
                var gapElems;
                var count;
                if (!choice.dataset.matchmax) {
                    return false;
                }
                limit = parseInt(choice.dataset.matchmax, 10);
                if (!limit) {
                    return false;
                }
                gapElems = getGaps();
                count = $(gapElems).find('.gap-choice[data-id="' + choice.dataset.id + '"]').length;
                return count >= limit;
            };

            this.isValidResponse = function isValidResponse() {
                var minChoices = this.config.minChoices;
                var gapElems;
                var count;
                if (!minChoices) {
                    return true;
                }
                gapElems = getGaps();
                count = $(gapElems).find('.gap-choice').length;
                return count >= minChoices;
            };

            this.disableChoices = function () {

                var choices = dom.querySelectorAll('.choice-container .gap-choice');
                choices.forEach(function (choice) {
                    if (self.isDisabled(choice)) {
                        choice.classList.add('disabled');
                        return;
                    }
                    choice.classList.remove('disabled');
                });
            };
            this.unDisableChoices = function () {
                var choices = dom.querySelectorAll('.choice-container .gap-choice');
                choices.forEach(function (choice) {
                    choice.classList.remove('disabled');
                });
            };

            this.hlAvailible = function () {
                var gaps;
                if (!dragged) {
                    return;
                }
                gaps = getGaps().filter(function (gap) {
                    return  gap.getAttribute('data-full') !== "true" &&
                            gap.getAttribute('data-groupid') === dragged.getAttribute('data-groupid');
                }).forEach(function (gap) {
                    gap.classList.add('availible');
                });
            };

            this.unHlAvailible = function () {
                var gapElems = getGaps();
                gapElems.forEach(function (gap) {
                    gap.classList.remove('availible');
                });
            };

            this.drag = function (event) {
                var elem;
                if (event.currentTarget.classList.contains('disabled')) {
                    return;
                }
                elem = event.currentTarget.cloneNode(true);
                event.currentTarget.parentNode.appendChild(elem);
                dragged = elem;
                dragged.classList.add('dragged');
                dom.addEventListener('mousemove', self.mouseMove);
                dragged.style.pointerEvents = "none";
                dragged.style.backgoundColor = "white";
                self.mouseMove(event);
                self.hlAvailible();
            };
            this.dragFromGap = function (event) {

                var elem = event.currentTarget;
                var gapid = elem.dataset.gap;
                var currGaps = dom.querySelectorAll('.empty-gap[data-id="' + gapid + '"]');
                var currGap;
                currGaps.forEach(function (gapElem) {
                    if (gapElem.tagName.toLowerCase() === 'span' || currGaps.length === 1) {
                        currGap = gapElem;
                    }
                });

                if (!currGap) {
                    return;
                }
                currGap.setAttribute('data-full', "false");
                self.drag(event);
                setTimeout(function () {
                    elem.remove();
                }, 0);

            };

            this.drop = function () {
                var currGaps;
                var gap;
                var gapSource;
                var MathJax = window.MathJax;
                var initialH = '1.4em';
                var initialW = '3em';
                var newGapSource;
                var root;
                var newMath;
                var jaxRoot;
                
                dom.removeEventListener('mousemove', self.mouseMove);

                if (!dragged) {
                    return;
                }
                dragged.style = '';
                $(dragged).siblings('.dragged').remove();
                currGaps = dom.querySelectorAll('.empty-gap[data-id="' + currentGapId + '"]');
                
                currGaps.forEach(function (gapElem) {
                    if (gapElem.tagName.toLowerCase() === 'span' || currGaps.length === 1) {
                        gap = gapElem;
                    }
                });
                if (gap && gap.getAttribute('data-groupid') === dragged.getAttribute('data-groupid') && gap.getAttribute('data-full') !== "true") {
                    self.putChoiceIntoGap(dragged, gap);
                } else {
                    dragged.remove();
                    gapSource = dom.querySelector('math [data-math-id="' + dragged.getAttribute('data-gap') + '"]') ||
                        dom.querySelector('math [data-id="' + dragged.getAttribute('data-gap') + '"]');
                    if (window.MathJax && gapSource) {
                        newGapSource = $('<mspace width="' + initialW + '" height="' + initialH + '" class="empty-gap"></mspace>')[0];
                        newGapSource.setAttribute('data-id', gapSource.getAttribute('data-id') || gapSource.getAttribute('data-math-id'));
                        gapSource.after(newGapSource);
                        root = $(gapSource).closest('math')[0];
                        gapSource.remove();
                        gapSource = newGapSource;
                        newMath = '<math>' + root.innerHTML + '</math>';
                        jaxRoot = getParentJax(gapSource);
                        MathJax.Hub.Queue(["Text", jaxRoot, newMath]);
                        MathJax.Hub.Queue(initAfterMathJax);
                    }
                }
                dragged.classList.remove('dragged');
                dragged = undefined;

                self.unHlAvailible();
                self.disableChoices();
            };
            this.putChoiceIntoGap = function (draggedClone, gap) {
                var gapSource;
                var MathJax = window.MathJax;
                var m;
                var mathChoice;
                var newGapSource;
                var root;
                var newMath;
                var jaxRoot;
                draggedClone.dataset.gap = gap.getAttribute('data-id');
                draggedClone.addEventListener('mousedown', self.dragFromGap);
                gap.appendChild(draggedClone);
                gap.setAttribute('data-full', true);
                gapSource = dom.querySelector('math [data-math-id="' + gap.getAttribute('data-id') + '"]') || dom.querySelector('math [data-id="' + gap.getAttribute('data-id') + '"]');
                if (window.MathJax && gapSource) {
                    m = draggedClone.querySelector('math')? draggedClone.querySelector('math').innerHTML : '<mtext>'+draggedClone.innerText+'</mtext>';
                    mathChoice = $('<mrow class="gap-choice">' + m + '</mrow>')[0];
                    mathChoice.setAttribute('data-id', draggedClone.getAttribute('data-id'));
                    mathChoice.setAttribute('data-groupid', draggedClone.getAttribute('data-groupid'));
                    mathChoice.setAttribute('data-gap', draggedClone.getAttribute('data-gap'));
                    newGapSource = $('<mrow class="empty-gap">' + gapSource.innerHTML + '</mrow>')[0];
                    newGapSource.setAttribute('data-id', gapSource.getAttribute('data-math-id') || gapSource.getAttribute('data-id'));
                    newGapSource.setAttribute('data-full', true);
                    gapSource.after(newGapSource);
                    newGapSource.appendChild(mathChoice);
                    root = $(gapSource).closest('math')[0];
                    gapSource.remove();
                    gapSource = newGapSource;
                    newMath = '<math>' + root.innerHTML + '</math>';
                    jaxRoot = getParentJax(gapSource);
                    MathJax.Hub.Queue(["Text", jaxRoot, newMath]);
                    MathJax.Hub.Queue(initAfterMathJax);
                    MathJax.Hub.Queue(function () {
                        gap.setAttribute('data-full', true);
                        newGapSource.setAttribute('data-full', true);
                    });
                }
            };

            this.enterGap = function (event) {
                var gap = event.currentTarget;
                if (gap.getAttribute('data-full') === "true") {
                    return;
                }
                currentGapId = gap.getAttribute('data-id');
            };
            this.leaveGap = function () {
                currentGapId = -1;
            };

            this.removeAllListeners = function () {
                dom.removeEventListener('mousemove', self.mouseMove);
                emptyGaps.forEach(function (gap) {
                    gap.removeEventListener('mouseenter', self.enterGap);
                    gap.removeEventListener('mouseleave', self.leaveGap);
                });
                boxes.forEach(function (box) {
                    box.removeEventListener('mousedown', self.drag);
                    dom.removeEventListener('mouseup', self.drop);
                    box.removeEventListener('mousedown', self.dragFromGap);
                });
                self.unDisableChoices();
                self.unHlAvailible();
            };
            this.initAllListeners = function () {
                var choicesInsideGaps = dom.querySelectorAll('.empty-gap[data-id] .gap-choice');
                boxes = dom.querySelectorAll('.gap-choice');
                boxes.forEach(function (box) {
                    box.addEventListener('mousedown', self.drag);
                    dom.addEventListener('mouseup', self.drop);
                });
                emptyGaps = dom.querySelectorAll('.empty-gap[data-id]');
                emptyGaps.forEach(function (gap) {
                    gap.addEventListener('mouseenter', self.enterGap);
                    gap.addEventListener('mouseleave', self.leaveGap);
                });
                choicesInsideGaps.forEach(function (draggedClone) {
                    draggedClone.addEventListener('mousedown', self.dragFromGap);
                    draggedClone.removeEventListener('mousedown', self.drag);
                });

            };

            function initAfterMathJax() {
                dom.querySelectorAll('.MathJax span.empty-gap').forEach(function(el) {
                    var id = el.getAttribute('data-id');
                    dom.querySelectorAll('mspace[data-id="' + id + '"]').forEach(function(elem){
                        elem.setAttribute('data-math-id', elem.getAttribute('data-id'));
                        elem.setAttribute('data-secondary', true);
                    });
                });

                self.removeAllListeners();
                self.initAllListeners();

            };
            function getParentJax(elem){
                var roots = MathJax.Hub.getAllJax(dom.querySelector('.qti-flow-container'));
                var jaxRoot;
                roots.some(function(rootElem){
                    var id = '#'+rootElem.inputID + '-Frame';
                    if($(elem).closest(id).length > 0){
                        jaxRoot = rootElem;
                        return true;
                    }
                });
                return jaxRoot;
            };

            self.initAllListeners();
            //restore table styles added by tabletoolstoolbar plugin for ckEditor 
            styledElems = dom.querySelectorAll('[data-style]');
            styledElems.forEach(function (elem) {
                if (elem.getAttribute('style')) {
                    return;
                }
                elem.setAttribute('style', elem.getAttribute('data-style'));
            });

            if (mathJax) {
                mathJax.Hub.Queue(["Typeset", mathJax.Hub]);
                mathJax.Hub.Queue(initAfterMathJax);
            }
        },
        setResponse: function setResponse(response) {
        },
        resetResponse: function resetResponse() { },
        setSerializedState: function setSerializedState(state) {
            this.setResponse(state);
        },
        getSerializedState: function getSerializedState() {
            return this.getResponse();
        }
    };

    qtiCustomInteractionContext.register(nmcGapMatchInteraction);
});