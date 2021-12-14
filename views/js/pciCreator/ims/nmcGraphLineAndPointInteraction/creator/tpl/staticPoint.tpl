<div class="static-point-container" data-idx="{{idx}}">
    <hr/>
    <div class="static-point-props">
        <label for="pointLabel">{{__ "Label"}}</label>
        <input name="pointLabel" value="{{label}}" type="text" />
    </div>
    <div class="static-point-props">
        <label for="x" class="spinner">{{__ "X"}}</label>
        <input name="x" value="{{x}}" data-increment="{{xStep}}" data-min={{xMin}} data-max="{{xMax}}" type="text" class="incrementer">
    </div>
    <div class="static-point-props">
        <label for="y" class="spinner">{{__ "Y"}}</label>
        <input name="y" value="{{y}}" data-increment="{{yStep}}" data-min={{yMin}} data-max="{{yMax}}"  type="text" class="incrementer">
    </div>
    <div class="static-point-props">
        <span class="static-point-delete icon-bin" title="{{__ "Delete this static point"}}" data-role="rule"></span>
    </div>
</div>
