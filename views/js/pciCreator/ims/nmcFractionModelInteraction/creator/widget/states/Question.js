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
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'tpl!nmcFractionModelInteraction/creator/tpl/propertiesForm',
    'tpl!nmcFractionModelInteraction/creator/tpl/circle',
    'tpl!nmcFractionModelInteraction/creator/tpl/rectangle',
    'ui/incrementer'
], function(_, stateFactory, Question, formElement, simpleEditor, formTpl, circleTpl, rectangleTpl){

    'use strict';

    var StateQuestion = stateFactory.extend(Question, function(){

        var interaction = this.widget.element;
        var $container = this.widget.$container;

        var changeCallback = function changeCallback(selection){
            var selected = _.values(selection);
            interaction.prop('selectedPartitionsInit', _.filter(selected).length);
            interaction.prop('partitionInit', selected.length);
            interaction.prop('selectedPartitions', JSON.stringify(selected));
            interaction.triggerPci('configchange', [_.clone(interaction.properties)]);
        };

        //fix color picker change
        var $colorTriggers = this.widget.$form.find('.color-trigger:not([data-color-picker=initialized])');
        $colorTriggers.on('click.color-picker', function(){
            var $colorTrigger = $(this),
               $context = $colorTrigger.closest('.item-editor-color-picker'),
               $container = $context.find('.color-picker-container'),
               $colorPicker = $container.find('.color-picker');

            $colorPicker.off('.farbtastic');
        });
       
        //inti color pickers
        this.initColorPickers();

        //init title editor
        simpleEditor.create($container, '.shape-title', function(text){
            interaction.prop('title', text);
            interaction.updateMarkup();
        });

        //init event listeners
        interaction
            .onPci('changepartition', changeCallback)
            .onPci('selectedpartition', changeCallback);

    }, function(){

        var interaction = this.widget.element;

        //remove event listeners
        interaction.offPci('changepartition');
        interaction.offPci('selectedpartition');

        //destroy editors
        simpleEditor.destroy(this.widget.$container);
        this.destroyColorPickers();
    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration(),
            $fractionTypePanel, 
            $circleForm, 
            $rectangleForm;

        function _getChangeCallback(refresh){
            return function(interaction, value, name){
                interaction.prop(name, value);
                if (refresh){
                    interaction.triggerPci('configchange', [_.clone(interaction.properties)]);
                }
            };
        }

        //render the form using the form template
        $form.html(formTpl({
            type : interaction.prop('type'),
            serial : response.serial,
            selectedPartitionsColor : interaction.prop('selectedPartitionsColor'),
            partitionColor : interaction.prop('partitionColor'),
            outlineColor : interaction.prop('outlineColor'),
            outlineThickness : interaction.prop('outlineThickness'),
            identifier : interaction.attr('responseIdentifier'),
            partitionMin : interaction.prop('partitionMin'),
            partitionMax : interaction.prop('partitionMax')
        }));

        
        //init form javascript
        formElement.initWidget($form);


        $fractionTypePanel = $form.find('.fraction-type-panel');
        $circleForm = $fractionTypePanel.find('.circle-form');
        $rectangleForm = $fractionTypePanel.find('.rectangle-form');

        function buildCircleForm() {
            $circleForm.empty();
            $circleForm = $(circleTpl({
                radius: interaction.prop('radius')
            }));
            formElement.initWidget($circleForm);
            $fractionTypePanel.find('.circle-form').append($circleForm);
        }

        function removeCircleForm() {
            $circleForm.remove();
        }

        function buildRectangleForm() {
            $rectangleForm.empty();
            $rectangleForm = $(rectangleTpl({
                width: interaction.prop('width'),
                height: interaction.prop('height'),
                subtypeRows : interaction.prop('subtype') == 0,
                subtypeColumns : interaction.prop('subtype') == 1,
            }));
            formElement.initWidget($rectangleForm);
            $fractionTypePanel.find('.rectangle-form').append($rectangleForm);
        }

        function removeRectangleForm() {
           $rectangleForm.remove();
        }

        function updateFractionModel() {
            interaction.triggerPci('configchange', [_.clone(interaction.properties)]);
        }

        if (interaction.prop('type') == 0) {
            buildCircleForm();
        } else {
            buildRectangleForm();
        }

        $fractionTypePanel
            .on('click', '#typeCircle', function(e) {
                removeRectangleForm();
                interaction.prop('type', 0);
                updateFractionModel();
                buildCircleForm();
            })
            .on('click', '#typeRectangle', function(e) {
                removeCircleForm();
                interaction.prop('type', 1); 
                updateFractionModel();
                buildRectangleForm();
            })


        var partitionChangeCallbacks = formElement.getMinMaxAttributeCallbacks($form, 'partitionMin', 'partitionMax', {
            allowNull : false,
            updateCardinality : false,
            attrMethodNames : {set : 'prop', remove : 'removeProp'},
            callback : function(interaction, value, name){

                var i;
                var propValue = interaction.prop('selectedPartitions');
                var selected = _.isArray(propValue) ? propValue:  JSON.parse(propValue);
 
                interaction.prop(name, value);

                //ensure that the selected partition is within range:
                for(i = selected.length; i < interaction.prop('partitionMin'); i++){
                    selected.push(false);
                }
                for(i = interaction.prop('partitionMax'); i < selected.length; i++){
                    selected.pop();
                }
                interaction.prop('selectedPartitions', JSON.stringify(selected));

                interaction.triggerPci('configchange', [_.clone(interaction.properties)]);
            }
        });

        var callbacks = _.assign({
            subtype : _getChangeCallback(true),
            radius : _getChangeCallback(true),
            width : _getChangeCallback(true),
            height : _getChangeCallback(true),
            selectedPartitionsColor : _getChangeCallback(true),
            partitionColor : _getChangeCallback(true),
            outlineColor : _getChangeCallback(true),
            outlineThickness : _getChangeCallback(true),
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            }
        }, partitionChangeCallbacks);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, callbacks);
    };

    return StateQuestion;
});
