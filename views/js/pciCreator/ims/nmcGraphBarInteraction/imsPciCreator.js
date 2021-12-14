define([
    'lodash',
    'nmcGraphBarInteraction/creator/widget/Widget',
    'tpl!nmcGraphBarInteraction/creator/tpl/markup',
], function(_, Widget, markupTpl){

    var _typeIdentifier = 'nmcGraphBarInteraction';

    var creatorHook = {
        /**
         * (required) Get the typeIdentifier of the custom interaction
         *
         * @returns {String}
         */
        getTypeIdentifier : function(){
            return _typeIdentifier;
        },
        /**
         * (required) Get the widget prototype
         * Used in the renderer
         *
         * @returns {Object} Widget
         */
        getWidget : function(){
            return Widget;
        },
        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        getDefaultProperties : function(pci){
            return {
                "horizontalBars": false,
                "plotColor": "#0000FF",
                "width": 450,
                "height": 450,
                "graphTitleRequired": true,
                "poupValueTitle": 'Value',
                "wideBars": false,
                "xLabelAlign": 1,
                "showBarTick" : false,
                "showSubGrid": false,
                "subGridColor": "#aaaaaa",
                "labelBBsize": 0,
                "horizontalBarLabels": true,

                "xAllowOuter": true,
                "xBorderWeight": 3,
                "xStep": 1,
                "xLabel": null,
                "xTitle": null,
                "xStart": 0,
                "xEnd": 5,
                "xSubStep": 1,
                "xWeight": 2,
                "xCategories":[],
                "xArrows": false,

                "yAllowOuter": true,
                "yBorderWeight": 3,
                "yStep": 1,
                "yLabel": null,
                "yTitle": null,
                "yStart": 0,
                "yEnd": 10,
                "ySubStep": 2,
                "yWeight": 2,
                "yArrows": false,
            };
        },
        /**
         * (optional) Callback to execute on the
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        afterCreate : function(pci){
        },
        /**
         * (required) Gives the qti pci xml template
         *
         * @returns {function} handlebar template
         */
        getMarkupTemplate : function(){
            return markupTpl;
        },
        /**
         * (optional) Allows passing additional data to xml template
         *
         * @returns {function} handlebar template
         */
        getMarkupData : function(pci, defaultData){

            return _.defaults(defaultData);
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return creatorHook;
});
