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
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label for="width" class="spinner">{{__ "Width"}}</label>
        <input name="width" value="{{width}}" data-increment="1" data-min="1" type="text" /><br />
        <label for="height" class="spinner">{{__ "Height"}}</label>
        <input name="height" value="{{height}}" data-increment="1" data-min="1" type="text" /><br />
    </div>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label>
            <input name="showOrigin" type="checkbox" {{#if showOrigin}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            <span class="label">{{__ "Show Origin"}}</span>
        </label>
    </div>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label>
            <input name="showXAxisTitle" type="checkbox" {{#if showXAxisTitle}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            <span class="label">{{__ "Show x-axis scale labels"}}</span>
        </label>
    </div>
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label>
            <input name="showYAxisTitle" type="checkbox" {{#if showYAxisTitle}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            <span class="label">{{__ "Show y-axis scale labels"}}</span>
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
</div>

<hr/>

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
            <label for="xDigits" class="spinner">{{__ "Fractional digits"}}
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
    <label>
        <input name="xAllowOuter" type="checkbox" {{#if xAllowOuter}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Allow points on border"}}
    </label>
</div>

<hr/>

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
            <label for="yDigits" class="spinner">{{__ "Fractional digits"}}
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
    <label>
        <input name="yAllowOuter" type="checkbox" {{#if yAllowOuter}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Allow points on border"}}
    </label>
</div>

<hr/>
<h3>{{__ "Graph Appearance"}}</h3>
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
    <div class="panel">
        <label for="plotColor">{{__ "Graph Color"}}</label>
        <span class="color-trigger" id="plotColor"></span>
        <input type="hidden" name="plotColor" value="{{plotColor}}"/>
    </div>
    <div class="panel">
        <label for="pointColor">{{__ "Point Color"}}</label>
        <span class="color-trigger" id="pointColor"></span>
        <input type="hidden" name="pointColor" value="{{pointColor}}"/>
    </div>
</div>
<div class="panel">
    <div class="panel creator-graphFunctionInteraction-spinner">
        <label for="plotThickness" class="spinner">{{__ "Thickness"}}</label>
        <input name="plotThickness" value="{{plotThickness}}" data-increment="1" data-min="1" type="text" class="incrementer">
        <label for="pointRadius" class="spinner">{{__ "Point radius"}}</label>
        <input name="pointRadius" value="{{pointRadius}}" data-increment="1" data-min="1" type="text" class="incrementer">
        <label for="weight" class="spinner">{{__ "Inner line weight"}}</label>
        <input name="weight" value="{{weight}}" data-increment="1" data-min="1" type="text" />
    </div>
    <label>
        <input name="pointGlow" type="checkbox" {{#if pointGlow}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ " Points Glow"}}
    </label>
</div>

<hr/>

<div class="panel" id="creator-graphFunctionInteraction-available-graphs">
    <label for="" class="has-icon">{{__ "Available Graphs"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'Define which graphs are availabe for the test taker to use.'}}</div>
    <ul class="plain" data-role="graphs">
        {{#each graphs}}
        <li class="graph-{{@key}}">
            <div class="graph-label">
                <label>
                    <input name="graphs" value="{{@key}}" type="checkbox" {{#if checked}}checked="checked"{{/if}}/>
                    <span class="icon-checkbox"></span>
                    <span class="label-text">{{label}}</span>
                </label>
                <span class="icon-edit tooltipstered"></span>
            </div>
            <div class="graph-edit">
                <div>
                    <input class="label-input" name="graphLabel-{{@key}}" value="{{label}}" type="text" maxlength="18"/>
                    <span class="icon-result-ok tooltipstered"></span>
                    <span class="icon-result-nok tooltipstered"></span>
                </div>
            </div>
        </li>
        {{/each}}
    </ul>
</div>