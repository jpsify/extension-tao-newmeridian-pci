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
 */

define([
    'taoQtiItem/portableLib/jquery_2_1_1',
    ], 
    function($) {

        function visitMrow($mathMl) {
            if ($mathMl.children.length) {
                var value = parse($mathMl.children[0]);
                if ($mathMl.nextElementSibling) {
                    value += parse($mathMl.nextElementSibling);
                }
                return value;
            }
        }

        function visitMn($mathMl) {
            var value = $mathMl.innerHTML.match(/[\d.]/) ? $mathMl.innerHTML: '';
            if ($mathMl.nextElementSibling) {
                value += parse($mathMl.nextElementSibling);
            }
            return value;
        }

        function visitMo($mathMl) {
            if ($mathMl.innerHTML === '.' || $mathMl.innerHTML === '-') {
                var value = $mathMl.innerHTML;
                if ($mathMl.nextElementSibling) {
                    value += parse($mathMl.nextElementSibling);
                }
                return value;
            }
        }

        function visitFrac($mathMl) {
            if ($mathMl.children.length === 2) {
                var numerator, denominator, value;
                if ($mathMl.children[0].children.length) {
                    numerator = parse($mathMl.children[0].children[0]);
                }
                if ($mathMl.children[1].children.length) {
                    denominator = parse($mathMl.children[1].children[0]);
                }
                value = (Number.parseFloat(numerator) / Number.parseFloat(denominator)).toString(); 
                if (value[0] === '0') {
                    value = value.substring(1);
                }
                return value;
            }
        }

        function parse($mathMl) {
            switch ($mathMl.tagName.toLowerCase()) {
                case 'mn': 
                    return visitMn($mathMl);
                case 'mo':
                    return visitMo($mathMl);
                case 'mfrac':
                    return visitFrac($mathMl);
                case 'mrow':
                    return visitMrow($mathMl);
            }
        }

        function parseFloat(mathMl) {
            if (mathMl) {
                var $mathMl = $(mathMl);
                if ($mathMl.length) {
                    var value = parse($mathMl[0]);
                    return Number.parseFloat(value); 
                }
            }
            return NaN;
        }

        return {
            parseFloat: parseFloat
        };
    }
)
