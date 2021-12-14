<responseCondition>
    <responseIf>
        <match>
            <isNull>
                <variable identifier="{{responseIdentifier}}" />
            </isNull>
            <isNull>
                <correct identifier="{{responseIdentifier}}" />
            </isNull>
        </match>
		<setOutcomeValue identifier="SCORE">
            <sum>
                <variable identifier="SCORE" />
                <baseValue baseType="float">1</baseValue>
            </sum>
		</setOutcomeValue>
	</responseIf>
</responseCondition>