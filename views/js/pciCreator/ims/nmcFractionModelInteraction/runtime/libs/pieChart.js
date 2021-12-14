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
 */


define([
    'taoQtiItem/portableLib/raphael',
    'taoQtiItem/portableLib/lodash'
], function(Raphael, _){

    'use strict';

    function getTotalSelected(selectedPartitions){
        return _.compact(_.values(selectedPartitions)).length;
    }

    /**
     *
     * @param {Array} selectedPartitions - e.g. [true, false, false, true, false, false]
     * @param {Object} config
     * @param {Object} [config.type] - the type of fraction
     * @param {Object} [config.padding] - the padding of the pie chart
     * 
     * circle
     * @param {Object} [config.radius] - the radius of the pie chart
     * 
     * rectangle
     * @param {Object} [config.subtype] - the subtype of fraction
     * @param {Object} [config.width] - the width of the pie chart
     * @param {Object} [config.height] - the height of the pie chart
     * 
     * @param {Object} [config.partitionColor] - the color of unselected slices
     * @param {Object} [config.selectedPartitionsColor] - the color of selected slices
     * @param {Object} [config.outlineColor]
     * @param {Object} [config.outlineThickness]
     * 
     * @param {Object} $container - jQuery object
     * @returns {undefined}
     */
    Raphael.fn.pieChart = function(selectedPartitions, config, $container){

        var paper = this,
            chart = this.set(),
            type = Number(config.type) === 0 ? 'circle' : 'rectangle',
            subtype = Number(config.subtype) === 0 ? 'rows' : 'columns',
            padding = config.padding || 2,
            radix = 10,
            r = parseInt(config.radius, radix),
            width = parseInt(config.width, radix),
            height = parseInt(config.height, radix),
            // read some stuff from config & reformat datas
            cx = type === 'circle' ? r + padding : padding,
            cy = type === 'circle' ? r + padding : padding,
            // Math Constant
            rad = Math.PI / 180,
            getStyle = function(selected){
                return {
                    fill : selected ? config.selectedPartitionsColor : config.partitionColor,
                    cursor : 'pointer',
                    stroke : config.outlineColor,
                    'stroke-width' : config.outlineThickness
                };
            },
            setHoverStyle = function(raphaelObject){
                raphaelObject.hover(function(){
                    this.animate({
                        'fill-opacity' : 0.7
                    });
                }, function(){
                    this.stop().attr({
                        'fill-opacity' : 1
                    });
                });
            },
            origSelectedPartitions = JSON.parse(config.selectedPartitions);

        //work on a clone of the array to prevent external modification
        selectedPartitions = _.clone(selectedPartitions);

        /**
         * Create a new sector to draw
         * @param  {int}          cx            initial position x
         * @param  {int}          cy            initial position y
         * @param  {int}          r             radius
         * @param  {int}          startAngle    initial angle to start drawing
         * @param  {int}          endAngle      ending angle to stop drawing
         * @param  {object|array} params        params passed to Raphael .attr()
         * @return {object}                     Raphael path
         */
        function sector(cx, cy, r, startAngle, endAngle, params){
            var x1 = cx + r * Math.cos(-startAngle * rad),
                x2 = cx + r * Math.cos(-endAngle * rad),
                y1 = cy + r * Math.sin(-startAngle * rad),
                y2 = cy + r * Math.sin(-endAngle * rad);
            return paper.path(['M', cx, cy, 'L', x1, y1, 'A', r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, 'z']).attr(params);
        }


         /**
         * Create a new bar to draw
         * @param  {int}          cx            initial position x
         * @param  {int}          cy            initial position y
         * @param  {int}          w             width
         * @param  {int}          h             height
         * @param  {object|array} params        params passed to Raphael .attr()
         * @return {object}                     Raphael path
         */
        function bar(cx, cy, w, l, params){
            return paper.rect(cx, cy, w, l).attr(params);
        }

        var angle = 0,
            angleplus = 360 / selectedPartitions.length;

        var yPos = cy,
            yHeight = height / selectedPartitions.length;

        var xPos = cx,
            xWidth = width / selectedPartitions.length;

        /**
         * Iterational function that draw every slice
         * @param  {int} j slice number
         * @param  {string} type fraction type
         * @param  {string} subtype fraction subtype for rectangle
         */
        function drawSlice(j, type, subtype){

            var p, selected = selectedPartitions[j];

            //modify the internal state
            selectedPartitions[j] = selected;

            if (type === 'circle') {
                // Slice, also called sector
                p = sector(cx, cy, r, angle, angle + angleplus, getStyle(selected));

                //increase the angle
                angle += angleplus;
            } else {
                // Slice, also called bar

                if (subtype === 'rows') {
                    // Rows
                    p = bar(cx, yPos, width, yHeight, getStyle(selected));

                    //increase the yPos
                    yPos += yHeight;
                }

                if (subtype === 'columns') {
                     // Columns
                    p = bar(xPos, cy, xWidth, height, getStyle(selected));

                    //increase the xPos
                    xPos += xWidth;
                }
            }

            //add hover style
            setHoverStyle(p);

            // Register this slice into the canvas
            chart.push(p);

            // Register events only on unselected slices / sector 
            if(config.changeSelected || j >= origSelectedPartitions.length || !origSelectedPartitions[j]){
                p.click(getClickCallback(j));
            }

        }

        function drawCircle(){
            var j = 0;
            var selected = selectedPartitions[j];
            var c = paper.circle(cx, cy, r).attr(getStyle(selected));

            //add hover style
            setHoverStyle(c);

            // Register this slice into the canvas
            chart.push(c);

            if(config.changeSelected || j >= origSelectedPartitions.length || !origSelectedPartitions[j]){
                c.click(getClickCallback(j));
            }
        }

        function drawRectangle(){
            var j = 0;
            var selected = selectedPartitions[j];
            var rect = paper.rect(cx, cy, width, height).attr(getStyle(selected));

            //add hover style
            setHoverStyle(rect);

            // Register this slice into the canvas
            chart.push(rect);

            // Register events on the slice / sector
            if(config.changeSelected || j >= origSelectedPartitions.length || !origSelectedPartitions[j]){
                rect.click(getClickCallback(j));
            }
        }

        function getClickCallback(j){
            return function(){
                if(String(this.attrs.fill) === config.partitionColor){
                    //it is selected:

                    // Change the color of the background
                    this.attr(getStyle(true));
                    // update the internal state
                    selectedPartitions[j] = true;
                    $container.trigger('select_slice.pieChart', [selectedPartitions, getTotalSelected(selectedPartitions)]);
                }else{

                    // Change the background color to the default unselected value
                    this.attr(getStyle(false));
                    // update the internal state
                    selectedPartitions[j] = false;
                    $container.trigger('unselect_slice.pieChart', [selectedPartitions, getTotalSelected(selectedPartitions)]);
                }
            }
        }

        if (selectedPartitions.length > 1) {
            for (var i = 0; i < selectedPartitions.length; i++) {
                drawSlice(i, type, subtype);
            }
        } else {
            if (type === 'rectangle') {
                drawRectangle();
            } else {
                drawCircle();
            }
        }

        $container.trigger('drawn.pieChart');
    };
});
