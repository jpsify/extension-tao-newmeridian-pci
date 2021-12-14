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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */
define(['lodash', 'jquery'], function(_, $){
    'use strict';

    function calculateChoiceColumns(choices, numColumns){

        if(!numColumns){
            numColumns = (choices.length > 1 && choices.length < 4) ? 2 : Math.ceil(choices.length / 3);
            if(numColumns > 5){
                numColumns = 5;
            }
        }else if(numColumns > choices.length){
            numColumns = choices.length;
        }

        var numPerColumn = Math.floor(choices.length / numColumns);
        var extra = choices.length % numColumns;
        var columns = [];
        var choicesCopy = choices.slice();

        for(var i=1; i <= numColumns; i++){
            columns.push( { 
                idx: i,
                choices: []
            } );
        };
        columns.forEach(function(column, i){
            var extraChoices = i < extra ? 1: 0;
            var choicesCount = numPerColumn + extraChoices;
            column.choices = choicesCopy.splice(0, choicesCount);
        })

        return columns;
    }

    return {
        calculateChoiceColumns : calculateChoiceColumns
    };
});
