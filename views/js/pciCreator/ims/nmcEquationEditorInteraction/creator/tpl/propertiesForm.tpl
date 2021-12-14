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

<hr />
    <div class="panel">
        <label for="width" class="spinner">{{__ "width"}}</label>
        <input name="width" value="{{width}}" data-increment="1" data-min="1" type="text" /><br />
        <label for="height" class="spinner">{{__ "height"}}</label>
        <input name="height" value="{{height}}" data-increment="1" data-min="0" type="text" /><br />
    </div>
<hr />

<h3>{{__ "Options"}}</h3>

<div>
    <!--
    <label class="panel">
        <input name="authorizeWhiteSpace" type="checkbox" {{#if authorizeWhiteSpace}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "authorize white space"}}
    </label>
    -->
    <label class="panel">
        <input name="useGapExpression" type="checkbox" {{#if useGapExpression}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Use expression with gaps"}}
    </label>
</div>

<div>
    <label class="spinner">{{__ 'Tool Bar'}}</label>
    <a href="#" class="more sidebar-popup-trigger" >...</a>
    <div class="sidebar-popup two graph-popup">
        <div class="sidebar-popup-title">
            <h3>{{__ 'Tool Bar'}}</h3>
            <a class="closer" href="#" title="{{__ 'Close'}}"></a>
        </div>
        <div class="sidebar-popup-content nmcEquationEditorInteraction"></div>
    </div>
</div>
<div class="item-editor-action-bar"></div>

<hr />
    <label for="gradeLevel">{{__ "Grade"}}</label>
    <select name="gradeLevel" data-grade-level>
        {{#each gradeOptions}}
            <option value="{{@key}}"{{#if selected}}selected="selected"{{/if}}>{{__ label}}</option>
        {{/each}}
    </select>
    <label for="keyboardBehavior">{{__ "Keyboard Behavior"}}</label>
    <select name="keyboardBehavior">
        {{#each keyboardBehaviorOptions}}
            <option value="{{@key}}"{{#if selected}}selected="selected"{{/if}}>{{__ label}}</option>
        {{/each}}
    </select>
<hr />

<div>
    <label class="panel">
        <input name="allowNewLine" type="checkbox" {{#if allowNewLine}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Allow line break"}}
    </label>
</div>
