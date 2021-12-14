<div class="nmc-graph-gap-match-interaction qti-graphicInteraction qti-blockInteraction qti-graphicGapMatchInteraction">
    <div class="image-container">
        <div class="main-image-box image-editor"></div>
    </div>
    <ul class="none block-listing source">
        {{#gapImgs}}{{{.}}}{{/gapImgs}}
    </ul>
    <script class="gap-match-gaps-tpl" type="text/x-handlebars-template">
        <![CDATA[
            <li class="qti-choice qti-gapImg selectable" data-identifier="\{{identifier}}" data-serial="\{{serial}}" data-groupid="\{{groupId}}">
                <img src ="\{{imgPath}}" 
                    width="\{{width}}"
                    height="\{{height}}"
                    \{{#if objectLabel}}alt="\{{objectLabel}}" \{{/if}}
                />
            </li>            
        ]]>
    </script>    
</div>