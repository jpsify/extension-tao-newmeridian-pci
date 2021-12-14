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


define(['taoQtiItem/portableLib/lodash'], function( _ ){

    'use strict';

    function gridFactory(paper,rawOptions){

        if (typeof rawOptions.x !== 'object' && typeof rawOptions.y !== 'object'){
            throw new Error('I need x and y axis');
        }

        if ( (rawOptions.x.start >= rawOptions.x.end) || (rawOptions.y.start >= rawOptions.y.end) ) {
            throw new Error('end must be greater than start');
        }

        var options = _buildOptions(rawOptions),

            _x = options.x,
            _y = options.y,

            _xRange = Math.abs(_x.end - _x.start),
            _yRange = Math.abs(_y.end - _y.start),

            _width = _xRange * _x.unit,
            _height = _yRange * _y.unit,

            _xSubStepSize = ((_width / (_xRange / _x.step)) / _x.subStep),
            _ySubStepSize = ((_height / (_yRange / _y.step)) / _y.subStep),

            _color = options.color,
            _weight = options.weight,

            _axisTitlePositions = _getAxisTitlePositions(options),
            _padding = _getPadding(options, _axisTitlePositions),
            _axisTitleCoords = _getAxisTitleCoords(),
            _labelCoords = _getLabelsCoords(),
            _snapToValues = _getSnapToValues(),

            clickableArea,
            set = paper.set(),
            _borderBox = {},

            arrowheadsShape = 'block-wide-long';

        function _getAxisTitleCoords() {
            var axisTitleCoords = {
                abs: {},
                ord: {}
            };

            // abs title
            axisTitleCoords.abs.x = _width / 2;
            axisTitleCoords.abs.angle = 0;

            if (_axisTitlePositions.abs === "bottom") {
                axisTitleCoords.abs.y = _height + options.axisTitlePadding;
            } else if (_axisTitlePositions.abs === "top") {
                axisTitleCoords.abs.y = -options.axisTitlePadding;
            }

            // ord title
            axisTitleCoords.ord.y = _height / 2;
            axisTitleCoords.ord.angle = -90;

            if (_axisTitlePositions.ord === "left") {
                axisTitleCoords.ord.x = -(options.axisTitlePadding + options.y.titleOffset);
            } else if (_axisTitlePositions.ord === "right") {
                axisTitleCoords.ord.x = _width + options.padding; // approximation...
            }

            return axisTitleCoords;
        }

        function _getLabelsCoords() {
            var labelCoords = {
                abs: {},
                ord: {}
            };

            // abs label
            labelCoords.abs.x = _width + options.borderWidth + options.labelPadding / 2;
            labelCoords.abs.angle = 0;

            if (_y.start < 0 && _y.end > 0) {
                labelCoords.abs.y = -1 * _y.start * _y.unit; // two y quadrants
            } else {
                labelCoords.abs.y = (_y.start >= 0) ? 0 : _height;  // one y quadrant
            }

            // ord label
            labelCoords.ord.y = -options.labelPadding;
            labelCoords.ord.angle = 0;

            if (_x.start < 0 && _x.end > 0) {
                labelCoords.ord.x = -1 * _x.start * _x.unit; // two x quadrants
            } else {
                labelCoords.ord.x = (_x.start >= 0) ? 0 : _width; // one x quadrant
            }
            return labelCoords;
        }

        function _getSnapToValues() {
            var snapToValues = {
                    x: [],
                    y: []
                },
                xStepSize = (_width / (_xRange / _x.step)),
                yStepSize = (_height / (_yRange / _y.step)),
                snapValue,
                i, j;

            i = (_width / (_xRange / _x.firstStep));
            for(j = _xSubStepSize; j <= i; j += _xSubStepSize) {
                snapValue = i - j;
                if (snapValue >= 0) {
                    snapToValues.x.splice(0, 0, snapValue + _padding.left);
                }
            }
            if (Math.abs(_x.start) % _x.step) {
                snapToValues.x.splice(0, 0, _padding.left);
            }
            // using a nested loop to avoid accumulating rounding error
            for (; i <= _width; i += xStepSize) {
                for(j = 0; j < xStepSize; j += _xSubStepSize) {
                    snapValue = i + j;
                    if (snapValue <= _width) {
                        snapToValues.x.push(snapValue + _padding.left);
                    }
                }
            }
            i = (_height / (_yRange / _y.firstStep));
            for(j = _ySubStepSize; j <= i; j += _ySubStepSize) {
                snapValue = i - j;
                if (snapValue >= 0) {
                    snapToValues.y.splice(0, 0, snapValue + _padding.top);
                }
            }
            if (Math.abs(_y.start) % _y.step) {
                snapToValues.y.splice(0, 0, _padding.top);
            }
            for (; i <= _height; i += yStepSize) {
                for(j = 0; j < yStepSize; j += _ySubStepSize) {
                    snapValue = i + j;
                    if (snapValue <= _height) {
                        snapToValues.y.push(snapValue + _padding.top);
                    }
                }
            }
            return snapToValues;
        }

        function _drawGraphTitle() {
            var x = _padding.left + _width / 2,
                y = options.padding,
                style = {
                    'font' : 'bold ' + options.graphTitleSize + 'pt Verdana',
                };

            if (options.graphTitle && options.graphTitleRequired === true) {
                _drawTitle(options.graphTitle, style, x, y);
            }
        }

        function _drawAxis(){

            var xStyle = {
                    'stroke' :  _x.color,
                    'stroke-width': _x.weight
                },
                yStyle = {
                    'stroke' :  _y.color,
                    'stroke-width': _y.weight
                },
                axisTitleStyle = {
                    'font' : options.axisTitleSize + 'pt Verdana Regular',
                },
                labelStyle = {
                    'font' : options.scaleSize + 'px Verdana Regular',
                },
                axisLabelStyle = {
                    'font' : options.labelSize + 'px Verdana', 'font-style': 'italic'
                };

            function drawXaxis(top, config){
                config = config || {};

                var digits = _x.digits || 1;

                var line =  _drawLine([0, top], [_width, top], config.style).attr({'stroke-width': 2}),
                    readabilityOffset = (config.multiQuadrant) ? 5 : 0,
                    position = readabilityOffset,
                    textTop,
                    text,
                    i;
                if (_x.arrows) {
                    if (_x.start < 0) {
                        line.attr({
                            'arrow-start': arrowheadsShape,
                        });
                    }
                    if (_x.end > 0) {
                        line.attr({
                            'arrow-end': arrowheadsShape,
                        });
                    }                
                }

                if(_x.dash){
                    _drawLine([0, top], [_width, top], config.style).attr({'stroke-width': 6, 'stroke-dasharray': '- ', 'stroke': 'grey'});
                }

                if (options.showXAxisTitle) {
                    if(config.unitsOnTop){
                        textTop = top + _padding.top - options.labelSize;
                    }else{
                        textTop = top + _padding.top + options.labelSize;
                    }

                    position += _x.unit * _x.firstStep;

                    for(i = _x.start + _x.firstStep; Number(i.toFixed(digits)) < _x.end ; i = i + _x.step){
                        if (Number(i.toFixed(digits)) !== 0) {
                            var label = _x.digits ? i.toFixed(_x.digits) : (i.toFixed(digits) * 1);
                            text = paper.text(_padding.left + position, textTop, label).attr(labelStyle);
                            var box = text.getBBox();
                            paper.rect(box.x, box.y, box.width, box.height).attr({
                                fill : '#ffffff',
                                stroke : 'none'
                            });
                            text.toFront();
                            _addCssClass(text, 'scene scene-text');
                        }
                        position += _x.unit * _x.step;
                    }
                }

                return line;
            }

            function drawYaxis(left, config){
                config = config || {};

                var digits = _y.digits || 1;
                var line =  _drawLine([left, _height], [left, 0], config.style).attr({'stroke-width': 2}),
                    readabilityOffset = (config.multiQuadrant) ? -5 : 0,
                    position = readabilityOffset,
                    textLeft,
                    text,
                    i;

                if(_y.dash){
                    _drawLine([left, _height], [left, 0], config.style).attr({'stroke-width': 6, 'stroke-dasharray': '- ', 'stroke': 'grey'});
                }

                if (_y.arrows) {
                    if (_y.start < 0) {
                        line.attr({
                            'arrow-end': arrowheadsShape,
                        });
                    }
                    if (_y.end > 0) {
                        line.attr({
                            'arrow-start': arrowheadsShape,
                        });
                    }
                }
                if (options.showYAxisTitle || options.showOrigin) {
                    if(config.unitsOnRight){
                        textLeft = left + _padding.left + options.labelSize/2 + 2;
                    }else{
                        textLeft = left + _padding.left - options.labelSize - 2;
                    }

                    position += _y.unit * _y.firstStep;

                    for(i = _y.start + _y.firstStep; Number(i.toFixed(digits)) <= _y.end; i = i + _y.step){
                        var isOrigin = Number(i.toFixed(digits)) === 0;
                        var isEnd = Number(i.toFixed(digits)) === _y.end;
                        if ((options.showYAxisTitle && !isEnd && !isOrigin) || (isOrigin && options.showOrigin)) {
                            var offset = isOrigin ? options.labelSize : 0;
                            var label = _y.digits ? ((-i).toFixed(_y.digits)) : (-i.toFixed(digits));
                            text = paper.text(textLeft + offset / 2, _padding.top + position + offset, label).attr(_.merge({}, labelStyle, {"text-anchor": "end"}));
                            var box = text.getBBox();
                            paper.rect(box.x, box.y, box.width, box.height).attr({
                                fill : '#ffffff',
                                stroke : 'none'
                            });
                            text.toFront();
                            _addCssClass(text, 'scene scene-text');
                        }
                        position += _y.unit * _y.step;
                    }
                }

                return line;
            }

            // top quadrant only
            if((_y.start < 0) && (_y.end <= 0)){
                drawXaxis(_height, {style : xStyle});
            // bottom quadrant only
            }else if((_y.start >= 0) && (_y.end > 0)){
               drawXaxis(0, {style : xStyle, unitsOnTop : true});
            // both quadrants
            }else{
                drawXaxis(Math.abs(_y.start) * _y.unit, {style : xStyle, multiQuadrant: false});
            }

            // left quadrant only
            if((_x.start < 0 ) && (_x.end <= 0)){
                drawYaxis(_width, {style : yStyle, unitsOnRight:true});
            // right quadrant only
            }else if((_x.start >= 0 ) && (_x.end > 0)){
                drawYaxis(0, {style : yStyle});
            // both quadrants
            }else{
                drawYaxis(Math.abs(_x.start) * _x.unit, {style : yStyle, multiQuadrant: false});
            }

            $('#raphael-marker-startblock55', paper.canvas).attr('id', 'raphael-marker-startblock55_grid');
            $('#raphael-marker-endblock55', paper.canvas).attr('id', 'raphael-marker-endblock55_grid');
            $('path[marker-start="url(#raphael-marker-startblock55)"]', paper.canvas).attr('marker-start', 'url(#raphael-marker-startblock55_grid)');
            $('path[marker-end="url(#raphael-marker-endblock55)"]', paper.canvas).attr('marker-end', 'url(#raphael-marker-endblock55_grid)');

            if (_x.label) {
                _drawTitle(
                    _x.label,
                    axisLabelStyle,
                    _padding.left  + _labelCoords.abs.x,
                    _padding.top + _labelCoords.abs.y,
                    _labelCoords.abs.angle);
            }
            if (_y.label) {
                _drawTitle(
                    _y.label,
                    axisLabelStyle,
                    _padding.left + _labelCoords.ord.x,
                    _padding.top + _labelCoords.ord.y,
                    _labelCoords.ord.angle);
            }

            if (_x.title) {
                _drawTitle(
                    _x.title,
                    axisTitleStyle,
                    _padding.left + _axisTitleCoords.abs.x,
                    _padding.top + _axisTitleCoords.abs.y,
                    _axisTitleCoords.abs.angle);
            }
            if (_y.title) {
                _drawTitle(
                    _y.title,
                    axisTitleStyle,
                    _padding.left + _axisTitleCoords.ord.x,
                    _padding.top + _axisTitleCoords.ord.y,
                    _axisTitleCoords.ord.angle);
            }
        }

        function _drawGrid(){

            var style = {
                    'stroke': _color,
                    'stroke-width' : _weight
                },
                subStyle = {
                    'stroke': options.subGridColor,
                    'stroke-width' : 1
                },
                borderStyle = {
                    'stroke': _color,
                    'stroke-width' : options.borderWidth
                },
                x, y, subStep;
            if(_y.showGrid){
                for(y = _y.firstStep * _y.unit; y <= _height; y += _y.step * _y.unit){
                    _drawLine([0, y], [_width, y], style);
                    if (options.showSubGrid) {
                        subStep = _y.step * _y.unit / _y.subStep;
                        var subY = y - subStep;
                        for(var sub = _y.subStep - 1; sub > 0 && subY > 0; sub--) {
                            _drawLine([0, subY], [_width, subY], subStyle);
                            subY -= subStep
                        }
                    }
                }
            }
            // close the graph if uneven step/y axis
            if (Math.abs(_y.end) % _y.step) {
                if (options.showSubGrid) {
                    var subY = y - _y.step * _y.unit + subStep;
                    for(var sub = _y.subStep - 1; sub > 0 && subY < _height; sub--) {
                        _drawLine([0, subY], [_width, subY], subStyle);
                        subY += subStep
                    }
                }
                _drawLine([0, _height], [_width, _height], style);
            }
            if (_x.showGrid) {
                _drawLine([0, 0], [0, _height], style);
                for(x = _x.firstStep * _x.unit; x <= _width; x += _x.step * _x.unit) {
                    _drawLine([x, 0], [x, _height], style);
                    if (options.showSubGrid) {
                        subStep = _x.step * _x.unit / _x.subStep;
                        var subX = x - subStep;
                        for(var sub = _x.subStep - 1; sub > 0 && subX > 0; sub--) {
                            _drawLine([subX, 0], [subX, _height], subStyle);
                            subX -= subStep
                        }
                    }
                }
            }else{
                _drawLine([_width, 0], [_width, _height], style);
            }
            // close the graph if uneven step/x axis
            if (Math.abs(_x.end) % _x.step) {
                if (options.showSubGrid) {                
                    var subX = x - _x.step * _x.unit + subStep;
                    for(var sub = _x.subStep - 1; sub > 0 && subX < _width; sub--) {
                        _drawLine([subX, 0], [subX, _height], subStyle);
                        subX += subStep
                    }
                }
                _drawLine([_width, 0], [_width, _height], style);
            }

            var borderPadding = options.borderWidth/2;
            var minX = 0,
                minY = 0,
                maxX = _width,
                maxY = _height;

            _drawLine([minX-borderPadding, minY], [maxX+borderPadding, minY], borderStyle);
            _drawLine([maxX, minY], [maxX, maxY], borderStyle);
            _drawLine([maxX+borderPadding, maxY], [minX-borderPadding, maxY], borderStyle);
            _drawLine([minX, maxY], [minX, minY], borderStyle);
        }

        function _drawLine(start, end, style){
            var path = paper.path(
                'M'+(_padding.left+start[0])+' '+(_padding.top+start[1])+
                'L'+(_padding.left+end[0])+' '+(_padding.top+end[1])).attr(style);
            _addCssClass(path, 'scene scene-grid');
            return path;
        }

        function _drawTitle(text, style, x, y, angle) {
            var textElement = paper.text(x, y, text).attr(style);

            if (angle) {
                textElement.rotate(angle, x, y);
            }
        }

        /**
         * Add a css class to the node of a Raphaël object
         * IE currently doesn't support the usage of element.classList in SVG
         *
         * @param {Object} raphaelObj Raphael Object
         * @param {String} newClass new class name
         */
        function _addCssClass(raphaelObj, newClass) {
            var pattern = new RegExp('\\b' + newClass + '\\b');
            var oldClass = raphaelObj.node.getAttribute('class') || '';
            raphaelObj.node.setAttribute('class', pattern.test(oldClass) ? oldClass : oldClass + ' ' + newClass);
        }

        function _calculateBBox(){

            var x = _padding.left,
                y = _padding.top;

            _borderBox = {
                x : x,
                y : y,
                width : _width,
                height : _height,
                x2 : x+_width,
                y2 : y+_height
            };
        }

        var obj = {
            children : set,
            snapping : options.snapping || false,
            /**
             * Set _color value
             * @param {String} color
             */
            setColor : function(color){
                _color = String(color);
                set.remove().clear();
                this.render();
            },
            /**
             * Set _weight of the grid elements
             * @param {Number} value weight in px
             */
            setWeight : function(value){
                _weight = parseInt(value, 10);
                set.remove().clear();
                this.render();
            },
            getX : function(){
                return _borderBox.x;
            },
            getY : function(){
                return _borderBox.y;
            },
            getBBox : function(){
                return _.clone(_borderBox);
            },
            /**
             * Get width of the _borderBox
             * @return {Number} width of the set of all elements
             */
            getWidth : function(){
                return _borderBox.width;
            },
            /**
             * Get height of the _borderBox
             * @return {Number} height of the set of all elements
             */
            getHeight : function(){
                return _borderBox.height;
            },
            /**
             * Get the units for x,y axis
             * @return {Object}
             */
            getUnits : function(){
                return {x: _x.unit , y: _y.unit};
            },
            /**
             * Get the units size for x,y axis
             * @return {Object}
             */
            getUnitSizes : function(){
                return {x: _borderBox.width/_x.unit , y: _borderBox.height/_y.unit};
            },
            /**
             * Get the subStep size for x,y axis
             * @return {Object}
             */
            getSubStepSizes: function(){
                return {x: _xSubStepSize, y: _ySubStepSize};
            },
            /**
             * Get the Raphaeljs paper object used for this grid
             *
             * @returns {Object} Raphaeljs paper object
             */
            getCanvas : function(){
                return paper;
            },
            /**
             * Get the position (top/left) of the origin of the cartesian axis relative to the paper
             *
             * @returns {Object}
             */
            getOriginPosition : function(){
                return {
                    left : _padding.left - _x.start * _x.unit,
                    top : _padding.top - _y.start * _y.unit
                };
            },
            getPostionFromCartesian : function(x,y){
                var origin = this.getOriginPosition();
                var unitSizes = this.getUnits();
                return {
                    left : origin.left + unitSizes.x * x,
                    top : origin.top - unitSizes.y * y
                };
            },
            /**
             * The the upper and lower bounds fof the grid on both axis
             *
             * @returns {Object}
             */
            getGridBounds : function(){
                return {
                    x : {
                        start : _x.start,
                        end : _x.end
                    },
                    y : {
                        start : _y.start,
                        end : _y.end
                    }
                };
            },
            /**
             * Rendering function
             */
            render : function(){
                _drawGrid();
                _drawAxis();
                _drawGraphTitle();
            },
            /**
             * @param {Number} x coordinate x to convert to snapped value
             * @param {Number} y  coordinate y to convert to snapped value
             * @return {Array} snapped values x,y
             */
            snap : function(x,y){
                x = paper.raphael.snapTo(_snapToValues.x, x, _xSubStepSize / 2);
                y = paper.raphael.snapTo(_snapToValues.y, y, _ySubStepSize / 2);
                return [x,y];
            },
            /**
             * Create a transparent rectangle object in front of every element
             * inside the set to gain clickability :add the interactive layer
             */
            clickable : function(){
                /** @type {Object} Rectangle Object to cover the all grid area */
                if(clickableArea){
                    clickableArea.remove();
                }
                clickableArea = paper.rect(_borderBox.x,_borderBox.y, _borderBox.width, _borderBox.height);
                clickableArea.attr({
                    fill : 'rgba(0,0,0,0)',
                    stroke : 0
                });
                set.push(clickableArea);
            },
            /**
             * Take the shape back to the interactive layer
             *
             * @param {Object} shape - a RaphaelJs Element
             */
            toBack : function(shape){
                if(clickableArea){
                    shape.insertBefore(clickableArea);
                }
            },
            /**
             * Bring the shape in front of the interactive layer
             *
             * @param {Object} shape - a RaphaelJs Element
             */
            toFront : function(shape){
                shape.toFront();
            }
            /**
             *
             */
        };

        _calculateBBox();
        obj.render();

        return obj;
    }

    gridFactory.getPaperSize = function getPaperSize(rawOptions) {
        var options = _buildOptions(rawOptions),

            width = Math.abs(options.x.end - options.x.start) * options.x.unit,
            height = Math.abs(options.y.end - options.y.start) * options.y.unit,

            axisTitlePositions = _getAxisTitlePositions(options),
            padding = _getPadding(options, axisTitlePositions);

        return {
            width: padding.left + width + padding.right,
            height: padding.top + height + padding.bottom
        };
    };

    function _buildOptions(rawOptions) {
        var axisColor = '#222',
            gridColor = '#222',

            options = _.merge({},{
                graphTitle : null,
                graphTitleRequired : false, // display or not graph title
                graphTitleSize : 13, // points
                graphTitlePadding : 40, // pixels
                color : gridColor,
                weight : 1, // inner grid weight
                axisTitleSize : 12, // points
                axisTitlePadding : 36, // pixels
                scaleSize : 9, // points
                labelSize : 10, // points
                labelPadding : 10, // pixels
                padding : 35, // pixels
                height: null, // grid size in pixels
                width: null, // grid size in pixels
                showOrigin: true, //show Origin
                showXAxisTitle: true, //show axis titles
                showYAxisTitle: true, //show axis titles
                showSubGrid: false,
                subGridColor: '#aaaaaa',
                borderWidth: 3,

                x : {
                    start : -10, // cartesian start
                    end :  10, // cartesian end
                    label : null, // small label (like 'x', 'y', 't'...) at the tip of an axis
                    title : null, // axis title
                    step : 1, // cartesian step
                    subStep : 1,  // snapping divisions inside step
                    unit : 10, // number of pixels for a cartesian unit
                    color : axisColor,
                    weight : 3, // axis weight,
                    arrows: true,
                    showGrid: true
                },
                y : {
                    start : -10,
                    end :  10,
                    label : null,
                    title : null,
                    step : 1,
                    subStep : 1,
                    unit : 10,
                    color : axisColor,
                    weight : 3,
                    arrows: true,
                    showGrid: true,
                    titleOffset: 0, //px
                }
            }, rawOptions);

        options.x.firstStep = options.x.step;
        if (options.x.start < 0) {
            var d = options.x.start % options.x.step;
            if (d != 0) {
                options.x.firstStep = Math.abs(d);
            }
        }
        options.y.firstStep = options.y.step;
        if (options.y.start < 0) {
            var d = options.y.start % options.y.step;
            if (d != 0) {
                options.y.firstStep = Math.abs(d);
            }
        }

        // if defined, width and height takes precedence over units
        if (options.width) {
            options.x.unit = (options.width / Math.abs(options.x.end - options.x.start)).toPrecision(2);
        }
        if (options.height) {
            options.y.unit = (options.height / Math.abs(options.y.end - options.y.start)).toPrecision(2);
        }
        return options;
    }

    function _getAxisTitlePositions(options) {
        var axisTitlePositions = {};

        if (options.x.title) {
            if (options.y.start < 0) {
                axisTitlePositions.abs = "bottom";
            } else {
                axisTitlePositions.abs = "top";
            }
        }
        if (options.y.title) {
            if (options.x.start < 0 && options.x.end <= 0) {
                axisTitlePositions.ord = "right";
            } else {
                axisTitlePositions.ord = "left";
            }
        }
        return axisTitlePositions;
    }

    function _getPadding(options, _axisTitlePositions) {
        var padding = {
            top: options.padding,
            right: options.padding,
            bottom: options.padding,
            left: options.padding
        };

        if (options.graphTitle && options.graphTitleRequired === true) {
            padding.top += options.graphTitlePadding;
        }

        if (_axisTitlePositions.abs === "top" && options.x.title) {
            padding.top += options.axisTitlePadding;
        } else if (options.y.label) {
            padding.top += options.labelPadding;
        }

        if (_axisTitlePositions.abs === "bottom" && options.x.title) {
            padding.bottom += options.axisTitlePadding;
        }

        if (_axisTitlePositions.ord === "right" && options.y.title) {
            padding.right += options.axisTitlePadding;
        } else if (options.x.label) {
            padding.right += options.labelPadding;
        }

        if (_axisTitlePositions.ord === "left" && options.y.title) {
            padding.left += options.axisTitlePadding;
        }
        padding.left += options.y.titleOffset;
        
        return padding;
    }

    return gridFactory;
});
