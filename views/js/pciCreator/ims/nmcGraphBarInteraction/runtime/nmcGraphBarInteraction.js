define([
    'taoQtiItem/portableLib/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/util/event',
    'taoQtiItem/portableLib/OAT/scale.raphael',
    'nmcPci/portableLib/gridFactory',
    'nmcPci/portableLib/poligonFactory',
    'css!nmcGraphBarInteraction/runtime/css/nmcGraphBarInteraction'
],
    function (
        $,
        qtiCustomInteractionContext,
        _,
        event,
        scaleRaphael,
        gridFactory,
        PoligonFactory
    ) {

        var buildGridConfig = function (rawConfig) {

            var getBoolean = function getBoolean(value, defaultValue) {
                    if (typeof (value) === "undefined") {
                        return defaultValue;
                    } else {
                        return (value === true || value === "true");
                    }
                };
            var xCategories = rawConfig.xCategories
                    ? typeof rawConfig.xCategories == "object" ? rawConfig.xCategories : JSON.parse(rawConfig.xCategories)
                    : [],
                getCategories = function () {
                    var categories = [""];
                    categories = categories.concat(_.map(xCategories, "title"));
                    categories.push("");
                    return categories;
                };

            var radix = 10,
                xWeight = parseInt(rawConfig.xWeight, radix),
                xBorderWeight = parseInt(rawConfig.xBorderWeight, radix),
                yWeight = parseInt(rawConfig.yWeight, radix),
                yBorderWeight = parseInt(rawConfig.yBorderWeight, radix),
                wideBars = getBoolean(rawConfig.wideBars, false),

                gridConfig = {

                    // Gridfactory config
                    graphTitle: rawConfig.graphTitle,
                    graphTitleRequired: getBoolean(rawConfig.graphTitleRequired, false),
                    weight: parseInt(rawConfig.weight, radix), // grid weight
                    width: parseInt(rawConfig.width, radix),
                    height: parseInt(rawConfig.height, radix),
                    popupValueTitle: rawConfig.popupValueTitle,
                    wideBars: wideBars,
                    showXAxisTitle: !!rawConfig.horizontalBars,
                    showYAxisTitle: !rawConfig.horizontalBars,
                    xLabelAlign: parseInt(rawConfig.xLabelAlign, radix),
                    showBarTick: getBoolean(rawConfig.showBarTick, false),
                    showSubGrid: getBoolean(rawConfig.showSubGrid, false),
                    color: '#222',
                    subGridColor: rawConfig.subGridColor,
                    labelSize : 12,
                    labelFont : 'Verdana Regular',
    
                    x: {
                        start: 0,
                        end: Math.max(xCategories.length + (wideBars ? 0 : 1), 1),
                        label: rawConfig.xLabel,
                        title: rawConfig.xTitle,
                        step: parseInt(rawConfig.xStep, radix),
                        subStep: parseInt(rawConfig.xSubStep, radix),
                        weight: (xWeight > 0) ? xWeight : xBorderWeight,
                        allowOuter: getBoolean(rawConfig.xAllowOuter, true),
                        categories: getCategories(),
                        arrows: getBoolean(rawConfig.xArrows, false),
                        showGrid: false,
                        titleOffset: rawConfig.labelBBsize || 0,
                    },
                    y: {
                        start: -1 * parseInt(rawConfig.yEnd, radix), // y-axis is reversed
                        end: -1 * parseInt(rawConfig.yStart, radix), // y-axis is reversed
                        label: rawConfig.yLabel,
                        title: rawConfig.yTitle,
                        step: parseFloat(rawConfig.yStep, radix),
                        subStep: parseInt(rawConfig.ySubStep, radix),
                        weight: (yWeight > 0) ? yWeight : yBorderWeight,
                        allowOuter: getBoolean(rawConfig.yAllowOuter, true),
                        arrows: getBoolean(rawConfig.yArrows, false),
                        showGrid: true,
                    },

                    // PlotFactory config
                    plot: {
                        color: rawConfig.plotColor,
                        thickness: parseInt(rawConfig.plotThickness, radix)
                    },

                    // PointFactory config
                    point: {
                        color: rawConfig.pointColor,
                        glow: getBoolean(rawConfig.pointGlow, true),
                        radius: parseInt(rawConfig.pointRadius, radix)
                    }
                };

                if(rawConfig.horizontalBars){
                    var temp = gridConfig.x;
                    gridConfig.x= gridConfig.y;
                    gridConfig.y = temp;
                    temp = gridConfig.x.start;
                    gridConfig.x.start = -1 * gridConfig.x.end;
                    gridConfig.x.end = -1 * temp;
                    temp = gridConfig.y.start;
                    gridConfig.y.start = -1 * gridConfig.y.end;
                    gridConfig.y.end = -1 * temp;
                }

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

        var createCanvas = function createCanvas($container, config) {

            var paperSize = gridFactory.getPaperSize(config),
                paper = scaleRaphael(
                    $('.shape-container', $container)[0],
                    paperSize.width,
                    paperSize.height
                );

            return paper;
        };

        var nmcGraphBarInteraction = {

            /**
              * - Custom Interaction Hook API: id
              * The unique identifier provided at instantiation time, identifying the
              * Custom Interaction Hook Instance at runtime.
              */
            id: -1,

            /**
             * return {Boolean} - Are we in a TAO QTI Creator context?
             */
            inQtiCreator: function isInCreator() {
                if (_.isUndefined(this._inQtiCreator) && this.$container) {
                    this._inQtiCreator = this.$container.hasClass('tao-qti-creator-context');
                }
                return this._inQtiCreator;
            },


            /**
              * Custom Interaction Hook API: getTypeIdentifier
              *
              * @returns {String} The unique identifier of the Custom Interaction Hook
              */
            getTypeIdentifier: function () {
                return 'nmcGraphBarInteraction';
            },

            /**
              * - Custom Interaction Hook API: initialize
              *
              * This method initializes the Custom Interaction Hook Instance.
              * The Id parameter is the custom is a system generated id.
              * The XMLNode parameter is the custom interaction root XML node
              * displayed by the rendering engine. The config parameter may be
              * undefined or a JSON object representing the configuration.
              *
              * @param {String} id
              * @param {Node} dom
              * @param {Object} config
              */
            initialize: function (id, dom, config) {
                //add method on(), off() and trigger() to the current object
                event.addEventMgr(this);

                this.id = id;
                this.dom = dom;
                this.config = config || {};

                var
                    self = this,
                    $container = $(dom),
                    paper,
                    grid,
                    categories = [],
                    bars = [],
                    popups = [],
                    popupValue;

                function initGrid($container, gridConfig) {

                    //clear existing drawn elements (if any)

                    //create paper
                    paper = createCanvas($container, gridConfig);

                    //intialize the grid only if the configuration is correct
                    if (_.isObject(gridConfig.x) &&
                        _.isObject(gridConfig.y) &&
                        gridConfig.x.start < gridConfig.x.end &&
                        gridConfig.y.start < gridConfig.y.end
                    ) {

                        grid = gridFactory(paper, gridConfig);
                        //grid.clickable();

                        poligonFactory = new PoligonFactory(grid, gridConfig.plot);

                    }

                    return grid;
                }

                function dragStart() {
                    if(self.config.horizontalBars){
                        this.ox = grid.getX();
                        this.ow = this.attr('width');

                        var idx = this.data("categoryId"),
                        category = categories[idx];
                        if (category) {
                            bar_tooltip(true, category, this.attr('x') + this.attr('width'), this.attr('y'));                    
                        };
                        _.forEach(popups, function(popup) {
                            var x = popup.attr().x;
                            if (x) {
                                popup.ox = x;
                            } else {
                                var cx = popup.attr().cx;
                                popup.ocx =  cx ;
                            }
                        });

                    }else{
                        this.oy = this.attr('y');
                        this.oh = this.attr('height');

                        var idx = this.data("categoryId"),
                        category = categories[idx];
                        if (category) {
                            bar_tooltip(true, category, this.attr('x') + this.attr('width') / 2, this.attr('y'));                    
                        }
                    }
                };
                function dragMove(dx, dy) {
                    if(self.config.horizontalBars){
                        var newX = grid.snap(this.ox + dx + this.ow, 0)[0];
                        var gridX = grid.getX();
                        if (newX >= gridX &&
                            newX <= gridX + grid.getWidth()) {
                            this.attr({
                                x: grid.getX(),
                                width: Math.max(newX - grid.getOriginPosition().left, 1)
                            });

                            if (popupValue) {
                                value = (newX - grid.getOriginPosition().left) / grid.getUnits().x;
                                value = Math.trunc(value * 100) / 100;
                                popupValue.attr({text: value || 0});
                            }
                            _.forEach(popups, function(popup) {
                                var x = popup.attr().x;
                                if (x) {
                                    var ox = popup.ox;
                                    popup.attr({x: ox + dx  });
                                } else {
                                    var ocx = popup.ocx;
                                    popup.attr({cx: ocx + dx });
                                }
                            });
                        }
                    }else{

                        var newY = grid.snap(0, this.oy + dy)[1],
                            gridY = grid.getY();
                        if (newY >= gridY &&
                            newY <= gridY + grid.getHeight()) {
                            var y = this.attr().y,
                                d = newY - y;
                            this.attr({
                                y: newY,
                                height: Math.max(grid.getOriginPosition().top - newY - 1, 1)
                            });
                            if (popupValue) {
                                value = - ((newY - grid.getOriginPosition().top) / grid.getUnits().y);
                                value = Math.trunc(value * 100) / 100;
                                popupValue.attr({text: value || 0});
                            }
                            _.forEach(popups, function(popup) {
                                var y = popup.attr().y;
                                if (y) {
                                    popup.attr({y: y + d });
                                } else {
                                    var cy = popup.attr().cy;
                                    popup.attr({cy: cy + d });
                                }
                            });
                        }
                    };  
                }

                function endDrag() {
                    if(self.config.horizontalBars){
                        var width = this.attr().width <= 1 ? 0 : this.attr().width;
                        var value = width/grid.getUnits().x;

                        setBarValue(this, value);
                        self.trigger("responseChange", [self.getResponse()]);
                        bar_tooltip(); 
                    }else{
                        var y = this.attr().y,
                        snap = grid.snap(0, y),
                        value = - (snap[1] - grid.getOriginPosition().top)/grid.getUnits().y
                    setBarValue(this, value);
                    self.trigger("responseChange", [self.getResponse()]);
                    bar_tooltip(); 
                    }
                   
                }

                function bar_tooltip(show, category, x, y) {
                    if(!show) {
                        _.forEach(popups, function(popup){
                            popup.remove();
                        });
                        popups = [];
                        popupValue = null;
                        return;
                    }
                    var line1 = paper.text(x + 5, y, category.title).attr({'text-anchor': 'start'});
                    var bb1 = line1.getBBox();
                    var circle = paper.circle(bb1.x + 5, bb1.y2 + 10, 5).attr({fill: category.color, stroke: category.color});
                    var title = paper.text(bb1.x + 20, y + bb1.height + 5, (self.config.popupValueTitle || '') + ' :').attr({'text-anchor': 'start'});
                    var bb2 = title.getBBox();
                    popupValue = paper.text(bb2.x2 + 5, y + bb1.height + 5, category.value || '0').attr({'text-anchor': 'start', 'font-weight': 'bold'});
                    var bb3 = popupValue.getBBox();
                    var rect = paper.rect(bb1.x - 5, bb1.y - 5, Math.max(bb1.width, bb3.x2 - bb1.x) + 30, bb3.y2 - bb1.y + 10, 4).attr({fill: 'white', stroke: category.color});
                
                    popups.push(line1);
                    popups.push(circle);
                    popups.push(title);
                    popups.push(popupValue);
                    popups.push(rect);

                    var overflow = self.config.width - (rect.attr().x + rect.attr().width);
                    if (overflow < 0) {
                        var w = rect.attr().width;
                        _.forEach(popups, function(popup) {
                            var px = popup.attr().x;
                            if (px) {
                                popup.attr({x: px - w});
                            } else {
                                var cx = popup.attr().cx;
                                popup.attr({cx: cx - w });
                            }
                        });
                    }

                    circle.toFront();
                    title.toFront();
                    line1.toFront();
                    popupValue.toFront();
                }
                

                function drawBars(categories) {
                    if(self.config.horizontalBars){
                        drawYBars(categories);
                        return;
                    }
                    var labelY = grid.getOriginPosition().top;
                    var tickColor = self.gridConfig.color;
                    var tickAttr = { stroke: tickColor };
                    tickAttr['stroke-width'] = 1;

                    bars = [];

                    var barX = grid.getX() + 1;
                    categories.forEach(function (category, index) {
                        var y = grid.getHeight() + grid.getY() - 4;
                        var xUnits = grid.getUnits().x;
                        var x = self.gridConfig.wideBars ? barX : xUnits * (index + 1) - (xUnits /  4) + grid.getX();
                        var barWidth = xUnits / (self.gridConfig.wideBars ? 1 : 2);
                        var rect = paper.rect(x, y, barWidth, 3);
                        rect.attr({
                            'stroke-width': 0,
                            'fill': category.color,
                        });
                        barX += barWidth;
                        rect.data('categoryId', index);
                        if (self.inQtiCreator() || !category.isStatic) {
                            rect.attr({
                                'cursor': 'ns-resize',
                            });
                            rect.drag(dragMove, dragStart, endDrag);
                        }
                        bars.push(rect);
                        if (category.isStatic) {
                            setBarValue(rect, category.value);
                        }
                        var anchor = 'middle', labelX = x + barWidth / 2;
                        switch (self.gridConfig.xLabelAlign) {
                            case 0:
                                anchor = 'start';
                                labelX = x;
                                break;
                            case 2:
                                anchor = 'end';
                                labelX = x + barWidth;
                                break
                        }
                        paper.text(labelX, labelY + 16, category.title).attr({'font' : '12pt Verdana Regular', 'text-anchor': anchor});
                        if (self.gridConfig.showBarTick) {
                            paper.path('M' + labelX + ' ' + (labelY + 1.5) +'L' + labelX + ' ' + (labelY + 10)).attr(tickAttr);
                        }

                    });
                }

                
                function drawYBars(categories) {
                    var labelX = grid.getOriginPosition().left;
                    var tickColor = self.gridConfig.color;
                    var tickAttr = { stroke: tickColor };
                    var maxLabelWidth = 0;
                    var barY = grid.getY() + 1;
                    tickAttr['stroke-width'] = 1;
                    bars = [];
  
                    categories.forEach(function (category, index) {
                        var x = grid.getX();
                        var yUnits = grid.getUnits().y;
                        var y = self.gridConfig.wideBars ? barY : yUnits * (index + 1) - (yUnits /  4) + grid.getY();
                        var barWidth = yUnits / (self.gridConfig.wideBars ? 1 : 2);
                        var rect = paper.rect(x, y, 3, barWidth);
                        var labelY;
                        var barText;
                        var labelYAligmentOffset;
                        var aligmentOffset;

                        rect.attr({
                            'stroke-width': 0,
                            'fill': category.color,
                        });
                        barY += barWidth;
                        rect.data('categoryId', index);
                        if (self.inQtiCreator() || !category.isStatic) {
                            rect.attr({
                                'cursor': 'ew-resize',
                            });
                            rect.drag(dragMove, dragStart, endDrag);
                        }
                        bars.push(rect);
                        if (category.isStatic) {
                            setBarValue(rect, category.value);
                        }

                        if(self.config.horizontalBarLabels){
                            labelY = y + barWidth / 2;
                            barText = paper.text(labelX - 9, labelY, category.title).attr({
                                'font' : '12pt Verdana Regular',
                                'text-anchor': 'end',
                            });
                        }else{
                            labelYAligmentOffset = ( 1 - self.gridConfig.xLabelAlign / 2); //0.5 - middle; 1 - start; 0 - end;
                            labelY = y + labelYAligmentOffset * barWidth;
                            barText = paper.text(labelX - 20, labelY, category.title).attr({
                                'font' : '12pt Verdana Regular'
                            });
                            barText.rotate(270);
                            aligmentOffset = (0.5 - self.gridConfig.xLabelAlign / 2) ; //0 - middle; 0.5 - start; -0.5 - end;
                            barText.translate( aligmentOffset * barText.getBBox().height, 0);
                        }
                        if (self.gridConfig.showBarTick) {
                            paper.path('M' + (labelX - 8.5) + ' ' + labelY +'L' + labelX + ' ' + labelY).attr(tickAttr);
                        };
                        maxLabelWidth = Math.max(barText.getBBox().width, maxLabelWidth);

                    });
                    
                    var interaction =   self._taoCustomInteraction;
                    if(Math.abs(interaction.prop('labelBBsize') - maxLabelWidth) > 1){
                        interaction.prop('labelBBsize', maxLabelWidth);
                        interaction.triggerPci('configChange', [interaction.getProperties()]);
                    }
                    
                }   ;

                function setBarValue(bar, value) {
                    value = value || 0;
                    if(self.config.horizontalBars){
                        var xUnits = grid.getUnits().x,
                            width = xUnits * value;
                        bar.attr({
                            x: grid.getX(),
                            width: Math.max(width, 3)
                        });
                        
                    }else{
                        var yUnits = grid.getUnits().y,
                            height = yUnits * value;
                        bar.attr({
                            y: grid.getHeight() + grid.getY() - Math.max(height, 4),
                            height: Math.max(height, 3)
                        });
                    }
                    var idx = bar.data("categoryId"),
                            category = categories[idx];
                        if (category) {
                            category.value = value || '0';
                        }

                }

                function getCategories(rawConfig) {
                    var categories = rawConfig.xCategories
                        ? typeof rawConfig.xCategories == "object" ? _.cloneDeep(rawConfig.xCategories) : JSON.parse(rawConfig.xCategories)
                        : [];
                    return categories;
                }

                this.gridConfig = buildGridConfig(this.config);

                grid = initGrid($container, this.gridConfig);

                categories = getCategories(config);
                drawBars(categories);

                self.on('configChange', function (newRawConfig) {
                    //var state = self.getRawResponse();
                    self.config = newRawConfig;
                    self.gridConfig = buildGridConfig(newRawConfig);
                    initGrid($container, self.gridConfig);
                    categories = getCategories(newRawConfig);
                    drawBars(categories);
                    //self.setRawResponse(state);
                });

                this.getRawResponse = function getRawResponse() {
                    return categories;
                }

                this.setRawResponse = function (response) {
                    if (response && response.list && response.list.float) {
                        response.list.float.forEach(function (value, idx) {
                            var bar = bars[idx];
                            bar && setBarValue(bar, value)
                        })
                    }
                }

            },

            /**
              * - Custom Interaction Hook API: setResponse
              *
              * This method can be called multiple times, once, or not at all. The
              * given response data must be compliant with the baseType and cardinality
              * of the response declaration referenced by the
              * qti:customInteraction->responseIdentifier attribute.
              *
              * @param {Object} response A response object in the PCI JSON format.
              */
            setResponse: function (response) {
                this.setRawResponse(response);
            },

            /**
              * - Custom Interaction Hook API: getResponse
              *
              * This method can be called multiple times, once, or not at all.
              * The response data must correspond with the baseType and cardinality
              * of the response declaration referenced by the
              * qti:customInteraction->responseIdentifier attribute.
              *
              * @returns {Object} A response object in the PCI JSON format.
              */
            getResponse: function () {
                var categories = this.getRawResponse();
                return {
                    list: {
                        float: _.map(categories, function (category) {
                            return category.value || 0
                        })
                    }
                }
            },

            /**
              * - Custom Interaction Hook API: resetResponse
              *
              * This method can be called multiple times, once, or not at all.
              * The reason of this new method in the API is that a rendering engine
              * would like to provide a "reset responses" feature to the candidate.
              */
            resetResponse: function () {
                // Reset the response and reflect the change on the internal state
                // and/or DOM...
            },

            /**
              * - Custom Interaction Hook API: destroy
              *
              * The destroy method is called when the rendering engine decides
              * the interaction must disappear. This is the last chance for the
              * Custom Interaction Hook instance to clean up anything that might
              * "pollute" the rendering environment in the future.
              *
              * Open Assessment Technologies do not recommend to ask the implementor
              * to clean the DOM in this method for performance reason. Indeed,
              * destroying each item related DOM one by one requests a lot of
              * redrawings to the browsers. We therefore recommend to delegate this
              * to the rendering engine itself, on an item basis.
              *
              * Because event listeners will be destroyed automatically when the
              * interaction disappears from the DOM, we do not expect a lot of code
              * for this method in implementations.
              */
            destroy: function () {
                // Do some clean-up...
            },

            /**
              * - Custom Interaction Hook API: setSerializedState
              *
              * This method can be called to set the serialized state of the item.
              * The state must be formatted as JSON data and may represent any
              * information required to give the opportunity to the interaction
              * to restore its internal state and/or its DOM representation.
              *
              * @param {Object} A JSON data object.
              */
            setSerializedState: function (state) {
                // Store the state and eventually, update the internal state
                // of the interaction or its DOM...
            },

            /**
              * - Custom Interaction Hook API: getSerializedState
              *
              * This method can be called to save the serialized state of the item.
              *
              * The state must be formatted as JSON data and may represent any
              * information required to resume the interaction later on.
              *
              * @returns {Object} A JSON data object.
              */
            getSerializedState: function () {
                return { response: this.getResponse() };
            },

            /**
              * - Custom Interaction Hook API: resetSerializedState
              *
              * This method can be called multiple times, once, or not at all.
              *
              * The reason of this new method in the API is that a rendering engine
              * would like to provide, for instance,  a "restart simulation"
              * feature to the candidate.
              */
            resetSerializedState: function () {
                // Reset the state of the custom interaction in an appropriate
                // way...
            },

            /**
              * Custom Interaction Hook implementors are of course free to add
              * their own methods to organize their interactions, or meet the requirements
              * of a particular platform extending the PCI standard for specific
              * projects or purpose.
              */

            /*********************************
             *
             * IMS specific PCI API property and methods
             *
             *********************************/

            /**
             * @param {DOMELement} dom - the dom element the PCI can use
             * @param {Object} config - the sandard configuration object
             * @param {Object} [state] - the json serialized state object, returned by previous call to getStatus(), use to initialize an
             */
            getInstance: function getInstance(dom, config, state) {
                var response = config.boundTo;
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
            getState: function getState() {
                return this.getSerializedState();
            },

            /**
             * Called by delivery engine when PCI is fully completed
             */
            oncompleted: function oncompleted() {
                this.destroy();
            },

        };

        // The Custom Interaction Hook registers to the qtiCustomInteractionContext
        // object. The owner of the qtiCustomInteractionContext object is now able
        // to clone it into Custom Interaction Hook Instances at will.
        qtiCustomInteractionContext.register(nmcGraphBarInteraction);

    });