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
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!nmcGraphFunctionInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, formTpl, _, $){
    'use strict';

    var StateQuestion = stateFactory.extend(Question, function(){
       //custom interaction state extends

       //fix color picker change
        var $colorTriggers = this.widget.$form.find('.color-trigger:not([data-color-picker=initialized])');
        $colorTriggers.on('click.color-picker', function(){
            var $colorTrigger = $(this),
                $context = $colorTrigger.closest('.item-editor-color-picker'),
                $container = $context.find('.color-picker-container'),
                $colorPicker = $container.find('.color-picker');

           $colorPicker.off('.farbtastic');
        });

        this.initColorPickers();


    }, function(){

        //destroy editors
        this.destroyColorPickers();
    });

    StateQuestion.prototype.initForm = function(){

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration();
        var graphs = interaction.prop('graphs');

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
            identifier : interaction.attr('responseIdentifier'),
            graphs : graphs,

            graphTitle : interaction.prop('graphTitle'),

            width : interaction.prop('width'),
            height : interaction.prop('height'),
            weight : interaction.prop('weight'),
            showOrigin : getBoolean(interaction.prop('showOrigin'), true),
            showXAxisTitle : getBoolean(interaction.prop('showXAxisTitle'), true),
            showYAxisTitle : getBoolean(interaction.prop('showYAxisTitle'), true),
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

            innerLineWeight : interaction.prop('innerLineWeight'),
            plotColor : interaction.prop('plotColor'),
            plotThickness : interaction.prop('plotThickness'),
            pointRadius : interaction.prop('pointRadius'),
            pointGlow : getBoolean(interaction.prop('pointGlow'), true),
            pointColor : interaction.prop('pointColor')
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
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },
            // reset state
            width : graphGridChangeCallback,
            height : graphGridChangeCallback,
            showOrigin : graphGridChangeCallback,
            showXAxisTitle: graphGridChangeCallback,
            showYAxisTitle: graphGridChangeCallback,
            showSubGrid: graphGridChangeCallback,
            subGridColor: graphGridChangeCallback,

            xStep : graphGridChangeCallback,
            xSubStep : graphGridChangeCallback,
            xDigits : graphGridChangeCallback,
            yStep : graphGridChangeCallback,
            ySubStep : graphGridChangeCallback,
            yDigits : graphGridChangeCallback,
            yAllowOuter : graphConfigChangeCallback,
            xAllowOuter : graphConfigChangeCallback,

            // maintain state
            graphTitle : graphConfigChangeCallback,
            weight : graphConfigChangeCallback,

            xLabel : graphConfigChangeCallback,
            xTitle : graphConfigChangeCallback,
            yLabel : graphConfigChangeCallback,
            yTitle : graphConfigChangeCallback,

            plotColor : graphConfigChangeCallback,
            plotThickness : graphConfigChangeCallback,
            pointRadius : graphConfigChangeCallback,
            pointGlow : graphConfigChangeCallback,
            pointColor : graphConfigChangeCallback,
            innerLineWeight : graphConfigChangeCallback
        };
        changeCallbacks = _.assign(changeCallbacks, xAxisCallbacks, yAxisCallbacks);

        formElement.setChangeCallbacks($form, interaction, changeCallbacks);

        //manually get array of checked graphs
        var $graphs = $form.find('[name=graphs]');
        $graphs.on('change', function(){
            graphs[$(this).val()].checked = $(this).is(':checked');
            interaction.prop('graphs', graphs);
            interaction.triggerPci('functionsChange', [graphs]);
        });

        _.forEach(graphs, function (graph, key) {
            var $graph = $form.find('li[class=graph-'+key+']');
            var $editIcon = $graph.find('.icon-edit');
            $editIcon.on('click', function(){
                toggleLabelsEdit($form, graphs, key);
            });
            var $okIcon = $graph.find('.icon-result-ok');
            $okIcon.on('click', function(){
                graph.label = $graph.find('.label-input').val();
                interaction.prop('graphs', graphs);
                interaction.triggerPci('configChange', [interaction.getProperties()]);
                interaction.triggerPci('functionsChange', [graphs]);
                toggleLabelsEdit($form, graphs, null);
            });
            var $nokIcon = $graph.find('.icon-result-nok');
            $nokIcon.on('click', function(){
                toggleLabelsEdit($form, graphs, null);
            });
        });

    };

    function toggleLabelsEdit($form, graphs, edit){
        _.forEach(graphs, function (graph, key) {
            var $graph = $form.find('li[class=graph-'+key+']');
            $graph.find('.label-text').html(graph.label);   
            $graph.find('.label-input').val(graph.label);
            
            $graph.find('.graph-edit').toggle(key === edit);
            $graph.find('.graph-label').toggle(key !== edit);                
        });
    }

    function graphGridChangeCallback(interaction, value, name){
        interaction.prop(name, value);
        interaction.triggerPci('gridChange', [interaction.getProperties()]);
    }

    function graphConfigChangeCallback(interaction, value, name){
        interaction.prop(name, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    return StateQuestion;
});
