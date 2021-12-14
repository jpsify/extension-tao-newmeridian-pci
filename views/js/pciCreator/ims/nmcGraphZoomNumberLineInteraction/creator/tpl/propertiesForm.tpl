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

<div class="panel" id="creator-graphFunctionInteraction-axis">
    <div>
        <label for="width" class="spinner">{{__ "Width"}}</label>
        <input name="width" value="{{width}}" data-increment="1" type="text" />
    </div>
    <hr/>
    <div>
        <label for="min" class="spinner">{{__ "Start point"}}</label>
        <input name="min" value="{{min}}" data-increment="1" type="text" />
    </div>
    <div>
        <label for="max" class="spinner">{{__ "End Point"}}</label>
        <input name="max" value="{{max}}" data-increment="1" type="text" />
    </div>
    <div>
        <label for="increment" class="spinner">{{__ "Increment by"}}</label>
        <input name="increment" value="{{increment}}" data-increment="1" data-min="1" type="text">
    </div>
    <hr/>
    <div>
        <label for="unitSubdivision" class="spinner">{{__ "Small Mark"}}</label>
        <input name="unitSubDivision" value="{{unitSubDivision}}" data-increment="1" data-min="1" type="text">
    </div>
    <div>
        <label for="zoomSubDivision" class="spinner">{{__ "Zoom Mark"}}</label>
        <input name="zoomSubDivision" value="{{zoomSubDivision}}" data-increment="1" data-min="1" type="text">
    </div>
</div>
