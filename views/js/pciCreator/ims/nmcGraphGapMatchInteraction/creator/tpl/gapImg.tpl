<li class="qti-choice qti-gapImg selectable" data-identifier="{{attributes.identifier}}" data-serial="{{serial}}"{{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}>
    <img src="{{baseUrl}}{{object.attributes.data}}" 
         width="{{object.attributes.width}}"
         height="{{object.attributes.height}}"
         {{#if attributes.objectLabel}}alt="{{attributes.objectLabel}}" {{/if}}
    />
</li>