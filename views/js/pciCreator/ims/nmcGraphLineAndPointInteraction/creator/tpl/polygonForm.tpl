<div class="panel graph-form-container">
    <div class="panel">
        <label for="label" class="has-icon">{{__ "Polygon name"}}</label>

        <input type="text"
               name="label"
               value="{{label}}"
               data-role="title"
               placeholder="e.g. Polygon A"
               data-validate="$notEmpty;">
    </div>

    <div class="panel">
        <label for="maximumPoints" class="spinner">{{__ "Maximum of Points"}}</label>
        <input name="maximumPoints" value="{{maximumPoints}}" data-increment="1" data-min="1" type="text" class="incrementer">
    </div>

    <div class="panel">
        <label>
            <input name="showCloseShapeBtn" type="checkbox" {{#if showCloseShapeBtn}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Show close shape button"}}
        </label>
    </div>

    <div class="panel">
        <label>
            <input name="autoCloseShape" type="checkbox" {{#if autoCloseShape}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Autoclose shape"}}
        </label>
    </div>

    <div class="panel item-editor-color-picker">
        <label for="lineColor" class="spinner">{{__ "Polygon color"}}</label>
        <span class="color-trigger" id="lineColor"></span>
        <input type="hidden" name="lineColor" value="{{lineColor}}"/>
    </div>

    <div class="panel">
        <label for="lineWeight" class="spinner">{{__ "Polygon thickness"}}</label>
        <input name="lineWeight" value="{{lineWeight}}" data-increment="1" data-min="1" type="text" class="incrementer">
    </div>

    <div class="panel">
        <label for="lineStyle" class="spinner">{{__ "Polygon style"}}</label>
        <select name="lineStyle" data-has-search="false">
            {{#each lineStyles}}
            <option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
            {{/each}}
        </select>
    </div>

    <div class="panel">
        <label>
            <span class="lineStyleToggle">{{__ "Polygon style toggle"}}</span>
            <input name="lineStyleToggle" type="checkbox" {{#if lineStyleToggle}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
        </label>
    </div>

    <div class="panel item-editor-color-picker">
        <label for="pointColor" class="spinner">{{__ "Point color"}}</label>
        <span class="color-trigger" id="pointColor"></span>
        <input type="hidden" name="pointColor" value="{{pointColor}}"/>
    </div>

    <div class="panel">
        <label for="pointRadius" class="spinner">{{__ "Point Radius"}}</label>
        <input name="pointRadius" value="{{pointRadius}}" data-increment="1" data-min="2" type="text" class="incrementer">
    </div>

    <div class="static-points-panel">
        <h3>{{__ "Static points"}}</h3>
        <div class="panel">
            <div class="static-points"></div>
            <a href="#" class="adder static-point-add">{{__ "Add a static point"}}</a>
        </div>

        <div class="panel item-editor-color-picker">
            <label for="staticLineColor" class="spinner">{{__ "Graph Color"}}</label>
            <span class="color-trigger" id="staticLineColor"></span>
            <input type="hidden" name="staticLineColor" value="{{staticLineColor}}"/>
        </div>

        <div class="panel item-editor-color-picker">
            <label for="staticPointColor" class="spinner">{{__ "Point color"}}</label>
            <span class="color-trigger" id="staticPointColor"></span>
            <input type="hidden" name="staticPointColor" value="{{staticPointColor}}"/>
        </div>

        <div class="panel item-editor-color-picker">
            <label for="staticPointLabelColor" class="spinner">{{__ "Label Color"}}</label>
            <span class="color-trigger" id="staticPointLabelColor"></span>
            <input type="hidden" name="staticPointLabelColor" value="{{staticPointLabelColor}}"/>
        </div>

        <div class="panel">
            <div class="panel  creator-graphPointLineGraphInteraction-spinner">
                <label for="staticLineThickness" class="spinner">{{__ "Thickness"}}</label>
                <input name="staticLineThickness" value="{{staticLineThickness}}" data-increment="1" data-min="1" type="text" class="incrementer">
            </div>
            <div class="panel  creator-graphPointLineGraphInteraction-spinner">
                <label for="staticPointRadius" class="spinner">{{__ "Point radius"}}</label>
                <input name="staticPointRadius" value="{{staticPointRadius}}" data-increment="1" data-min="1" type="text" class="incrementer">
            </div>
            <div class="panel  creator-graphPointLineGraphInteraction-spinner">
                <label for="staticPointLabelSize" class="spinner">{{__ "Label font size"}}</label>
                <input name="staticPointLabelSize" value="{{staticPointLabelSize}}" data-increment="1" data-min="8" type="text" />
            </div>
            <div class="panel  creator-graphPointLineGraphInteraction-spinner">
                <label for="staticPointLabelWeight" class="spinner">{{__ "Label font weight"}}</label>
                <input name="staticPointLabelWeight" value="{{staticPointLabelWeight}}" data-increment="1" data-min="0" type="text" />
            </div>
            <label>
                <input name="staticPointGlow" type="checkbox" {{#if staticPointGlow}}checked="checked"{{/if}}/>
                <span class="icon-checkbox"></span>
                {{__ " points Glow"}}
            </label>
            <label>
                <input name="staticDisplayPoints" type="checkbox" {{#if staticDisplayPoints}}checked="checked"{{/if}}/>
                <span class="icon-checkbox"></span>
                {{__ " Display points"}}
            </label>
            <label>
                <input name="staticShowLine" type="checkbox" {{#if staticShowLine}}checked="checked"{{/if}}/>
                <span class="icon-checkbox"></span>
                {{__ " Display lines"}}
            </label>
        </div>
    </div>

</div>