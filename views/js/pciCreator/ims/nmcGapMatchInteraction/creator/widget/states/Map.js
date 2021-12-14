define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
], function($, _, stateFactory, Map,){

    function initMapState(){

    }
    function exitMapState(){

    }


    return  stateFactory.create(Map, initMapState, exitMapState);
});
