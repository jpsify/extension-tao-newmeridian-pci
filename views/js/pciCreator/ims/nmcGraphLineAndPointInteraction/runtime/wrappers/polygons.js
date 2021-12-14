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
    'nmcPci/portableLib/plotFactory',
    'nmcPci/portableLib/poligonFactory'
], function(
    $,
    _,
    pointFactory,
    PlotFactory,
    PoligonFactory) {

    'use strict';
    var _defaults = {
        pointColor : '#bb1a2a',
        lineColor : '#bb1a2a',
        lineStyle : '',
        lineWeight : 3,
        pointRadius : 10,
        maximumPoints: 3,
        showCloseShapeBtn: true,
        staticPoints:  [],
        showStaticLines: true,
        showStaticPoints: true
    };

    function initialize(grid, config, buttonContainer){

        var points = [],
            paths = [],
            staticPoints = [],
            staticPaths = [],
            active = false,
            uid = config.uid,
            segment = true,
            paper = grid.getCanvas(),
            $paperCanvas = $(paper.canvas),
            plotFactory = new PlotFactory(grid),
            poligonFactory = new PoligonFactory(grid, config),
            line,
            shapeClosed = false,
            $closeButton = buttonContainer.find('.close-shape-button'),
            staticPlotFactory;

        $closeButton.on('click', function() {
            shapeClosed = true;
            plot();
        });

        function setConfig(cfg){
            config = _.defaults(cfg, _defaults);
        }

        function unbindEvents(){
            $paperCanvas.off('.' + uid);
        }

        function plot(){
            clearPlot();
            plotLines(points, paths, plotFactory, shapeClosed);
            $paperCanvas.trigger('drawn.polygon');
        }

        function plotLines(points, paths, plotFactory, shapeClosed, isStatic = false){
            var plotPoints = points.slice();
            var plotConf = {
                color : isStatic ? config.staticLineColor : config.lineColor,
                segment : segment,
                thickness : config.lineWeight,
                opacity : .8
            };

            if (staticPoints.length > 0 && points !== staticPoints) {
                plotPoints.unshift(staticPoints[staticPoints.length - 1]);
            }

            if (plotPoints.length >= 2) {
                var reducer = function(pointA, pointB) {
                    var line;
                    if (pointA.getX() === pointB.getX()) {
                        line = plotFactory.plotVertical(pointA, pointB, plotConf);
                    } else {
                        line = plotFactory.plotLinear(pointA, pointB, plotConf);
                    }
                    line.attr({opacity : 1});
                    if(config.lineStyle && points !== staticPoints){
                        line.attr({'stroke-dasharray' : config.lineStyle});
                    }
                    paths.push(line);
                    return pointB;
                };
                plotPoints.reduce(reducer);
                if (shapeClosed && plotPoints.length >= 3) {
                    var startPoint = staticPoints.length > 0 && points !== staticPoints
                        ? staticPoints[0]
                        : points[0];
                    reducer(startPoint, plotPoints[plotPoints.length - 1]);
                    paths.push(poligonFactory.poligon(plotConf, staticPoints.concat(plotPoints)));
                }
                if (points !== staticPoints){
                    staticPlot();
                }
            }
        }

        // Remove line
        function clearPlot(){
            if(line){
                line.remove();
                line = null;
                $paperCanvas.trigger('removed.lines', [line]);
            }
            removeAll(paths);
            paths = [];
        }

        function removeAll(list) {
            list.forEach(function(element) {
                element.remove();
            });
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
            return newPoint;
        }

        function addStaticPoint(fx, fy, label, cartesian){

            var newPoint, pointConfig;

            if(grid){

                pointConfig = _.defaults({
                    x : fx,
                    y : fy,
                    label : label,
                    color: config.staticPointColor,
                    labelColor: config.staticPointLabelColor,
                }, config);

                newPoint = pointFactory(paper, grid, pointConfig);
                if(cartesian){
                    newPoint.setCartesianCoord(fx, fy, pointConfig);
                }
                staticPoints.push(newPoint);
            }
            newPoint.render();
            return newPoint;
        }

        function bindEvents(){

            $paperCanvas.on('click_grid.' + uid, function(event, coord) {

                shapeClosed = false;

                if (points.length < config.maximumPoints) {
                    addPoint(coord.x, coord.y);
                    $paperCanvas.off('moved.point').on('moved.point', plot);
                    if ((points.length + staticPoints.length) > 2) {
                        $closeButton.removeClass('disabled');
                    }
                } else {
                    // Get the last point placed
                    var oldPoint = points.pop();
                    // Change their coordinates for new ones
                    oldPoint.setCoord(coord.x, coord.y);
                    // Re-draw the point
                    oldPoint.render();
                    // re-enable the drag'n'drop
                    oldPoint.drag();
                    // Add it back to the list
                    points.push(oldPoint);
                    // Raise event ready for a line plot
                    plotLines(points, paths, plotFactory, shapeClosed);
                }

                if (config.autoCloseShape &&
                    !isNaN(Number(config.maximumPoints)) && points.length === Number(config.maximumPoints)) {
                    shapeClosed = true;
                }
                plot();

            }).on('removed.point.' + uid, function(event, removedPoint){
                shapeClosed = false;
                if(points){
                    // get the point to remove from the "registry"
                    var pointToDelete = _.findIndex(points, {uid : removedPoint.uid});
                    if(pointToDelete > -1){
                        points.splice(pointToDelete, 1);
                        clearPlot();
                    }
                    if(points.length > 0){
                        plotLines(points, paths, plotFactory, shapeClosed);
                        $paperCanvas.off('moved.point').on('moved.point', plot);
                    }
                    if((points.length + staticPoints.length) < 3){
                        $closeButton.addClass('disabled');
                    }
                }
            }).trigger('activated.lines', [uid]);

        }

        function clearStaticPlot(){
            removeAll(staticPaths);
            staticPaths = [];
        }

        function staticPlot(){
            clearStaticPlot();

            if (config.showStaticLines) {
                plotLines(staticPoints, staticPaths, staticPlotFactory, false, true);
            }

            if (config.showStaticPoints) {
                staticPoints.forEach(function (point) {
                    point.render();
                });
            }
        }

        setConfig(config);

        staticPlotFactory = new PlotFactory(grid, config);
        //add static points, if any
        _.forEach(config.staticPoints, function(point) {
            addStaticPoint(point.x, point.y, point.label, true);
        });
        staticPlot();

        return {
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
                if(line !== undefined && line !== null){
                    line.remove();
                    line = null;
                }
                if(points !== undefined && points !== []){
                    _.forEach(points, function(point){
                        point.children.remove().clear();
                    });
                    points = [];
                }
            },
            setLineStyle : function(style){
                config.lineStyle = style || '';
                clearPlot();
                plotLines(points, paths, plotFactory, shapeClosed);
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

                var pts = [];
                _.each(points, function(pt){
                    pts.push(pt.getCartesianCoord());
                });

                return {
                    points : pts,
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

                    if (points.length > 0){
                        plotLines(points, paths, plotFactory, shapeClosed);
                        $paperCanvas.off('moved.point').on('moved.point', plot);
                        if ((points.length + staticPoints.length) > 2){
                            $closeButton.removeClass('disabled');
                        }
                    }
                }
                this.disactivate();
            },
            clear: function() {
                clearPlot();
                if(points !== undefined && points !== []){
                    _.forEach(points, function(point){
                        point.children.remove().clear();
                    });
                    points = [];
                }
            }
        };
    }

    return {
        initialize : initialize
    };
});
