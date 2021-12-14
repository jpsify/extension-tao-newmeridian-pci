<responseCondition>
    {{#each map}}
        {{#if @index}} 
            <responseElseIf>
        {{else}}   
            <responseIf>                     
        {{/if}} 
            <gte>
                <variable identifier="{{../target}}" />
				<baseValue baseType="float">{{targetValue}}</baseValue>
			</gte>
			<setOutcomeValue identifier="SCORE">
				<sum>
					<variable identifier="SCORE" />
					<baseValue baseType="float">{{score}}</baseValue>
				</sum>
			</setOutcomeValue>

        {{#if @index}} 
            </responseElseIf>
        {{else}}   
            </responseIf>                     
        {{/if}} 
    {{/each}}
</responseCondition>