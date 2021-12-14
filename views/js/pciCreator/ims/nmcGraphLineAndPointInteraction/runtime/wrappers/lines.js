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
    'taoQtiItem/portableLib/jquery_2_1_1',
    'taoQtiItem/portableLib/lodash',
    'nmcPci/portableLib/pointFactory',
    'nmcPci/portableLib/plotFactory'
], function(
    $,
    _,
    pointFactory,
    PlotFactory
){
    'use strict';

    var _defaults = {
        pointColor : '#bb1a2a',
        lineColor : '#bb1a2a',
        lineStyle : '',
        lineWeight : 3,
        pointRadius : 10,
        maximumPoints: 2,
        useSlope: false,
    };

    function initialize(grid, config){
        var points = [],
            active = false,
            uid = config.uid,
            segment = config.segment || false,
            paper = grid.getCanvas(),
            $paperCanvas = $(paper.canvas),
            plotFactory = new PlotFactory(grid),
            line,
            linesWrapper;

        function setConfig(cfg){
            config = _.defaults(cfg, _defaults);
        }

        function unbindEvents(){
            $paperCanvas.off('.' + uid);
        }

        function plot(){

            var point1 = points[0],
                point2 = points[1],
                plotConf = {color : config.lineColor, segment : segment, thickness : config.lineWeight, opacity : .8, includeBorders : true};

            if(point1 && point2){

                clearPlot();
               
                if(point1.getX() === point2.getX()){
                    //vertical line :
                    //@todo implement this case
                    line = plotFactory.plotVertical(point1, point2, plotConf);
                } else {
                    line = plotFactory.plotLinear(point1, point2, plotConf);
                }
                
                line.uid = uid;
                line.attr({opacity : 1});
                
                if (!segment) {
                    var arrowheadsShape = 'block-wide-long';
                    line.attr({
                        'arrow-start': arrowheadsShape, 
                        'arrow-end': arrowheadsShape,
                    });
                }

                if(config.lineStyle){
                    line.attr({'stroke-dasharray' : config.lineStyle});
                }

                $paperCanvas.trigger('drawn.lines', [line]);
            }
        }

        // Remove line
        function clearPlot(){
            if(line){
                line.remove();
                line = null;
                $paperCanvas.trigger('removed.lines', [line]);
            }
        }

        function addPoint(x, y, cartesian){

            var gridBBox = grid.getBBox();

            var newPoint = pointFactory(paper, grid, {
                x : x,
                y : y,
                xMin : gridBBox.x,
                xMax : gridBBox.x2,
                yMin : gridBBox.y,
                yMax : gridBBox.y2,
                cartesian : !!cartesian,
                radius : config.pointRadius,
                color : config.pointColor,
                on : {
                    dragStart : clearPlot
                }
            });
            // Draw the point
            newPoint.render();
            // Enable drag'n'drop hability
            newPoint.drag();
            // Add it to the list of points
            points.push(newPoint);
            // Raise event ready for line plot
            if(points.length >= 2){
                plot();
                $paperCanvas.on('moved.point', plot);
            }

            return newPoint;
        }

        function bindEvents(){
            $paperCanvas.on('click_grid.' + uid, function(event, coord){
                var oldPoint;

                if (points.length < config.maximumPoints) {
                    addPoint(coord.x, coord.y);
                } else {
                    // Get the last point placed
                    oldPoint = points.pop();
                    // Change their coordinates for new ones
                    oldPoint.setCoord(coord.x, coord.y);
                    // Re-draw the point
                    oldPoint.render();
                    // re-enable the drag'n'drop
                    oldPoint.drag();
                    // Add it back to the list
                    points.push(oldPoint);
                    // Raise event ready for a line plot
                    plot();
                }
            }).on('removed.point.' + uid, function(event, removedPoint) {
                var pointToDelete;
                if (points) {
                    // get the point to remove from the "registry"
                    pointToDelete = _.findIndex(points, {uid : removedPoint.uid});
                    if (pointToDelete > -1) {
                        points.splice(pointToDelete, 1);
                        clearPlot();
                    }
                }
            }).trigger('activated.lines', [uid]);
        }

        setConfig(config);

        linesWrapper = {
            type : 'line',
            getId : function(){
                return uid;
            },
            getLine : function(){
                return line;
            },
            isActive : function(){
                return active;
            },
            activate : function(){
                _.forEach(points, function(point){
                    point.showGlow();
                    point.drag();
                });
                bindEvents();
                active = true;
            },
            disactivate : function(){
                _.forEach(points, function(point){
                    point.hideGlow();
                    point.unDrag();
                });
                unbindEvents();
                active = false;
            },
            destroy : function(){
                if (typeof line !== 'undefined' && line !== null){
                    line.remove();
                    line = null;
                }
                if (typeof points !== 'undefined' && points !== []){
                    _.forEach(points, function(point){
                        point.children.remove().clear();
                    });
                    points = [];
                }
            },
            setLineStyle : function(style){
                config.lineStyle = style || '';
                plot();
            },
            highlightOn : function(){
                _.forEach(points, function(point){
                    point.showGlow();
                });
            },
            highlightOff : function(){
                _.forEach(points, function(point){
                    point.hideGlow();
                });
            },
            getState : function(){
                var coeffs = {};
                var slope = null, xIntercept = null, yIntercept = null;
                // collect points
                var pts = [];
                _.each(points, function(pt){
                    pts.push(pt.getCartesianCoord());
                });

                if(pts.length >= 2) { // protect from null reference
                    // first counting coefficients for general form Ax + By + C = 0
                    coeffs.A = pts[0].y - pts[1].y; // A = y1 - y2
                    coeffs.B = pts[1].x - pts[0].x; // B = x2 - x1
                    coeffs.C = pts[0].x * pts[1].y - pts[1].x * pts[0].y; // C = x1y2 - x2y1

                    // then for matter of convenience get slope and intercepts (if exist)
                    if (coeffs.B !== 0) {
                        slope = -(coeffs.A / coeffs.B);
                        yIntercept = -(coeffs.C / coeffs.B);
                    } else if(coeffs.A !== 0) {
                        xIntercept = -(coeffs.C / coeffs.A);
                    }
                }

                if (config.useSlope) { // only slope matters
                    return {
                        points : pts.length >= 2 ? pts : [], // line should be defined AT LEAST by TWO points, otherwise treat as empty
                        slope: slope,
                        config: _.cloneDeep(config)
                    };
                }

                return {
                    points : pts.length >= 2 ? pts : [], // line should be defined AT LEAST by TWO points, otherwise treat as empty
                    slope: slope,
                    xIntercept: xIntercept,
                    yIntercept: yIntercept,
                    config : _.cloneDeep(config)
                };
            },
            setState : function(state){

                if(state.config){
                    setConfig(state.config);
                }

                //clear points and plot
                clearPlot();
                _.each(points, function(point){
                    point.remove();
                });
                points = [];
                if(state.points){
                    _.each(state.points, function(point){
                        addPoint(point.x, point.y, true);
                    });
                }
                linesWrapper.disactivate();
            },
            clear: function() {
                clearPlot();
                if (typeof points !== 'undefined' && points !== []){
                    _.forEach(points, function(point){
                        point.children.remove().clear();
                    });
                    points = [];
                }
            },
            isUseSlope: function() {
                return config.useSlope;
            }
        };

        return linesWrapper;
    }

    return {
        initialize : initialize
    };

});
