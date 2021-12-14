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
    'qtiCustomInteractionContext',
    'taoQtiItem/portableLib/OAT/util/event',
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/scale.raphael',
    'taoQtiItem/portableLib/raphael',
    'nmcPci/portableLib/gridFactory',
    'nmcGraphLineAndPointInteraction/runtime/wrappers/setOfPoints',
    'nmcGraphLineAndPointInteraction/runtime/wrappers/points',
    'nmcGraphLineAndPointInteraction/runtime/wrappers/lines',
    'nmcGraphLineAndPointInteraction/runtime/wrappers/segments',
    'nmcGraphLineAndPointInteraction/runtime/wrappers/polygons',
    'nmcGraphLineAndPointInteraction/runtime/wrappers/solutionSet',
    'css!nmcGraphLineAndPointInteraction/runtime/css/nmcGraphLineAndPointInteraction'
], function(
    $,
    qtiCustomInteractionContext,
    event,
    _,
    scaleRaphael,
    Raphael,
    gridFactory,
    setPointsWrapper,
    pointsWrapper,
    linesWrapper,
    segmentsWrapper,
    polygonsWrapper,
    solutionSetWrapper
){

    'use strict';

    var _wrappers = {
        setPoints : setPointsWrapper,
        points : pointsWrapper,
        lines : linesWrapper,
        segments : segmentsWrapper,
        polygons: polygonsWrapper,
        solutionSet : solutionSetWrapper
    };

    /**
     * List of events to listen to in order to detect a response change
     * @type Array
     */
    var responseChangeEvents = [
        'drawn.lines',
        'moved.point',
        'removed.point',
        'added.pointSet',
        'moved.pointSet',
        'unselected.solutionSet',
        'selected.solutionSet',
        'drawn.polygon'
    ];

    var _typeIdentifier = 'nmcGraphLineAndPointInteraction';

    var nmcGraphLineAndPointInteraction;

    var LINE_PARAM_NAMES = {
        SLOPE: 'slope',
        XINTERCEPT: 'xIntercept',
        YINTERCEPT: 'yIntercept',
    };

    /**
     * Sanitize configuration
     * @param  {Object} rawConfig Raw Config from Authoring
     * @returns {Object}           Cleaned config ready to use
     */
    var buildGridConfig = function buildGridConfig(rawConfig){

        var getBoolean = function getBoolean(value, defaultValue) {
                if (typeof(value) === "undefined") {
                    return defaultValue;
                } else {
                    return (value === true || value === "true");
                }
            },

            radix = 10,
            xWeight = parseInt(rawConfig.xWeight, radix),
            xBorderWeight = parseInt(rawConfig.xBorderWeight, radix),
            yWeight = parseInt(rawConfig.yWeight, radix),
            yBorderWeight = parseInt(rawConfig.yBorderWeight, radix),

            gridConfig = {
                // PCI config
                graphType: rawConfig.graphType, // scatterPlot or line

                // Gridfactory config
                graphTitle: rawConfig.graphTitle,
                graphTitleRequired : getBoolean(rawConfig.graphTitleRequired, false),
                weight: parseInt(rawConfig.weight, radix), // grid weight
                width: parseInt(rawConfig.width, radix),
                height: parseInt(rawConfig.height, radix),
                showOrigin: getBoolean(rawConfig.showOrigin, true),
                showXAxisTitle: getBoolean(rawConfig.showXAxisTitle, true),
                showYAxisTitle: getBoolean(rawConfig.showYAxisTitle, true),
                showSubGrid: getBoolean(rawConfig.showSubGrid, false),
                subGridColor: rawConfig.subGridColor,

                x : {
                    start : parseInt(rawConfig.xStart, radix),
                    end : parseInt(rawConfig.xEnd, radix),
                    label : rawConfig.xLabel,
                    title : rawConfig.xTitle,
                    step: parseFloat(rawConfig.xStep, radix),
                    subStep : parseInt(rawConfig.xSubStep, radix),
                    digits: parseInt(rawConfig.xDigits, radix),
                    weight : (xWeight > 0) ? xWeight : xBorderWeight,
                    allowOuter : getBoolean(rawConfig.xAllowOuter, true)
                },
                y : {
                    start : -1 * parseInt(rawConfig.yEnd, radix), // y-axis is reversed
                    end : -1 * parseInt(rawConfig.yStart, radix), // y-axis is reversed
                    label : rawConfig.yLabel,
                    title : rawConfig.yTitle,
                    step: parseFloat(rawConfig.yStep, radix),
                    subStep : parseInt(rawConfig.ySubStep, radix),
                    digits: parseInt(rawConfig.yDigits, radix),
                    weight : (yWeight > 0) ? yWeight : yBorderWeight,
                    allowOuter : getBoolean(rawConfig.yAllowOuter, true)
                },

                graphs : _.isUndefined(rawConfig.graphs) ? {} : rawConfig.graphs,
                padding : 40

            };

        // overide invalid values with safe defaults
        if (gridConfig.x.step < 0.1) {
            gridConfig.x.step = 0.1;
        }
        if (gridConfig.y.step < 0.1) {
            gridConfig.y.step = 0.1;
        }
        if (gridConfig.x.subStep < 1) {
            gridConfig.x.subStep = 1;
        }
        if (gridConfig.y.subStep < 1) {
            gridConfig.y.subStep = 1;
        }

        if ((gridConfig.x.weight > 0) === false) {
            gridConfig.x.weight = 3;
        }
        if ((gridConfig.y.weight > 0) === false) {
            gridConfig.y.weight = 3;
        }
        return gridConfig;
    };

    /**
     * Create the minimum canvas and desplay it
     * @param  {Object} $container jQuery node
     * @param  {Object} config     configuration ( cleaned )
     * @returns {Object}            Paper ( RaphaelJS )
     */
    function createCanvas($container, config){

        var paperSize = gridFactory.getPaperSize(config),
            paper = scaleRaphael(
                $('.shape-container', $container)[0],
                paperSize.width,
                paperSize.height
            );

        return paper;
    }

    /**
     * Dirty functiion to return the right wrapper for a given config element
     * @param  {String} type     Name of the element you want
     * @returns {Object}         Wrapper corresponding to this element
     */
    function getWrapper(type){
        return _wrappers[type];
    }

    function drawLineStyle(dom, config){
        var w = 57, h = 20;
        var lineStylePaper = new Raphael(dom, w, h);
        var line = lineStylePaper.path('M0 ' + h / 2 + 'L' + w + ' ' + h / 2);
        line.attr({
            stroke : config.lineColor || '#000',
            'stroke-width' : config.lineWeight || 3,
            'stroke-dasharray' : config.lineStyle || '',
            opacity : config.opacity || 1
        });
    }

    /**
     * Validate the record entry format (used in setResponse)
     *
     * @param {object} entry
     * @returns {boolean}
     */
    function isValidRecordEntry(entry){
        return (
            _.isPlainObject(entry) &&
            _.isString(entry.name) &&
            entry.base &&
            entry.base.string &&
            _.isString(entry.base.string));
    }

    /**
     * Return response element formatted as list of points
     *
     * @param {string} name
     * @param {array} points
     * @returns {object}
     */
    function formatResponseElementAsPoints(name, points){
        if (_.isString(name) && _.isArray(points)) {
            return {
                name : name,
                base : { string : csvFormatPoints(points) }
            };
        } else {
            throw new Error('invalid arguments');
        }
    }

    /**
     * Return response element formatted as line parameters
     *
     * @param {string} name element name
     * @param {number} slope slope value
     * @param {number} xIntercept x intercept (crossing of X-axis)
     * @param {*} yIntercept y intercept (crossing of Y-axis)
     * @returns {array} array of formatted line parameters
     */
    function formatResponseElementAsLineParameters(name, slope, xIntercept, yIntercept) {
        var formatted = [];
        if (_.isString(name)) {
            if(_.isNumber(slope)) {
                formatted.push({
                    name: name + '_' + LINE_PARAM_NAMES.SLOPE,
                    base: { float: Math.round(slope * 1000) / 1000 }
                });
            }
            if(_.isNumber(xIntercept)) {
                formatted.push({
                    name: name + '_' + LINE_PARAM_NAMES.XINTERCEPT,
                    base: { float: Math.round(xIntercept * 1000) / 1000 }
                });
            }
            if(_.isNumber(yIntercept)) {
                formatted.push({
                    name: name + '_' + LINE_PARAM_NAMES.YINTERCEPT,
                    base: { float: Math.round(yIntercept * 1000) / 1000 }
                });
            }
            return formatted;
        } else {
            throw new Error('Invalid arguments');
        }
    }

    /**
     * Make CSV string from array of points
     *
     * @param {array} points
     * @returns {string} CSV string
     */
    function csvFormatPoints(points) {
        if (!_.isArray(points)) {
            throw new Error('invalid arguments');
        }

        return _.map(points, function (point) {
            return point.x + ' ' + point.y;
        }).join(',');
    }

    function makePointsArrayFromCsv(csvString) {
        if(!_.isString(csvString)) {
            throw new Error('invalid arguments');
        }

        return _.map(csvString.split(/,/), function(csvPointPart) {
            var pt = csvPointPart.trim().split(/\s+/);
            if (pt.length === 2) {
                return {
                    x: Number(pt[0]),
                    y: Number(pt[1])
                };
            } else {
                return;
            }
        });
    }

    nmcGraphLineAndPointInteraction = {

        /*********************************
         *
         * IMS specific PCI API property and methods
         *
         *********************************/

        typeIdentifier : _typeIdentifier,

        /**
         * @param {DOMELement} dom - the dom element the PCI can use
         * @param {Object} config - the sandard configuration object
         * @param {Object} [state] - the json serialized state object, returned by previous call to getStatus(), use to initialize an
         */
        getInstance : function getInstance(dom, config, state){
            var response = config.boundTo;

            // Parse the "graphs" property, which is given as a serialized JSON
            try {
                config.properties.graphs = JSON.parse(config.properties.graphs);
            } catch(e) { /* parsing failed */ }

            //simply mapped to existing TAO PCI API
            this.initialize(Object.getOwnPropertyNames(response).pop(), dom, config.properties);
            this.setSerializedState(state);

            //tell the rendering engine that I am ready
            if (typeof config.onready === 'function') {
                config.onready(this, this.getState());
            }
        },

        /**
         * Get the current state fo the PCI
         * @returns {Object}
         */
        getState : function getState(){
            return this.getSerializedState();
        },

        /**
         * Called by delivery engine when PCI is fully completed
         */
        oncompleted : function oncompleted(){
            this.destroy();
        },

        /*********************************
         *
         * TAO and IMS shared PCI API methods
         *
         *********************************/

        /**
         * Get the response in the json format
         *
         * @returns {Object} response object
         */
        getResponse : function(){
            var rawResponse = this.getRawResponse();
            var response = {record : []};

            _.forEach(rawResponse, function(element){
                var formattedLineParams, formattedSlopeParams;
                if ((!_.isArray(element.points) || element.points.length === 0) &&
                    (!_.isArray(element.selections) || element.selections.length === 0)) {
                    // not including empty elements to response
                    return;
                }

                if (element.type === 'solutionSet') {
                    _.each(element.selections, function(selection) {
                        response.record.push(formatResponseElementAsPoints(element.id, selection));
                    });
                } else {
                    response.record.push(formatResponseElementAsPoints(element.id, element.points));
                }

                if (element.type === 'line' && !element.useSlope) {
                    formattedLineParams = formatResponseElementAsLineParameters(element.id, element.slope, element.xIntercept, element.yIntercept);
                    response.record = response.record.concat(formattedLineParams);
                }

                if (element.useSlope) { // line, segments and set of points only
                    formattedSlopeParams  = formatResponseElementAsLineParameters(element.id, element.slope);
                    response.record = response.record.concat(formattedSlopeParams);
                }
            });

            return response;
        },

        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy : function(){
            var $container = $(this.dom);
            $container.off().empty();
        },

        /*********************************
         *
         * TAO specific PCI API methods
         *
         *********************************/

        getTypeIdentifier : function(){
            return _typeIdentifier;
        },

        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config){
            var grid,
                activeGraphElement,
                elements,
                $container = $(dom),
                self = this;

            this.id = id;
            this.dom = dom;
            this.config = buildGridConfig(config || {});

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            /**
             * Initialize a new graphic element called grid with all needed
             *
             * @param  {Object} $container jQuery node
             * @param  {Object} gridConfig Config (cleaned)
             * @returns {Void}
             */
            function initGrid($container, gridConfig){

                // @todo : Clear Everything
                var paper = createCanvas($container, gridConfig);
                var grid;
                var $canvas = $(paper.canvas);
                elements = {};

                //intialize the grid only if the configuration is correct
                if(_.isObject(gridConfig.x) &&
                    _.isObject(gridConfig.y) &&
                    gridConfig.x.start < gridConfig.x.end &&
                    gridConfig.y.start < gridConfig.y.end
                ){

                    grid = gridFactory(paper, gridConfig);
                    grid.clickable();
                    grid.children.click(function(event){

                        // Get the coordinate for a click
                        var bnds = event.target.getBoundingClientRect(),
                            wfactor = paper.w / paper.width,
                            fx = grid.getX() + Math.round((event.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                            fy = grid.getY() + Math.round((event.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor);

                        //transfer the click event to the paper
                        $canvas.trigger('click_grid', {x : fx, y : fy});
                    });

                }

                return grid;
            }

            /**
             * Init the interaction
             *
             * @param {Object} grid - the grid object build from GridFactory
             * @param {Object} $cont - the container
             * @param {Object} options
             * @returns {undefined}
             */
            function initInteraction(grid, $cont, options){

                var $templates = $cont.find('.templates');

                // Remove all existing button
                var $controlArea = $cont.find('.shape-controls');
                $controlArea.empty();

                // Loop over all elements we have
                _.each(options.graphs, function(graphType, typeName){

                    var $template = $templates.find('.template-' + typeName);

                    _.each(graphType.elements, function(elementConfig){

                        var $buttonContainer = $template.children().first().clone();
                        var $button = $buttonContainer.children('.btn');
                        var $arrow = $buttonContainer.children('.triangle');
                        var $polygonCtrlsContainer = $buttonContainer.find('.polygon-container');
                        var color = elementConfig.lineColor || elementConfig.pointColor;

                        // Change attributes
                        $buttonContainer.attr('data-uid', elementConfig.uid);
                        $buttonContainer.data('config', elementConfig);
                        $button.text(elementConfig.label);
                        $button.css({backgroundColor : color});
                        $arrow.css({borderColor : 'transparent transparent transparent ' + color});

                        //configure change line style buttons (for lines and segments wrapper)
                        if(elementConfig.lineStyleToggle && elementConfig.lineStyleToggle !== 'false'){

                            $buttonContainer
                                .find('.line-styles')
                                .show()
                                .find('input[name=line-style]')
                                .attr('name', 'line-style-' + elementConfig.uid)
                                .change(function(){

                                    elementConfig.lineStyle = $(this).val();
                                    $buttonContainer.data('element').setLineStyle(elementConfig.lineStyle);
                                    $button.click();

                                }).each(function(){

                                    var $input = $(this),
                                        $lineStyle = $input.siblings('.line-style'),
                                        style = $input.val();

                                    drawLineStyle($lineStyle[0], {
                                        lineStyle : style,
                                        lineColor : elementConfig.lineColor,
                                        lineWeight : elementConfig.lineWeight
                                    });

                                    if(elementConfig.lineStyle === style){
                                        $input.prop('checked', true);
                                    }
                                });
                        }

                        if (elementConfig.showCloseShapeBtn === false) {
                            $buttonContainer.find('.close-shape-button').hide();
                        }

                        if ($polygonCtrlsContainer && elementConfig.showCloseShapeBtn === false && elementConfig.lineStyleToggle === false) {
                            $polygonCtrlsContainer.addClass('empty');
                        }

                        //insert into dom
                        $controlArea.append($buttonContainer);

                        //init element
                        var wrapper = getWrapper(typeName);

                        //initialize the element only if the grid has been properly initialized
                        if(grid){
                            var element = wrapper.initialize(grid, elementConfig, $buttonContainer);
                            $buttonContainer.data('element', element);
                            element.$buttonContainer = $buttonContainer;
                            elements[elementConfig.uid] = element;
                        }
                    });
                });

                $controlArea.on('click', '.button-container:not(.deactivated)', function(){
                    activate($(this).data('element'));
                }).on('mouseenter', '.button-container:not(.deactivated)', function(e){
                    var element = $(this).data('element');
                    if(!e.buttons && element){
                        element.highlightOn();
                    }
                }).on('mouseleave', '.button-container:not(.deactivated)', function(e){
                    var element = $(this).data('element');
                    if(!e.buttons && element && !element.isActive()){
                        element.highlightOff();
                    }
                });
                
                $container.on(responseChangeEvents.join(' '), _.debounce(function(){
                    //response change
                    self.trigger('responseChange', [self.getResponse()]);
                }, 100));

                if(grid){
                    //check if solution set should be active or not
                    var $solutionSet = $controlArea.find('.graph-solutionSet');
                    $(grid.getCanvas().canvas).on('drawn.lines removed.lines', function(){
                        var drawnLineExists = false;
                        _.each(_.where(elements, {type : 'line'}), function(line){
                            var drawnLine = line.getLine();
                            if(drawnLine){
                                drawnLineExists = true;
                                return false;
                            }
                        });
                        if(drawnLineExists){
                            $solutionSet.removeClass('deactivated');
                        }else{
                            $solutionSet.addClass('deactivated');
                        }
                    });
                }
            }

            /**
             * Activate a graph element
             *
             * @param {Object} element
             */
            function activate(element){

                if(activeGraphElement){
                    activeGraphElement.disactivate();
                }

                //toggle active class appearance
                element.$buttonContainer.addClass('activated');
                element.$buttonContainer.siblings('.button-container').removeClass('activated');

                //activate the element itself to allow interaction
                element.activate(elements);

                activeGraphElement = element;
            }

            /**
             * Disactivate graph element
             * @param {O} element Element that should be deactivated
             */
            function disactivateElement(element) {
                element.$buttonContainer.removeClass('activated');
                element.disactivate();
                activeGraphElement = null;
            }

            function getElement(uid){
                return elements[uid];
            }

            /**
             * Get the current state of initialized element
             *
             * @returns {Object}
             */
            function getState(){

                var state = {
                    activeGraph : activeGraphElement ? activeGraphElement.getId() : '',
                    elements : {}
                };

                _.each(elements, function(element){
                    state.elements[element.getId()] = element.getState();
                });

                return state;
            }

            /**
             * restore state of already initialized elements:
             *
             * @param {Object} state
             * @param {Boolean} ignoreConfig
             */
            function setState(state, ignoreConfig){

                //restore element states
                _.forIn(state.elements, function(state, uid){
                    var element = getElement(uid);
                    if(element){
                        if(ignoreConfig){
                            delete state.config;
                        }
                        element.setState(state);
                    }
                });

                //restore the currently selected element
                if(state.activeGraph){
                    var currentActive = getElement(state.activeGraph);
                    if(currentActive){
                        //restore the active element:
                        activate(currentActive);
                    }
                }
            }

            /**
             * Get the raw response of the interaction
             *
             * @returns {array}
             */
            this.getRawResponse = function getRawResponse(){
                var response = [];
                _.forEach(elements, function(element, _id){
                    var res = {
                        id: _id,
                        type: element.type
                    };
                    var elementState = element.getState();

                    if (element.type === 'solutionSet') {
                        res.selections = elementState.selections;
                    } else {
                        res.points = elementState.points;
                    }

                    if (element.type === 'line' && !element.useSlope) {
                        res.slope = elementState.slope;
                        res.xIntercept = elementState.xIntercept;
                        res.yIntercept = elementState.yIntercept;
                    }

                    if (element.isUseSlope && element.isUseSlope()) { // only for lines, segments and set of points
                        res.useSlope = true;
                        res.slope = elementState.slope;
                    }

                    response.push(res);
                });

                return response;
            };

            /**
             * Set the raw response
             *
             * @param {object} response
             */
            this.setRawResponse = function setRawResponse(response){
                _.forEach(elements, function(element) {
                    disactivateElement(element);
                    element.clear();
                });

                // NOT caring about line parameters (like slope and intercepts) as they are computed (compare to getResponse)
                _.forEach(response, function(res){
                    var state = {},
                        element = elements[res.id];
                    if(element){
                        if(res.type === 'solutionSet'){
                            element.createSolutionSet(elements);
                            state.selections = res.selections;
                        }else{
                            state.points = res.points;
                        }
                        element.setState(state);
                    }
                });
            };

            grid = initGrid($container, this.config);
            initInteraction(grid, $container, this.config);

            this.on('configChange', function(newConfig){

                var state = getState();
                self.config = newConfig ? buildGridConfig(newConfig) : self.config;
                grid = initGrid($container, self.config);
                initInteraction(grid, $container, self.config);
                setState(state, true);
            });

            this.on('gridChange', function(newConfig){

                self.config = newConfig ? buildGridConfig(newConfig) : self.config;
                grid = initGrid($container, self.config);
                initInteraction(grid, $container, self.config);
            });

            this.on('clearElementPoints', function(graphElementId) {
                // clear plotted points for element if slope params was changed from outside
                var graphElement = _.find(elements, function(element) {
                    return element.getId() === graphElementId;
                });
                if (graphElement) {
                    graphElement.clear();
                }
            });
        },

        /**
         * Programmatically set the response
         *
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse : function(response){
            var rawResponse = [];
            var solutionSetSelections = [];
            var solutionSetId = '';

            if(response && _.isArray(response.record)){

                _.forEach(response.record, function(entry){
                    var points, id;

                    if(isValidRecordEntry(entry)){
                        id = entry.name;
                        points = makePointsArrayFromCsv(entry.base.string);

                        //special case for solutionSet
                        if (id.match(/^solutionSet/)) {
                            solutionSetId = id;
                            solutionSetSelections.push(points);
                        } else {
                            rawResponse.push({
                                id : id,
                                points : points
                            });
                        }
                    }
                });

                if (solutionSetId && solutionSetSelections.length) {
                    rawResponse.push({
                        id : solutionSetId,
                        type : 'solutionSet',
                        selections : solutionSetSelections
                    });
                }

                this.setRawResponse(rawResponse);
            }
        },

        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse : function(){
            this.setRawResponse([]);
        },

        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} state - json format
         */
        setSerializedState : function(state){
            this.setResponse(state);
        },

        /**
         * Get the current state of the interaction as a json.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){
            return this.getResponse();
        }
    };

    qtiCustomInteractionContext.register(nmcGraphLineAndPointInteraction);
});
