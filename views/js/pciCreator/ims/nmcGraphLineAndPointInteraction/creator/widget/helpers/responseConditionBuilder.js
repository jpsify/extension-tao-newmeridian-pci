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
 * Copyright (c) 2020 Open Assessment Technologies SA;
 */

define([
    'jquery',
    'lodash',
], function ($, _) {
    'use strict';

    /**
     * @returns {Object} response condition builder with empty responseCondition
     */
    function createBuilder() {
        return {
            _responseCondition: document.createElementNS('', 'responseCondition'),

            /**
             * Adds <responseIf> to <responseCondition> with expression and response rule
             * @param {Element} expression
             * @param {Element} responseRule
             *
             * @returns {Object} response condition builder
             */
            responseIf: function(expression, responseRule) {
                var rIf = document.createElementNS('', 'responseIf');
                rIf.appendChild(expression);
                rIf.appendChild(responseRule);
                this._responseCondition.appendChild(rIf);
                return this;
            },

            /**
             * @returns {Element} <responseCondition> element
             */
            getElement: function() {
                return this._responseCondition;
            }
        };
    }

    /**
     * Makes an setOutcomeValue outcome rule that adds value to outcome
     * @param {String} outcomeValueIdentifer
     * @param {String} value
     *
     * @returns {Element}
     */
    function setSumToOutcomeValue(outcomeValueIdentifer, value) {
        var setOutcomeValue = document.createElementNS('', 'setOutcomeValue'),
            sum = document.createElementNS('', 'sum'),
            variable = document.createElementNS('', 'variable'),
            baseValue = document.createElementNS('', 'baseValue');
        setOutcomeValue.setAttribute('identifier', outcomeValueIdentifer);
        variable.setAttribute('identifier', outcomeValueIdentifer);
        baseValue.setAttribute('baseType', 'float');
        baseValue.textContent = value;
        sum.appendChild(variable);
        sum.appendChild(baseValue);
        setOutcomeValue.appendChild(sum);
        return setOutcomeValue;
    }

    /**
     * Wraps array of element operators with and operator
     * @param {Array<Element>} elementList
     *
     * @returns {Element} joined list of operators wrapped in and operator
     */
    function joinWithAndOperator(elementList) {
        var and = document.createElementNS('', 'and');

        if(!_.isArray(elementList)) {
            throw new Error('Conditions list must be an array');
        }

        _.each(elementList, function(conditionEl) {
            and.appendChild(conditionEl);
        });

        return and;
    }

    return {
        createBuilder: createBuilder,
        setSumToOutcomeValue: setSumToOutcomeValue,
        joinWithAndOperator: joinWithAndOperator,
    };
});