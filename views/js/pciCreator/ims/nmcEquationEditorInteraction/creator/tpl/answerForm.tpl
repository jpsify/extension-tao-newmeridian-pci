<div class="panel">
    <label class="has-icon">{{__ "Expression"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The expression to evaluate the student response.'}}</div>

    {{#each gaps}}
        <input type="text"
            name="{{@key}}"
            value="{{expression}}"
            placeholder="e.g. 5 < x < 10">
    {{/each}}
</div>