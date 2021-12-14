define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
    'nmcGraphBarInteraction/creator/widget/states/Question',
    'nmcGraphBarInteraction/creator/widget/states/Correct',
], function(factory, states){
    return factory.createBundle(states, arguments);
});
