<div class="fraction-model-panel">

<div class="panel">
    <label>
        <input name="exactMatch" type="checkbox" {{#if exactMatch}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        <span class="label">{{__ "Exact Match"}}</span>
    </label>    
</div>

<div class="exlcluded-values-panel">
    <h3>{{__ "Excluded Values"}}</h3>
    <div class="panel">
        <button class="new-excluded-value btn-info small">Add Excluded Value</button>
        <table class="excluded-value-table">
            <tbody>
                <tr>
                    <th>Selected Parts</th>
                    <th>Total Parts</th>
                    <th></th>
                </tr>
                {{#each excludedValues}}
                    <tr class="excluded-value-row">
                        <td>
                            <input class="fractions-num-input incrementer" type="text" data-increment="1" data-min="0" value="{{this.fractions}}"/>
                        </td>
                        <td>
                            <input class="fractions-total-input incrementer" type="text" data-increment="1" data-min="0" value="{{this.total}}"/>
                        </td>
                        <td>
                            <button class="excluded-value-delete btn-info">Delete</button>
                        </td>
                    </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
</div>

</div>