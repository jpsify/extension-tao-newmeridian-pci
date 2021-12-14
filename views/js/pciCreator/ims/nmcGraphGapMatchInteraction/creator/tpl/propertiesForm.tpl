<div class="panel">
    <h3>{{__ "Choice Image"}}</h3>

    <div class="panel">
        <label>{{__ 'File'}}
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ 'The file path to the image.'}}</div>
            <input type="text" name="src" value="{{src}}" data-validate="$notEmpty; $fileExists(baseUrl={{baseUrl}})"/>
        </label>
        <button class="btn-info small block" data-role="upload-trigger">{{__ 'Select image'}}</button>
    </div>

    <input name="mime" type="hidden" value="{{mime}}" type="text" />

    <div class="panel">
        <label>
            {{__ 'Alternate text'}}
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ "Alternate text for background image"}}</div>
            <input type="text" name="altText" value="{{altText}}">
        </label>
    </div>

    <div class="panel position">
        <h3>{{__ 'Choices position'}}</h3>
        <div class="panel">
            <label>
                <input type="radio" name="position" value="top" {{#equal position "top"}} checked="true" {{/equal}}>
                <span class="icon-radio"></span>
                {{__ 'Top'}}
            </label>
            <label>
                <input type="radio" name="position" value="bottom" {{#equal position "bottom"}} checked="true" {{/equal}}>
                <span class="icon-radio"></span>
                {{__ 'Bottom'}}
            </label>
            <br>
            <label>
                <input type="radio" name="position" value="left" {{#equal position "left"}} checked="true" {{/equal}}>
                <span class="icon-radio"></span>
                {{__ 'Left'}}
            </label>
            <label>
                <input type="radio" name="position" value="right" {{#equal position "right"}} checked="true" {{/equal}}>
                <span class="icon-radio"></span>
                {{__ 'Right'}}
            </label>
        </div>

    </div>

</div>