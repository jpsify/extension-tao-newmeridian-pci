<responseCondition>
    <responseIf>
        <member>
            <baseValue baseType="pair">{{pairString}}</baseValue>
            <variable identifier="{{responseId}}" />
        </member>
        <setOutcomeValue identifier="{{correctId}}">
            <sum>
                <variable identifier="{{correctId}}" />
                <baseValue baseType="integer">1</baseValue>
            </sum>
        </setOutcomeValue>
    </responseIf>
</responseCondition>