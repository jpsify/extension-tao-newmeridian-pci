<div class="nmcGraphFunctionInteraction">
    <div class="shape-panel">
        <div class="shape-controls">
            {{#each graphs}}
                <button name="{{@key}}" value="{{@key}}" class="btn btn-info" type="button">{{label}}</button>
            {{/each}}
        </div>
        <div class="shape-container"></div>
    </div>
</div>
