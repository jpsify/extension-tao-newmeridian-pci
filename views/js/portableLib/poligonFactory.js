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


define(['taoQtiItem/portableLib/lodash', 'nmcPci/portableLib/graphFunction'], function(_, graphFunction){

    'use strict';

    var _defaults = {
        start : -10, //the starting abcisse in cartesian coordinate system
        end : 10, //the end abcisse in cartesian coordinate system
        precision : .01, //the precision of the plot (in cartesian coordinate)
        opacity : .25, //the opacity of the plot
        color : '#bb1a2a', //the color of the plot
        thickness : 3     //the thickness of the plot
    };

    /**
     * Apply relevant stroke attribute from config on a Raphaeljs path
     *
     * @param {Object} path - Raphaeljs Path
     * @param {Object} config
     * @returns {undefined}
     */
    function _applyStyle(path, config){
        path.attr({
            stroke : config.color ? config.color : _defaults.color,
            'stroke-width' : config.thickness ? config.thickness : _defaults.thickness,
            opacity : 0.25,
            fill: config.color ? config.color : _defaults.color,
        });
    }

    /**
     * Create a new Poligon factory for a grid
     *
     * Usage:
     * var myPoligonFactory = new PoligonFactory(myGrid, myCOnfig);
     * myPoligonFactory.poligon(plotConfig, [ {x : 4, y : 0}, {x : 0, y : 4} ]);
     *
     * @param {Object} grid - a grid build from the gridFactory
     * @param {type} config - the poligon factory configuration
     * @param {Integer} [config.start = -10] - the starting abcisse in cartesian coordinate system
     * @param {Integer} [config.end = 10] - the end abcisse in cartesian coordinate system
     * @param {Float} [config.precision = .01] - the precision of the plot (in cartesian coordinate)
     * @param {String} [config.color = .01] - the color of the poligon
     * @param {Integer} [config.thickness = 3] - the thickness of the plot
     * @returns {Object} A new instance of PlotFactory
     */
    function PoligonFactory(grid, config0){

        var _this = this;
        var canvas = grid.getCanvas();
        var config = _.clone(config0 || {});
        config = _.defaults(config, _defaults);
        var bounds = grid.getGridBounds();

        config.unitSize = grid.getUnits();
        config.origin = grid.getOriginPosition();

        config.start = bounds.x.start;
        config.end = bounds.x.end;
        config.start_y = bounds.y.start;
        config.end_y = bounds.y.end;

        _this.poligon = function(conf, points){

            conf = _.defaults(conf || {}, config);
            try{

                var path = 'M' + _.map(points, function(point) {
                    return point.getX() + ',' + point.getY();
                }).join('L');

                var poligon = canvas.path(path);
                _applyStyle(poligon, conf);

                return poligon;
            }catch(e){
                console.log(e);
            }

            return false;
        }

    }

    return PoligonFactory;
});
