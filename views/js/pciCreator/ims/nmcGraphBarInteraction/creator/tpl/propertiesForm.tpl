<div class="panel">
    <label for="" class="has-icon">{{__ "Response identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The identifier of the choice. This identifier must not be used by any other response or item variable. An identifier is a string of characters that must start with a Letter or an underscore ("_") and contain only Letters, underscores, hyphens ("-"), period (".", a.k.a. full-stop), Digits, CombiningChars and Extenders.'}}</div>

    <input type="text"
           name="identifier"
           value="{{identifier}}"
           placeholder="e.g. RESPONSE"
           data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});">
</div>

<hr/>
<div class="panel">
    <h3>{{__ "Graph properties"}}</h3>
    <div class="panel">
        <label for="graphTitle">{{__ "Title"}}</label>
        <input name="graphTitle" value="{{graphTitle}}" type="text" />
    </div>
    <div class="panel">
        <label for="width" class="spinner">{{__ "Width"}}</label>
        <input name="width" value="{{width}}" data-increment="1" data-min="1" type="text" /><br />
        <label for="height" class="spinner">{{__ "Height"}}</label>
        <input name="height" value="{{height}}" data-increment="1" data-min="1" type="text" /><br />
    </div>
    <div class="panel">
        <label for="popupValueTitle">{{__ "Popup Value Title"}}</label>
        <input name="popupValueTitle" value="{{popupValueTitle}}" type="text" />
    </div>
    <div class="panel">
        <label class="panel">
            <input name="wideBars" type="checkbox" {{#if wideBars}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Wide Bars"}}
        </label>
    </div>
    <div class="panel">
        <label class="panel">
            <input name="showSubGrid" type="checkbox" {{#if showSubGrid}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Show Sub Grid"}}
        </label>
    </div>
    <div class="panel">
        <div class="item-editor-color-picker">
            <div class="color-picker-container sidebar-popup" style="position: static;">
                <div class="sidebar-popup-title">
                    <h3 style="font-size:13px;margin:0"></h3>
                    <a class="closer" href="#"></a>
                </div>
                <div class="sidebar-popup-content">
                    <div class="color-picker"></div>
                    <input class="color-picker-input" type="text" value="#000000">
                </div>
            </div>

            <label for="subGridColor">{{__ "Sub Grid Color"}}</label>
            <span class="color-trigger"></span>
            <input type="hidden" name="subGridColor" value="{{subGridColor}}"/>
        </div>
    </div>
    <div class="panel">
        <label class="panel">
            <input name="horizontalBars" type="checkbox" {{#if horizontalBars}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            Horizontal bars
        </label>
    </div>

</div>
<hr/>
<div class="panel">
        <h3 class="horizontal-axis">{{__ "X axis"}}</h3>
        <h3 class="vertical-axis">{{__ "Y axis"}}</h3>
    <br />
    <div class="panel subpanel">
        <div class="panel creator-graphPointLineGraphInteraction-range">
            <!-- TODO: Do we need to change min value?
            <label for="yStart" class="spinner">{{__ "From"}}</label>
            <input name="yStart" value="{{yStart}}" data-increment="1" data-min="0" type="text" /> 
            -->
            <label for="yEnd" class="spinner">{{__ "Max"}}</label>
            <input name="yEnd" value="{{yEnd}}" data-increment="1" data-min="1" type="text" /><br />
        </div>
        <div class="panel yStepValue">
            <label for="yStep" class="spinner">{{__ "By increment of"}}</label>
            <input name="yStep" value="{{yStep}}" data-increment="0.1" data-min="0.1" type="text" />
        </div>
        <div class="panel yStepInfo"></div>
    </div>
    <div class="panel">
        <label for="yTitle">{{__ "Title"}}</label>
        <input name="yTitle" value="{{yTitle}}" type="text" />
    </div>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label for="ySubStep" class="spinner">{{__ "Sub step (snapping)"}}</label>
        <input name="ySubStep" value="{{ySubStep}}" data-increment="1" data-min="1" type="text" />
    </div>
    <div class="panel">
        <label class="panel">
            <input name="yArrows" type="checkbox" {{#if yArrows}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Show Arrows"}}
        </label>
    </div>
</div>
<div class="panel">
        <h3 class="horizontal-axis">{{__ "Y axis"}}</h3>
        <h3 class="vertical-axis">{{__ "X axis"}}</h3>
    <br />
    <div class="panel">
        <label for="xTitle">{{__ "Title"}}</label>
        <input name="xTitle" value="{{xTitle}}" type="text" />
    </div>
    <div class="panel">
        <label class="panel">
            <input name="showBarTick" type="checkbox" {{#if showBarTick}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Show Bar Ticks"}}
        </label>
    </div>
    <h3>{{__ "Label align"}}</h3>
    <div class="panel label-orientation">
        <label class="panel">
            <input name="horizontalBarLabels" type="checkbox" {{#if horizontalBarLabels}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Horizontal bar labels"}}
        </label>
    </div>
    <div class="panel horizontal-label-aligment">
        <label>
            <input type="radio" name="xLabelAlign" value="0" {{#if labelAlignLeft}}checked="checked"{{/if}}/> <span class="icon-radio"></span>
            {{__ "Left"}}
        </label>
        <label>
            <input type="radio" name="xLabelAlign" value="1" {{#if labelAlignCenter}}checked="checked"{{/if}}/> <span class="icon-radio"></span>
            {{__ "Center"}}
        </label>
        <label>
            <input type="radio" name="xLabelAlign" value="2" {{#if labelAlignRight}}checked="checked"{{/if}}/> <span class="icon-radio"></span>
            {{__ "Right"}}
        </label>
    </div>
    <div class="panel">
        <label class="panel">
            <input name="xArrows" type="checkbox" {{#if xArrows}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Show Arrows"}}
        </label>
    </div>
    <div class="axis-categories-panel">
        <h3>{{__ "Categories"}}</h3>
        <div class="axis-categories"></div>
        <a href="#" class="adder axis-category-add">{{__ "Add category"}}</a>
    </div>
</div>
<hr/>
