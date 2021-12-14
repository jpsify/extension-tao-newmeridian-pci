<div class="panel">
    <h3>{{__ "Graph properties"}}</h3>
    <div class="panel">
        <label for="graphTitle">{{__ "Title"}}</label>
        <input name="graphTitle" value="{{graphTitle}}" type="text" />
    </div>
    <label>
        <input name="graphTitleRequired" type="checkbox" {{#if graphTitleRequired}}checked="checked" {{/if}} />
        <span class="icon-checkbox"></span>
        {{__ "Display Title"}}
    </label>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label for="width" class="spinner">{{__ "Width"}}</label>
        <input name="width" value="{{width}}" data-increment="1" data-min="1" type="text" /><br />
        <label for="height" class="spinner">{{__ "Height"}}</label>
        <input name="height" value="{{height}}" data-increment="1" data-min="1" type="text" /><br />
    </div>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label>
            <input name="showOrigin" type="checkbox" {{#if showOrigin}}checked="checked" {{/if}} />
            <span class="icon-checkbox"></span>
            <span class="label">{{__ "Show Origin"}}</span>
        </label>
    </div>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label>
            <input name="showXAxisTitle" type="checkbox" {{#if showXAxisTitle}}checked="checked" {{/if}} />
            <span class="icon-checkbox"></span>
            <span class="label">{{__ "Show x-axis scale labels"}}</span>
        </label>
    </div>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label>
            <input name="showYAxisTitle" type="checkbox" {{#if showYAxisTitle}}checked="checked" {{/if}} />
            <span class="icon-checkbox"></span>
            <span class="label">{{__ "Show y-axis scale labels"}}</span>
        </label>
    </div>
    <div class="panel">
        <label class="panel">
            <input name="showSubGrid" type="checkbox" {{#if showSubGrid}}checked="checked" {{/if}} />
            <span class="icon-checkbox"></span>
            {{__ "Show Sub Grid"}}
        </label>
    </div>
</div>

<hr />

<div class="panel">
    <h3>{{__ "X axis"}}</h3><br />
    <div class="panel subpanel">
        <div class="panel creator-graphFunctionInteraction-range">
            <label for="xStart" class="spinner">{{__ "From"}}</label>
            <input name="xStart" value="{{xStart}}" data-increment="1" type="text" />
        </div>
        <div class="panel creator-graphFunctionInteraction-range">
            <label for="xEnd" class="spinner">{{__ "To"}}</label>
            <input name="xEnd" value="{{xEnd}}" data-increment="1" type="text" /><br />
        </div>
        <div class="panel xStepValue">
            <label for="xStep" class="spinner">{{__ "By increment of"}}</label>
            <input name="xStep" value="{{xStep}}" data-increment="0.1" data-min="0.1" type="text" />
        </div>
        <div class="panel xStepInfo"></div>
        <div class="panel xDigitsValue">
            <label class="spinner">{{__ "Fractional digits"}}
                <input name="xDigits" value="{{xDigits}}" data-increment="1" data-min="0" data-max="5" type="text" />
            </label>
        </div>
    </div>
    <div class="panel">
        <label for="xTitle">{{__ "Title"}}</label>
        <input name="xTitle" value="{{xTitle}}" type="text" />
    </div>
    <div class="panel">
        <label for="xLabel">{{__ "Label"}}</label>
        <input name="xLabel" value="{{xLabel}}" type="text" />
    </div>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label for="xSubStep" class="spinner">{{__ "Sub step (snapping)"}}</label>
        <input name="xSubStep" value="{{xSubStep}}" data-increment="1" data-min="1" type="text" />
    </div>
</div>
<div class="item-editor-action-bar"></div>

<hr />

<div class="panel">
    <h3>{{__ "Y axis"}}</h3>
    <br />
    <div class="panel subpanel">
        <div class="panel creator-graphFunctionInteraction-range">
            <label for="yStart" class="spinner">{{__ "From"}}</label>
            <input name="yStart" value="{{yStart}}" data-increment="1" type="text" />
        </div>
        <div class="panel creator-graphFunctionInteraction-range">
            <label for="yEnd" class="spinner">{{__ "To"}}</label>
            <input name="yEnd" value="{{yEnd}}" data-increment="1" type="text" /><br />
        </div>
        <div class="panel yStepValue">
            <label for="yStep" class="spinner">{{__ "By increment of"}}</label>
            <input name="yStep" value="{{yStep}}" data-increment="0.1" data-min="0.1" type="text" />
        </div>
        <div class="panel yStepInfo"></div>
        <div class="panel yDigitsValue">
            <label class="spinner">{{__ "Fractional digits"}}
                <input name="yDigits" value="{{yDigits}}" data-increment="1" data-min="0" data-max="5" type="text" />
            </label>
        </div>
    </div>
    <div class="panel">
        <label for="yTitle">{{__ "Title"}}</label>
        <input name="yTitle" value="{{yTitle}}" type="text" />
    </div>
    <div class="panel">
        <label for="yLabel">{{__ "Label"}}</label>
        <input name="yLabel" value="{{yLabel}}" type="text" />
    </div>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label for="ySubStep" class="spinner">{{__ "Sub step (snapping)"}}</label>
        <input name="ySubStep" value="{{ySubStep}}" data-increment="1" data-min="1" type="text" />
    </div>
</div>

<div class="panel" id="creator-pointAndLineFunctionInteraction-available-graphs">

    <h3>{{__ "Type of Elements"}}</h3>

    {{#each graphs}}
    <div>
        <label for="{{@key}}" class="spinner">{{label}}</label>
        <input name="{{@key}}" value="{{count}}" data-increment="1" data-min="0" type="text">
        <a href="#" title="{{__ 'Edit options'}}" class="more sidebar-popup-trigger" data-popup="~ .sidebar-popup"
            data-type="{{@key}}">...</a>
        <div class="sidebar-popup one-fifty graph-popup">
            <div class="sidebar-popup-title">
                <h3>Options for &quot;{{label}}&quot;</h3>
                <a class="closer" href="#" title="{{__ 'Close'}}"></a>
            </div>
            <div class="sidebar-popup-content"></div>
        </div>
    </div>
    {{/each}}

    <div class="panel allowSolutionSet">
        <label>
            <span class="label">{{__ "Allow solution set"}}</span>
            <input name="allowSolutionSet" type="checkbox" {{#if allowSolutionSet}}checked="checked" {{/if}} />
            <span class="icon-checkbox"></span>
        </label>
    </div>
</div>