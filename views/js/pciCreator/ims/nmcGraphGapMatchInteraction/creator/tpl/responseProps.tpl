<div class='custom-score-container nmc-graph-gap-match-interaction'>
    <h1 class="custom-score-header">Partial scores</h1>
    <hr class="custom-score-separator">
    <button class="new-partial-score btn-info">Add partial score</button>
    <hr class="custom-score-separator">
    <table class="custom-score-table">
        <tbody>
            <tr>
                <th>Target value</th>
                <th>Score</th>
                <th></th>
            </tr>
            {{#each ns}}
                <tr class="custom-score">
                    {{#each this}}
                        <td>
                            <input 
                                {{#if @index}} 
                                    class="custom-score-input"
                                {{else}}
                                    class="custom-target-input"
                                {{/if}} 
                            type="number" step="1" value="{{this}}" size="1" />
                        </td>
                    {{/each}}
                    <td>
                        <button class="custom-score-delete btn-info">Delete</button>
                    </td>
                </tr>
            {{/each}}
        </tbody>
    </table>

</div>