
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!nmcGraphBarInteraction/creator/tpl/propertiesForm',
    'tpl!nmcGraphBarInteraction/creator/tpl/category',
    'lodash',
    'jquery',
    'ui/incrementer'
], function(stateFactory, Question, formElement, formTpl, categoryTpl, _, $, spinner){

    'use strict';

    var StateQuestion = stateFactory.extend(Question, function(){
        this.initColorPickers();
    }, function(){
        this.destroyColorPickers();
    });

    StateQuestion.prototype.initForm = function(){

        //code to init your interaction property form (on the right side bar)

        var self = this,
            widget = this.widget,
            interaction = widget.element,
            $form = widget.$form,
            response = interaction.getResponseDeclaration(),
            categories = {},
            categoriesNb = 0,
            $categoriesPanel, $categoriesForms;
        
        var $labelOrientation;
        var $labelAligment; 
        var $horizontalBarAxisName;
        var $verticalBarAxisName;

        function buildCategoriesForms() {
            categories = {};
            categoriesNb = 0;
            $categoriesForms.empty();
            _.forEach(interaction.prop('xCategories'), addCategory);
        }

        function addCategory(category) {
            var idx = categoriesNb ++;
            var $category;
            category = category || {title: 'Category ' + idx, color: '#000000'};

            $category = $(categoryTpl({
                isStatic: category.isStatic,
                idx: idx,
                title: category.title,
                categoryColor: category.color,
                value: category.value
            }));
            spinner($category);

            categories[idx] = category;
            $categoriesForms.append($category);
        }

        function updateCategories() {
            graphConfigChangeCallback(interaction, _.compact(_.values(categories)), 'xCategories');
        }

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier'),
            graphTitle : interaction.prop('graphTitle'),
            height : interaction.prop('height'),
            width : interaction.prop('width'),
            popupValueTitle : interaction.prop('popupValueTitle'),
            wideBars: interaction.prop('wideBars'),
            showSubGrid: interaction.prop('showSubGrid'),
            subGridColor: interaction.prop('subGridColor') || '#aaaaaa',
            labelAlignLeft: interaction.prop('xLabelAlign') == 0,
            labelAlignCenter: interaction.prop('xLabelAlign') == 1,
            labelAlignRight: interaction.prop('xLabelAlign') == 2,
            showBarTick: interaction.prop('showBarTick'),
            xTitle : interaction.prop('xTitle'),
            yTitle : interaction.prop('yTitle'),
            yStart : interaction.prop('yStart'),
            yEnd : interaction.prop('yEnd'),
            yStep : interaction.prop('yStep'),
            ySubStep : interaction.prop('ySubStep'),
            xArrows : interaction.prop('xArrows'),
            yArrows : interaction.prop('yArrows'),
            horizontalBars : interaction.prop('horizontalBars'),
            horizontalBarLabels: interaction.prop('horizontalBarLabels'),
        }));

        $categoriesPanel = $form.find('.axis-categories-panel');
        $categoriesForms = $categoriesPanel.find('.axis-categories');
        $labelOrientation = $form.find('.label-orientation');
        $labelAligment = $form.find('.horizontal-label-aligment');
        $horizontalBarAxisName = $form.find('.horizontal-axis');
        $verticalBarAxisName = $form.find('.vertical-axis');
        //init form javascript
        formElement.initWidget($form);

        buildCategoriesForms();
        $categoriesPanel
            .on('click', '.axis-category-add', function(e) {
                e.preventDefault();
                addCategory();
                self.initColorPickers();
                updateCategories();
            })
            .on('click', '.category-delete', function(e) {
                var $panel = $(this).closest('.category-container');
                var idx = $panel.data('idx');
                e.preventDefault();
                $panel.remove();
                categories[idx] = null;
                updateCategories();
            })
            .on('change', '.category-container input', function() {
                var $panel = $(this).closest('.category-container');
                var idx = $panel.data('idx');
                var category = categories[idx];
                if (category) {
                    category.isStatic = $panel.find('input[name="isStatic"]')[0].checked;
                    category.color = $panel.find('input[name="categoryColor"]').val();
                    category.title = $panel.find('input[name="title"]').val();
                    category.value = parseInt($panel.find('input[name="value"]').val(), 10);
                    updateCategories();
                }
            });

        function onLabelConfigChange(inter, value, name){
            if(inter){
                graphConfigChangeCallback(inter, value, name);
            }
            $labelOrientation.toggle(interaction.prop('horizontalBars'));
            $labelAligment.toggle(!interaction.prop('horizontalBars') || !interaction.prop('horizontalBarLabels'));
            $horizontalBarAxisName.toggle(interaction.prop('horizontalBars'));
            $verticalBarAxisName.toggle(!interaction.prop('horizontalBars'));
        }
        onLabelConfigChange();
        
        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },
            graphTitle : graphConfigChangeCallback,
            width : graphConfigChangeCallback,
            popupValueTitle: graphConfigChangeCallback,
            wideBars: graphConfigChangeCallback,
            showSubGrid: graphConfigChangeCallback,
            subGridColor: graphConfigChangeCallback,
            xLabelAlign: graphConfigChangeCallback,
            showBarTick: graphConfigChangeCallback,
            height : graphConfigChangeCallback,
            xTitle : graphConfigChangeCallback,
            yTitle : graphConfigChangeCallback,
            yStart : graphConfigChangeCallback,
            yEnd : graphConfigChangeCallback,
            yStep: graphConfigChangeCallback,
            ySubStep: graphConfigChangeCallback,
            xArrows: graphConfigChangeCallback,
            yArrows: graphConfigChangeCallback,
            horizontalBars: onLabelConfigChange,
            horizontalBarLabels: onLabelConfigChange,
        });

    };

    function graphConfigChangeCallback(interaction, value, name){
        interaction.prop(name, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    return StateQuestion;
});
