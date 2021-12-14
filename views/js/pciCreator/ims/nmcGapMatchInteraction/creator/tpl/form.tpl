<div class="panel nmcGapMatchInteraction">

    <div>
        <div class="panel position">
            <h3>Choices position</h3>
            <div class="panel">
                <label>
                    <input type="radio" name="choicesposition" value="top" {{#equal position "top"}} checked="true" {{/equal}}>
                    <span class="icon-radio"></span>
                    Top
                </label>
                <label>
                    <input type="radio" name="choicesposition" value="bottom" {{#equal position "bottom"}} checked="true" {{/equal}}>
                    <span class="icon-radio"></span>
                    Bottom
                </label>
                <br>
                <label>
                    <input type="radio" name="choicesposition" value="left" {{#equal position "left"}} checked="true" {{/equal}}>
                    <span class="icon-radio"></span>
                    Left
                </label>
                <label>
                    <input type="radio" name="choicesposition" value="right" {{#equal position "right"}} checked="true" {{/equal}}>
                    <span class="icon-radio"></span>
                    Right
                </label>
            </div>

        </div>
        <div class="panel group">
            <h3>Display</h3>
            <div class="panel">
                <label>
                    <input type="radio" name="choicesdisplay" value="list" {{#equal display "list"}} checked="true" {{/equal}}>
                    <span class="icon-radio"></span>
                    Show choices in one list
                </label>
                <br>
                <label>
                    <input type="radio" name="choicesdisplay" value="groups" {{#equal display "groups"}} checked="true" {{/equal}}>
                    <span class="icon-radio"></span>
                    Show choices in groups
                </label>
                <br>
                <label>
                    <input type="radio" name="choicesdisplay" value="columns" {{#equal display "columns"}} checked="true" {{/equal}}>
                    <span class="icon-radio"></span>
                    Show choices in columns
                </label>
            </div>
        </div>

        <div class="panel numberColumns {{#equal display "columns"}} show {{/equal}}">
            <label>
                <span class="spinner">Number of columns (0 is auto):</span>
                <span class="incrementer-ctrl-wrapper">
                    <input placeholder="0" name="numColumns" value="{{numColumns}}" data-increment="1" data-min="0" data-max="5" type="text" class="incrementer">
                    <span class="ctrl incrementer-ctrl">
                        <a href="#" class="inc" title="+1" tabindex="-1"></a>
                        <a href="#" class="dec" title="-1" tabindex="-1"></a>
                    </span>
                </span>
            </label>
        </div>

        <div class="panel minimumChoices">
            <label>
                <span class="spinner">Minimum choices to complete:</span>
                <span class="incrementer-ctrl-wrapper">
                    <input placeholder="0" name="minChoices" value="{{minChoices}}" data-increment="1" data-min="0" type="text" class="incrementer">
                    <span class="ctrl incrementer-ctrl">
                        <a href="#" class="inc" title="+1" tabindex="-1"></a>
                        <a href="#" class="dec" title="-1" tabindex="-1"></a>
                    </span>
                </span>
            </label>
        </div>
    </div>
    <div class="selected-choice hidden">
        <h3>Choice properties</h3>
    </div>
    <div class="selected hidden">
        <h3>Gap properties</h3>
    </div>
    <div class="panel group hidden">
        <label>Group id:
            <input type="text" name="groupid" value="{{groupid}}" placeholder="A">
        </label>
    </div>

    <div class="selected hidden">
        <div class="panel style">
            <h3>Style</h3>
            <label>
                <span class="spinner">Width (px):</span>
                <span class="incrementer-ctrl-wrapper">
                    <input placeholder="50" name="minWidth" value="{{width}}" data-increment="1" data-min="0" type="text" class="incrementer">
                    <span class="ctrl incrementer-ctrl">
                        <a href="#" class="inc" title="+1" tabindex="-1"></a>
                        <a href="#" class="dec" title="-1" tabindex="-1"></a>
                    </span>
                </span>
            </label>
            <label>
                <span class="spinner">Height (px):</span>
                <span class="incrementer-ctrl-wrapper">
                    <input placeholder="20" name="minHeight" value="{{height}}" data-increment="1" data-min="0" type="text" class="incrementer">
                    <span class="ctrl incrementer-ctrl">
                        <a href="#" class="inc" title="+1" tabindex="-1"></a>
                        <a href="#" class="dec" title="-1" tabindex="-1"></a>
                    </span>
                </span>
            </label>
        </div>
    </div>
    <div class="selected-choice hidden">
        <div class="panel">
            <h3>Allowed number of uses</h3>
            <label>
                <span class="spinner">Max</span>
                <span class="incrementer-ctrl-wrapper">
                    <input placeholder="0" name="matchmax" value="{{matchmax}}" data-increment="1" data-min="0" data-max="100" type="text" class="incrementer">
                    <span class="ctrl incrementer-ctrl">
                        <a href="#" class="inc" title="+1" tabindex="-1"></a>
                        <a href="#" class="dec" title="-1" tabindex="-1"></a>
                    </span>
                </span>
            </label>
        </div>
    </div>

</div>