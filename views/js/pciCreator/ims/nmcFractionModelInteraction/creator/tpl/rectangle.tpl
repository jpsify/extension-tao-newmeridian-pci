<div class="rectangle">
    <div class="panel">
        <label class="spinner">
            {{__ "Width"}}
            <input name="width" value="{{width}}" data-increment="10" data-min="0" type="text" class="incrementer" />
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{__ "Width Description"}}</span>
    </div>
    <div class="panel">
        <label class="spinner">
            {{__ "Height"}}
            <input name="height" value="{{height}}" data-increment="10" data-min="0" type="text" class="incrementer" />
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{__ "Height Description"}}</span>
    </div>
    <div class="panel">
        <div class="rectangle-subtype-panel">
            <h3>{{__ "Rectangle subtype"}}</h3>
            <div class="rectangle-subtypes">
                <label>
                    <input type="radio" name="subtype" value="0" {{#if subtypeRows}}checked="checked"{{/if}}/> <span class="icon-radio"></span>
                    {{__ "Rows"}}
                </label>
                <label>
                    <input type="radio" name="subtype" value="1" {{#if subtypeColumns}}checked="checked"{{/if}}/> <span class="icon-radio"></span>
                    {{__ "Columns"}}
                </label>
            </div>
        </div>
    </div>
</div>