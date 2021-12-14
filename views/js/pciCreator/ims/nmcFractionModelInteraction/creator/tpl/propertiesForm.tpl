<div class="item-editor-color-picker">
    <h3>{{__ "Pie Chart Colors"}}</h3>
    <div class="color-picker-container sidebar-popup"  style="position: static;">
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
        <label for="partitionColor">{{__ "Default Partition"}}</label>
        <span class="color-trigger" id="partitionColor"></span>
        <input type="hidden" name="partitionColor" value="{{partitionColor}}"/>
    </div>
    <div class="panel">
        <label for="selectedPartitionsColor">{{__ "Selected Partition"}}</label>
        <span class="color-trigger" id="selectedPartitionsColor"></span>
        <input type="hidden" name="selectedPartitionsColor" value="{{selectedPartitionsColor}}"/>
    </div>
    <div class="panel">
        <label for="outlineColor">{{__ "Outline"}}</label>
        <span class="color-trigger" id="outlineColor"></span>
        <input type="hidden" name="outlineColor" value="{{outlineColor}}"/>
    </div>
</div>
<hr />
<div class="fraction-type-panel">
    <h3>{{__ "Fraction type"}}</h3>
    <div class="panel">
        <label>
            <input type="radio" name="type" id="typeCircle" value="0" {{#equal type "0"}}checked="checked"{{/equal}}/> <span class="icon-radio"></span>
            {{__ "Circle"}}
        </label>
        <label>
            <input type="radio" name="type" id="typeRectangle" value="1" {{#equal type "1"}}checked="checked"{{/equal}}/> <span class="icon-radio"></span>
            {{__ "Rectangle"}}
        </label>
    </div>
    <div class="circle-form"></div>
    <div class="rectangle-form"></div>
</div>
<div class="fraction-editor">
    <div class="panel">
        <label class="spinner">
            {{__ "Outline Thickness"}}  
            <input name="outlineThickness" value="{{outlineThickness}}" data-increment="1" data-min="0" type="text" class="incrementer"/>
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{__ "Outline Thickness Description"}}</span>
    </div>
    <div class="panel">
        <label class="spinner">
            {{__ "Min. Parts"}}
            <input name="partitionMin" value="{{partitionMin}}" data-increment="1" data-min="1" type="text" class="incrementer" />
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{__ "Mininum number of segments allowed."}}</span>
    </div>
    <div class="panel">
        <label class="spinner">
            {{__ "Max. Parts"}}
            <input name="partitionMax" value="{{partitionMax}}" data-increment="1" data-min="1" type="text" class="incrementer" />
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{__ "Maximum number of segments allowed."}}</span>
    </div>
</div>

