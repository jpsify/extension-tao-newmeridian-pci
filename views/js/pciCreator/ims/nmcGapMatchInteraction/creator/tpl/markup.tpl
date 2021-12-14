<div class="nmcGapMatchInteraction">
    <div class="choice-position-container {{#if position}} position-{{position}} {{/if}}"
    {{#if position}} data-position="{{position}}"{{/if}}
    >
        {{#equal display 'groups'}}
            <ul class="choice-container choice-area">
                {{#each groups}}
                    <div class="group" data-id="{{this.id}}">
                            <h3 class="group-title">{{{dompurify this.title}}}</h3>
                            <div class="choices">
                                {{#each this.choices}}
                                    <div class="gap-choice"
                                        {{#each this.data}}
                                            {{#if this}}
                                                data-{{@key}}="{{this}}"
                                            {{/if}}
                                        {{/each}}
                                    >
                                        <div data-html-editable="true">
                                            {{{dompurify this.content}}}
                                        </div>
                                    </div>
                                {{/each}}
                            </div>
                    </div>
                {{/each}}
            </ul>
        {{/equal}}
        {{#equal display 'columns'}}
            <ul class="choice-container choice-area" data-columns="{{numColumns}}">
                {{#each columns}}
                            {{#each this.choices}}
                                <div class="gap-choice"
                                    {{#each this.data}}
                                        {{#if this}}
                                            data-{{@key}}="{{this}}"
                                        {{/if}}
                                    {{/each}}
                                    data-column="{{../this.idx}}"
                                    data-row="{{@index}}"
                                >
                                    <div data-html-editable="true">
                                        {{{dompurify this.content}}}
                                    </div>
                                </div>
                            {{/each}}
                {{/each}}
            </ul>
        {{/equal}}
        {{#equal display 'list'}}
            <ul class="choice-container choice-area">
                {{#each choices}}
                    <div class="gap-choice"
                        {{#each this.data}}
                            {{#if this}}
                                data-{{@key}}="{{this}}"
                            {{/if}}
                        {{/each}}
                    >
                        <div data-html-editable="true">
                            {{{dompurify this.content}}}
                        </div>
                    </div>
                {{/each}}
            </ul>
        {{/equal}}
    
        <div class="qti-flow-container">
            <div data-html-editable="true">
                {{{dompurify editorText}}}
            </div>
        </div>
    </div>
    <div class="response-props-ui">

    </div>
</div>