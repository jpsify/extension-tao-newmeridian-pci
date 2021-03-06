define(['jquery', 'lodash', 'raphael', 'scale.raphael'], function ($, _, raphael, scaleRaphael) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);
    var ___default = /*#__PURE__*/_interopDefaultLegacy(_);
    var raphael__default = /*#__PURE__*/_interopDefaultLegacy(raphael);
    var scaleRaphael__default = /*#__PURE__*/_interopDefaultLegacy(scaleRaphael);

    var basic = {
    	stroke: "#8D949E",
    	"stroke-width": 2,
    	"stroke-dasharray": "",
    	"stroke-linejoin": "round",
    	fill: "#cccccc",
    	"fill-opacity": 0.5,
    	cursor: "pointer"
    };
    var hover = {
    	stroke: "#3E7DA7",
    	fill: "#0E5D91",
    	"fill-opacity": 0.3
    };
    var selectable = {
    	"stroke-dasharray": "-",
    	stroke: "#3E7DA7",
    	fill: "#cccccc",
    	"fill-opacity": 0.5
    };
    var active = {
    	stroke: "#3E7DA7",
    	"stroke-dasharray": "",
    	fill: "#0E5D91",
    	"fill-opacity": 0.5
    };
    var error = {
    	stroke: "#C74155",
    	"stroke-dasharray": "",
    	"fill-opacity": 0.5,
    	fill: "#661728"
    };
    var success = {
    	stroke: "#C74155",
    	"stroke-dasharray": "",
    	fill: "#0E914B",
    	"fill-opacity": 0.5
    };
    var layer = {
    	fill: "#ffffff",
    	opacity: 0,
    	cursor: "pointer"
    };
    var creator = {
    	"fill-opacity": 0.5,
    	stroke: "#3E7DA7",
    	"stroke-dasharray": "",
    	fill: "#0E5D91",
    	cursor: "pointer"
    };
    var target = {
    	path: "m 18,8.4143672 -1.882582,0 C 15.801891,4.9747852 13.071059,2.2344961 9.63508,1.9026738 L 9.63508,0 8.2305176,0 l 0,1.9026387 C 4.7947148,2.2343027 2.0637246,4.9746621 1.7481973,8.4143672 l -1.7481973,0 0,1.4045625 1.754877,0 c 0.3460429,3.4066753 3.0632871,6.1119843 6.4756406,6.4413813 l 0,1.739689 1.4045624,0 0,-1.739725 c 3.412547,-0.329537 6.129633,-3.034793 6.475641,-6.4413453 l 1.889279,0 z m -8.36492,6.5188648 0,-4.064673 -1.4045624,0 0,4.063882 C 5.5511016,14.612555 3.4232695,12.494619 3.0864551,9.8189297 l 4.0449512,0 0,-1.4045625 -4.0546368,0 C 3.3788672,5.6984941 5.5228887,3.5393379 8.2305176,3.2161113 l 0,3.9153125 1.4045624,0 0,-3.9160859 c 2.711162,0.3203965 4.858576,2.4808887 5.160955,5.1990293 l -3.927441,0 0,1.4045625 3.917773,0 C 14.449289,12.496957 12.318363,14.616158 9.63508,14.933232 z",
    	fill: "#0E914B",
    	width: 1,
    	"stroke-width": 0,
    	cursor: "pointer"
    };
    var assoc = {
    	"stroke-width": 2,
    	"stroke-linecap": "round",
    	cursor: "pointer"
    };
    var close = {
    	path: "m 8.9997236,18.000001 c -4.9703918,0 -8.99972284217367,-4.02901 -8.99972284217367,-9 C 7.5782633e-7,4.029011 4.0293108,9.8531742e-7 8.9997236,9.8531742e-7 13.970691,9.8531742e-7 18.000001,4.029011 18.000001,9.000001 c 0,4.97099 -4.02931,9 -9.0002774,9 z m 0.0045,-16.37151 c -4.06191,0 -7.35492,3.29635 -7.35492,7.36251 0,4.06562 3.292989,7.36255 7.35492,7.36255 4.0630384,0 7.3554334,-3.29693 7.3554334,-7.36255 0,-4.06614 -3.292969,-7.36251 -7.3554334,-7.36251 v 0 z m 3.1314894,9.31167 -1.953823,-1.94014 1.953843,-1.94018 c 0.08964,-0.089 0.134622,-0.19099 0.135073,-0.30584 4.31e-4,-0.11488 -0.04383,-0.21712 -0.132838,-0.30681 l -0.54267,-0.54685 c -0.08898,-0.0897 -0.190903,-0.13473 -0.305719,-0.13514 -0.114837,-4.4e-4 -0.217064,0.0439 -0.306703,0.1329 l -1.9623724,1.94865 -1.962395,-1.94865 c -0.08964,-0.089 -0.191845,-0.13336 -0.306702,-0.1329 -0.114837,4.3e-4 -0.216736,0.0455 -0.305719,0.13514 l -0.54265,0.54685 c -0.08902,0.0897 -0.133269,0.19193 -0.132838,0.30681 4.3e-4,0.11485 0.04543,0.21681 0.135073,0.30584 l 1.953823,1.94018 -1.953782,1.94014 c -0.0896,0.089 -0.134684,0.19094 -0.135114,0.3058 -4.31e-4,0.11486 0.04386,0.21716 0.132838,0.30681 l 0.542671,0.54687 c 0.08896,0.0897 0.190923,0.13467 0.305718,0.13516 0.114857,3.9e-4 0.217105,-0.0439 0.306724,-0.13288 l 1.962332,-1.94863 1.9623324,1.94863 c 0.08962,0.089 0.191886,0.13323 0.306744,0.13288 0.114836,-4.5e-4 0.216736,-0.0455 0.305698,-0.13516 l 0.542691,-0.54687 c 0.089,-0.0897 0.133227,-0.19193 0.132838,-0.30681 -3.9e-4,-0.1149 -0.0455,-0.21683 -0.135073,-0.3058 z",
    	fill: "#0E5D91",
    	width: 1,
    	opacity: 0,
    	"stroke-width": 0,
    	cursor: "pointer"
    };
    var gstyle = {
    	basic: basic,
    	hover: hover,
    	selectable: selectable,
    	active: active,
    	error: error,
    	success: success,
    	layer: layer,
    	creator: creator,
    	"imageset-rect-stroke": {
    	fill: "#ffffff",
    	stroke: "#666666",
    	"stroke-width": 1,
    	"stroke-linejoin": "round",
    	cursor: "pointer"
    },
    	"imageset-rect-no-stroke": {
    	fill: "#ffffff",
    	stroke: "#ffffff",
    	"stroke-width": 2,
    	"stroke-linejoin": "round",
    	cursor: "pointer"
    },
    	"imageset-img": {
    	cursor: "pointer"
    },
    	"order-text": {
    	fill: "#ffffff",
    	stroke: "#000000",
    	"stroke-width": 0.7,
    	"font-family": "sans-serif",
    	"font-weight": "bold",
    	"font-size": 22,
    	cursor: "pointer"
    },
    	"score-text-default": {
    	stroke: "#444444",
    	"stroke-width": 0.5,
    	"font-family": "sans-serif",
    	"font-weight": "normal",
    	"font-size": 20,
    	cursor: "pointer"
    },
    	"score-text": {
    	stroke: "#000000",
    	"stroke-width": 0.5,
    	"font-family": "sans-serif",
    	"font-weight": "normal",
    	"font-size": 20,
    	cursor: "pointer"
    },
    	"small-text": {
    	stroke: "#000000",
    	"stroke-width": 0.5,
    	"font-family": "sans-serif",
    	"font-weight": "normal",
    	"font-size": 16,
    	cursor: "pointer"
    },
    	"layer-pos-text": {
    	stroke: "#333",
    	"stroke-width": 0.5,
    	"font-family": "sans-serif",
    	"font-weight": "normal",
    	"font-size": 14
    },
    	target: target,
    	"target-hover": {
    	fill: "#3E7DA7",
    	"fill-opacity": 1
    },
    	"target-success": {
    	fill: "#0E914B",
    	"fill-opacity": 1
    },
    	assoc: assoc,
    	"assoc-layer": {
    	"stroke-width": 12,
    	cursor: "pointer",
    	"stroke-opacity": 0
    },
    	"assoc-bullet": {
    	fill: "#000000"
    },
    	close: close,
    	"close-bg": {
    	fill: "#ffffff",
    	stroke: "none",
    	cursor: "pointer",
    	opacity: 0
    },
    	"touch-circle": {
    	fill: "none",
    	stroke: "#3E7DA7",
    	"stroke-width": 2
    }
    };

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
     * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
     */

    //maps the QTI shapes to Raphael shapes
    var shapeMap = {
        default: 'rect',
        poly: 'path'
    };

    //length constraints to validate coords
    var coordsValidator = {
        rect: 4,
        ellipse: 4,
        circle: 3,
        poly: 6,
        default: 0
    };

    //transform the coords from the QTI system to Raphael system
    var qti2raphCoordsMapper = {
        /**
         * Rectangle coordinate mapper:  from left-x,top-y,right-x-bottom-y to x,y,w,h
         * @param {Array} coords - QTI coords
         * @returns {Array} raphael coords
         */
        rect: function(coords) {
            return [coords[0], coords[1], coords[2] - coords[0], coords[3] - coords[1]];
        },

        /**
         * Creates the coords for a default shape (a rectangle that covers all the paper)
         * @param {Raphael.Paper} paper - the paper
         * @returns {Array} raphael coords
         */
        default: function(paper) {
            return [0, 0, paper.width, paper.height];
        },

        /**
         * polygone coordinate mapper:  from x1,y1,...,xn,yn to SVG path format
         * @param {Array} coords - QTI coords
         * @returns {Array} path desc
         */
        poly: function(coords) {
            var a;
            var size = coords.length;

            // autoClose if needed
            if (coords[0] !== coords[size - 2] && coords[1] !== coords[size - 1]) {
                coords.push(coords[0]);
                coords.push(coords[1]);
            }

            // move to first point
            coords[0] = 'M' + coords[0];

            for (a = 1; a < size; a++) {
                if (a % 2 === 0) {
                    coords[a] = 'L' + coords[a];
                }
            }

            return [coords.join(' ')];
        }
    };

    //transform the coords from a raphael shape to the QTI system
    var raph2qtiCoordsMapper = {
        /**
         * Rectangle coordinate mapper: from x,y,w,h to left-x,top-y,right-x-bottom-y
         * @param {Object} attr - Raphael Element's attributes
         * @returns {Array} qti based coords
         */
        rect: function(attr) {
            return [attr.x, attr.y, attr.x + attr.width, attr.y + attr.height];
        },

        /**
         * Circle coordinate mapper
         * @param {Object} attr - Raphael Element's attributes
         * @returns {Array} qti based coords
         */
        circle: function(attr) {
            return [attr.cx, attr.cy, attr.r];
        },

        /**
         * Ellispe coordinate mapper
         * @param {Object} attr - Raphael Element's attributes
         * @returns {Array} qti based coords
         */
        ellipse: function(attr) {
            return [attr.cx, attr.cy, attr.rx, attr.ry];
        },

        /**
         * Get the coords for a default shape (a rectangle that covers all the paper)
         * @param {Object} attr - Raphael Element's attributes
         * @returns {Array} qti based coords
         */
        default: function(attr) {
            return this.rect(attr);
        },

        /**
         * polygone coordinate mapper:  from SVG path (available as segments) to x1,y1,...,xn,yn format
         * @param {Raphael.Paper} paper - the paper
         * @returns {Array} raphael coords
         */
        path: function(attr) {
            var poly = [];
            var i;

            if (___default['default'].isArray(attr.path)) {
                for (i = 1; i < attr.path.length; i++) {
                    if (attr.path[i].length === 3) {
                        poly.push(attr.path[i][1]);
                        poly.push(attr.path[i][2]);
                    }
                }
            }

            return poly;
        }
    };

    /**
     * Graphic interaction helper
     * @exports qtiCommonRenderer/helpers/Graphic
     */
    var GraphicHelper = {
        /**
         * Raw access to the styles
         * @type {Object}
         */
        _style: gstyle,

        /**
         * Apply the style defined by name to the element
         * @param {Raphael.Element} element - the element to change the state
         * @param {String} state - the name of the state (from states) to switch to
         */
        setStyle: function(element, name) {
            if (element && gstyle[name]) {
                element.attr(gstyle[name]);
            }
        },

        /**
         * Create a Raphael paper with a bg image, that is width responsive
         * @param {String} id - the id of the DOM element that will contain the paper
         * @param {String} serial - the interaction unique indentifier
         * @param {Object} options - the paper parameters
         * @param {String} options.img - the url of the background image
         * @param {jQueryElement} [options.container] - the parent of the paper element (got the closest parent by default)
         * @param {Number} [options.width] - the paper width
         * @param {Number} [options.height] - the paper height
         * @param {String} [options.imgId] - an identifier for the image element
         * @param {Function} [options.done] - executed once the image is loaded
         * @returns {Raphael.Paper} the paper
         */
        responsivePaper: function(id, serial, options) {
            var paper, image;

            var $container = options.container || $__default['default']('#' + id).parent();
            var $editor = $__default['default']('.image-editor', $container);
            var $body = $container.closest('.qti-itemBody');
            var resizer = ___default['default'].throttle(resizePaper, 10);

            var containerWidth = $container.innerWidth();
            var containerHeight = $container.innerHeight();
            var imgWidth = options.width || containerWidth;
            var imgHeight = options.height || containerHeight;

            paper = scaleRaphael__default['default'](id, imgWidth, imgHeight);
            paper.changeSize(containerWidth, containerHeight, false, false);
            image = paper.image(options.img, 0, 0, imgWidth, imgHeight);
            image.id = options.imgId || image.id;
            paper.setViewBox(0, 0, imgWidth, imgHeight);

            resizer();

            //retry to resize once the SVG is loaded
            $__default['default'](image.node)
                .attr('externalResourcesRequired', 'true')
                .on('load', resizer);

            if (raphael__default['default'].type === 'SVG') {
                // TODO: move listeners somewhere they can be easily turned off
                $__default['default'](window).on('resize.qti-widget.' + serial, resizer);
                // TODO: favor window resize event and deprecate $container resive event (or don't allow $container to be destroyed and rebuilt
                $container.on('resize.qti-widget.' + serial, resizer);
                $__default['default'](document).on('customcssloaded.styleeditor', resizer);
            } else {
                $container.find('.main-image-box').width(imgWidth);
                if (typeof options.resize === 'function') {
                    options.resize(imgWidth, 1);
                }
            }

            /**
             * scale the raphael paper
             * @private
             */
            function resizePaper(e, givenWidth) {
                var diff, maxWidth, containerWidth, containerHeight, factor;

                if (e) {
                    e.stopPropagation();
                }

                diff = $editor.outerWidth() - $editor.width() + ($container.outerWidth() - $container.width()) + 1;
                maxWidth = $body.width();
                containerWidth = $container.innerWidth();

                if (containerWidth > 0 || givenWidth > 0) {
                    if (givenWidth < containerWidth && givenWidth < maxWidth) {
                        containerWidth = givenWidth - diff;
                    } else if (containerWidth > maxWidth) {
                        containerWidth = maxWidth - diff;
                    } else {
                        containerWidth -= diff;
                    }

                    factor = containerWidth / imgWidth;
                    containerHeight = imgHeight * factor;

                    if (containerWidth > 0) {
                        paper.changeSize(containerWidth, containerHeight, false, false);
                    }

                    if (typeof options.resize === 'function') {
                        options.resize(containerWidth, factor);
                    }

                    $container.trigger('resized.qti-widget');
                }
            }

            return paper;
        },

        /**
         * Create a new Element into a raphael paper
         * @param {Raphael.Paper} paper - the interaction paper
         * @param {String} type - the shape type
         * @param {String|Array.<Number>} coords - qti coords as a string or an array of number
         * @param {Object} [options] - additional creation options
         * @param {String} [options.id] - to set the new element id
         * @param {String} [options.title] - to set the new element title
         * @param {String} [options.style = basic] - to default style
         * @param {Boolean} [options.hover = true] - to disable the default hover state
         * @param {Boolean} [options.touchEffect = true] - a circle appears on touch
         * @param {Boolean} [options.qtiCoords = true] - if the coords are in QTI format
         * @returns {Raphael.Element} the created element
         */
        createElement: function(paper, type, coords, options) {
            var self = this;
            var element;
            var shaper = shapeMap[type] ? paper[shapeMap[type]] : paper[type];
            var shapeCoords = options.qtiCoords !== false ? self.raphaelCoords(paper, type, coords) : coords;

            if (typeof shaper === 'function') {
                element = shaper.apply(paper, shapeCoords);
                if (element) {
                    if (options.id) {
                        element.id = options.id;
                    }

                    if (options.title) {
                        element.attr('title', options.title);
                    }

                    element.attr(gstyle[options.style || 'basic']).toFront();

                    //prevent issue in firefox 37
                    $__default['default'](element.node).removeAttr('stroke-dasharray');

                    if (options.hover !== false) {
                        element.hover(
                            function() {
                                if (!element.flashing) {
                                    self.updateElementState(this, 'hover');
                                }
                            },
                            function() {
                                if (!element.flashing) {
                                    self.updateElementState(
                                        this,
                                        this.active ? 'active' : this.selectable ? 'selectable' : 'basic'
                                    );
                                }
                            }
                        );
                    }

                    if (options.touchEffect !== false) {
                        element.touchstart(function() {
                            self.createTouchCircle(paper, element.getBBox());
                        });
                    }
                }
            } else {
                throw new Error('Unable to find method ' + type + ' on paper');
            }

            return element;
        },

        /**
         * Create target point
         * @param {Raphael.Paper} paper - the paper
         * @param {Object} [options]
         * @param {Object} [options.id] - and id to identify the target
         * @param {Object} [options.point] - the point to add to the paper
         * @param {Number} [options.point.x = 0] - point's x coord
         * @param {Number} [options.point.y = 0] - point's y coord
         * @param {Boolean} [options.hover] = true - the target has an hover effect
         * @param {Function} [options.create] - call once created
         * @param {Function} [options.remove] - call once removed
         */
        createTarget: function createTarget(paper, options) {
            var baseSize, count, factor, half, hover, layer, point, self, tBBox, targetSize, x, y, target;

            options = options || {};

            self = this;
            point = options.point || { x: 0, y: 0 };
            factor = paper.w !== 0 ? paper.width / paper.w : 1;
            hover = typeof options.hover === 'undefined' ? true : !!options.hover;

            baseSize = 18; // this is the base size of the path element to be placed on svg (i.e. the path element crosshair is created to have a size of 18)
            half = baseSize / 2;
            x = point.x - half;
            y = point.y - half;
            targetSize = factor !== 0 ? 2 / factor : 2;

            //create the target from a path
            target = paper
                .path(gstyle.target.path)
                .transform('t' + x + ',' + y + 's' + targetSize)
                .attr(gstyle.target)
                .attr('title', ___default['default']('Click again to remove'));

            //generate an id if not set in options
            if (options.id) {
                target.id = options.id;
            } else {
                count = 0;
                paper.forEach(function(element) {
                    if (element.data('target')) {
                        count++;
                    }
                });
                target.id = 'target-' + count;
            }

            tBBox = target.getBBox();

            //create an invisible rect over the target to ensure path selection
            layer = paper
                .rect(tBBox.x, tBBox.y, tBBox.width, tBBox.height)
                .attr(gstyle.layer)
                .click(function() {
                    var id = target.id;
                    var p = this.data('point');

                    if (___default['default'].isFunction(options.select)) {
                        options.select(target, p, this);
                    }

                    if (___default['default'].isFunction(options.remove)) {
                        this.remove();
                        target.remove();
                        options.remove(id, p);
                    }
                });

            if (hover) {
                layer.hover(
                    function() {
                        if (!target.flashing) {
                            self.setStyle(target, 'target-hover');
                        }
                    },
                    function() {
                        if (!target.flashing) {
                            self.setStyle(target, 'target-success');
                        }
                    }
                );
            }

            layer.id = 'layer-' + target.id;
            layer.data('point', point);
            target.data('target', point);

            if (___default['default'].isFunction(options.create)) {
                options.create(target);
            }

            return target;
        },

        /**
         * Get the Raphael coordinate from QTI coordinate
         * @param {Raphael.Paper} paper - the interaction paper
         * @param {String} type - the shape type
         * @param {String|Array.<Number>} coords - qti coords as a string or an array of number
         * @returns {Array} the arguments array of coordinate to give to the approriate raphael shapre creator
         */
        raphaelCoords: function raphaelCoords(paper, type, coords) {
            var shapeCoords;

            if (___default['default'].isString(coords)) {
                coords = ___default['default'].map(coords.split(','), function(coord) {
                    return parseInt(coord, 10);
                });
            }

            if (!___default['default'].isArray(coords) || coords.length < coordsValidator[type]) {
                throw new Error('Invalid coords ' + JSON.stringify(coords) + '  for type ' + type);
            }

            switch (type) {
                case 'rect':
                    shapeCoords = qti2raphCoordsMapper.rect(coords);
                    break;
                case 'default':
                    shapeCoords = qti2raphCoordsMapper['default'].call(null, paper);
                    break;
                case 'poly':
                    shapeCoords = qti2raphCoordsMapper.poly(coords);
                    break;
                default:
                    shapeCoords = coords;
                    break;
            }

            return shapeCoords;
        },

        /**
         * Get the QTI coordinates from a Raphael Element
         * @param {Raphael.Element} element - the shape to get the coords from
         * @returns {String} the QTI coords
         */
        qtiCoords: function qtiCoords(element) {
            var mapper = raph2qtiCoordsMapper[element.type];
            var result = '';

            if (___default['default'].isFunction(mapper)) {
                result = ___default['default'].map(mapper.call(raph2qtiCoordsMapper, element.attr()), function(coord) {
                    return ___default['default'].parseInt(coord);
                }).join(',');
            }

            return result;
        },

        /**
         * Create a circle that animate and disapear from a shape.
         *
         * @param {Raphael.Paper} paper - the paper
         * @param {Raphael.Element} element - used to get the bbox from
         */
        createTouchCircle: function(paper, bbox) {
            var radius = bbox.width > bbox.height ? bbox.width : bbox.height;
            var tCircle = paper.circle(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, radius);

            tCircle.attr(gstyle['touch-circle']);

            ___default['default'].defer(function() {
                tCircle.animate({ r: radius + 5, opacity: 0.7 }, 300, function() {
                    tCircle.remove();
                });
            });
        },

        /**
         * Create a text, that scales.
         *
         * @param {Raphael.Paper} paper - the paper
         * @param {Object} options - the text options
         * @param {Number} options.left - x coord
         * @param {Number} options.top - y coord
         * @param {String} [options.content] - the text content
         * @param {String} [options.id] - the element identifier
         * @param {String} [options.style = 'small-text'] - the style name according to the graphic-style.json keys
         * @param {String} [options.title] - the text tooltip content
         * @param {Boolean} [options.hide = false] - if the text starts hidden
         * @returns {Raphael.Element} the created text
         */
        createText: function(paper, options) {
            var fontSize, scaledFontSize, text;
            var top = options.top || 0;
            var left = options.left || 0;
            var content = options.content || '';
            var style = options.style || 'small-text';
            var title = options.title || '';
            var factor = 1;

            if (paper.width && paper.w) {
                factor = paper.width / paper.w;
            }

            text = paper.text(left, top, content).toFront();
            if (options.id) {
                text.id = options.id;
            }

            if (options.hide) {
                text.hide();
            }

            text.attr(gstyle[style]);

            if (typeof factor !== 'undefined' && factor !== 1) {
                fontSize = parseInt(text.attr('font-size'), 10);
                scaledFontSize = Math.floor(fontSize / factor) + 1;

                text.attr('font-size', scaledFontSize);
            }

            if (title) {
                this.updateTitle(text, title);
            }

            return text;
        },

        /**
         * Create a text in the middle of the related shape.
         *
         * @param {Raphael.Paper} paper - the paper
         * @param {Raphael.Element} shape - the shape to add the text to
         * @param {Object} options - the text options
         * @param {String} [options.content] - the text content
         * @param {String} [options.id] - the element identifier
         * @param {String} [options.style = 'small-text'] - the style name according to the graphic-style.json keys
         * @param {String} [options.title] - the text tooltip content
         * @param {Boolean} [options.hide = false] - if the text starts hidden
         * @param {Boolean} [options.shapeClick = false] - clicking the text delegates to the shape
         * @returns {Raphael.Element} the created text
         */
        createShapeText: function(paper, shape, options) {
            var self = this;
            var bbox = shape.getBBox();

            var text = this.createText(
                paper,
                ___default['default'].merge(
                    {
                        left: bbox.x + bbox.width / 2,
                        top: bbox.y + bbox.height / 2
                    },
                    options
                )
            );

            if (options.shapeClick) {
                text.click(function() {
                    self.trigger(shape, 'click');
                });
            }

            return text;
        },

        /**
         * Create an image with a padding and a border, using a set.
         *
         * @param {Raphael.Paper} paper - the paper
         * @param {Object} options - image options
         * @param {Number} options.left - x coord
         * @param {Number} options.top - y coord
         * @param {Number} options.width - image width
         * @param {Number} options.height - image height
         * @param {Number} options.url - image ulr
         * @param {Number} [options.padding = 6] - a multiple of 2 is welcomed
         * @param {Boolean} [options.border = false] - add a border around the image
         * @param {Boolean} [options.shadow = false] - add a shadow back the image
         * @returns {Raphael.Element} the created set, augmented of a move(x,y) method
         */
        createBorderedImage: function(paper, options) {
            var padding = options.padding >= 0 ? options.padding : 6;
            var halfPad = padding / 2;

            var rx = options.left,
                ry = options.top,
                rw = options.width + padding,
                rh = options.height + padding;

            var ix = options.left + halfPad,
                iy = options.top + halfPad,
                iw = options.width,
                ih = options.height;

            var set = paper.set();

            //create a rectangle with a padding and a border.
            var rect = paper
                .rect(rx, ry, rw, rh)
                .attr(options.border ? gstyle['imageset-rect-stroke'] : gstyle['imageset-rect-no-stroke']);

            //and an image centered into the rectangle.
            var image = paper.image(options.url, ix, iy, iw, ih).attr(gstyle['imageset-img']);

            if (options.shadow) {
                set.push(
                    rect.glow({
                        width: 2,
                        offsetx: 1,
                        offsety: 1
                    })
                );
            }

            set.push(rect, image);

            /**
             * Add a move method to set that keep the given coords during an animation
             * @private
             * @param {Number} x - destination
             * @param {Number} y - destination
             * @param {Number} [duration = 400] - the animation duration
             * @returns {Raphael.Element} the set for chaining
             */
            set.move = function move(x, y, duration) {
                var animation = raphael__default['default'].animation({ x: x, y: y }, duration || 400);
                var elt = rect.animate(animation);
                image.animateWith(elt, animation, { x: x + halfPad, y: y + halfPad }, duration || 400);
                return set;
            };

            return set;
        },

        /**
         * Update the visual state of an Element
         * @param {Raphael.Element} element - the element to change the state
         * @param {String} state - the name of the state (from states) to switch to
         * @param {String} [title] - a title linked to this step
         */
        updateElementState: function(element, state, title) {
            if (element && element.animate) {
                element.animate(gstyle[state], 200, 'linear', function() {
                    element.attr(gstyle[state]); //for attr that don't animate

                    //preven issue in firefox 37
                    $__default['default'](element.node).removeAttr('stroke-dasharray');
                });

                if (title) {
                    this.updateTitle(element, title);
                }
            }
        },

        /**
         * Update the title of an element (the attr method of Raphael adds only new node instead of updating exisitings).
         * @param {Raphael.Element} element - the element to update the title
         * @param {String} [title] - the new title
         */
        updateTitle: function(element, title) {
            if (element && element.node) {
                //removes all remaining titles nodes
                ___default['default'].forEach(element.node.children, function(child) {
                    if (child.nodeName.toLowerCase() === 'title') {
                        element.node.removeChild(child);
                    }
                });

                //then set the new title
                element.attr('title', title);
            }
        },

        /**
         * Highlight an element with the error style
         * @param {Raphael.Element} element - the element to hightlight
         * @param {String} [restorState = 'basic'] - the state to restore the elt into after flash
         */
        highlightError: function(element, restoredState) {
            var self = this;
            if (element) {
                element.flashing = true;
                self.updateElementState(element, 'error');
                ___default['default'].delay(function() {
                    self.updateElementState(element, restoredState || 'basic');
                    element.flashing = false;
                }, 800);
            }
        },

        /**
         * Trigger an event already bound to a raphael element
         * @param {Raphael.Element} element
         * @param {String} event - the event name
         *
         */
        trigger: function(element, event) {
            var evt = ___default['default'].where(element.events, { name: event });
            if (evt.length && evt[0] && typeof evt[0].f === 'function') {
                evt[0].f.apply(element, Array.prototype.slice.call(arguments, 2));
            }
        },

        /**
         * Get an x/y point from a MouseEvent
         * @param {MouseEvent} event - the source event
         * @param {Raphael.Paper} paper - the interaction paper
         * @param {jQueryElement} $container - the paper container
         * @param {Boolean} isResponsive - if the paper is scaling
         * @returns {Object} x,y point
         */
        getPoint: function getPoint(event, paper, $container) {
            var point = this.clickPoint($container, event);
            var rect = $container.get(0).getBoundingClientRect();
            var factor = paper.w / rect.width;

            point.x = Math.round(point.x * factor);
            point.y = Math.round(point.y * factor);

            return point;
        },

        /**
         * Get paper position relative to the container
         * @param {jQueryElement} $container - the paper container
         * @param {Raphael.Paper} paper - the interaction paper
         * @returns {Object} position with top and left
         */
        position: function($container, paper) {
            var pw = parseInt(paper.w || paper.width, 10);
            var cw = parseInt($container.width(), 10);
            var ph = parseInt(paper.w || paper.width, 10);
            var ch = parseInt($container.height(), 10);

            return {
                left: (cw - pw) / 2,
                top: (ch - ph) / 2
            };
        },

        /**
         * Get a point from a click event
         * @param {jQueryElement} $container - the element that contains the paper
         * @param {MouseEvent} event - the event triggered by the click
         * @returns {Object} the x,y point
         */
        clickPoint: function($container, event) {
            var x, y;
            var offset = $container.offset();

            if (event.pageX || event.pageY) {
                x = event.pageX - offset.left;
                y = event.pageY - offset.top;
            } else if (event.clientX || event.clientY) {
                x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - offset.left;
                y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - offset.top;
            }

            return { x: x, y: y };
        }
    };

    return GraphicHelper;

});
