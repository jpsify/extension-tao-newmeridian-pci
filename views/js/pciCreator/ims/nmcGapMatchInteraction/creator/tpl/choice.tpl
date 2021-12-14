<div
    class="gap-choice"
    {{#each data}}
        {{#if this}}
            data-{{@key}}="{{this}}"
        {{/if}}
    {{/each}}
>
    <div data-html-editable="true">
        {{{dompurify content}}}
    </div>
</div>