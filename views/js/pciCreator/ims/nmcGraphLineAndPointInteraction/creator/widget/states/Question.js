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
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/helper/popup',
    'taoQtiItem/qtiCreator/editor/colorPicker/colorPicker',
    'nmcGraphLineAndPointInteraction/creator/libs/randomColor/randomColor',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/propertiesForm',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/pointForm',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/pointSetForm',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/lineForm',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/segmentForm',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/polygonForm',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/solutionSetForm',
    'tpl!nmcGraphLineAndPointInteraction/creator/tpl/staticPoint',
    'lodash',
    'jquery',
    'ui/incrementer'
], function(
    stateFactory,
    Question,
    formElement,
    popup,
    colorPicker,
    randomColor,
    formTpl,
    pointFormTpl,
    pointSetFormTpl,
    lineFormTpl,
    segmentFormTpl,
    polygonForm,
    solutionSetForm,
    staticPointTpl,
    _,
    $,
    spinner){

    'use strict';

    var StateQuestion = stateFactory.extend(Question, function(){

    }, function(){

    });

    var _tpl = {
        points : pointFormTpl,
        setPoints : pointSetFormTpl,
        segments : segmentFormTpl,
        lines : lineFormTpl,
        polygons: polygonForm,
        solutionSet : solutionSetForm
    };

    var _typeHues = {
        points : 'blue',
        setPoints : 'green',
        lines : 'red',
        segments : 'yellow',
        polygons : 'blue',
        solutionSet : 'blue',
        static: '#9c2d74',
        label: 'white',
    };

    var _typeLabels = {
        points : 'Point',
        setPoints : 'Point Set',
        lines : 'Line',
        segments : 'Segment',
        polygons: 'Polygon',
        solutionSet : 'Solution Set'
    };

    function generateColorByGraphType(type){
        if(_typeHues[type]){
            var colors = randomColor({hue : _typeHues[type], luminosity : 'dark', count : 1});
            return colors.pop();
        }
    }

    function generateLabelByGraphType(type, rank){
        if(_typeLabels[type]){
            return _typeLabels[type] + ' ' + String.fromCharCode(65 + rank);
        }
    }

    var _defaultConfig = {
        points : {pointRadius : 10},
        setPoints : {maximumPoints : 5},
        lines : {lineStyle : '', lineStyleToggle : false, lineWeight : 3, pointRadius : 10},
        segments : {lineStyle : '', lineStyleToggle : false, lineWeight : 3, pointRadius : 10},
        polygons : {lineStyle : '', lineStyleToggle : false, lineWeight : 3, pointRadius : 10},
        solutionSet : {}
    };

    /**
     * Create a default config width a label and a color
     * @param  {String} graphType - the type of the graph
     * @param  {Number} nbElements - How many elements you want to generate
     * @param {Number} existingElements - How many elements already exists
     * @return {Array} Element Collection
     */
    function defaultConfig(graphType, nbElements, existingElements){

        var elements = [];
        for(var i = 0; i < nbElements; i++){

            var color = generateColorByGraphType(graphType);
            var label = generateLabelByGraphType(graphType, existingElements + i);
            var generatedConfig = {
                label : label,
                uid : _.uniqueId(graphType + '_')
            };

            switch(graphType){
                case 'points':
                case 'setPoints':
                    generatedConfig.pointColor = color;
                    break;
                case 'lines':
                case 'segments':
                    generatedConfig.pointColor = color;
                    generatedConfig.lineColor = color;
                    break;
                case 'polygons':
                    generatedConfig.pointColor = color;
                    generatedConfig.lineColor = color;
                    var staticColor = generateColorByGraphType('static');
                    generatedConfig.staticLineColor = staticColor;
                    generatedConfig.staticPointColor = staticColor;
                    generatedConfig.staticPointLabelColor = '#FFFFFF';
                    break;
                case 'solutionSet':
                    //force solution set label and color (only one allowed currently)
                    generatedConfig.label = _typeLabels.solutionSet;
                    generatedConfig.color = '#326399';
                    break;
                default:
                    throw 'unknown type of grapth';
            }

            var element = _.defaults(generatedConfig, _defaultConfig[graphType]);

            elements.push(element);
        }
        return elements;
    }

    /**
     * Update values for the graphs properties
     * @param  {Object} interaction
     * @param  {String} value       value of the changed element
     * @param  {String} name        name of the changed element
     */
    function updateGraphValue(interaction, value, name){

        var _graphs = interaction.prop('graphs');
        value = parseInt(value);
        _graphs[name].count = value;


        if(value > _graphs[name].elements.length){
            /**
             * If value are greater than what we have, add the diff w/ default values
             */
            _graphs[name].elements = _graphs[name].elements.concat(defaultConfig(name, value - _graphs[name].elements.length, _graphs[name].elements.length));
        }else if(value < _graphs[name].elements.length){
            /**
             * If value are smaller than what we have, just take the firsts n elements
             * where n is the value.
             */
            _graphs[name].elements = _.first(_graphs[name].elements, value);
        }
        interaction.prop('graphs', _graphs);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            allowSolutionSet = false,
            response = interaction.getResponseDeclaration(),
            graphs = _.clone(interaction.prop('graphs'));

        //for the itme being only allow one single solutionSet:
        if(graphs.solutionSet.elements.length){
            allowSolutionSet = true;
        }
        delete graphs.solutionSet;

        /**
         * Check if the "more" button should be displayed
         *
         * @todo provides some caching system
         * @param {String} graphType
         */
        function checkMoreTriggerAvailability(graphType){
            var $availableGraphsContainer = $form.find('#creator-pointAndLineFunctionInteraction-available-graphs');
            var $graphType = $availableGraphsContainer.find('input[name=' + graphType + ']');
            var $more = $availableGraphsContainer.find('.more[data-type=' + graphType + ']');
            if(parseInt($graphType.val())){
                $more.show();
            }else{
                $more.hide();
            }
        }

        /**
         * Common graph number change callback function
         *
         * @param {Object} interaction
         * @param {String} value - a number string
         * @param {String} name
         */
        function graphConfigChangeCallback(interaction, value, name){
            interaction.prop(name, value);
            interaction.triggerPci('gridChange', [interaction.getProperties()]);
        }
        /**
         * Common graph number change callback function
         *
         * @param {Object} interaction
         * @param {String} value - a number string
         * @param {String} graphType
         */
        function changeCallback(interaction, value, graphType){
            updateGraphValue(interaction, value, graphType);
            checkMoreTriggerAvailability(graphType);
        }

        function getBoolean(value, defaultValue) {
            if (typeof(value) === "undefined") {
                return defaultValue;
            } else {
                return (value === true || value === "true");
            }
        }

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,

            graphTitle : interaction.prop('graphTitle'),
            graphTitleRequired : getBoolean(interaction.prop('graphTitleRequired'), true),

            width : interaction.prop('width'),
            height : interaction.prop('height'),
            weight : interaction.prop('weight'),
            showOrigin: getBoolean(interaction.prop('showOrigin'), true),
            showXAxisTitle: getBoolean(interaction.prop('showXAxisTitle'), true),
            showYAxisTitle: getBoolean(interaction.prop('showYAxisTitle'), true),
            showSubGrid: interaction.prop('showSubGrid'),
            subGridColor: interaction.prop('subGridColor') || '#aaaaaa',

            xLabel : interaction.prop('xLabel'),
            xTitle : interaction.prop('xTitle'),
            xStart : interaction.prop('xStart'),
            xEnd : interaction.prop('xEnd'),
            xStep : interaction.prop('xStep'),
            xSubStep : interaction.prop('xSubStep'),
            xAllowOuter : getBoolean(interaction.prop('xAllowOuter'), true),
            xDigits : interaction.prop('xDigits'),

            yLabel : interaction.prop('yLabel'),
            yTitle : interaction.prop('yTitle'),
            yStart : interaction.prop('yStart'),
            yEnd : interaction.prop('yEnd'),
            yStep : interaction.prop('yStep'),
            ySubStep : interaction.prop('ySubStep'),
            yAllowOuter : getBoolean(interaction.prop('yAllowOuter'), true),
            yDigits : interaction.prop('yDigits'),

            graphs : graphs,
            allowSolutionSet : allowSolutionSet
        }));

        //init form javascript
        formElement.initWidget($form);

        //set change callbacks:
        var options = {
            allowNull : true,
            updateCardinality : false,
            attrMethodNames : {set : 'prop', remove : 'removeProp'},
            callback : function(){
                interaction.triggerPci('gridChange', [interaction.getProperties()]);
            }
        };

        var xAxisCallbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'xStart', 'xEnd', options);
        var yAxisCallbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'yStart', 'yEnd', options);
        var changeCallbacks = {
            graphTitle : graphConfigChangeCallback,
            graphTitleRequired : graphConfigChangeCallback,
            width : graphConfigChangeCallback,
            height : graphConfigChangeCallback,
            showOrigin: graphConfigChangeCallback,
            showXAxisTitle: graphConfigChangeCallback,
            showYAxisTitle: graphConfigChangeCallback,
            showSubGrid: graphConfigChangeCallback,
            subGridColor: graphConfigChangeCallback,

            xStep : graphConfigChangeCallback,
            xSubStep : graphConfigChangeCallback,
            xDigits : graphConfigChangeCallback,
            yStep : graphConfigChangeCallback,
            ySubStep : graphConfigChangeCallback,
            yDigits : graphConfigChangeCallback,
            yAllowOuter : graphConfigChangeCallback,
            xAllowOuter : graphConfigChangeCallback,

            xLabel : graphConfigChangeCallback,
            xTitle : graphConfigChangeCallback,
            yLabel : graphConfigChangeCallback,
            yTitle : graphConfigChangeCallback,


            lines : changeCallback,
            points : changeCallback,
            segments : changeCallback,
            polygons : changeCallback,
            setPoints : changeCallback,
            allowSolutionSet : function(interaction, value){

                if(value){
                    var $availableGraphsContainer = $form.find('#creator-pointAndLineFunctionInteraction-available-graphs');
                    var $graphType = $availableGraphsContainer.find('input[name=lines]');
                    if(!parseInt($graphType.val())){
                        //set value to one and trigger the ui/incrementer.js change event
                        $graphType.val(1).keyup();
                    }
                }

                updateGraphValue(interaction, value ? 1 : 0, 'solutionSet');
            }
        };
        changeCallbacks = _.assign(changeCallbacks, xAxisCallbacks, yAxisCallbacks);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, changeCallbacks);

        var _this = this;

        $form.find('.sidebar-popup-trigger').each(function(){

            var $trigger = $(this),
                $popup = $trigger.siblings('.sidebar-popup'),
                $panel = $trigger.siblings('.sidebar-popup').find('.sidebar-popup-content'),
                type = $trigger.data('type');

            $('#item-editor-wrapper').append($popup);
            // basic popup functionality
            popup.init($trigger, {popup : $popup, top: 10});

            // after popup opens
            $trigger.on('beforeopen.popup', function(e, params){
                _this.buildOptionsBoxContent(type, $panel);
            }).on('close.popup', function(){
                //clean the popup content
                _this.destroyOptionsBoxContent($panel);
            });
        });

        //init the "more" buttons visibility:
        _.each(_.keys(_defaultConfig), function(type){
            checkMoreTriggerAvailability(type);
        });
    };

    /**
     * Build the content of the graph otpion box
     *
     * @param {String} type
     * @param {Object} $panel - the JQuery container
     * @returns {undefined}
     */
    StateQuestion.prototype.buildOptionsBoxContent = function(type, $panel){

        var interaction = this.widget.element,
            graphs = interaction.properties['graphs'];

        if(graphs[type]){
            _.each(graphs[type].elements, function(element){
                //pass element and interaction by reference
                var elementForm = buildElementForm(type, element, interaction);
                elementForm.init();
                $panel.append(elementForm.$dom).append('<hr/>');
            });
        }else{
            throw 'invalid type';
        }

    };

    /**
     * Destroy the content of the graph option box
     *
     * @param {Object} $panel - the JQuery container
     * @returns {undefined}
     */
    StateQuestion.prototype.destroyOptionsBoxContent = function($panel){

        $panel.find('.color-trigger').each(function(){
            colorPicker.destroy($(this));
        });
        $panel.empty();
    };

    /**
     * Build the form of a graph element
     *
     * @param {String} type - the type of graph the form of which to be built
     * @param {Object} element
     * @param {Object} interaction
     * @returns {Object}
     */
    function buildElementForm(type, element, interaction){

        var tpl = _tpl[type];
        var lineStyle = element.lineStyle;
        var lineStyles = {
            '' : {label : "plain", selected : false},
            '-' : {label : "dotted", selected : false}
        };
        var $staticPointsPanel,$staticPointsForms;
        var staticPoints, staticPointsNb;


        if(lineStyles[lineStyle]){
            lineStyles[lineStyle].selected = true;
        }

        var data = {
            uid : element.uid,
            label : element.label,
            pointColor : element.pointColor,
            pointRadius : element.pointRadius,
            maximumPoints : element.maximumPoints,
            showCloseShapeBtn: element.showCloseShapeBtn,
            autoCloseShape: element.autoCloseShape,
            lineColor : element.lineColor,
            lineWeight : element.lineWeight,
            lineStyles : lineStyles,
            lineStyleToggle : element.lineStyleToggle,
            staticLineColor : element.staticLineColor,
            staticPointColor : element.staticPointColor,
            staticPointLabelColor : element.staticPointLabelColor,
        };

        var $dom = $(tpl(data));

        var changeCallbacks = {
            label : propChangeCallback,
            pointColor : propChangeCallback,
            pointRadius : propChangeCallback,
            maximumPoints : propChangeCallback,
            showCloseShapeBtn: propChangeCallback,
            autoCloseShape: propChangeCallback,
            lineColor : propChangeCallback,
            lineStyle : propChangeCallback,
            lineWeight : propChangeCallback,
            lineStyleToggle : propChangeCallback,
            staticLineColor : propChangeCallback,
            staticPointColor : propChangeCallback,
            staticPointLabelColor : propChangeCallback,
        };

        /**
         * Define the callback function for all property elements
         *
         * @param {Object} element
         * @param {Mixed} propValue
         * @param {String} propName
         * @returns {undefined}
         */
        function propChangeCallback(element, propValue, propName){
            element[propName] = propValue;
            interaction.triggerPci('configChange', [interaction.getProperties()]);
        }

        function updateStaticPoints() {
            propChangeCallback(element, _.compact(_.values(staticPoints)), 'staticPoints');
        }

        function buildStaticPointsForms() {
            staticPoints = {};
            staticPointsNb = 0;
            $staticPointsForms.empty();
            _.forEach(element.staticPoints, addStaticPoint);
        }

        function addStaticPoint(staticPoint) {
            var idx = staticPointsNb ++;
            var $staticPoint;
            staticPoint = staticPoint || {x: 0, y: 0};

            $staticPoint = $(staticPointTpl({
                idx: idx,
                x: staticPoint.x,
                y: staticPoint.y,
                xMax: interaction.prop('xEnd'),
                xStep: parseInt(interaction.prop('xStep')) / (parseInt(interaction.prop('xSubStep')) || 0),
                yMax: interaction.prop('yEnd'),
                yStep: parseInt(interaction.prop('yStep')) / (parseInt(interaction.prop('ySubStep')) || 0),
                label: staticPoint.label
            }));
            spinner($staticPoint);

            staticPoints[idx] = staticPoint;
            $staticPointsForms.append($staticPoint);
        }

        /**
         * Init the form elements
         *
         * @returns {undefined}
         */
        function init(){

            formElement.initWidget($dom);

            $staticPointsPanel = $dom.find('.static-points-panel');
            $staticPointsForms = $staticPointsPanel.find('.static-points');

            buildStaticPointsForms();
            $staticPointsPanel
                .on('click', '.static-point-add', function(e) {
                    e.preventDefault();
                    addStaticPoint();
                    updateStaticPoints();
                })
                .on('click', '.static-point-delete', function(e) {
                    var $panel = $(this).closest('.static-point-container');
                    var idx = $panel.data('idx');
                    e.preventDefault();
                    $panel.remove();
                    staticPoints[idx] = null;
                    updateStaticPoints();
                })
                .on('change', '.static-point-container input', function() {
                    var $panel = $(this).closest('.static-point-container');
                    var idx = $panel.data('idx');
                    var staticPoint = staticPoints[idx];
                    if (staticPoint) {
                        staticPoint.x = $panel.find('input[name="x"]').val();
                        staticPoint.y = $panel.find('input[name="y"]').val();
                        staticPoint.label = $panel.find('input[name="pointLabel"]').val();
                        updateStaticPoints();
                    }
                });

            $dom.find('.color-trigger').each(function(){
                var $trigger = $(this);
                colorPicker.create($trigger, {
                    title : function(){
                        var $title = $trigger.parents('.graph-form-container').find('input[name=label]');
                        return $title.val();
                    }
                });
            });

            formElement.setChangeCallbacks($dom, element, changeCallbacks);
        }

        return {
            $dom : $dom,
            init : init
        };

    }

    return StateQuestion;
});
