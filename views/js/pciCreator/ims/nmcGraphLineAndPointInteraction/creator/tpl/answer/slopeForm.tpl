<div class="panel subpanel">
    <h3>{{label}}</h3>
    <div class="panel">
        <label>
            <span class="label">{{__ "Use slope value"}}</span>
            <input name="useSlope" type="checkbox" {{#if useSlope}}checked="checked" {{/if}} />
            <span class="icon-checkbox"></span>
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">
            {{__ 'Use slope value instead of plotted points to define a correct response for this graph element'}}</div>
    </div>
    <div class="panel">
        <label for="slopeValue" class="spinner">{{__ "Slope value"}}</label>
        <input id={{slopeFieldIdentifier}} name="slopeValue" type="text" data-validate="$notEmpty;" data-increment="0.1"
            class="incrementer" {{#unless useSlope}}disabled="disabled" {{/unless}} value={{slopeValue}} />
    </div>
</div>