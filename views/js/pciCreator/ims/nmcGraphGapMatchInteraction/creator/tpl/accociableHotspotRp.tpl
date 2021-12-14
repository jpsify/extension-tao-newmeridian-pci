<xml>
<setOutcomeValue identifier="{{hotspotOutcome}}">
    <baseValue baseType="float">0</baseValue>
</setOutcomeValue>
{{#each gapImgs}}
    <responseCondition>
    	<responseIf>
            <member>
                <baseValue baseType="directedPair">{{this.id}} {{../hotspotId}}</baseValue>
                <variable identifier="RESPONSE"/>
            </member>
    		<setOutcomeValue identifier="{{../hotspotOutcome}}">
    				<sum>
    					<variable identifier="{{../hotspotOutcome}}" />
    					<baseValue baseType="float">{{this.value}}</baseValue>
    				</sum>
    		</setOutcomeValue>
    	</responseIf>
    </responseCondition>
{{/each}}
<responseCondition>
    <responseIf>
		<and>
			<not>
				<isNull>
					<baseValue baseType="string">{{hotspotId}}</baseValue>
				</isNull>
			</not>
            <match>
                <variable identifier="{{hotspotOutcome}}" />
                <baseValue baseType="float">{{hotspotValue}}</baseValue>
            </match>
		</and>
            <setOutcomeValue identifier="{{targetOutcome}}">
    				<sum>
    					<variable identifier="{{targetOutcome}}" />
    					<baseValue baseType="float">1</baseValue>
    				</sum>
    		</setOutcomeValue>
        </responseIf>
</responseCondition>        
</xml>