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
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/OrderInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
], function(_, $, __, stateFactory, Answer, commonRenderer, instructionMgr){

    var StateAnswer = stateFactory.extend(Answer, function(){

        initResponseDeclarationWidget(this.widget);
        
    }, function(){
        
        destroyResponseDeclarationWidget(this.widget);
    });

    /**
     * Set the correct response to the state of interaction and set the correct response listener
     *
     * @param widget
     */
    function initResponseDeclarationWidget(widget){
        
        var interaction = widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();
        var correct = [];
        if(_.isArray(responseDeclaration.correctResponse) && responseDeclaration.correctResponse.length){
            correct = responseDeclaration.correctResponse;
        }
 
        //set correct response as defined in the model
        interaction.setResponse({
            list : {
                float : correct
            }
        });

        instructionMgr.appendInstruction(widget.element, __('Please define the correct values.'));
        commonRenderer.render(widget.element);

        //init editing widget event listener
        interaction.onPci('responseChange', function(response){
            if(response && response.list && response.list.float){
                var correctResponse = response.list.float
                responseDeclaration.setCorrect(correctResponse);
            }
        });

    }

    /**
     * Restore default interaction state and remove listeners
     *
     * @param widget
     */
    function destroyResponseDeclarationWidget(widget){
        var interaction = widget.element;
        interaction.offPci('responseChange');
        interaction.resetResponse();

        commonRenderer.resetResponse(widget.element);
        commonRenderer.destroy(widget.element);
    }

    return StateAnswer;
});
