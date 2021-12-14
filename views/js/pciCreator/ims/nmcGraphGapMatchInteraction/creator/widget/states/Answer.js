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
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'taoQtiItem/qtiCreator/widgets/helpers/content',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/selectResponseTypePanel',
    'jquery',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'nmcGraphGapMatchInteraction/creator/helpers/response',
], function (
    stateFactory,
    Answer,
    answerStateHelper,
    contentHelper,
    selectRpTpl,
    $,
    xmlRenderer,
    responseMethods,
) {
    'use strict';

    var InteractionStateAnswer = stateFactory.create(Answer, function initInteractionStateAnswer() {
        var panel;
        var $customPanel = $(selectRpTpl());
        var select = $customPanel[0].querySelector('.select-response-type');
        var widget = this.widget;
        var template = getCustomRpType(widget);
        var availibleStates = widget.registeredStates;
        var answerStates = Object.keys(availibleStates)
            .filter((name) => {
                return availibleStates[name].prototype.superState.some(function (st) {
                    return st === 'answer';
                });
            });
        select.addEventListener('change', onChange)
        function onChange(e) {
            var prevStateNme = getCustomRpType(widget);
            widget.changeState('answer');
            if(prevStateNme){
                var interaction = widget.element;
                var item = interaction.getRootElement();
                var rp = item.responseProcessing;
                var rootElem = responseMethods.clearRp(widget, prevStateNme);
                var xml = (new XMLSerializer()).serializeToString(rootElem);
                rp.xml = xml;
            }
            widget.element.getResponseDeclaration().removeMapEntries();
            widget.changeState(e.target.value);
        };

        widget.$container.addClass('runtime');

        this.initResponseForm();

        this.widget.$responseForm.show();

        contentHelper.changeInnerWidgetState(this.widget, 'inactive');

        panel = this.widget.$responseForm[0].querySelectorAll('.panel')[1];
        panel.style.display = "none";

        $customPanel.insertAfter(panel);

        if (answerStates.indexOf(template) !== -1) {
            select.value = template;
            widget.changeState(template);
        } else {
            select.value = 'norp';
            widget.changeState('norp');
        }

    }, function exitInteractionStateAnswer() {

        this.widget.$container.removeClass('runtime');

        this.widget.$responseForm.empty().hide();

        contentHelper.changeInnerWidgetState(this.widget, 'sleep');
    });

    function getCustomRpType(widget) {
        var interaction = widget.element;
        var item = interaction.getRootElement();
        var rp = item.responseProcessing;
        var renderedRp = rp.render(xmlRenderer.get()) || '<responseProcessing />';
        var $rpXml = $($.parseXML(renderedRp));
        var root = $rpXml[0].documentElement;
        var elems = Array.prototype.slice.call(root.querySelectorAll('not match baseValue'));
        elems = elems.filter(function (elem) {
            return elem.textContent === interaction.attr('responseIdentifier');
        }).map(function (elem) {
            return elem.parentElement.lastElementChild.textContent;
        });
        return elems[0];
    }

    InteractionStateAnswer.prototype.initResponseForm = function initResponseForm() {
        answerStateHelper.initResponseForm(this.widget);
    };

    return InteractionStateAnswer;
});