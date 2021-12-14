	<responseCondition>
		<responseIf>
            <not>
                <match>
                    <baseValue baseType="identifier">{{responseId}}</baseValue>
                    <baseValue baseType="identifier">{{stateName}}</baseValue>
                </match>
            </not>
        <setOutcomeValue identifier="{{outcome}}">
            <baseValue baseType="float">0</baseValue>
        </setOutcomeValue>
		</responseIf>

	</responseCondition>