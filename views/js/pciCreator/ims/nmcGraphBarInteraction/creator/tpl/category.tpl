<div class="category-container" data-idx="{{idx}}">
   <div>
        <label class="panel">
            <input name="isStatic" type="checkbox" {{#if isStatic}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Static"}}
        </label>
        <span class="category-delete icon-bin" title="{{__ "Delete this category"}}" data-role="rule"></span>        
    </div>
    <div class="category-props panel">
        <label for="title">{{__ "Title"}}</label>
        <input name="title" value="{{title}}" type="text" />
    </div>
    <div class="category-props panel">
        <label for="value">{{__ "Value"}}</label>
        <input name="value" value="{{value}}" data-increment="1" type="text" />
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

            <label for="categoryColor">{{__ "Category Color"}}</label>
            <span class="color-trigger" id="categoryColor"></span>
            <input type="hidden" name="categoryColor" value="{{categoryColor}}"/>
        </div>
    </div>
    <hr/>
</div>
