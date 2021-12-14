   <div class='custom-score-container'>
       {{#each ns}}
       <label class="custom-score-row">
           <span>Score for <strong class="custom-score-matches">{{@key}} / {{../maxCorrect}}</strong> correct matches: </span>
           <input class="custom-score-input" name="{{@key}}" type="number" step="1" value="{{this}}" size="1" />
       </label>
       {{/each}}
   </div>